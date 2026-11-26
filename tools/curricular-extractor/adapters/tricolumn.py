"""
adapters/tricolumn.py — Adaptador para tablas tipo A (tricolumna).

Convierte RawTable (representación intermedia) en elementos del modelo de datos
con relaciones SOURCE_EXPRESSED.

Áreas: Matemática, Ciencias Sociales, Ciencias Naturales.
"""

from dataclasses import dataclass, field
from typing import Optional
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from table_reconstructor import RawTable, RawCell
from normalizer import normalize
from id_generator import IDGenerator


@dataclass
class ExtractedElement:
    """Elemento curricular extraído, listo para serialización JSON."""
    stable_id: str
    element_type: str           # CONCEPT, WAY_OF_KNOWING, PROGRESS_INDICATOR, etc.
    area: str
    ciclo: str
    year: Optional[int | str]
    year_scope: str             # YEAR, CYCLE, DOCUMENT
    block_name: str
    block_number: int
    original_text: str
    normalized_text: str
    extraction_method: str = "SCRIPT_A"
    review_status: str = "extracted"

    # Trazabilidad
    digital_page: int = 0
    printed_page: int = 0
    table_name: str = ""
    row_index: int = 0
    column_index: int = 0
    column_name: str = ""
    bbox: Optional[tuple[float, float, float, float]] = None
    span_text: str = ""         # texto exacto del span de referencia

    notes: str = ""


@dataclass
class ExtractedRelation:
    """Relación entre dos elementos, extraída de la estructura de tabla."""
    source_stable_id: str
    target_stable_id: str
    relation_type: str          # CONCEPT_WAY_OF_KNOWING, etc.
    relation_basis: str         # SOURCE_EXPRESSED / PEDAGOGICALLY_INFERRED
    digital_page: int = 0
    row_index: int = 0
    notes: str = ""


def _make_bbox(cell: RawCell) -> Optional[tuple]:
    if cell.spans:
        x0 = min(s.x0 for s in cell.spans)
        y0 = min(s.y0 for s in cell.spans)
        x1 = max(s.x1 for s in cell.spans)
        y1 = max(s.y1 for s in cell.spans)
        return (x0, y0, x1, y1)
    return None


COLUMN_NAMES = {0: "Conceptos", 1: "Modos de conocer", 2: "Indicadores de avance"}
COLUMN_TYPES = {0: "CONCEPT", 1: "WAY_OF_KNOWING", 2: "PROGRESS_INDICATOR"}


class TricolumnAdapter:
    """
    Convierte RawTable → (list[ExtractedElement], list[ExtractedRelation]).

    Estrategia para celdas combinadas:
    - Si col 1 cubre N filas de col 0: crear N relaciones CONCEPT_WAY_OF_KNOWING
      (una por cada concepto cubierto), todas con relation_basis='SOURCE_EXPRESSED'
      y una nota indicando que era celda combinada.
    - Mismo criterio para col 2.
    """

    def __init__(self, id_gen: IDGenerator):
        self.id_gen = id_gen

    def adapt(
        self,
        raw_table: RawTable,
        source_id: str = "DC-PBA-PRIMARY-2018",
    ) -> tuple[list[ExtractedElement], list[ExtractedRelation]]:
        elements: list[ExtractedElement] = []
        relations: list[ExtractedRelation] = []

        year_scope = "YEAR" if raw_table.year is not None else "CYCLE"

        for row in raw_table.rows:
            row_elements: dict[int, list[ExtractedElement]] = {}

            for col in (0, 1, 2):
                cell = row.cells.get(col)
                if not cell or cell.is_empty:
                    continue

                col_name = COLUMN_NAMES[col]
                col_type = COLUMN_TYPES[col]

                # Dividir la celda en ítems individuales
                cell_items = cell.items()
                if not cell_items:
                    # Celda con texto no parseable como ítems
                    cell_items = [cell.raw_text] if cell.raw_text.strip() else []

                col_elements = []
                for item_text in cell_items:
                    item_text = item_text.strip()
                    if not item_text:
                        continue

                    normalized = normalize(item_text)
                    stable_id = self.id_gen.generate(
                        raw_table.area, raw_table.ciclo,
                        raw_table.year, raw_table.block_number,
                        col_type, item_text,
                    )

                    page = cell.page_start
                    elem = ExtractedElement(
                        stable_id=stable_id,
                        element_type=col_type,
                        area=raw_table.area,
                        ciclo=raw_table.ciclo,
                        year=raw_table.year,
                        year_scope=year_scope,
                        block_name=raw_table.block_name,
                        block_number=raw_table.block_number,
                        original_text=item_text,
                        normalized_text=normalized,
                        digital_page=page,
                        printed_page=page - 1,
                        table_name=raw_table.block_name,
                        row_index=row.row_index,
                        column_index=col,
                        column_name=col_name,
                        bbox=_make_bbox(cell),
                        span_text=cell.raw_text[:120],
                    )

                    if cell.row_span > 1:
                        elem.review_status = "pending"
                        elem.notes = (
                            f"Celda combinada (row_span={cell.row_span}). "
                            "Verificar correspondencia con conceptos cubiertos."
                        )

                    elements.append(elem)
                    col_elements.append(elem)

                row_elements[col] = col_elements

            # Crear relaciones CONCEPT_WAY_OF_KNOWING (col 0 ↔ col 1)
            concepts = row_elements.get(0, [])
            ways = row_elements.get(1, [])
            indicators = row_elements.get(2, [])

            for concept in concepts:
                for way in ways:
                    merged_note = ""
                    if row.cells.get(1) and row.cells[1].row_span > 1:
                        merged_note = f"Celda combinada col 1 abarca {row.cells[1].row_span} filas."
                    relations.append(ExtractedRelation(
                        source_stable_id=concept.stable_id,
                        target_stable_id=way.stable_id,
                        relation_type="CONCEPT_WAY_OF_KNOWING",
                        relation_basis="SOURCE_EXPRESSED",
                        digital_page=concept.digital_page,
                        row_index=row.row_index,
                        notes=merged_note,
                    ))

                for indicator in indicators:
                    merged_note = ""
                    if row.cells.get(2) and row.cells[2].row_span > 1:
                        merged_note = f"Celda combinada col 2 abarca {row.cells[2].row_span} filas."
                    relations.append(ExtractedRelation(
                        source_stable_id=concept.stable_id,
                        target_stable_id=indicator.stable_id,
                        relation_type="CONTENT_PROGRESS_INDICATOR",
                        relation_basis="SOURCE_EXPRESSED",
                        digital_page=concept.digital_page,
                        row_index=row.row_index,
                        notes=merged_note,
                    ))

        return elements, relations
