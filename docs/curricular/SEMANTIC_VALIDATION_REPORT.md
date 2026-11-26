# Reporte de Validación Semántica — Etapa 02.3.1

**Fecha:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Área:** Matemática (MAT) — Segundo Ciclo 4°  
**Rango real verificado:** d135–d146 (11 páginas digitales)

---

## Resumen ejecutivo

Etapa 02.3.1 corrigió tres errores semánticos identificados en Etapa 02.3:

| Error | Descripción | Estado anterior | Estado actual |
|-------|-------------|-----------------|---------------|
| EI-01 | Tabla tiene 4 columnas (no 3), thresholds incorrectos | ABIERTO | CORREGIDO |
| EI-02 | Segmentación de año por texto completo (falsos positivos) | DOCUMENTADO | CORREGIDO |
| EI-03 / GC-007 | Año del ciclo hidrológico determinado incorrectamente | PARCIALMENTE RESUELTO | RESUELTO |

---

## Comparación antes / después

### Resultados del piloto

| Métrica | Piloto v1 (Etapa 02.3) | Piloto v2 (Etapa 02.3.1) | Cambio |
|---------|------------------------|--------------------------|--------|
| Rango procesado | d135–d179 (todo MAT 2C) | d135–d146 (solo 4°) | Correcto |
| Páginas digitales | 44 | 11 | -75% |
| Bloques detectados | 20 (3 años) | 7 (solo 4°) | Correcto |
| Elementos totales | 1551 | 619 | -60% |
| — CONCEPT | 706 | 213 | Correcto |
| — WAY_OF_KNOWING | 726 | 196 | Correcto |
| — PROGRESS_INDICATOR | 119 | 207 | +74% (antes sub-extraído) |
| — TEACHING_SITUATION | 0 | 3 | Nueva columna detectada |
| — YEAR_OBJECTIVE | 0 | 0 | Sin cambio |
| Relaciones totales | 22726 | 9526 | -58% |
| — CONCEPT_WAY_OF_KNOWING | ~18220 | 4738 | -74% |
| — CONTENT_PROGRESS_INDICATOR | ~4506 | 4785 | +6% |
| — CONTENT_TEACHING_SITUATION | 0 | 3 | Nueva |
| Errores de validación | 0 | 0 | Sin cambio |

### Análisis de relaciones restantes

Las 9526 relaciones del piloto v2 reflejan la estructura real de las tablas del DC:
- Las celdas combinadas (merged cells) producen relaciones M:N legítimas
- El método `cell.items()` puede sobresegmentar texto multi-línea → genera más relaciones por fila
- El test de regresión `test_two_rows_produce_two_relations` verifica la ausencia de cartesiano cross-row

Análisis adicional de M:N intra-fila se agenda para Etapa 02.4.

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

**Suite agregada:** `tests/test_regression_02_3_1.py`  
**Tests:** 36 (todos pasan)

| Clase | Tests | Cobertura |
|-------|-------|-----------|
| `TestColumnThresholdsEI01` | 10 | Thresholds correctos, regresión de thresholds viejos |
| `TestNoCartesianEI01` | 3 | Ausencia de cartesiano cross-row |
| `TestCol3TeachingSituation` | 5 | col3 → TEACHING_SITUATION, relaciones correctas |
| `TestYearHeadingDetectionEI02` | 8 | Detección heading por span-size, MAT 4°/5°/6° |
| `TestGC007Year5` | 4 | GC-007 año=5°, d279, conclusión correcta |
| `TestRelationTypes` | 6 | Tipos de relación por columna, basis SOURCE_EXPRESSED |

**Suite total:** 125/125 tests (6 suites)

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
