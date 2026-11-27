# Natural Sciences Extraction Report — Ciencias Naturales (CSN)
**Etapa:** 02.4C  
**Fecha:** 2026-11-27  
**Estado:** EXTRACCIÓN COMPLETADA ✓

---

## 1. Fuente y Alcance

| Campo | Valor |
|-------|-------|
| Documento | DC PBA 2018 (433 pp.) |
| SHA-256 | `1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38` |
| Área | Ciencias Naturales |
| Páginas digitales | d236–d290 |
| Páginas impresas | 235–289 |
| Bibliografía (excluida) | d291+ |
| Años cubiertos | 1°, 2°, 3°, 4°, 5°, 6° |
| Archivo de salida | `docs/curricular/extract_CSN_all.json` |

> Convención: `digital_page = printed_page + 1`. Las referencias de código usan siempre el número digital.

---

## 2. Estructura de Columnas

Las tablas CSN tienen **tres columnas activas** (a diferencia de MAT/CSS que tienen cuatro):

| Col | x0 aprox. | Rol | Tipo de elemento |
|-----|-----------|-----|-----------------|
| 0 | 55–77 pt | **Conceptos** | `CONCEPT` |
| 1 | 289–311 pt | **Modos de conocer** | `WAY_OF_KNOWING` |
| 2 | — | Sub-encabezado de col1 | vacío en práctica |
| 3 | 529–549 pt | **Indicadores de avance** | `PROGRESS_INDICATOR` |

> **Diferencia clave con MAT/CSS:** col3 → `PROGRESS_INDICATOR`, no `TEACHING_SITUATION`.  
> Las *Situaciones de enseñanza* son páginas separadas (no columna), y se excluyen por el corte EI-10 (páginas sin contenido en col1).

### Tipos de relación

| Par de columnas | Tipo de relación | Semántica |
|----------------|-----------------|-----------|
| (col0, col1) | `CONCEPT_WAY_OF_KNOWING` | Concepto → modo de conocer |
| (col0, col3) | `CONTENT_PROGRESS_INDICATOR` | Concepto → indicador de avance |

---

## 3. Sección 1°/2° (Primer Ciclo conjunto)

Las tablas de 1° y 2° están mezcladas en un único bloque físico (d244–d253). Los años se separan por marcadores textuales:

- `"CONTENIDOS DE PRIMER AÑO"` → inicio del segmento de 1°
- `"CONTENIDOS DE SEGUNDO AÑO"` → inicio del segmento de 2°

La función `extract_csn12()` en `extract_all.py` maneja esta separación. Los spans de cada página se asignan al año activo según el último marcador encontrado.

---

## 4. Inventario de Bloques por Año

### Año 1° (páginas d244–d253 primer segmento)

| Bloque | CONCEPT | WAY | PROGRESS_IND | Total |
|--------|---------|-----|--------------|-------|
| Seres vivos | 9 | 6 | 7 | 22 |
| Materiales | 7 | 6 | 5 | 18 |
| El mundo físico | 3 | 3 | 2 | 8 |
| **Total 1°** | **19** | **15** | **14** | **48** |

### Año 2° (páginas d244–d253 segundo segmento)

| Bloque | CONCEPT | WAY | PROGRESS_IND | Total |
|--------|---------|-----|--------------|-------|
| La Tierra y el universo | 17 | 14 | 4 | 35 |
| El mundo físico | 6 | 6 | 5 | 17 |
| Seres vivos | 5 | 2 | 3 | 10 |
| **Total 2°** | **28** | **22** | **12** | **62** |

> Nota: 1°/2° no tiene bloque "La Tierra" en 1° ni "Materiales" en 2° — el DC lista un subconjunto por año.

### Año 3° (páginas d254–d263)

| Bloque | CONCEPT | WAY | PROGRESS_IND | Total | Notas |
|--------|---------|-----|--------------|-------|-------|
| Seres vivos | 23 | 27 | 20 | 70 | ✓ |
| La Tierra y el universo | 13 | 36 | 6 | 55 | ⚠ CSN EI-01 |
| Materiales | 7 | 4 | 4 | 15 | ✓ |
| Mundo físico | 2 | 3 | 0 | 5 | ⚠ CSN EI-05 |
| **Total 3°** | **45** | **70** | **30** | **145** | |

### Año 4° (páginas d264–d271)

| Bloque | CONCEPT | WAY | PROGRESS_IND | Total |
|--------|---------|-----|--------------|-------|
| Materiales | 30 | 37 | 10 | 77 |
| Seres vivos | 20 | 35 | 19 | 74 |
| La Tierra y el universo | 15 | 34 | 10 | 59 |
| Mundo físico | 13 | 12 | 4 | 29 |
| **Total 4°** | **78** | **118** | **43** | **239** |

### Año 5° (páginas d272–d281)

| Bloque | CONCEPT | WAY | PROGRESS_IND | Total | Notas |
|--------|---------|-----|--------------|-------|-------|
| Seres vivos | 27 | 32 | 23 | 82 | ✓ |
| La Tierra y el universo | 22 | 31 | 16 | 69 | ⚠ CSN EI-02 |
| Mundo físico | 24 | 25 | 6 | 55 | ✓ |
| Materiales | 15 | 20 | 15 | 50 | ✓ |
| **Total 5°** | **88** | **108** | **60** | **256** |

### Año 6° (páginas d282–d290)

| Bloque | CONCEPT | WAY | PROGRESS_IND | Total | Notas |
|--------|---------|-----|--------------|-------|-------|
| Materiales | 24 | 36 | 8 | 68 | ⚠ CSN EI-03 |
| Seres vivos | 25 | 19 | 14 | 58 | ⚠ CSN EI-04 |
| La Tierra y el universo | 19 | 4 | 12 | 35 | ⚠ CSN EI-02 |
| Mundo físico | 9 | 6 | 7 | 22 | ✓ |
| **Total 6°** | **77** | **65** | **41** | **183** |

### Totales Consolidados CSN

| Año | CONCEPT | WAY | PROGRESS_IND | Total |
|-----|---------|-----|--------------|-------|
| 1° | 19 | 15 | 14 | 48 |
| 2° | 28 | 22 | 12 | 62 |
| 3° | 45 | 70 | 30 | 145 |
| 4° | 78 | 118 | 43 | 239 |
| 5° | 88 | 108 | 60 | 256 |
| 6° | 77 | 65 | 41 | 183 |
| **Total** | **335** | **398** | **200** | **933** |

**Relaciones extraídas:** 7 414  
- `CONCEPT_WAY_OF_KNOWING`: 5 273  
- `CONTENT_PROGRESS_INDICATOR`: 2 141

---

## 5. Bugs Encontrados y Resueltos

### BUG-CSN-01: `has_tricolumn` falso negativo en páginas de encabezado de año

**Causa:** Cuando `blk_start` es la página de encabezado de año (ej. "CUARTO AÑO" + "BLOQUE: Seres vivos"), el filtro CSS elimina los encabezados de columna de `blk_start+1` (ya que `pg_num != blk_start`). La verificación `has_tricolumn` sobre los spans filtrados no encontraba ninguna keyword → `False` → bloque omitido por completo.

**Impacto:** Año 4° "Seres vivos" producía 0 elementos.

**Fix:** Mover la verificación `has_tricolumn` a **antes** del filtro CSS, usando `all_spans_flat_raw` (spans sin filtrar). Esto encuentra "CONTENIDOS" en la página de encabezado antes de que sea eliminada.

### BUG-CSN-02: Contaminación por "Objetivos del año" como CONCEPT

**Causa:** `css_hdr_zone = blk_y0 + 160pt`. Con `blk_y0 ≈ 34pt` → zona hasta 194pt. Los encabezados de columna CSN están en `y0 ≈ 200+pt`, fuera de la zona → `header_y` defaultea a 34pt. El texto "Objetivos del año" en `y0 ≈ 50-130pt` (> 34pt) se incluía como filas de tabla.

**Fix:** `hdr_zone_offset = 300.0 if area_code == "CSN" else 160.0`. Con 300pt la zona captura los encabezados de columna (`header_y ≈ 229pt`) → objetivos quedan por debajo del umbral.

---

## 6. Problemas Conocidos (Issues Registrados, Deferred a 02.5+)

### CSN EI-01: Año 3° "La Tierra y el universo" — páginas del Segundo Ciclo incluidas

**Bloque:** 3° / La Tierra y el universo (55 elementos)  
**Causa:** El rango `d258–d263` incluye páginas de introducción al Segundo Ciclo (d260–d263). El corte EI-10 las retiene porque el texto de encabezado "Segundo Ciclo" tiene span en zona col1 (x0 ≈ 300pt).  
**Síntoma:** Primeros 2 conceptos del bloque contienen texto de intro ("Segundo CicloBLOQUE", "Propósitos específicos...").  
**Fix potencial:** Detección keyword-based de páginas de situaciones/intro.

### CSN EI-02: "Objetivos del año" residual en La Tierra 5° y 6°

**Causa:** EI-10 residual. "Objetivos del año" aparece inmediatamente después de los encabezados de columna (`y0 = 220+ ≈ header_y = 229pt`), justo debajo del umbral. Con columnas a 229pt y objetivos a 220+pt, el margen es de ~9pt.  
**Síntoma:** Primer CONCEPT de "La Tierra y el universo" en 5° y 6° es "Objetivos del año".

### CSN EI-03: Año 6° "Materiales" — texto de Situaciones de enseñanza

**Causa:** EI-10 residual. La página de "Situaciones de enseñanza" tiene texto en zona col1.  
**Síntoma:** Primer CONCEPT de 6° Materiales es "Situaciones de enseñanza...".

### CSN EI-04: Año 6° "Seres vivos" — fragmentación por css_split_items

**Causa:** EI-11 — `css_split_items` divide en exceso texto que el DC no separa.  
**Síntoma:** Fragmentos de texto como "distintas partes y en la identificación de las particularidades y" como CONCEPT independiente.

### CSN EI-05: Año 3° "Mundo físico" — contaminación por número de página

**Causa:** Número de página "256Diseño Curricular..." se captura como CONCEPT.  
**Síntoma:** 5 elementos totales, 2 conceptos son texto de pie de página.

---

## 7. Verificación Post-extracción

| Check | Resultado |
|-------|-----------|
| Errores de validación (schema) | 0 |
| Años presentes {1,2,3,4,5,6} | ✓ |
| Mínimo 4 bloques en años 3-6 | ✓ |
| Tipos presentes: CONCEPT, WAY_OF_KNOWING, PROGRESS_INDICATOR | ✓ |
| Ausencia de TEACHING_SITUATION | ✓ |
| Ausencia de elementos con `year=None` | ✓ |
| Regresión CSS (533 elem., 4958 rels.) | ✓ sin cambios |
| Suite completa (50 tests) | ✓ 50/50 |
