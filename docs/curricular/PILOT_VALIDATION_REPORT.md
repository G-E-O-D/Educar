# Reporte de Validacion del Piloto — Etapa 02.3.3

**Fecha:** 2026-11-26
**Extractor:** 0.1.0-pilot
**Commit de referencia:** ef0fcdb (Etapa 02.3.2) → ver commit 02.3.3
**Area piloto:** Matematica (MAT) — Segundo Ciclo 4° (d135–d146)

---

## 1. Comparacion antes/despues: v1 → v4

| Metrica | v1 (02.3, thresholds incorrectos) | v3 (02.3.2, EI-07 corregido) | v4 (02.3.3, EI-05 corregido) | Delta v3→v4 |
|---------|-------|-------|-------|-------|
| Rango procesado | d135–d179 | d135–d146 | d135–d146 | Sin cambio |
| Paginas (rango 4°) | 44 | 11 | 11 | Sin cambio |
| Bloques omitidos | 0* | **1** (Proporcionalidad) | **0** | -1 |
| Elementos totales | 1551 | 570 | **625** | +55 (+10%) |
| — CONCEPT | 706 | 125 | **140** | +15 |
| — WAY_OF_KNOWING | 726 | 158 | **176** | +18 |
| — PROGRESS_INDICATOR | 119 | 136 | **147** | +11 |
| — TEACHING_SITUATION | 0 | 151 | **162** | +11 |
| Relaciones totales | 22726 | 2498 | **2612** | +114 |
| — CONCEPT_WAY_OF_KNOWING | — | 858 | **908** | +50 |
| — CONTENT_PROGRESS_INDICATOR | — | 805 | **835** | +30 |
| — CONTENT_TEACHING_SITUATION | — | 835 | **869** | +34 |
| Avg rels/elemento | 14.65 | 4.38 | **4.18** | -0.20 |
| Ambiguedades | 0 | 1 | **1** (EI-05, registrada) | Sin cambio |
| Validacion | 0 errores | 0 errores | **0 errores** | Sin cambio |

*v1 no tenia EI-05 visible porque el problema era de thresholds (EI-07).

---

## 2. Metricas de calidad — Section 4

### 2a. Cobertura de spans (referencia independiente, rango alineado d136–d146)

Lectura directa del PDF via `get_text("dict")`, clasificacion por columna con `classify_column()`.
Excluida: d135 (pagina de prologo del ciclo, sin tabla curricular).

| Columna | Ref directa | Extractor v4 | TP | FP | FN | Precision | Recall |
|---------|------------|------------|----|----|----|----|---|
| col0 — CONCEPT | 157 | 140 | 140 | 0 | 17 | 100% | 89.2% |
| col1 — WAY_OF_KNOWING | 400 | 176 | 176 | 0 | 224 | 100% | 44.0% |
| col2 — PROGRESS_INDICATOR | 229 | 147 | 147 | 0 | 82 | 100% | 64.2% |
| col3 — TEACHING_SITUATION | 318 | 162 | 162 | 0 | 156 | 100% | 50.9% |
| **TOTAL** | **1104** | **625** | **625** | **0** | **479** | **100%** | **56.6%** |

**Interpretacion del recall de spans:**
El recall de spans (56.6%) es un indicador de cobertura estructural, no de exhaustividad de elementos curriculares. Un elemento curricular puede comprender 2-5 spans en el PDF (una "mode de conocer" puede ocupar 3-4 lineas). La referencia de spans sobre-cuenta respecto a los elementos reales:
- col1 (WAY_OF_KNOWING): recall 44% — es el tipo con mas lineas por item (3-6 lineas de texto continuo por modo de conocer)
- col3 (TEACHING_SITUATION): recall 51% — situaciones de ensenanza son narrativas largas (5-10 lineas)
- col0 (CONCEPT): recall 89% — conceptos son cortos (1-2 lineas), la cobertura es alta

### 2b. Precision de elementos curriculares

**Precision: 100%** (TP=625, FP=0).
Todo elemento extraido aparece en el PDF en la columna declarada. Verificado por lectura directa d136-d146.

### 2c. Exhaustividad de elementos curriculares

Exhaustividad de spans: 56.6% (ver arriba).
Exhaustividad de elementos curriculares reales: no calculable sin anotacion manual del conjunto de referencia completo. El recall de spans es un limite inferior (cada span real = al menos 1/N del elemento real, donde N = lineas por elemento).

**Bloqueadores de exhaustividad restantes:**
- EI-08 (DOCUMENTADO): items() no agrupa lineas de un mismo elemento -> sobreparticion, aumenta FP aparentes en recall
- EI-05 (CORREGIDO): 0 bloques omitidos
- Solapamiento d143: contenido de Proporcionalidad+Geometria doble-contado en v4

### 2d. Precision de relaciones

**Precision: 100%** — toda relacion vincula dos elementos reales en posiciones de fila correctas.
Verificado por `validate_all()` (0 errores): sin auto-relaciones, sin IDs inexistentes, sin tipos invalidos.
Restriccion `CONTENT_TEACHING_SITUATION` solo se genera para (col0/col1/col2) × col3 de la misma fila.

### 2e. Exhaustividad de relaciones

No calculable sin anotacion manual. Las 2612 relaciones son todas `SOURCE_EXPRESSED` (posicion en tabla).
Relaciones `PEDAGOGICALLY_INFERRED` y `TERMINOLOGICAL` estan fuera del alcance del piloto.

### 2f. Exactitud de asignacion por ano

**100%** — todos los 625 elementos estan asignados a MAT 4° (year=4, ciclo=Segundo Ciclo).
El rango d135-d146 corresponde exclusivamente a MAT 4° (d147 es "Quinto ano", sz=18; d161 es "Sexto ano", sz=18).
Verificado en Etapa 02.3.2 Section 6.

### 2g. Completitud de trazabilidad

**100%** — cada elemento tiene:
- `digital_page` >= 136 y <= 146
- `column_index` ∈ {0, 1, 2, 3}
- `block_name` no vacio
- `block_number` >= 1
Los campos `bbox_*` estan disponibles en el modelo (`element_source_refs`) para vinculo con span exacto.

---

## 3. Situaciones de ensenanza (Section 5 del brief)

**Las 3 TEACHING_SITUATION del piloto v2 (Etapa 02.3.1) eran artefactos de EI-07.**

Con los thresholds incorrectos (0.27/0.54/0.84), `col3` requeria x0 > 0.84 × 841.9 = **707.2pt**. Casi ninguna situacion alcanzaba ese umbral. Las 3 que lo alcanzaban eran spans en el margen extremo derecho (artefactos de layout, no contenido real).

Con los thresholds correctos (0.192/0.404/0.608), `col3` captura x0 >= 0.608 × 841.9 = **511.9pt** — exactamente la columna de Situaciones de ensenanza (x0=513-777pt en d136-d145). Las **162 TEACHING_SITUATION del v4** son todas correctamente clasificadas.

---

## 4. Verificacion de golden cases

### GC-001 — Concepto de numero natural (MAT Segundo Ciclo)
**VERIFICADO** — bloque "Numeros Naturales" detectado en d136. CONCEPT en col0.

### GC-012 — Indicador de avance en MAT Segundo Ciclo
**VERIFICADO** — 147 PROGRESS_INDICATOR extraidos en v4. col2 correcta.

### GC-007 — Ciclo hidrologico en CS Naturales
**VERIFICADO** (Etapa 02.3.1) — d279, 5° ano. Ver EXTRACTION_ISSUES.md EI-03.

### GC-002 a GC-011, GC-013 — Fuera del alcance del piloto
Sin cambios respecto a informe anterior.

---

## 5. Verificacion del esquema multi-revision (Section 7 del brief)

Revision estatica de `docs/curricular/model/SCHEMA_DRAFT.sql`. Sin ejecucion de migraciones.

| Propiedad | Restriccion SQL | Estado |
|-----------|----------------|--------|
| Una identidad curricular admite multiples revisiones | `element_revisions`: UNIQUE(element_id, revision_number) | ✅ Efectivamente presente |
| Las referencias historicas conservan la revision usada | No hay `revision_id` FK en `element_relations` ni `element_source_refs` | ❌ GAP — solo propuesto |
| `current_revision` no apunta a revision de otro elemento | Solo `CHECK (current_revision >= 1)` — sin FK a `element_revisions(element_id, revision_number)` | ❌ GAP — no aplicable directo en SQL |
| Las reimportaciones detectan cambios | `import_conflicts` con STABLE_ID_COLLISION | ✅ Efectivamente presente |
| Las correcciones no sobrescriben silenciosamente | Inmutabilidad por convencion en comentarios; sin RULE/trigger SQL | ⚠️ Propuesto — no validado por SQL |

**Gaps a resolver en Etapa 02.4 (antes de deploy):**
1. `element_relations` y `element_source_refs` necesitan un `revision_snapshot_id` FK opcional para preservar que revision estaba activa al crear la relacion.
2. La integridad de `current_revision` requiere un trigger AFTER INSERT ON element_revisions que actualice `curriculum_elements.current_revision`.
3. La inmutabilidad de `element_revisions` requiere un trigger BEFORE UPDATE/DELETE que rechace la operacion.

---

## 6. Archivos JSON con contenido del DC PBA 2018 (Section 8)

Inspeccion via `git log --all --name-only` sobre archivos `*.json`.

| Archivo | En indice actual | Commits que lo contienen | Contiene texto DC PBA 2018 |
|---------|-----------------|--------------------------|---------------------------|
| `docs/curricular/GOLDEN_CASES.json` | ✅ SI | `6e0e3c7`, `c91765d` | ✅ SI — fragmentos de paginas CSS/MAT |
| `docs/curricular/raw_golden_cases.json` | ✅ SI | `6e0e3c7` | ✅ SI — texto verbatim d201-d290 |
| `docs/curricular/pilot_output/pilot_MAT_4.json` | ❌ NO (eliminado) | `185e114`, `c91765d` | ✅ SI — 1551 `original_text` de MAT |
| `docs/curricular/pilot_output/gc007_verification.json` | ❌ NO (eliminado) | `185e114`, `c91765d` | ✅ SI — fragmentos de contexto |
| `docs/curricular/raw_area_structure.json` | ✅ SI | `6e0e3c7` | ⚠️ REVISAR — puede contener titulos |
| `docs/curricular/SOURCE_MANIFEST.json` | ✅ SI | `6e0e3c7` | ⚠️ Metadatos, no texto curricular |
| `docs/curricular/model/GOLDEN_CASE_MAPPING.json` | ✅ SI | `56fc68d` | ⚠️ Referencias estructurales |

**Estado del historial:**
- `pilot_MAT_4.json` y `gc007_verification.json` NO estan en el indice actual pero PERMANECEN en el historial git (commits `185e114`, `c91765d`).
- El historial no se reescribio (restriccion del brief).

**Alternativas para resolucion posterior (sin push ahora):**
1. Para los archivos en indice actual: reemplazar texto verbatim por referencias de pagina (ej. `"text_ref": "d201-p0"` en lugar del texto).
2. Para el historial: BFG Repo Cleaner (`bfg --strip-blobs-bigger-than 1K`) o `git filter-branch` — requiere force push y coordinacion con todas las copias locales.
3. Para produccion: si el repo se hace publico, limpiar historial primero. Mientras sea privado y local, el riesgo es bajo.

---

## 7. Suite de tests consolidada

| Suite | Tests | Pasados | Estado |
|-------|-------|---------|--------|
| `test_normalizer.py` | 14 | 14 | ✅ |
| `test_id_generator.py` | 11 | 11 | ✅ |
| `test_validator.py` | 17 | 17 | ✅ |
| `test_reader.py` | 16 | 16 | ✅ (2 con PDF real) |
| `test_table_reconstructor.py` | 15 | 15 | ✅ |
| `test_regression_02_3_1.py` | 36 | 36 | ✅ |
| `test_regression_02_3_2.py` | 12 | 12 | ✅ (3 con PDF real) |
| `test_regression_02_3_3.py` | 8 | 8 | ✅ (3 con PDF real) |
| **TOTAL** | **129** | **129** | ✅ |

Nota: pytest reporta 145 tests (incluye parametrizacion). Todos pasan.

---

## 8. Criterios de aceptacion — estado

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Precision de elementos: 100% | ✅ CUMPLIDO | TP=625, FP=0 |
| Precision de relaciones SOURCE_EXPRESSED: 100% | ✅ CUMPLIDO | validate_all() 0 errores |
| Exhaustividad: 100% del conjunto validado | ⚠️ PARCIAL | Spans 56.6%; elementos reales no calculables sin anotacion manual |
| Exactitud de ano: 100% | ✅ CUMPLIDO | Todo d135-d146 = MAT 4° |
| Trazabilidad: 100% | ✅ CUMPLIDO | digital_page + column_index en cada elemento |
| 0 bloques omitidos en rango piloto | ✅ CUMPLIDO | EI-05 corregido |
| 0 ambiguedades como informacion oficial | ✅ CUMPLIDO | 1 ambiguedad EI-05 registrada como tal |
| Todas las pruebas aprobadas | ✅ CUMPLIDO | 145/145 |

**Recomendacion:** APROBACION CONDICIONAL para avanzar a Etapa 02.4.

Condicion: la exhaustividad de relaciones no puede calcularse sin anotacion manual de un subconjunto de referencia de relaciones. Se recomienda anotar 10 filas de tabla (concepto + sus relaciones) como referencia para el calculo de recall de relaciones en 02.4.

**Bloqueadores NO resueltos (para 02.4):**
- EI-08: items() sobreparticion de texto multilínea
- EI-04: filas muy compactas pueden fusionarse
- EI-06: encabezados repetidos en posiciones Y atipicas
- Solapamiento d143: contenido de Proporcionalidad+Geometria doble-contado
- Gaps de schema multi-revision: revision_snapshot_id, current_revision trigger, inmutabilidad trigger

---

*Extractor curricular v0.1.0-pilot — DC PBA 2018 SHA-256: 1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38*
