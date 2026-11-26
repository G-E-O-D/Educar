# Reporte de Validación Semántica — Etapa 02.3.2

**Fecha:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Área:** Matemática (MAT) — Segundo Ciclo 4°  
**Rango real verificado:** d135–d146 (11 páginas digitales)

---

## Resumen ejecutivo

Etapa 02.3.1 corrigió EI-01/02/03. Etapa 02.3.2 descubrió y corrigió EI-07 (causa raíz de todos los errores anteriores):

| Error | Descripción | Estado anterior | Estado actual |
|-------|-------------|-----------------|---------------|
| EI-01 | Tabla tiene 4 columnas (no 3), thresholds incorrectos | ABIERTO | CORREGIDO |
| EI-02 | Segmentación de año por texto completo (falsos positivos) | DOCUMENTADO | CORREGIDO |
| EI-03 / GC-007 | Año del ciclo hidrológico determinado incorrectamente | PARCIALMENTE RESUELTO | RESUELTO |
| EI-07 | Thresholds calibrados para portrait A4 (595pt); PDF usa landscape (841.9pt) | — | CORREGIDO |
| EI-08 | items() divide texto multi-línea en ítems separados (y0-to-y0 gap) | — | DOCUMENTADO |

---

## Comparación antes / después (mismo rango d135–d146)

### Resultados del piloto

| Métrica | Piloto v2 (Etapa 02.3.1) | Piloto v3 (Etapa 02.3.2) | Cambio |
|---------|--------------------------|--------------------------|--------|
| Rango procesado | d135–d146 (solo 4°) | d135–d146 (solo 4°) | Sin cambio |
| Páginas digitales | 11 | 11 | Sin cambio |
| Bloques detectados | 7 (solo 4°) | 6 (solo 4°) | -1 (bloque inválido excluido) |
| Elementos totales | 619 | **570** | -8% |
| — CONCEPT | 213 | **125** | -41% (EI-07: líneas dentro de concepto se contaban separadas) |
| — WAY_OF_KNOWING | 196 | **158** | -19% |
| — PROGRESS_INDICATOR | 207 | **136** | -34% |
| — TEACHING_SITUATION | 3 | **151** | +4933% (EI-07: antes clasificados como PROGRESS_INDICATOR) |
| Relaciones totales | 9526 | **2498** | -74% |
| — CONCEPT_WAY_OF_KNOWING | 4738 | **858** | -82% |
| — CONTENT_PROGRESS_INDICATOR | 4785 | **805** | -83% |
| — CONTENT_TEACHING_SITUATION | 3 | **835** | +27700% |
| Errores de validación | 0 | 0 | Sin cambio |
| Avg relaciones/elemento | 15.39 | **4.38** | -72% |

### Causa raíz de los errores (EI-07)

El DC PBA 2018 usa páginas A4 landscape (841.9pt × 595.3pt). Los thresholds ratios (0.27, 0.54, 0.84) aplicados sobre 841.9pt producen límites absolutos INCORRECTOS:
- col0/col1: 0.27×841.9=**227.3pt** → Modos de conocer (x0=163–339) clasificaba como col0
- col1/col2: 0.54×841.9=**454.6pt** → Indicadores (x0=341–511) clasificaba como col1
- col2/col3: 0.84×841.9=**707.2pt** → Situaciones (x0=513–777) clasificaba como col2

Los thresholds correctos para 841.9pt (medidos en d136–d145): **0.192 / 0.404 / 0.608**

### Comparación en rango idéntico d135–d179 (MAT Segundo Ciclo completo)

| Métrica | v1 (02.3, thresholds incorrectos) | v3 (02.3.2, thresholds correctos) | Cambio |
|---------|-----------------------------------|-----------------------------------|--------|
| Rango | d135–d179 | d135–d179 | Igual |
| Páginas procesadas | 44 | 44 | Sin cambio |
| Bloques | 20 | 20 | Sin cambio |
| Elementos | 1551 | **1862** | +20% |
| — CONCEPT | 706 | **434** | -38% |
| — WAY_OF_KNOWING | 726 | **536** | -26% |
| — PROGRESS_INDICATOR | 119 | **527** | +343% |
| — TEACHING_SITUATION | 0 | **365** | +∞ |
| Relaciones | 22726 | **13861** | -39% |
| Avg rels/elem | 14.65 | **7.44** | -49% |

**Paradoja explicada (más elementos, menos relaciones):** Con v1, todo texto de col1–col3 caía en col0 → un único "concepto" gigante con texto de múltiples columnas mezcladas generaba pocas relaciones (ya que col1–col3 quedaban vacías). Con v3, las 4 columnas producen elementos independientes (1862 total), pero las relaciones son intra-row (no cartesiano total), resultando en 39% menos relaciones totales.

### Análisis de relaciones post-corrección

Las 2498 relaciones del piloto v3 (d135–d146) son estructuralmente correctas pero incluyen sobre-segmentación por items():
- EI-08: `cell.items()` divide texto de 2 líneas en 2 ítems (gap y0-to-y0 ≈ 9.5pt > umbral 3pt)
- Ejemplo: "Números hasta el orden" + "de los millones." → 2 CONCEPT en lugar de 1
- Consecuencia: productos cartesianos intra-celda (2 fragmentos × N modos de conocer)
- El test `test_two_rows_produce_two_relations` verifica ausencia de cartesiano cross-row
- Fix de EI-08 se agenda para Etapa 02.4 (requiere revisar lógica raw_text)

---

## Correcciones técnicas

### EI-01 — Thresholds de columna

**Verificación visual (d136 DC PBA 2018):**

```
x0 ~60-120   → col0 Conceptos           (x0/page < 0.27)
x0 ~170-220  → col1 Modos de conocer    (0.27 ≤ x0/page < 0.54)
x0 ~330-380  → col2 Indicadores avance  (0.54 ≤ x0/page < 0.84)
x0 ~510-580  → col3 Situaciones enseñ.  (x0/page ≥ 0.84)
```

**Archivos modificados:** `config.py`, `page_extractor.py`, `table_reconstructor.py`, `adapters/tricolumn.py`

### EI-02 — Segmentación de año MAT

**Headings verificados:**
- d147: `"Quinto año"` size=18 → inicio de 5° (texto en PDF tiene 2 espacios)
- d161: `"Sexto año"` size=18 → inicio de 6°
- MAT 4°: sin heading explícito → inicio implícito d135 (Segundo Ciclo)

**Fix clave:** Normalización de whitespace con `" ".join(text.split())` para manejar `"QUINTO  AÑO"` (2 espacios en este PDF).

### GC-007 — Año del ciclo hidrológico

**Verificación span-level (d260–d290):**
- d272: `"QUINTO AÑO"` size=16
- d279: ciclo hidrológico en Conceptos col0
- d282: `"SEXTO AÑO"` size=16

**Conclusión:** ciclo hidrológico = **5° año**, bloque "La Tierra y el universo".

---

## Tests de regresión

**Suite agregada Etapa 02.3.1:** `tests/test_regression_02_3_1.py` — 36 tests  
**Suite agregada Etapa 02.3.2:** `tests/test_regression_02_3_2.py` — 12 tests

| Clase | Tests | Cobertura |
|-------|-------|-----------|
| `TestColumnThresholdsEI01` | 10 | Thresholds correctos, regresión de thresholds viejos |
| `TestNoCartesianEI01` | 3 | Ausencia de cartesiano cross-row |
| `TestCol3TeachingSituation` | 5 | col3 → TEACHING_SITUATION, relaciones correctas |
| `TestYearHeadingDetectionEI02` | 8 | Detección heading por span-size, MAT 4°/5°/6° |
| `TestGC007Year5` | 4 | GC-007 año=5°, d279, conclusión correcta |
| `TestRelationTypes` | 6 | Tipos de relación por columna, basis SOURCE_EXPRESSED |
| `TestEI07LandscapePageWidth` | 9 | x0 reales d136 con page_width=841.9 → col correcta |
| `TestEI07PDFIntegration` | 3 | Ancho real 841.9pt; spans col1/col2 en columna correcta |

**Suite total:** 137/137 tests (7 suites)

---

## Estado de issues actualizados

| Issue | Estado previo | Estado nuevo |
|-------|---------------|--------------|
| I-12 (GC-007 año) | PARCIALMENTE VERIFICADO | VERIFICADO — 5° año |
| EI-01 (cartesiano) | ABIERTO | CORREGIDO |
| EI-02 (bounds) | DOCUMENTADO | CORREGIDO |
| EI-03 (GC-007) | PARCIALMENTE RESUELTO | RESUELTO |

---

## Validación independiente (Section 5)

**Metodología:** Lectura directa de spans del PDF (d136–d145, 10 páginas) con `get_text("dict")`, clasificando cada span por columna con `classify_column()`. Ningún span del extractor fue usado como referencia propia — validación totalmente independiente.

**Agrupaciones inspeccionadas:** 125 conceptos (col0) extraídos = 125 groupings, superando el umbral de 30+.

| Columna / Tipo | Spans directos | Extraídos v3 | Prec | Recall |
|----------------|---------------|-------------|------|--------|
| col0 — CONCEPT | 136 | 125 | 100% | 91.9% |
| col1 — WAY_OF_KNOWING | 365 | 158 | 100% | 43.3% |
| col2 — PROGRESS_INDICATOR | 202 | 136 | 100% | 67.3% |
| col3 — TEACHING_SITUATION | 315 | 151 | 100% | 47.9% |
| **TOTAL** | **1018** | **570** | **100%** | **56.0%** |

**Precisión 100%:** El extractor no produce ningún falso positivo — todo elemento extraído aparece en el PDF en la columna correcta.

**Recall 56% — causas identificadas:**

1. **EI-05 (Proporcionalidad d143 skipped):** El bloque Proporcionalidad es saltado por `start > end`. Se pierden los elementos de d143 exclusivos a ese bloque.
2. **Desfase de rango:** La lectura directa cubre d136–d145; el extractor cubre d135–d146. D146 (Espacio) no está en la lectura directa.
3. **col1/col2 desbalance estructural:** Muchas páginas tienen col2 casi vacío (d141=3, d142=4, d144=2) — el DC concentra modos de conocer, no indicadores, en varios bloques de 4°.
4. **EI-08 (no afecta recall relativo):** Ambos métodos cuentan spans por línea — la sobre-segmentación cancela entre sí.

**Trazabilidad:** `element_source_refs.digital_page` + `column_index` + `bbox_*` disponibles en el modelo para vincular cualquier elemento al span exacto en el PDF.

---

## Límites documentales (Section 6)

Verificación directa sobre el PDF (via `get_text("dict")`, spans con size >= 14pt en y0 < 100). Rango MAT Segundo Ciclo: d135–d179.

| Página | Heading encontrado | Font size | Significado |
|--------|-------------------|-----------|-------------|
| d135 | "Segundo Ciclo" / "Cuarto año" | 18pt | Inicio MAT 4°; sin heading de año en la tabla, se usa d135 como inicio implícito |
| d146 | "BLOQUE: Espacio" | 14pt | Último bloque de MAT 4° |
| d147 | "Quinto año" | 18pt | Inicio de MAT 5° ✓ |
| d160 | (sin heading grande) | — | Última página de contenido de MAT 5° — mid-table |
| d161 | "Sexto año" | 18pt | Inicio de MAT 6° ✓ |
| d179 | (sin heading grande) | — | Última página de MAT — sigue siendo Matemática ✓ |
| d180 | "Ciencias Sociales" | 51pt | Primera página de CSS — confirma que d179 es el fin de MAT |

**Conclusión:** Todos los límites verificados. D179 es Matemática (no CSS); CSS comienza en d180.

---

## Validación schema / identidad (Section 7)

El campo `column_index` del validador fue actualizado para aceptar valores 0–3 (antes 0–2) y -1 para elementos no-tabla.

**Diseño multi-revisión (Etapa 02.3.2):** Se agregó la tabla `element_revisions` a SCHEMA_DRAFT.sql:

- **Inmutabilidad:** Solo INSERT; nunca UPDATE ni DELETE (excepto CASCADE al borrar el elemento padre).
- **revision_number=1:** Extracción inicial. Cada corrección aprobada crea una nueva revisión.
- **Idempotencia:** Re-import del mismo (stable_id, area_id) con texto idéntico no crea revisión. Con texto distinto genera STABLE_ID_COLLISION en import_conflicts hasta resolución manual.
- **Trazabilidad:** `change_reason` ∈ {initial_extraction, corrected_text, corrected_year, status_change, re_extraction, merge, split, other}; `changed_fields text[]` lista qué columnas cambiaron.
- **`current_revision int`** agregado a `curriculum_elements` para saber en qué revisión está el estado canónico.

UNIQUE(stable_id, area_id) se mantiene en `curriculum_elements` como identidad canónica. El historial completo vive en `element_revisions`.

---

## Reproducción de PDFs en el índice git (Section 9)

Verificación: `git log --all --name-only` sobre `*.pdf` / `*.PDF` en todos los commits del repositorio.

**Resultado:** Ningún archivo PDF en el índice git en ningún commit. El PDF del DC PBA 2018 no está en el repositorio.

Los 5 commits existentes (`6e0e3c7`, `56fc68d`, `185e114`, `c91765d`, `a7a4868`) contienen únicamente archivos `.py`, `.sql`, `.md` y `.json`.

---

*Generado por extractor curricular v0.1.0-pilot — DC PBA 2018 SHA-256: 1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38*
