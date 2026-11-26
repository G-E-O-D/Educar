# DATA_MODEL.md — Modelo de datos curricular
**Etapa 02.2 · Fecha: 2026-11-26**

---

## 1. Propósito y alcance

Este modelo representa el contenido del Diseño Curricular para la Educación Primaria de la Provincia de Buenos Aires (DC PBA 2018, Resolución N° 1482/17) en una base de datos relacional compatible con PostgreSQL, Supabase y pgvector.

**Alcance de esta versión:**
- Jurisdicción: Provincia de Buenos Aires
- Nivel: Educación Primaria (1° a 6° año)
- Fuente: DC PBA 2018 (SHA-256: `1C53A2CC9D8AACC1D1B4CFD6DEAC2AF7FCDAD0834D232C9C391705EB46271A38`)

**Extensibilidad prevista:** el modelo acepta otras jurisdicciones y niveles sin cambio de esquema.

---

## 2. Principios de diseño

1. **Trazabilidad obligatoria.** Todo elemento curricular referencia la página exacta del documento fuente.
2. **Texto original preservado.** El campo `original_text` guarda el texto tal como aparece en el PDF. La normalización se hace en campos separados.
3. **Separación de lo oficial y lo inferido.** Las relaciones llevan un campo `relation_basis` que distingue relaciones expresadas por la fuente de las pedagógicamente inferidas.
4. **Versionado no destructivo.** Los registros no se eliminan; se marcan como `replaced` con puntero al sucesor.
5. **Estados de revisión explícitos.** Ningún registro llega a la interfaz docente sin `review_status = 'validated'`.
6. **Idempotencia.** Una reimportación del mismo documento con el mismo hash no crea duplicados.

---

## 3. Capas del modelo

```
┌─────────────────────────────────────────────────────────┐
│ CAPA 1 — FUENTES DOCUMENTALES                          │
│ document_sources, source_relations                      │
└──────────────────────┬──────────────────────────────────┘
                       │ 1:N
┌──────────────────────▼──────────────────────────────────┐
│ CAPA 2 — ORGANIZACIÓN EDUCATIVA                         │
│ jurisdictions → education_levels → curriculum_cycles    │
│ → education_years → curriculum_areas → curriculum_subareas│
│ → curriculum_blocks                                     │
└──────────────────────┬──────────────────────────────────┘
                       │ 1:N
┌──────────────────────▼──────────────────────────────────┐
│ CAPA 3 — UNIDADES CURRICULARES                          │
│ curriculum_elements (polimórfico por element_type)      │
│ element_source_refs (trazabilidad)                      │
│ element_year_scope (alcance año/ciclo)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ M:N
┌──────────────────────▼──────────────────────────────────┐
│ CAPA 4 — RELACIONES                                     │
│ element_relations (con relation_basis y relation_type)  │
│ transversal_relations                                   │
│ term_aliases                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Entidades principales

### 4.1 `document_sources`

Registra las fuentes documentales oficiales.

Campos clave: `id`, `stable_code`, `title`, `organism`, `jurisdiction_id`, `resolution_number`, `resolution_date`, `publication_year`, `sha256`, `provenance_url`, `validity_status`, `verification_status`, `reuse_conditions`, `version_tag`, `notes`.

**Estados de vigencia** (`validity_status`): `draft`, `active`, `partially_modified`, `superseded`, `revoked`.

**Estados de verificación** (`verification_status`): `unverified`, `partially_verified`, `verified`.

> DC PBA 2018: `validity_status = 'active'` (referenciado por DGCyE en 2026, ver D-02 en DECISIONS.md); `verification_status = 'partially_verified'` (vigencia normativa exhaustiva pendiente, ver I-01).

### 4.2 `source_relations`

Relaciones entre fuentes documentales: `UPDATES`, `SUPERSEDES`, `SUPPLEMENTS`, `COMPLEMENTS`.

### 4.3 `jurisdictions`

Tabla de jurisdicciones: `id`, `code` (ej. `PBA`), `name`, `country_code`.

### 4.4 `education_levels`

Niveles educativos: `id`, `code` (ej. `PRIMARY`), `name`, `jurisdiction_id`.

### 4.5 `curriculum_cycles`

Ciclos dentro de un nivel: `id`, `code` (ej. `PBA-PRIMARY-C1`), `name` (Primer Ciclo / Segundo Ciclo), `level_id`, `year_range` (ej. `[1,2,3]`).

### 4.6 `education_years`

Años escolares: `id`, `year_number` (1–6), `name` (ej. `1° año`), `cycle_id`.

**Caso especial:** Unidad Pedagógica (1° + 2°) se modela como `year_number = NULL` con `cycle_id` = Primer Ciclo y `special_scope = 'UP_1_2'`.

### 4.7 `curriculum_areas`

Áreas, sub-áreas y módulos. Campo `area_kind`:
- `AREA` — área oficial con desarrollo curricular (7 áreas)
- `SUBAREA` — sub-área de Educación Artística (Plástica, Música, Danza, Teatro)
- `MODULE` — módulo transversal con desarrollo propio (Ed. Inclusiva, TIC)
- `TRANSVERSAL_CONTENT` — contenido transversal sin sección propia (FEyC, Ed. Tecnológica)
- `FRAMEWORK` — marco general (Principios organizadores)

Campos: `id`, `stable_code`, `name`, `official_name`, `area_kind`, `parent_area_id`, `source_id`, `page_range_digital`, `page_range_printed`, `table_structure_type` (A, B, C, D per EXTRACTION_STRATEGY).

### 4.8 `curriculum_blocks`

Bloques dentro de un área/ciclo. Campos: `id`, `stable_code`, `name`, `area_id`, `cycle_id`, `block_number`, `page_range_digital`, `page_range_printed`, `source_ref`.

### 4.9 `curriculum_elements`

Tabla central polimórfica. Campo `element_type`:

| Tipo | Código | Áreas típicas |
|------|--------|---------------|
| Concepto | `CONCEPT` | Mat, CSS, CSN, PdL |
| Contenido | `CONTENT` | Todas |
| Modo de conocer | `WAY_OF_KNOWING` | Mat, CSS, CSN |
| Indicador de avance | `PROGRESS_INDICATOR` | Mat, CSS, CSN |
| Situación de enseñanza | `TEACHING_SITUATION` | Todas |
| Objetivo de año | `YEAR_OBJECTIVE` | Todas |
| Propósito del área | `AREA_PURPOSE` | Todas |
| Propósito del ciclo | `CYCLE_PURPOSE` | Todas |
| Orientación didáctica | `DIDACTIC_GUIDANCE` | Algunas |
| Orientación de evaluación | `EVAL_GUIDANCE` | Algunas |
| Contenido transversal | `TRANSVERSAL` | ESI, FEyC, Ed. Ambiental |

**Campos de trazabilidad embebidos:**
`id`, `stable_id`, `element_type`, `area_id`, `block_id`, `year_scope` (YEAR/CYCLE/DOCUMENT), `original_text`, `normalized_text`, `extraction_method` (MANUAL/SCRIPT_A/SCRIPT_B), `review_status`, `replaced_by_id`, `notes`, `created_at`, `updated_at`.

**Estados de revisión** (`review_status`): `extracted`, `pending`, `ambiguous`, `validated`, `rejected`, `replaced`.

### 4.10 `element_source_refs`

Trazabilidad documental por elemento. Permite múltiples referencias (elemento que continúa en varias páginas).

Campos: `id`, `element_id`, `source_id`, `digital_page`, `printed_page`, `section_name`, `table_name`, `row_index`, `column_index`, `column_name`, `bbox_x0`, `bbox_y0`, `bbox_x1`, `bbox_y1` (coordenadas PDF, opcionales), `span_text`, `notes`.

**Regla de integridad:** Todo `curriculum_element` debe tener al menos un `element_source_ref`.

### 4.11 `element_year_scope`

Tabla puente que relaciona un elemento con los años o ciclos a los que aplica.

Campos: `element_id`, `year_id` (NULL si aplica a todo el ciclo), `cycle_id`, `scope_kind` (YEAR / CYCLE / DOCUMENT).

**Caso ciclo completo:** `year_id = NULL`, `cycle_id = Primer Ciclo`, `scope_kind = CYCLE`.

### 4.12 `element_relations`

Relaciones entre elementos curriculares.

Campos: `id`, `source_element_id`, `target_element_id`, `relation_type`, `relation_basis`, `source_ref`, `notes`.

**Tipos de relación** (`relation_type`):
- `CONCEPT_WAY_OF_KNOWING` — concepto con su modo de conocer (tabla tricolumna)
- `CONTENT_PROGRESS_INDICATOR` — contenido con indicador de avance
- `CONTENT_TEACHING_SITUATION` — contenido con situación de enseñanza
- `YEAR_PROGRESSION` — mismo contenido en año sucesivo (progresión)
- `PREREQUISITE` — prerrequisito documentado
- `TRANSVERSAL_LINK` — relación entre área principal y contenido transversal
- `CYCLE_TO_YEAR` — refinamiento de contenido de ciclo a año

**Bases de relación** (`relation_basis`):
- `SOURCE_EXPRESSED` — la fuente lo expresa explícitamente (posición en tabla)
- `PEDAGOGICALLY_INFERRED` — inferencia pedagógica sin respaldo textual explícito
- `TERMINOLOGICAL` — equivalencia de términos

### 4.13 `term_aliases`

Gestión de sinónimos y equivalencias terminológicas.

Campos: `id`, `canonical_term`, `alias_text`, `alias_kind`, `scope_area_id` (NULL = global), `notes`.

**Tipos de alias** (`alias_kind`):
- `OFFICIAL_NAME` — nombre oficial en el DC
- `SEARCH_ALIAS` — alias para búsqueda (ej. "ciclo del agua" → "ciclo hidrológico")
- `VALIDATED_SYNONYM` — sinónimo validado por docente/auditor
- `RELATED_TERM` — término relacionado pero no equivalente
- `PARTIAL_EQUIVALENCE` — equivalencia parcial (compartir contexto pero no contenido)
- `AMBIGUOUS` — equivalencia dudosa; no usar para recuperación automática

### 4.14 `document_sections` (auxiliar)

Para registrar secciones del DC que no son áreas extraíbles (ej. Principios organizadores).

Campos: `id`, `source_id`, `section_name`, `section_kind` (FRAMEWORK / BIBLIOGRAPHY / ANNEX), `page_range_digital`, `page_range_printed`, `notes`.

---

## 5. Separación lógica de repositorios

El modelo contempla 4 espacios de contenido (aislables por schema de PostgreSQL):

| Schema | Contenido |
|--------|-----------|
| `curriculum` | Repositorio curricular oficial (DC PBA y futuros DC) |
| `resources` | Recursos didácticos (fichas, videos, etc.) — alcance futuro |
| `inclusive_ed` | Contenidos de educación inclusiva / DUA |
| `teacher_docs` | Documentos privados de docentes — alcance futuro |

En esta etapa se diseña únicamente el schema `curriculum`.

---

## 6. Preparación para búsqueda y pgvector

El modelo admite sin cambio de esquema:
- **Full Text Search** sobre `normalized_text` (índice `tsvector`)
- **pgvector** mediante tabla adicional `element_embeddings` (`element_id` FK + `embedding vector(1536)` + `model_name` + `model_version` + `created_at`)
- **Búsqueda híbrida** combinando score FTS y score coseno sobre `element_embeddings`
- **Filtros determinísticos** via FK a `curriculum_areas`, `curriculum_cycles`, `education_years`
- **Sinónimos** via `term_aliases` consultada antes del query principal

Los embeddings no se generan en esta etapa.

---

## 7. Vigencia normativa — evidencia externa registrada

El propietario del proyecto aportó la siguiente evidencia sin conexión a servicios externos:

> URL: `https://continuemosestudiando.abc.gob.ar/contenido/leer-en-comunidad-2025-2026/`  
> Descripción: Documento oficial de DGCyE actualizado el 24 de abril de 2026 que continúa referenciando el Diseño Curricular de Educación Primaria de 2018.  
> Fecha del aporte: 2026-11-26

Esta evidencia se registra en `document_sources.notes` para el DC PBA 2018 y actualiza el estado de I-01 de `PENDIENTE` a `PARCIALMENTE_VERIFICADO`.

**Nota:** Esta evidencia no reemplaza la verificación exhaustiva en el SINBA / Boletín Oficial PBA. I-01 permanece abierto hasta esa verificación.

El campo `verification_status` del `document_sources` para el DC PBA 2018 pasa de `unverified` a `partially_verified`.
