# DATA_DICTIONARY.md — Diccionario de datos
**Etapa 02.2 · Fecha: 2026-11-26**

Convenciones: `PK` = clave primaria · `FK` = clave foránea · `UK` = unique · `NN` = not null · `D` = default

---

## `document_sources`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | Identificador interno |
| `stable_code` | text | UK, NN | Código legible estable, ej. `DC-PBA-PRIMARY-2018` |
| `title` | text | NN | Título oficial del documento |
| `organism` | text | NN | Organismo emisor |
| `jurisdiction_id` | uuid | FK→jurisdictions, NN | Jurisdicción del documento |
| `resolution_number` | text | | N° de resolución de aprobación |
| `resolution_date` | date | | Fecha de la resolución |
| `publication_year` | int | | Año de publicación |
| `sha256` | text(64) | UK | Hash SHA-256 del archivo fuente |
| `provenance_url` | text | | URL de acceso público original |
| `validity_status` | text | NN, D 'draft' | draft / active / partially_modified / superseded / revoked |
| `verification_status` | text | NN, D 'unverified' | unverified / partially_verified / verified |
| `reuse_conditions` | text | | Texto libre sobre condiciones de reutilización |
| `version_tag` | text | | Etiqueta de versión, ej. `2018-ed1` |
| `notes` | text | | Notas adicionales, evidencias externas |
| `created_at` | timestamptz | NN, D now() | |
| `updated_at` | timestamptz | NN, D now() | |

**CHECK:** `validity_status IN ('draft','active','partially_modified','superseded','revoked')`
**CHECK:** `verification_status IN ('unverified','partially_verified','verified')`

---

## `source_relations`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `source_id` | uuid | FK→document_sources, NN | Fuente "más nueva" |
| `related_source_id` | uuid | FK→document_sources, NN | Fuente "más antigua" o relacionada |
| `relation_type` | text | NN | UPDATES / SUPERSEDES / SUPPLEMENTS / COMPLEMENTS |
| `notes` | text | | |

**CHECK:** `source_id <> related_source_id`

---

## `document_sections`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `source_id` | uuid | FK→document_sources, NN | |
| `section_name` | text | NN | Nombre de la sección |
| `section_kind` | text | NN | FRAMEWORK / BIBLIOGRAPHY / ANNEX / INTRO |
| `page_start_digital` | int | | Página digital de inicio |
| `page_end_digital` | int | | Página digital de fin |
| `page_start_printed` | int | | Página impresa de inicio |
| `page_end_printed` | int | | Página impresa de fin |
| `notes` | text | | |

---

## `jurisdictions`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `code` | text | UK, NN | Ej. `PBA`, `CABA`, `NAC` |
| `name` | text | NN | Nombre completo |
| `country_code` | char(2) | NN, D 'AR' | ISO 3166-1 alpha-2 |

---

## `education_levels`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `code` | text | UK, NN | Ej. `PBA-PRIMARY` |
| `name` | text | NN | Ej. `Educación Primaria` |
| `jurisdiction_id` | uuid | FK→jurisdictions, NN | |

---

## `curriculum_cycles`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `code` | text | UK, NN | Ej. `PBA-PRIMARY-C1`, `PBA-PRIMARY-C2` |
| `name` | text | NN | Primer Ciclo / Segundo Ciclo |
| `level_id` | uuid | FK→education_levels, NN | |
| `year_range` | int[] | NN | Ej. `{1,2,3}` para Primer Ciclo |

---

## `education_years`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `year_number` | int | | 1–6; NULL para Unidad Pedagógica |
| `name` | text | NN | Ej. `1° año`, `Unidad Pedagógica` |
| `cycle_id` | uuid | FK→curriculum_cycles, NN | |
| `special_scope` | text | | UP_1_2 (Unidad Pedagógica), NULL en otros casos |

**CHECK:** `year_number BETWEEN 1 AND 6 OR (year_number IS NULL AND special_scope IS NOT NULL)`

---

## `curriculum_areas`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `stable_code` | text | UK, NN | Ej. `PBA-PRIMARY-MAT`, `PBA-PRIMARY-ART-PLASTICA` |
| `name` | text | NN | Nombre abreviado |
| `official_name` | text | NN | Nombre exacto en el DC |
| `area_kind` | text | NN | AREA / SUBAREA / MODULE / TRANSVERSAL_CONTENT / FRAMEWORK |
| `parent_area_id` | uuid | FK→curriculum_areas | NULL salvo sub-áreas |
| `source_id` | uuid | FK→document_sources, NN | |
| `level_id` | uuid | FK→education_levels, NN | |
| `page_start_digital` | int | | |
| `page_end_digital` | int | | |
| `page_start_printed` | int | | |
| `page_end_printed` | int | | |
| `table_structure_type` | text | | A / B / C / D / NONE (ver EXTRACTION_STRATEGY.md) |
| `notes` | text | | |

**CHECK:** `area_kind IN ('AREA','SUBAREA','MODULE','TRANSVERSAL_CONTENT','FRAMEWORK')`
**CHECK:** `(area_kind = 'SUBAREA' AND parent_area_id IS NOT NULL) OR (area_kind <> 'SUBAREA')`
**CHECK:** `page_start_digital <= page_end_digital`
**CHECK:** `page_start_digital BETWEEN 1 AND 433` (para DC PBA 2018; genérico: > 0)

---

## `curriculum_blocks`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `stable_code` | text | UK, NN | Ej. `PBA-PRIMARY-MAT-C2-BLQ-FRACCIONES` |
| `name` | text | NN | Nombre del bloque tal como aparece en el DC |
| `area_id` | uuid | FK→curriculum_areas, NN | |
| `cycle_id` | uuid | FK→curriculum_cycles | NULL si aplica a un año específico |
| `year_id` | uuid | FK→education_years | NULL si es del ciclo entero |
| `block_number` | int | | Número de orden dentro del área/ciclo |
| `page_start_digital` | int | NN | |
| `page_end_digital` | int | NN | |
| `page_start_printed` | int | NN | |
| `page_end_printed` | int | NN | |

**CHECK:** `(cycle_id IS NOT NULL OR year_id IS NOT NULL)`

---

## `curriculum_elements`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | Identificador interno |
| `stable_id` | text | UK, NN | Ej. `CSS-2C-4-BLQ1-CON-0003` |
| `element_type` | text | NN | Ver enum en DATA_MODEL.md §4.9 |
| `area_id` | uuid | FK→curriculum_areas, NN | |
| `block_id` | uuid | FK→curriculum_blocks | NULL para propósitos/objetivos fuera de bloque |
| `year_scope` | text | NN | YEAR / CYCLE / DOCUMENT |
| `original_text` | text | NN | Texto tal como se extrajo del PDF |
| `normalized_text` | text | | Texto normalizado (sin hiphenación, tildes corregidas) |
| `extraction_method` | text | NN, D 'MANUAL' | MANUAL / SCRIPT_A / SCRIPT_B / SCRIPT_C |
| `review_status` | text | NN, D 'extracted' | extracted / pending / ambiguous / validated / rejected / replaced |
| `replaced_by_id` | uuid | FK→curriculum_elements | Apunta al sucesor cuando status = replaced |
| `notes` | text | | Notas del revisor; obligatorio si status = ambiguous |
| `created_at` | timestamptz | NN, D now() | |
| `updated_at` | timestamptz | NN, D now() | |

**CHECK:** `element_type IN ('CONCEPT','CONTENT','WAY_OF_KNOWING','PROGRESS_INDICATOR','TEACHING_SITUATION','YEAR_OBJECTIVE','AREA_PURPOSE','CYCLE_PURPOSE','DIDACTIC_GUIDANCE','EVAL_GUIDANCE','TRANSVERSAL')`
**CHECK:** `review_status IN ('extracted','pending','ambiguous','validated','rejected','replaced')`
**CHECK:** `year_scope IN ('YEAR','CYCLE','DOCUMENT')`
**CHECK:** `(review_status = 'replaced' AND replaced_by_id IS NOT NULL) OR review_status <> 'replaced'`
**CHECK:** `(review_status = 'ambiguous' AND notes IS NOT NULL) OR review_status <> 'ambiguous'`

---

## `element_source_refs`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `element_id` | uuid | FK→curriculum_elements, NN | |
| `source_id` | uuid | FK→document_sources, NN | |
| `digital_page` | int | NN | Página digital (1-indexed) |
| `printed_page` | int | NN | Página impresa = digital − 1 (regla DC PBA 2018) |
| `section_name` | text | | Nombre del área/sección |
| `table_name` | text | | Nombre de la tabla (ej. "Bloque 1") |
| `row_index` | int | | Fila en la tabla (0-indexed) |
| `column_index` | int | | Columna en la tabla (0=Conceptos, 1=Modos, 2=Indicadores) |
| `column_name` | text | | Nombre de la columna |
| `bbox_x0` | float | | Coordenada X izquierda del span en el PDF |
| `bbox_y0` | float | | Coordenada Y superior del span |
| `bbox_x1` | float | | Coordenada X derecha |
| `bbox_y1` | float | | Coordenada Y inferior |
| `span_text` | text | | Fragmento de texto exacto en la referencia |
| `notes` | text | | |

**CHECK:** `digital_page BETWEEN 1 AND 433`  — para DC PBA 2018 (genérico: > 0)
**CHECK:** `printed_page = digital_page - 1`  — para DC PBA 2018 (relajar para otras fuentes)
**CHECK:** `column_index BETWEEN 0 AND 2 OR column_index IS NULL`

---

## `element_year_scope`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `element_id` | uuid | FK→curriculum_elements, NN | PK compuesto |
| `year_id` | uuid | FK→education_years | NULL si es ciclo/documento |
| `cycle_id` | uuid | FK→curriculum_cycles | NULL si es año específico |
| `scope_kind` | text | NN | YEAR / CYCLE / DOCUMENT |

**PK:** (`element_id`, `year_id`, `cycle_id`) con NULL tratado como valor
**CHECK:** `(scope_kind = 'YEAR' AND year_id IS NOT NULL) OR (scope_kind = 'CYCLE' AND cycle_id IS NOT NULL) OR scope_kind = 'DOCUMENT'`

---

## `element_relations`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `source_element_id` | uuid | FK→curriculum_elements, NN | Elemento de origen |
| `target_element_id` | uuid | FK→curriculum_elements, NN | Elemento de destino |
| `relation_type` | text | NN | Ver DATA_MODEL.md §4.12 |
| `relation_basis` | text | NN | SOURCE_EXPRESSED / PEDAGOGICALLY_INFERRED / TERMINOLOGICAL |
| `source_ref_id` | uuid | FK→element_source_refs | Referencia documental que respalda la relación |
| `notes` | text | | Obligatorio si relation_basis = PEDAGOGICALLY_INFERRED |

**UK:** (`source_element_id`, `target_element_id`, `relation_type`)
**CHECK:** `source_element_id <> target_element_id`
**CHECK:** `relation_basis IN ('SOURCE_EXPRESSED','PEDAGOGICALLY_INFERRED','TERMINOLOGICAL')`
**CHECK:** `(relation_basis = 'PEDAGOGICALLY_INFERRED' AND notes IS NOT NULL) OR relation_basis <> 'PEDAGOGICALLY_INFERRED'`

---

## `term_aliases`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NN | |
| `canonical_term` | text | NN | Término oficial en el DC |
| `alias_text` | text | NN | Alias o sinónimo |
| `alias_kind` | text | NN | OFFICIAL_NAME / SEARCH_ALIAS / VALIDATED_SYNONYM / RELATED_TERM / PARTIAL_EQUIVALENCE / AMBIGUOUS |
| `scope_area_id` | uuid | FK→curriculum_areas | NULL = válido para todas las áreas |
| `notes` | text | | Obligatorio si alias_kind = AMBIGUOUS |

**UK:** (`canonical_term`, `alias_text`, `alias_kind`)
**CHECK:** `alias_kind IN ('OFFICIAL_NAME','SEARCH_ALIAS','VALIDATED_SYNONYM','RELATED_TERM','PARTIAL_EQUIVALENCE','AMBIGUOUS')`
