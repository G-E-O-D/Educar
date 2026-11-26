# Reporte de Extraccion CSS — Etapa 02.4B

**Fecha:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Area:** Ciencias Sociales (CSS) — d186–d232  
**Estado:** COMPLETO — 6 años extraidos (con calidad limitada en 6°)

---

## 1. Mapa de limites del area CSS

| Rango digital | Contenido | Estado extraccion |
|---------------|-----------|-------------------|
| d183–d185 | Titulo area, Enfoque Curricular, Orientaciones | No extraible (texto continuo) |
| d186–d189 | Primer Ciclo 1° — 2 bloques | Extraido (CSSAdapter) |
| d190–d193 | Primer Ciclo 2° — 2 bloques | Extraido (CSSAdapter) |
| d194–d200 | Primer Ciclo 3° — 2 bloques | Extraido (TricolumnAdapter+css_split_items) |
| d201–d208 | Segundo Ciclo 4° — 2 bloques | Extraido (TricolumnAdapter+css_split_items) |
| d209–d219 | Segundo Ciclo 5° — 2 bloques | Extraido (TricolumnAdapter+css_split_items) |
| d220–d232 | Segundo Ciclo 6° — 2 bloques | Extraido parcial (EI-14 bleed bibliog.) |
| d233–d235 | Bibliografía General Disciplinar Segundo Ciclo | No aplica |

**Paginas de contenido curricular:** d186–d232 (47 paginas)  
**Paginas situaciones de enseñanza (excluidas del table cutoff):** ~12 paginas (d196, d203, d206–d208, d215–d219, d223–d224, d227–d232)

---

## 2. Diferencias estructurales respecto a MAT

| Aspecto | MAT | CSS |
|---------|-----|-----|
| Columnas en tabla | 4 (Conceptos/Modos/Indicadores/Situaciones) | 3 (Conceptos/Modos/Indicadores) |
| Separador de ítems | Bullet PUA (U+E001) | Indentacion relativa x0 (css_split_items) |
| Columna Situaciones | col3 en tabla principal | Paginas separadas (no columna) |
| Layout col por año | Uniforme (col0/col1/col2/col3) | Distinto: 1°/2° usa col2/col3; 3°+ usa col1/col2 |
| Adaptador 1°/2° | TricolumnAdapter | CSSAdapter (mapeo col2→WAY, col3→PROG) |
| Adaptador 3°–6° | TricolumnAdapter | TricolumnAdapter + cell_items_fn=css_split_items |
| Bullets | PUA U+E001 (detectados) | Sin bullets (x0 indentation) |

---

## 3. Layout de columnas CSS

### CSS 1°/2° (d186–d193)

```
col0 (x0≈60pt)     | col1 vacío | col2 (x0≈372pt)    | col3 (x0≈536pt)
Conceptos          |            | Modos de conocer   | Indicadores de avance
```
Adaptador: `CSSAdapter` → col2→WAY_OF_KNOWING, col3→PROGRESS_INDICATOR

### CSS 3°–6° (d194–d232)

```
col0 (x0≈62–70pt)  | col1 (x0≈329pt)       | col2 (x0≈341–475pt)
Conceptos          | Modos de conocer       | Indicadores de avance
```
Adaptador: `TricolumnAdapter(cell_items_fn=css_split_items)`

**col3 en CSS 3°+:** No contiene datos curriculares. Captura números de página y texto EI-06. Ver EI-13.

---

## 4. Función css_split_items

Reemplaza `cell.items()` (que usa PUA bullets) para CSS. Divide una `RawCell` en ítems individuales basándose en la indentación relativa x0:

| Regla | Condición | Acción |
|-------|-----------|--------|
| 0 | gap < −50pt (salto de página) | Nuevo ítem si offset ≤ 7pt, continuación si offset > 7pt |
| 1 | offset > 7pt | Continuación (sangría de segunda línea) |
| 2 | offset < offset_prev − 2pt AND gap > −0.5pt | Nuevo ítem (dedent) |
| 3 | gap ≥ 0.5pt | Nuevo ítem (brecha entre oraciones) |
| 4 | comienza con mayúscula | Nuevo ítem (inicio de oración) |
| default | — | Continuación |

Donde `offset = sp.x0 − min_x0_in_cell` (relativo al borde izquierdo de la columna).

---

## 5. Inventario por ciclo, año y bloque

### Primer Ciclo

| Año | Bloque | Paginas | CONCEPT | WAY | PROG | Elementos | Relaciones |
|-----|--------|---------|---------|-----|------|-----------|------------|
| 1° | Sociedades y culturas: Cambios y continuidades | d186–d187 | — | — | — | — | — |
| 1° | Sociedades, culturas y organización del espacio | d188–d189 | — | — | — | — | — |
| **1°** | | **d186–d189** | **25** | **32** | **14** | **71** | **532** |
| 2° | Sociedades, culturas: cambios y continuidades | d190–d191 | — | — | — | — | — |
| 2° | Sociedades, culturas y organización del espacio | d192–d193 | — | — | — | — | — |
| **2°** | | **d190–d193** | **31** | **30** | **17** | **78** | **680** |
| 3° | Sociedades, culturas: Cambios y continuidades | d195–d197 | — | — | — | — | — |
| 3° | Sociedades, culturas y organización del espacio | d198–d200 | — | — | — | — | — |
| **3°** | | **d194–d200** | **20** | **36** | **31** | **89** | **275** |

### Segundo Ciclo

| Año | Bloque | Paginas tabla | CONCEPT | WAY | PROG | Elementos | Relaciones |
|-----|--------|---------------|---------|-----|------|-----------|------------|
| 4° | Las sociedades a través del tiempo | d202–d205 | — | — | — | — | — |
| 4° | Sociedades y territorios | d204–d205 | — | — | — | — | — |
| **4°** | | **d202–d205** | **41** | **38** | **23** | **106** | **1219** |
| 5° | Las sociedades a través del tiempo | d210–d214 | — | — | — | — | — |
| 5° | Sociedades y territorios | d214–d219 | — | — | — | — | — |
| **5°** | | **d210–d219** | **56** | **34** | **38** | **133** | **2089** |
| 6° | Las sociedades a través del tiempo | d221–d222 | — | — | — | — | — |
| 6° | Sociedades y territorios | d225–d226 | — | — | — | — | — |
| **6°** | | **d221–d226** | **20** | **18** | **14** | **56** | **163** |

*Nota: 6° bajo por EI-14 (bibliografía bleed) y EI-10 residual.*

---

## 6. Resumen total CSS

| Año | CONCEPT | WAY | PROG | TEACH* | Elementos | Relaciones |
|-----|---------|-----|------|--------|-----------|------------|
| 1° | 25 | 32 | 14 | 0 | 71 | 532 |
| 2° | 31 | 30 | 17 | 0 | 78 | 680 |
| 3° | 20 | 36 | 31 | 2 | 89 | 275 |
| 4° | 41 | 38 | 23 | 4 | 106 | 1219 |
| 5° | 56 | 34 | 38 | 5 | 133 | 2089 |
| 6° | 20 | 18 | 14 | 4 | 56 | 163 |
| **TOTAL** | **193** | **188** | **137** | **15** | **533** | **4958** |

*TEACH en CSS son artefactos (EI-13: números de página en col3). No representan situaciones de enseñanza reales.

**Validacion:** 0 errores, 0 warnings.

---

## 7. Issues activos en extraccion CSS

| Issue | Severidad | Estado |
|-------|-----------|--------|
| EI-10: Situaciones contaminan conceptos | MEDIA | Parcialmente corregido (page cutoff) |
| EI-11: Artefactos de texto (concatenaciones) | BAJA | Documentado |
| EI-12: digital_page=None en todos los elementos | BAJA | Documentado |
| EI-13: TEACHING_SITUATION espurios (pag. en col3) | BAJA | Documentado |
| EI-14: Bibliografía bleed en 6° bloque 2 | BAJA | Documentado |

---

## 8. Archivos de salida

| Archivo | Ruta | Contenido |
|---------|------|-----------|
| `extract_CSS_all.json` | `docs/curricular/` | 533 elementos, 4958 relaciones, metadata |

*Extractor curricular v0.1.0-pilot — DC PBA 2018 SHA-256: 1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38*
