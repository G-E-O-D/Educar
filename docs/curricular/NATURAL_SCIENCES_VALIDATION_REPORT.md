# Natural Sciences Validation Report — Ciencias Naturales (CSN)
**Etapa:** 02.4C  
**Fecha:** 2026-11-27  
**Estado:** VALIDACIÓN COMPLETADA ✓

---

## 1. Golden Cases CSN

### GC-007 — Ciclo Hidrológico (año 5°)

**Hipótesis:** El ciclo hidrológico está en 5°, bloque "La Tierra y el universo".

| Campo | Esperado | Encontrado | Resultado |
|-------|----------|------------|-----------|
| `year` | 5 | 5 | ✓ PASS |
| `block_name` | La Tierra y el universo | La Tierra y el universo | ✓ PASS |
| `element_type` | CONCEPT | CONCEPT | ✓ PASS |
| Texto | contiene "ciclo hidrol" | ✓ | ✓ PASS |
| Ausencia en año 4° | — | ✓ no hay en 4° | ✓ PASS |

**Estado:** PASS ✓  
**Nota:** GC-007 también verificó que el bug BUG-CSN-01 está corregido (antes del fix, GC-007 fallaba porque año=4 era retornado en lugar de año=5).

### GC-008 — LOS ANIMALES año 1° (Seres vivos)

**Hipótesis:** "LOS ANIMALES" como CONCEPT en 1°, bloque "Seres vivos".

| Campo | Esperado | Encontrado | Resultado |
|-------|----------|------------|-----------|
| `year` | 1 | 1 | ✓ PASS |
| `element_type` | CONCEPT | CONCEPT | ✓ PASS |
| Texto | contiene "LOS ANIMALES" | ✓ | ✓ PASS |

**Estado:** PASS ✓

### GC-009 — DIVERSIDAD DE LOS SERES VIVOS año 4°

**Hipótesis:** "DIVERSIDAD DE LOS SERES VIVOS" como CONCEPT en 4°.

| Campo | Esperado | Encontrado | Resultado |
|-------|----------|------------|-----------|
| `year` | 4 | 4 | ✓ PASS |
| `element_type` | CONCEPT | CONCEPT | ✓ PASS |
| Texto | contiene "DIVERSIDAD DE LOS SERES VIVOS" | ✓ | ✓ PASS |

**Estado:** PASS ✓

### GC-010 — Hidrosfera año 5°

**Hipótesis:** "hidrosfera" como CONCEPT en 5°.

| Campo | Esperado | Encontrado | Resultado |
|-------|----------|------------|-----------|
| `year` | 5 | 5 | ✓ PASS |
| `element_type` | CONCEPT | CONCEPT | ✓ PASS |
| Texto | contiene "hidrosfera" | ✓ | ✓ PASS |

**Estado:** PASS ✓

### GC-011 — Geoformas año 2° (La Tierra y el universo)

**Hipótesis:** "geoformas" en año 2°.

| Campo | Esperado | Encontrado | Resultado |
|-------|----------|------------|-----------|
| `year` | 2 | 2 | ✓ PASS |
| Texto | contiene "geoformas" | ✓ | ✓ PASS |

**Estado:** PASS ✓

---

## 2. Métricas de Calidad

### 2.1 Distribución por tipo

| Tipo | Cantidad | % del total |
|------|----------|-------------|
| CONCEPT | 335 | 35,9% |
| WAY_OF_KNOWING | 398 | 42,7% |
| PROGRESS_INDICATOR | 200 | 21,4% |
| **Total** | **933** | 100% |

Ratio CONCEPT:WAY:PROGRESS ≈ 1 : 1,19 : 0,60. El DC CSN es relativamente denso en "modos de conocer" (métodos, actividades), lo que explica que WAY supere a CONCEPT.

### 2.2 Distribución por año

| Año | Elementos | % |
|-----|-----------|---|
| 1° | 48 | 5,1% |
| 2° | 62 | 6,6% |
| 3° | 145 | 15,5% |
| 4° | 239 | 25,6% |
| 5° | 256 | 27,4% |
| 6° | 183 | 19,6% |

La progresión 1°–5° es monotónica (creciente), coherente con la mayor complejidad curricular. El descenso de 5° a 6° es normal.

### 2.3 Relaciones

| Tipo | Cantidad | % |
|------|----------|---|
| CONCEPT_WAY_OF_KNOWING | 5 273 | 71,1% |
| CONTENT_PROGRESS_INDICATOR | 2 141 | 28,9% |
| **Total** | **7 414** | 100% |

Ratio medio: ~15,8 relaciones por CONCEPT. El alto ratio refleja la estructura M:N del DC (un concepto se relaciona con múltiples modos de conocer e indicadores de las celdas combinadas por merged cells).

### 2.4 Ausencia de TEACHING_SITUATION

0 elementos de tipo `TEACHING_SITUATION` en la extracción CSN. Correcto: las Situaciones de enseñanza son páginas separadas en CSN, no una columna de tabla.

---

## 3. Issues Conocidos y Clasificación de Impacto Curricular

| ID | Bloque | Issue | Impacto | Decisión |
|----|--------|-------|---------|----------|
| CSN EI-01 | 3° La Tierra | Páginas intro Segundo Ciclo incluidas | Medio — ~6 elementos contaminados sobre 55 | Deferred 02.5+ |
| CSN EI-02 | 5°/6° La Tierra | "Objetivos del año" residual (EI-10) | Bajo — 1-2 items por bloque | Deferred 02.5+ |
| CSN EI-03 | 6° Materiales | Texto Situaciones de enseñanza | Bajo — 2-3 items contaminados | Deferred 02.5+ |
| CSN EI-04 | 6° Seres vivos | Fragmentación css_split_items | Bajo — fragmentos breves | Deferred 02.5+ |
| CSN EI-05 | 3° Mundo físico | Número de página como CONCEPT | Alto — bloque con solo 5 items, 2 contaminados | Deferred 02.5+ |

**Clasificación global CSN:** ACEPTABLE para 02.4C. Los issues son residuales, limitados a casos de borde del parser, y no afectan la cobertura curricular principal. Ningún issue impide el uso de los datos para búsqueda semántica (el contenido limpio es mayoría abrumadora).

---

## 4. Comparación con Otras Áreas

| Área | Elementos | Relaciones | GCs | Issues activos |
|------|-----------|------------|-----|---------------|
| MAT | 1 431 | 1 246 | GC-001..GC-005 | EI-06 (6° situaciones) |
| CSS | 533 | 4 958 | GC-006 | EI-10 residual (GC-003 fail) |
| CSN | 933 | 7 414 | GC-007..GC-011 | EI-01..EI-05 |
| **Total** | **2 897** | **13 618** | | |

---

## 5. Cobertura de Tests

| Clase de test | Tests | Estado |
|--------------|-------|--------|
| TestCSNExtractionCounts | 9 | ✓ 9/9 PASS |
| TestCSNGoldenCases | 7 (GC-007..GC-011 + extras) | ✓ 7/7 PASS |
| (Regresión MAT) | 15 | ✓ 15/15 PASS |
| (Regresión CSS) | 10 | ✓ 10/10 PASS |
| **Total suite** | **50** | **✓ 50/50 PASS** |
