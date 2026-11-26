"""
adapters/pc12.py — Adaptador para tablas Primer Ciclo 1° y 2° (EI-09).

Las páginas d102-d120 del DC PBA 2018 tienen una estructura diferente a las de
3°-6°: dentro de cada página de bloque, el contenido de 1° y 2° está separado
por sub-cabeceras "Primer año" / "Segundo año" (sz=12, en col3), que actúan como
separadores de sección, NO como encabezados de página.

Estrategia de extracción:
1. Recolectar todos los spans de las páginas de un bloque.
2. Detectar marcadores de año ("Primer año" / "Segundo año" / "Primero y segundo año").
3. Dividir los spans en secciones por año usando los marcadores como separadores.
4. Procesar cada sección con TricolumnReconstructor (thresholds idénticos a SC).
5. Asignar el año correcto a cada sección.

Verificado: los thresholds de columna de config.TRICOLUMN_THRESHOLDS son válidos
para d102-d120 (medidos en d102: col0 x0≈61, col1 x0≈218, col2 x0≈374, col3 x0≈559).
"""
import sys
import os
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from page_extractor import Span
from table_reconstructor import TricolumnReconstructor, RawTable
from adapters.tricolumn import TricolumnAdapter, ExtractedElement, ExtractedRelation
from id_generator import IDGenerator

# ——— Textos de marcadores de año (lowercase normalizado) ———
YEAR_MARKER_MAP = {
    "primer año": 1,
    "primer  año": 1,       # doble espacio (variante tipográfica)
    "segundo año": 2,
    "segundo  año": 2,
    "primero y segundo año": None,   # contenido compartido por ciclo
}

# Offset desde el marcador de año hasta el inicio del contenido (pt).
# El marcador aparece en y0≈93, las cabeceras de col en y0≈95, el contenido en y0≈112.
# Usamos 20pt para saltar marcador + cabeceras de columna de forma robusta.
CONTENT_OFFSET_PT = 20.0


def _normalize_text(text: str) -> str:
    """Normaliza whitespace y convierte a minúsculas."""
    return " ".join(text.strip().lower().split())


def find_year_markers(spans: list[Span]) -> list[dict]:
    """
    Detecta marcadores de año en la lista de spans.

    Devuelve lista de dicts {year, page, y0, x0, text} ordenada por (page, y0).
    Los marcadores de col3 con texto de año se detectan independientemente de su
    tamaño de fuente, porque sz=12 no supera el MIN_HEADING_SIZE=14 del scanner
    principal (ese es precisamente el origen de EI-09).
    """
    markers = []
    for sp in spans:
        t_norm = _normalize_text(sp.text)
        for pat, year in YEAR_MARKER_MAP.items():
            if t_norm == pat or t_norm.startswith(pat):
                markers.append({
                    "year": year,
                    "page": sp.page_digital,
                    "y0": sp.y0,
                    "x0": sp.x0,
                    "text": sp.text.strip(),
                })
                break
    return sorted(markers, key=lambda m: (m["page"], m["y0"]))


def split_spans_by_year(
    spans: list[Span],
    markers: list[dict],
) -> list[dict]:
    """
    Divide los spans en secciones delimitadas por los marcadores de año.

    Cada sección tiene:
      year      : 1, 2, o None (contenido compartido)
      spans     : list[Span] dentro del rango de la sección
      marker_y0 : y0 del marcador que inicia la sección

    Algoritmo:
    - Para cada par (marker[i], marker[i+1]), recolectar spans con:
        (page > marker[i].page)
        OR (page == marker[i].page AND y0 >= marker[i].y0 + CONTENT_OFFSET)
      AND:
        (page < marker[i+1].page)
        OR (page == marker[i+1].page AND y0 < marker[i+1].y0)
    """
    if not markers:
        return []

    sections = []
    for i, m in enumerate(markers):
        next_m = markers[i + 1] if i + 1 < len(markers) else None

        section_spans = []
        content_start_y = m["y0"] + CONTENT_OFFSET_PT

        for sp in spans:
            # Debe estar después del inicio de la sección
            after_start = (
                sp.page_digital > m["page"]
                or (sp.page_digital == m["page"] and sp.y0 >= content_start_y)
            )
            # Debe estar antes del inicio de la siguiente sección
            if next_m is not None:
                before_end = (
                    sp.page_digital < next_m["page"]
                    or (sp.page_digital == next_m["page"] and sp.y0 < next_m["y0"])
                )
            else:
                before_end = True

            if after_start and before_end:
                section_spans.append(sp)

        if section_spans:
            sections.append({
                "year": m["year"],
                "marker_y0": m["y0"],
                "marker_page": m["page"],
                "spans": section_spans,
            })

    return sections


class PC12Extractor:
    """
    Extractor para Primer Ciclo 1° y 2° (d102-d120).

    Uso:
        extractor = PC12Extractor(id_gen, page_width=841.9)
        elements, relations, ambiguities = extractor.extract_block(
            spans_by_page={102: [...], 103: [...], ...},
            block_name="Números Naturales",
            block_number=1,
        )
    """

    def __init__(self, id_gen: IDGenerator, page_width: float = 841.9):
        self.id_gen = id_gen
        self.reconstructor = TricolumnReconstructor(page_width=page_width)
        self.adapter = TricolumnAdapter(id_gen)

    def extract_block(
        self,
        spans_by_page: dict[int, list[Span]],
        block_name: str,
        block_number: int,
        area: str = "Matemática",
        ciclo: str = "Primer Ciclo",
    ) -> tuple[list[ExtractedElement], list[ExtractedRelation], list[str]]:
        """
        Extrae un bloque de Primer Ciclo 1°/2° del conjunto de páginas dado.

        Retorna (elements, relations, ambiguities).
        """
        all_elements: list[ExtractedElement] = []
        all_relations: list[ExtractedRelation] = []
        ambiguities: list[str] = []

        # Aplanar todos los spans del bloque
        all_spans: list[Span] = []
        for page_spans in spans_by_page.values():
            all_spans.extend(page_spans)

        if not all_spans:
            ambiguities.append(f"PC12 bloque '{block_name}': sin spans.")
            return all_elements, all_relations, ambiguities

        # Encontrar marcadores de año
        markers = find_year_markers(all_spans)

        if not markers:
            ambiguities.append(
                f"PC12 bloque '{block_name}': sin marcadores de año. "
                "Procesando como ciclo completo (year=None)."
            )
            # Sin marcadores: usar TricolumnReconstructor directamente
            markers = [{"year": None, "page": min(spans_by_page.keys()), "y0": 0.0}]

        # Dividir en secciones por año
        sections = split_spans_by_year(all_spans, markers)

        if not sections:
            ambiguities.append(f"PC12 bloque '{block_name}': sin secciones extraíbles.")
            return all_elements, all_relations, ambiguities

        # Procesar cada sección
        for section in sections:
            year = section["year"]
            sec_spans = section["spans"]

            if not sec_spans:
                continue

            # Reconstruir spans_by_page para esta sección
            sec_spans_by_page: dict[int, list[Span]] = {}
            for sp in sec_spans:
                sec_spans_by_page.setdefault(sp.page_digital, []).append(sp)

            # Detectar si tiene tabla tricolumna
            has_tricolumn = any(
                "Conceptos" in s.text or "Modos de conocer" in s.text or "CONTENIDOS" in s.text
                for s in sec_spans
            )

            # Usar year_scope según si es año específico o ciclo
            year_scope = "YEAR" if year is not None else "CYCLE"
            year_label = year if year is not None else "PC12"

            if has_tricolumn or True:  # siempre intentar tricolumna
                # Header_y_cutoff: no necesario porque ya filtramos por y0 >= content_start
                raw_table = self.reconstructor.reconstruct(
                    spans_by_page=sec_spans_by_page,
                    area=area,
                    ciclo=ciclo,
                    year=year,
                    block_name=block_name,
                    block_number=block_number,
                    header_y_cutoff=0.0,  # ya filtrado
                )
                ambiguities.extend(raw_table.ambiguities)

                # Parchear year_scope en raw_table (no tiene field directo)
                elements, relations = self.adapter.adapt(raw_table)

                # Ajustar year_scope para contenido de ciclo
                if year is None:
                    for elem in elements:
                        elem.year_scope = "CYCLE"
                        elem.ciclo = ciclo

                all_elements.extend(elements)
                all_relations.extend(relations)

        return all_elements, all_relations, ambiguities
