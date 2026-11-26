"""
table_reconstructor.py — Reconstrucción de tablas a partir de spans con coordenadas.

Maneja:
- Tablas tricolumna (tipo A): Conceptos | Modos de conocer | Indicadores de avance
- Celdas combinadas verticalmente
- Texto en múltiples líneas dentro de una celda
- Tablas que continúan en la página siguiente
- Viñetas (·, -, •)
- Palabras cortadas por guión tipográfico

Produce una representación intermedia de celdas antes de mapear al modelo de datos.
"""

from dataclasses import dataclass, field
from typing import Optional
import re

from page_extractor import Span, TextRow, classify_column


@dataclass
class RawCell:
    """
    Celda tal como se detecta en el PDF, antes de la clasificación semántica.
    Puede contener múltiples spans de distintas páginas (tabla que cruza página).
    """
    column: int           # 0=Conceptos, 1=Modos de conocer, 2=Indicadores
    row_index: int        # Fila lógica dentro de la tabla (0-indexed)
    spans: list[Span] = field(default_factory=list)

    # Si la celda abarca múltiples filas lógicas (celda combinada)
    row_span: int = 1

    # Metadatos de posición
    y0: float = 0.0
    y1: float = 0.0
    page_start: int = 0
    page_end: int = 0

    @property
    def raw_text(self) -> str:
        """Texto concatenado de todos los spans, respetando saltos de línea."""
        parts = []
        prev_y = None
        for span in sorted(self.spans, key=lambda s: (s.y0, s.x0)):
            t = span.text.strip()
            if not t:
                continue
            if prev_y is not None and abs(span.y0 - prev_y) > 3.0:
                parts.append("\n" + t)
            else:
                parts.append(t)
            prev_y = span.y0
        return " ".join(parts).strip()

    @property
    def is_empty(self) -> bool:
        return not any(s.text.strip() for s in self.spans)

    def items(self) -> list[str]:
        """
        Divide el contenido en ítems curriculares independientes.

        Estrategia (EI-08 fix):
        1. Bullets PUA (): el DC PBA 2018 usa este carácter como viñeta. Aparece
           en el mismo renglón visual que el primer texto del ítem (y0 difiere <= 3pt).
           Agrupar spans en renglones visuales (y0 dentro de LINE_TOLERANCE), luego
           tratar cada renglón con PUA como inicio de nuevo ítem; renglones sin PUA
           son continuaciones del ítem actual.
        2. Viñetas estándar (·, •, -, –) en raw_text: comportamiento previo (compatible
           con fixtures de tests existentes que no usan PUA).
        3. Sin viñetas: texto único — no dividir por saltos de línea tipográficos
           (corrige el caso EI-08: "Números hasta el orden\nde los millones." = 1 ítem).
        """
        LINE_TOLERANCE = 3.0  # pt: distancia y0 máxima para "mismo renglón visual"

        if not self.spans:
            return []

        sorted_spans = sorted(self.spans, key=lambda s: (s.y0, s.x0))

        # Agrupar spans en renglones visuales
        visual_lines: list[list] = [[sorted_spans[0]]]
        for sp in sorted_spans[1:]:
            if abs(sp.y0 - visual_lines[-1][0].y0) <= LINE_TOLERANCE:
                visual_lines[-1].append(sp)
            else:
                visual_lines.append([sp])

        # Detectar presencia de PUA en la celda
        def _is_pure_pua(text: str) -> bool:
            return bool(text) and all(ord(c) > 0xE000 for c in text)

        has_pua = any(
            _is_pure_pua(sp.text.strip())
            for line in visual_lines
            for sp in line
            if sp.text.strip()
        )

        if has_pua:
            items_accumulator: list[list[str]] = []
            current_texts: list[str] = []

            for line in visual_lines:
                has_pua_in_line = any(
                    _is_pure_pua(sp.text.strip()) for sp in line if sp.text.strip()
                )
                line_text = " ".join(
                    sp.text.strip()
                    for sp in sorted(line, key=lambda s: s.x0)
                    if sp.text.strip() and not _is_pure_pua(sp.text.strip())
                ).strip()

                if has_pua_in_line:
                    # Renglón con PUA: cierra ítem anterior, inicia nuevo
                    if current_texts:
                        items_accumulator.append(current_texts)
                    current_texts = [line_text] if line_text else []
                else:
                    # Renglón de continuación
                    if line_text:
                        current_texts.append(line_text)

            if current_texts:
                items_accumulator.append(current_texts)

            result = [" ".join(ts).strip() for ts in items_accumulator if ts]
            return result if result else []

        # Sin PUA: comprobar viñetas estándar en raw_text (compatibilidad fixtures)
        text = self.raw_text
        if re.search(r'(^|[\n])\s*[·•\-–]\s+\S', text):
            parts = re.split(r'\n+\s*[·•\-–]\s*', text)
            result = []
            for part in parts:
                for s in re.split(r'\n', part):
                    s = s.strip().lstrip('·•\\-– \t')
                    if s:
                        result.append(s)
            return result

        # Sin viñetas: todo el contenido es un único ítem (EI-08: no dividir continuaciones)
        full = " ".join(
            sp.text.strip()
            for sp in sorted_spans
            if sp.text.strip() and not _is_pure_pua(sp.text.strip())
        ).strip()
        return [full] if full else []


@dataclass
class RawTableRow:
    """Una fila lógica de la tabla con sus celdas por columna."""
    row_index: int
    cells: dict[int, RawCell] = field(default_factory=dict)  # column → RawCell
    y0: float = 0.0
    y1: float = 0.0

    def get_cell(self, column: int) -> Optional[RawCell]:
        return self.cells.get(column)


@dataclass
class RawTable:
    """
    Tabla tricolumna reconstruida de una o más páginas.
    Preserva la representación intermedia antes del mapeo semántico.
    """
    area: str
    ciclo: str
    year: Optional[int | str]
    block_name: str
    block_number: int
    rows: list[RawTableRow] = field(default_factory=list)
    pages: list[int] = field(default_factory=list)  # páginas digitales que contiene
    table_type: str = "A"  # A=tricolumna, B=bicolumna
    ambiguities: list[str] = field(default_factory=list)  # notas de ambigüedad

    def add_ambiguity(self, note: str) -> None:
        self.ambiguities.append(note)

    def row_count(self) -> int:
        return len(self.rows)

    def cell_count(self) -> int:
        return sum(len(r.cells) for r in self.rows)

    def has_merged_cells(self) -> bool:
        return any(
            cell.row_span > 1
            for row in self.rows
            for cell in row.cells.values()
        )


class TricolumnReconstructor:
    """
    Reconstructor de tablas tricolumna a partir de spans de página(s).

    Estrategia:
    1. Detectar el encabezado de tabla (fila con "Conceptos", "Modos de conocer", etc.)
    2. Para cada span posterior al encabezado, clasificar en columna por posición X
    3. Agrupar spans en filas por posición Y
    4. Detectar celdas combinadas: una celda de col 1 o 2 que cubre el rango Y de
       múltiples items en col 0
    5. Producir RawTable con RawTableRow y RawCell
    """

    def __init__(self, page_width: float = 595.3):
        self.page_width = page_width

    def reconstruct(
        self,
        spans_by_page: dict[int, list[Span]],
        area: str,
        ciclo: str,
        year: Optional[int | str],
        block_name: str,
        block_number: int,
        header_y_cutoff: float = 0.0,  # ignorar spans por encima de este Y
    ) -> RawTable:
        """
        Reconstruye la tabla a partir de spans de una o más páginas.
        spans_by_page: {digital_page: [Span, ...]}
        header_y_cutoff: Y de la última fila del encabezado de la tabla.
        """
        table = RawTable(
            area=area, ciclo=ciclo, year=year,
            block_name=block_name, block_number=block_number,
            pages=sorted(spans_by_page.keys()),
        )

        # Recolectar todos los spans post-encabezado, ordenados por (page, y0, x0)
        all_spans: list[Span] = []
        for page_num in sorted(spans_by_page.keys()):
            for span in spans_by_page[page_num]:
                if page_num == min(spans_by_page.keys()) and span.y0 <= header_y_cutoff:
                    continue
                all_spans.append(span)

        if not all_spans:
            table.add_ambiguity("No se encontraron spans después del encabezado de tabla.")
            return table

        # Clasificar cada span en columna 0–3
        col_spans: dict[int, list[Span]] = {0: [], 1: [], 2: [], 3: []}
        for span in all_spans:
            col = classify_column(span.x0, self.page_width)
            if col in col_spans:
                col_spans[col].append(span)

        # Construir filas para columna 0 (eje de la tabla)
        col0_rows = self._group_col_spans_into_items(col_spans[0])

        # Para cada item de col 0, buscar los spans de col 1–3 que lo solapan en Y
        row_index = 0
        for item_spans in col0_rows:
            if not item_spans:
                continue

            y_min = min(s.y0 for s in item_spans)
            y_max = max(s.y1 for s in item_spans)

            # Cell de columna 0
            cell0 = RawCell(
                column=0, row_index=row_index,
                spans=item_spans,
                y0=y_min, y1=y_max,
                page_start=item_spans[0].page_digital,
                page_end=item_spans[-1].page_digital,
            )

            # Spans de col 1 que solapan con [y_min, y_max]
            c1_spans = self._spans_overlapping_y(col_spans[1], y_min, y_max)
            # Spans de col 2 que solapan
            c2_spans = self._spans_overlapping_y(col_spans[2], y_min, y_max)
            # Spans de col 3 (Situaciones de enseñanza) que solapan
            c3_spans = self._spans_overlapping_y(col_spans[3], y_min, y_max)

            row = RawTableRow(row_index=row_index, y0=y_min, y1=y_max)
            row.cells[0] = cell0

            if c1_spans:
                row.cells[1] = RawCell(
                    column=1, row_index=row_index,
                    spans=c1_spans,
                    y0=min(s.y0 for s in c1_spans),
                    y1=max(s.y1 for s in c1_spans),
                    page_start=c1_spans[0].page_digital,
                    page_end=c1_spans[-1].page_digital,
                )

            if c2_spans:
                row.cells[2] = RawCell(
                    column=2, row_index=row_index,
                    spans=c2_spans,
                    y0=min(s.y0 for s in c2_spans),
                    y1=max(s.y1 for s in c2_spans),
                    page_start=c2_spans[0].page_digital,
                    page_end=c2_spans[-1].page_digital,
                )

            if c3_spans:
                row.cells[3] = RawCell(
                    column=3, row_index=row_index,
                    spans=c3_spans,
                    y0=min(s.y0 for s in c3_spans),
                    y1=max(s.y1 for s in c3_spans),
                    page_start=c3_spans[0].page_digital,
                    page_end=c3_spans[-1].page_digital,
                )

            table.rows.append(row)
            row_index += 1

        # Detectar celdas combinadas: si una celda de col 1 cubre múltiples items de col 0
        self._detect_merged_cells(table, col_spans)

        # Validar que no haya filas completamente vacías
        empty_rows = [r for r in table.rows if all(c.is_empty for c in r.cells.values())]
        if empty_rows:
            table.add_ambiguity(
                f"{len(empty_rows)} filas completamente vacías detectadas en tabla '{block_name}'."
            )

        return table

    def _group_col_spans_into_items(self, spans: list[Span]) -> list[list[Span]]:
        """
        Agrupa los spans de la columna 0 en ítems textuales separados.
        Un nuevo ítem comienza cuando hay un gap vertical significativo (> 2 * tamaño de fuente típico).
        """
        if not spans:
            return []

        sorted_spans = sorted(spans, key=lambda s: (s.y0, s.x0))
        items: list[list[Span]] = [[sorted_spans[0]]]

        for span in sorted_spans[1:]:
            last_span = items[-1][-1]
            gap = span.y0 - last_span.y1
            # Gap mayor a ~1.5 líneas sugiere nuevo ítem
            typical_line = last_span.size if last_span.size > 0 else 10.0
            if gap > typical_line * 1.2:
                items.append([span])
            else:
                items[-1].append(span)

        return items

    def _spans_overlapping_y(
        self, spans: list[Span], y_min: float, y_max: float, tolerance: float = 2.0
    ) -> list[Span]:
        """Devuelve los spans cuyo rango Y solapa con [y_min, y_max]."""
        result = []
        for span in spans:
            # Solapamiento: span.y0 < y_max + tol AND span.y1 > y_min - tol
            if span.y0 < y_max + tolerance and span.y1 > y_min - tolerance:
                result.append(span)
        return sorted(result, key=lambda s: (s.y0, s.x0))

    def _detect_merged_cells(self, table: RawTable, col_spans: dict[int, list[Span]]) -> None:
        """
        Detecta y registra celdas combinadas en columnas 1 y 2.
        Una celda es combinada si su rango Y cubre más de una fila de la columna 0.
        """
        for row in table.rows:
            for col in (1, 2):
                cell = row.cells.get(col)
                if not cell:
                    continue
                # Contar cuántas filas de col 0 cubre este cell
                covered = sum(
                    1 for other_row in table.rows
                    if other_row.row_index != row.row_index
                    and other_row.y0 >= cell.y0 - 2
                    and other_row.y1 <= cell.y1 + 2
                )
                if covered > 0:
                    cell.row_span = covered + 1
                    table.add_ambiguity(
                        f"Celda combinada en col {col}, fila {row.row_index}: "
                        f"abarca {cell.row_span} filas. Verificar correspondencia manual."
                    )
