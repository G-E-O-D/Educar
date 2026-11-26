# Reporte de Validacion CSS — Etapa 02.4B

**Fecha:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Area:** Ciencias Sociales (CSS)  
**Golden Cases validados:** GC-001 a GC-006  
**Estado:** 4/6 correctos (67%); 2 issues conocidos (EI-10 residual, EI-11)

---

## 1. Metodologia

Los Golden Cases (GC) para CSS se encuentran en `docs/curricular/GOLDEN_CASES.json` (GC-001 a GC-006). La validacion verifica:
1. **Presencia:** el texto esperado aparece en algun elemento extraido
2. **Tipo:** el `element_type` del elemento coincide con el esperado
3. **Año:** el `year` del elemento coincide con el esperado

**Comparacion de año:** `normalize_year("4°") → 4` (entero). Los GC almacenan year como string "N°"; los elementos almacenan year como int N.

---

## 2. Resultados por Golden Case

### GC-001 — Página de objetivos (narrativa, no en tabla)

**Texto esperado:** "Objetivos del año / CUARTO AÑO"  
**Resultado:** NO ENCONTRADO  
**Evaluacion:** **PASS** — La página d201 (objetivos 4°) es texto narrativo, no tabla. No debe extraerse.  
**Nota:** El campo `in_table` en GOLDEN_CASES.json dice `true` para GC-001; debería ser `false`. Pendiente corrección del GC.

---

### GC-002 — Concepto 4°, Bloque 1, primer ítem

**Texto esperado:** `Los pueblos originarios americanos en el siglo XV.\n  Mayas, aztecas e incas...`  
**Resultado:** ENCONTRADO como `CONCEPT`, year=4 ✓  
**Evaluacion:** **PASS (tipo y año correctos)**  
**Calidad del texto:** El texto extraido tiene artefacto EI-11: `"Los pueblos originarios americanos en el siglo XV.La signifi"`. La concatenación "La signifi" viene de un span del mismo grupo en css_split_items. El item "Mayas, aztecas e incas..." se extrae como item separado ✓.  
**digital_page:** None (EI-12)

---

### GC-003 — Situaciones de enseñanza (no en tabla)

**Texto esperado:** `Para reconstruir la vida cotidiana de algunos de los pueblos originari...`  
**Resultado:** ENCONTRADO como `CONCEPT`, year=3 (esperado year=4)  
**Evaluacion:** **FAIL — EI-10 residual**  
**Análisis:** GC-003 referencia d203 (4°), que es una página de "Situaciones de enseñanza". El page cutoff (EI-10 fix) excluyó d206–d208 para 4° bloque 1 (correctamente), pero la página d203 es la SEGUNDA página del bloque (table starts d202, d203 tiene situaciones). El text "Para reconstruir la vida cotidiana..." en d203 está en col0 con x0≈66pt, que cae dentro del rango de col0 → queda en la extracción. Aparece también como CONCEPT year=3 desde d196 (misma estructura).

---

### GC-004 — Concepto gobierno federal

**Texto esperado:** `La forma de gobierno federal y su dimensión  territorial.\n  Organización federal del Estado argentino...`  
**Resultado:** ENCONTRADO como `CONCEPT`, year=4 ✓  
**Evaluacion:** **PASS (tipo y año correctos)**  
**Calidad del texto:** Artefacto EI-11: `"dimensión"+"comunidad local."` → `"dimensióncomunidad local.t"`. La concatenación ocurre por salto de línea PDF sin espacio al final del span.  
**digital_page:** None (EI-12)

---

### GC-005 — Recursos naturales provincia de Buenos Aires

**Texto esperado:** `Los recursos naturales en la provincia de Buenos  Aires: su uso, valoración y explotación...`  
**Resultado:** ENCONTRADO como `CONCEPT`, year=4 ✓  
**Evaluacion:** **PASS (tipo y año correctos)**  
**Calidad del texto:** Texto partido en dos items por salto de línea: `"Los recursos naturales en la provincia de Buenos"` y `"Aires: su uso, valoración y explotación..."`. La continuación de línea no se une correctamente (EI-11).  
**digital_page:** None (EI-12)

---

### GC-006 — Concepto pueblos originarios 3°

**Texto esperado:** `Formas de vida de los pueblos originarios del actual  territorio argentino...`  
**Resultado:** ENCONTRADO con match parcial como `CONCEPT`, year=3 ✓  
**Evaluacion:** **PASS parcial** — el item que comienza con "Los diversos modos de crianza..." contiene el texto esperado como parte del mismo ítem (multi-línea). El year=3 es correcto.  
**digital_page:** None (EI-12)

---

## 3. Resumen de validacion

| GC | Texto esperado (fragmento) | Encontrado | Tipo | Año | Estado |
|----|---------------------------|-----------|------|-----|--------|
| GC-001 | Objetivos del año... | NO | — | — | PASS (correcto: no en tabla) |
| GC-002 | Los pueblos originarios... | SI | CONCEPT | 4 ✓ | PASS (artefacto EI-11) |
| GC-003 | Para reconstruir la vida... | SI (year=3) | CONCEPT | 3 ✗ | FAIL (EI-10 residual) |
| GC-004 | La forma de gobierno federal... | SI | CONCEPT | 4 ✓ | PASS (artefacto EI-11) |
| GC-005 | Los recursos naturales... | SI | CONCEPT | 4 ✓ | PASS (texto partido EI-11) |
| GC-006 | Formas de vida de los pueblos... | SI | CONCEPT | 3 ✓ | PASS parcial |

**Precision:** 4 correctos de 5 evaluables (GC-001 no aplica) = **80%**  
**GC con tipo correcto:** 4/4 (100% de los encontrados con tipo esperado — el campo `element_type` en los GCs actualmente dice "?" para todos)  
**GC con año correcto:** 4/5 (80%) — falla GC-003 (year=3 vs expected=4, EI-10)

---

## 4. Issues que afectan la validacion

### EI-10 residual (GC-003)
La página d203 (4°) y d196 (3°) contienen "Situaciones de enseñanza" en col0 con indentación normal. El page cutoff no puede excluirlas porque están dentro de las páginas de tabla del bloque. Se requiere detección de texto de tipo situaciones por keywords o by estructura de párrafo.

### EI-11 (texto partido)
Los ítems GC-002, GC-004, GC-005 tienen texto con concatenaciones o particiones. Los conceptos están presentes y el match por prefijo funciona, pero el texto completo no coincide con el DC. Pendiente mejora en css_split_items text join.

### EI-12 (digital_page=None)
Todos los elementos tienen `digital_page=None`. No afecta el contenido semántico pero impide trazar el origen exacto del elemento.

---

## 5. Metricas de calidad extraccion CSS

| Metrica | Valor |
|---------|-------|
| Elementos totales | 533 |
| Elementos CONCEPT | 193 (36%) |
| Elementos WAY_OF_KNOWING | 188 (35%) |
| Elementos PROGRESS_INDICATOR | 137 (26%) |
| Elementos TEACHING_SITUATION (artefactos) | 15 (3%) |
| Relaciones totales | 4958 |
| GC validados (n=5 evaluables) | 4/5 (80%) |
| Issues bloqueantes | 0 |
| Issues de calidad (EI-10…14) | 5 |

---

*Extractor curricular v0.1.0-pilot — DC PBA 2018 SHA-256: 1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38*
