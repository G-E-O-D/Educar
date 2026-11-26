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

### Análisis de relaciones post-corrección

Las 2498 relaciones del piloto v3 son estructuralmente correctas pero incluyen sobre-segmentación por items():
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

## Validación schema / identidad

El campo `column_index` del validador fue actualizado para aceptar valores 0–3 (antes 0–2) y -1 para elementos no-tabla.

La restricción UNIQUE(stable_id, area_id) en SCHEMA_DRAFT.sql permite múltiples versiones del mismo elemento con distinto `review_status`. El import de un mismo elemento en dos batches se maneja con `import_conflicts` (tabla agregada en Etapa 02.3). Revisión de identidad para multi-revisión se agenda para Etapa 02.4.

---

*Generado por extractor curricular v0.1.0-pilot — DC PBA 2018 SHA-256: 1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38*
