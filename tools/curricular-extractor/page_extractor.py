"""
page_extractor.py — Extracción de spans con coordenadas de una página PDF.
Produce representación intermedia antes de la reconstrucción de tablas.
"""

from dataclasses import dataclass, field
from typing import Optional
import fitz

from config import RUNNING_HEADERS, ROW_Y_TOLERANCE


@dataclass
class Span:
    """Un fragmento de texto con sus coordenadas y atributos tipográficos."""
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    font: str = ""
    size: float = 0.0
    flags: int = 0  # bold=16, italic=2
    color: int = 0
    page_digital: int = 0

    @property
    def is_bold(self) -> bool:
        return bool(self.flags & 16)

    @property
    def is_italic(self) -> bool:
        return bool(self.flags & 2)

    @property
    def height(self) -> float:
        return self.y1 - self.y0

    @property
    def width(self) -> float:
        return self.x1 - self.x0

    def center_y(self) -> float:
        return (self.y0 + self.y1) / 2


@dataclass
class TextRow:
    """Un conjunto de spans en la misma línea horizontal (tolerancia ROW_Y_TOLERANCE)."""
    spans: list[Span] = field(default_factory=list)

    @property
    def y0(self) -> float:
        return min(s.y0 for s in self.spans) if self.spans else 0

    @property
    def y1(self) -> float:
        return max(s.y1 for s in self.spans) if self.spans else 0

    @property
    def text(self) -> str:
        return " ".join(s.text.strip() for s in sorted(self.spans, key=lambda s: s.x0) if s.text.strip())

    @property
    def x0(self) -> float:
        return min(s.x0 for s in self.spans) if self.spans else 0

    @property
    def x1(self) -> float:
        return max(s.x1 for s in self.spans) if self.spans else 0


def extract_spans(page: fitz.Page, digital_page: int = 0) -> list[Span]:
    """
    Extrae todos los spans de texto de una página con coordenadas.
    Filtra texto completamente vacío.
    """
    spans: list[Span] = []
    page_dict = page.get_text("dict", sort=True)

    for block in page_dict.get("blocks", []):
        if block.get("type") != 0:  # solo bloques de texto
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text = span.get("text", "").strip()
                if not text:
                    continue
                bbox = span.get("bbox", (0, 0, 0, 0))
                spans.append(Span(
                    text=text,
                    x0=bbox[0], y0=bbox[1],
                    x1=bbox[2], y1=bbox[3],
                    font=span.get("font", ""),
                    size=span.get("size", 0.0),
                    flags=span.get("flags", 0),
                    color=span.get("color", 0),
                    page_digital=digital_page,
                ))

    return spans


def filter_running_headers(spans: list[Span], headers: set | None = None) -> list[Span]:
    """
    Elimina spans que corresponden a encabezados de página repetidos.
    Heurística: texto exacto coincide con un encabezado conocido,
    y el span está en la parte superior (y0 < 60pt) o inferior (y0 > 780pt) de la página.
    """
    known = headers or RUNNING_HEADERS
    result = []
    for span in spans:
        is_header = (
            span.text in known
            or any(span.text.startswith(h[:20]) for h in known if len(h) > 20)
        )
        in_margin = span.y0 < 60 or span.y0 > 780
        if is_header and in_margin:
            continue
        result.append(span)
    return result


def group_into_rows(spans: list[Span], tolerance: float = ROW_Y_TOLERANCE) -> list[TextRow]:
    """
    Agrupa spans en filas según proximidad vertical.
    Dos spans están en la misma fila si |y0_a - y0_b| <= tolerance.
    """
    if not spans:
        return []

    sorted_spans = sorted(spans, key=lambda s: (s.y0, s.x0))
    rows: list[TextRow] = []
    current_row = TextRow(spans=[sorted_spans[0]])

    for span in sorted_spans[1:]:
        ref_y = current_row.y0
        if abs(span.y0 - ref_y) <= tolerance:
            current_row.spans.append(span)
        else:
            rows.append(current_row)
            current_row = TextRow(spans=[span])

    rows.append(current_row)
    return rows


def find_table_header_row(rows: list[TextRow]) -> Optional[int]:
    """
    Detecta la fila de encabezado de tabla tricolumna.
    Busca la primera fila que contenga "Conceptos" o "CONTENIDOS".
    Devuelve el índice en la lista de rows.
    """
    keywords = {"Conceptos", "Modos de conocer", "Indicadores", "CONTENIDOS"}
    for i, row in enumerate(rows):
        for span in row.spans:
            if any(kw in span.text for kw in keywords):
                return i
    return None


def classify_column(x0: float, page_width: float) -> int:
    """
    Clasifica un span en columna 0, 1, 2 o 3 según su posición X.
    0 = Conceptos/Contenidos (izquierda)
    1 = Modos de conocer (centro-izquierda)
    2 = Indicadores de avance (centro-derecha)
    3 = Situaciones de enseñanza (derecha)

    Thresholds en TRICOLUMN_THRESHOLDS (config.py), calibrados para A4 landscape
    (841.9pt ancho). Límites absolutos medidos en d136–d145 DC PBA 2018:
      col0: x0 ≤ 161pt   → x0/page < 0.192
      col1: x0 164–338pt → 0.192 ≤ x0/page < 0.404
      col2: x0 341–511pt → 0.404 ≤ x0/page < 0.608
      col3: x0 ≥ 513pt   → x0/page ≥ 0.608
    """
    from config import TRICOLUMN_THRESHOLDS
    ratio = x0 / page_width
    if ratio < TRICOLUMN_THRESHOLDS["col0_max"]:
        return 0
    elif ratio < TRICOLUMN_THRESHOLDS["col1_max"]:
        return 1
    elif ratio < TRICOLUMN_THRESHOLDS["col2_max"]:
        return 2
    else:
        return 3


def extract_page_content(
    page: fitz.Page,
    digital_page: int,
    filter_headers: bool = True,
) -> dict:
    """
    Extracción completa de una página: spans + rows.
    Devuelve dict con 'spans', 'rows', 'page_width', 'page_height'.
    """
    spans = extract_spans(page, digital_page)
    if filter_headers:
        spans = filter_running_headers(spans)
    rows = group_into_rows(spans)

    page_rect = page.rect
    return {
        "digital_page": digital_page,
        "printed_page": digital_page - 1,
        "page_width": page_rect.width,
        "page_height": page_rect.height,
        "spans": spans,
        "rows": rows,
        "span_count": len(spans),
        "row_count": len(rows),
    }
