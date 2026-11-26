"""
adapters/css.py — Adaptador para tablas de Ciencias Sociales (CSS).

Ciencias Sociales tiene una estructura de tabla diferente a Matemática:
- 3 columnas de contenido (no 4): Conceptos | Modos de conocer | Indicadores de avance
- NO tiene columna "Situaciones de enseñanza" en la tabla principal
- En 1°/2°: encabezado de DOS NIVELES ("CONTENIDOS" | "INDICADORES DE AVANCE")
  - Sub-cabeceras: "Conceptos" (x0≈188, col1) | "Modos de conocer" (x0≈407, col2)
  - Contenido real en: col0 (x0≈60) | col2 (x0≈372) | col3 (x0≈536)
- En 3°-6°: estructura similar (col0 | col2 | col3), sin col1

Mapeo de columnas para CSS (vs MAT):
  MAT col0 → CONCEPT           | CSS col0 → CONCEPT           (igual)
  MAT col1 → WAY_OF_KNOWING    | CSS col1 → vacío             (nunca hay contenido)
  MAT col2 → PROGRESS_INDICATOR| CSS col2 → WAY_OF_KNOWING    (Modos de conocer)
  MAT col3 → TEACHING_SITUATION| CSS col3 → PROGRESS_INDICATOR (Indicadores de avance)

Relaciones resultantes:
  col0 × col2 → CONCEPT_WAY_OF_KNOWING        (Conceptos × Modos de conocer)
  col0 × col3 → CONTENT_PROGRESS_INDICATOR    (Conceptos × Indicadores de avance)

Verificado en d186–d235 (DC PBA 2018):
  col2 x0≈372–418pt (x0/841.9 ≈ 0.44–0.50 → col2 ✓)
  col3 x0≈536–777pt (x0/841.9 ≈ 0.64–0.92 → col3 ✓)
"""

import sys
import os
from dataclasses import dataclass, field
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from table_reconstructor import RawTable, RawCell
from normalizer import normalize
from id_generator import IDGenerator
from adapters.tricolumn import ExtractedElement, ExtractedRelation, _make_bbox


def css_split_items(cell) -> list[str]:
    """
    Divide una RawCell CSS en ítems individuales usando indentación relativa (x0).

    CSS no usa bullets PUA. Los ítems se detectan por:
      - x0 relativo al mínimo de la celda (funciona para cualquier columna)
      - Umbral de sangría profunda: offset > 7pt -> continuación de línea anterior
      - Reglas (en orden):
        1. offset > 7pt: continuación (siempre; sangría de segunda línea)
        2. offset < offset_anterior - 2pt AND gap > -0.5pt: nuevo ítem (dedent)
        3. gap >= 0.5pt: nuevo ítem (brecha no trivial entre oraciones)
        4. texto empieza con mayúscula: nuevo ítem (inicio de oración)
        default: continuación
    """
    spans = sorted(cell.spans, key=lambda s: s.y0)
    if not spans:
        return []

    # Mínimo x0 en la celda = "borde izquierdo" de esta columna
    min_x0 = min(sp.x0 for sp in spans)
    WRAP_THRESHOLD = 7.0  # offset a partir del cual es sangría de continuación

    groups: list[list] = [[spans[0]]]
    for sp in spans[1:]:
        last = groups[-1][-1]
        gap = sp.y0 - last.y1
        off_curr = sp.x0 - min_x0   # offset relativo
        off_prev = last.x0 - min_x0

        # Regla 0: salto de página (gap << 0 → páginas distintas).
        # Un gap < -50pt es física del PDF y no distancia real.
        # Si el span está a sangría "normal" o menor, inicia ítem nuevo.
        if gap < -50.0:
            if off_curr <= WRAP_THRESHOLD:
                groups.append([sp])
            else:
                groups[-1].append(sp)  # continuación de sangría profunda entre páginas
            continue

        # Regla 1: sangría profunda → continuación
        if off_curr > WRAP_THRESHOLD:
            groups[-1].append(sp)
            continue

        # Regla 2: dedent (offset bajó) → nuevo ítem
        if off_curr < off_prev - 2.0 and gap > -0.5:
            groups.append([sp])
            continue

        # Regla 3: brecha no trivial → nuevo ítem
        if gap >= 0.5:
            groups.append([sp])
            continue

        # Regla 4: empieza con mayúscula → nuevo ítem
        t = sp.text.strip()
        if t and t[0].isupper():
            groups.append([sp])
            continue

        groups[-1].append(sp)

    result = []
    for grp in groups:
        # Unir spans; normalizar guiones de corte de línea
        text = "".join(s.text for s in grp)
        text = text.replace("-\n", "").replace("­", "").strip()
        if text:
            result.append(text)
    return result


CSS_COLUMN_NAMES = {
    0: "Conceptos",
    1: "Modos de conocer",    # vacío en CSS; mantenido por simetría
    2: "Modos de conocer",    # contenido real en col2
    3: "Indicadores de avance",
}

CSS_COLUMN_TYPES = {
    0: "CONCEPT",
    1: "WAY_OF_KNOWING",      # vacío
    2: "WAY_OF_KNOWING",
    3: "PROGRESS_INDICATOR",
}

# Tipos de relación por par de columnas
CSS_RELATION_TYPES = {
    (0, 1): ("CONCEPT_WAY_OF_KNOWING",     "SOURCE_EXPRESSED"),
    (0, 2): ("CONCEPT_WAY_OF_KNOWING",     "SOURCE_EXPRESSED"),
    (0, 3): ("CONTENT_PROGRESS_INDICATOR", "SOURCE_EXPRESSED"),
}


class CSSAdapter:
    """
    Convierte RawTable → (list[ExtractedElement], list[ExtractedRelation])
    para tablas de Ciencias Sociales.

    Reutiliza la estructura de TricolumnAdapter con mapeo de columnas específico.
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

                col_name = CSS_COLUMN_NAMES[col]
                col_type = CSS_COLUMN_TYPES[col]

                # CSS usa x0-based splitting en lugar de PUA bullets
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

            # Crear relaciones
            concepts = row_elements.get(0, [])

            for target_col in (1, 2, 3):
                targets = row_elements.get(target_col, [])
                if not targets:
                    continue
                rel_type, rel_basis = CSS_RELATION_TYPES.get(
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
