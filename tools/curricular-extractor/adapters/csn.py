"""
adapters/csn.py — Adaptador para tablas de Ciencias Naturales (CSN).

Ciencias Naturales tiene una estructura de tabla diferente a MAT y CSS:
  - 3 columnas activas: Conceptos | Modos de conocer | Indicadores de avance
  - SIN columna Situaciones de enseñanza en la tabla (páginas separadas)
  - SIN bullets PUA → usa css_split_items para separar ítems

Layout de columnas (igual para todos los años):
  col0 (x0≈55-105pt):  Conceptos
  col1 (x0≈289-311pt): Modos de conocer    ← contenido real en col1
  col2 (x0≈340-410pt): sub-cabecera "Modos de conocer" (vacía de contenido)
  col3 (x0≈529-580pt): Indicadores de avance

Diferencia clave con MAT:
  MAT col2 → PROGRESS_INDICATOR  |  CSN col2 → vacío
  MAT col3 → TEACHING_SITUATION  |  CSN col3 → PROGRESS_INDICATOR

Verificado en d244–d290 (DC PBA 2018):
  col1 Modos content:  x0≈289-311pt (0.34-0.37 → col1 zone < 0.404)
  col3 Indicadores:    x0≈529-580pt (0.63-0.69 → col3 zone > 0.608)

Relaciones:
  col0 × col1 → CONCEPT_WAY_OF_KNOWING
  col0 × col3 → CONTENT_PROGRESS_INDICATOR
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from table_reconstructor import RawTable, RawCell
from normalizer import normalize
from id_generator import IDGenerator
from adapters.tricolumn import ExtractedElement, ExtractedRelation, _make_bbox
from adapters.css import css_split_items


CSN_COLUMN_NAMES = {
    0: "Conceptos",
    1: "Modos de conocer",
    2: "Modos de conocer",    # sub-header only, never has content
    3: "Indicadores de avance",
}

CSN_COLUMN_TYPES = {
    0: "CONCEPT",
    1: "WAY_OF_KNOWING",
    2: "WAY_OF_KNOWING",      # vacío en la práctica
    3: "PROGRESS_INDICATOR",  # ← distinto de MAT (que tiene TEACHING_SITUATION aquí)
}

CSN_RELATION_TYPES = {
    (0, 1): ("CONCEPT_WAY_OF_KNOWING",     "SOURCE_EXPRESSED"),
    (0, 2): ("CONCEPT_WAY_OF_KNOWING",     "SOURCE_EXPRESSED"),
    (0, 3): ("CONTENT_PROGRESS_INDICATOR", "SOURCE_EXPRESSED"),
}


class CSNAdapter:
    """
    Convierte RawTable → (list[ExtractedElement], list[ExtractedRelation])
    para tablas de Ciencias Naturales.

    Mapeo de columnas específico: col3 → PROGRESS_INDICATOR (no TEACHING_SITUATION).
    Usa css_split_items para separar ítems (sin bullets PUA).
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

            for col in (0, 1, 2, 3):
                cell = row.cells.get(col)
                if not cell or cell.is_empty:
                    continue

                col_name = CSN_COLUMN_NAMES[col]
                col_type = CSN_COLUMN_TYPES[col]

                cell_items = css_split_items(cell)
                if not cell_items:
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
                        printed_page=page - 1 if page else None,
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

            # Crear relaciones
            concepts = row_elements.get(0, [])
            for target_col in (1, 2, 3):
                targets = row_elements.get(target_col, [])
                if not targets:
                    continue
                rel_type, rel_basis = CSN_RELATION_TYPES.get(
                    (0, target_col), ("CONCEPT_RELATED", "SOURCE_EXPRESSED")
                )
                for concept in concepts:
                    for target in targets:
                        merged_note = ""
                        cell_t = row.cells.get(target_col)
                        if cell_t and cell_t.row_span > 1:
                            merged_note = f"Celda combinada col {target_col} abarca {cell_t.row_span} filas."
                        relations.append(ExtractedRelation(
                            source_stable_id=concept.stable_id,
                            target_stable_id=target.stable_id,
                            relation_type=rel_type,
                            relation_basis=rel_basis,
                            digital_page=concept.digital_page,
                            row_index=row.row_index,
                            notes=merged_note,
                        ))

        return elements, relations
