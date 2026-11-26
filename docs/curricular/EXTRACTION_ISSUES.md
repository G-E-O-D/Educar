# Registro de Problemas de Extracción — Etapa 02.3 / 02.3.1

**Fecha última actualización:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Área procesada:** Matemática (MAT) — Segundo Ciclo 4°

---

## EI-01 — Relaciones por producto cartesiano

**Severidad:** ALTA  
**Estado:** CORREGIDO — Etapa 02.3.1

**Descripción original:**  
El adaptador tricolumna con thresholds erróneos mezclaba Conceptos (col0) y Modos de conocer (col1) en la misma columna clasificada, produciendo producto cartesiano a nivel de bloque.

**Causa raíz corregida:**  
Los thresholds de columna eran incorrectos (0.37/0.67 para 2 columnas), cuando el DC PBA 2018 tiene 4 columnas:
- col0 Conceptos: x0/page < 0.27
- col1 Modos de conocer: 0.27 ≤ x0/page < 0.54
- col2 Indicadores de avance: 0.54 ≤ x0/page < 0.84
- col3 Situaciones de enseñanza: x0/page ≥ 0.84

**Correcciones aplicadas en Etapa 02.3.1:**
- `config.py`: thresholds actualizados (0.27, 0.54, 0.84)
- `page_extractor.py`: `classify_column()` retorna 0–3 (antes 0–2)
- `table_reconstructor.py`: `TricolumnReconstructor` procesa col3
- `adapters/tricolumn.py`: COLUMN_TYPES incluye `TEACHING_SITUATION` para col3

**Resultado:**
- Piloto v1 (thresholds incorrectos): 1551 elementos, 22726 relaciones (inválidos)
- Piloto v2 (thresholds correctos): 619 elementos, 9526 relaciones (d135-d146)

**Nota:** Las relaciones M:N restantes dentro de cada fila son legítimas (celdas combinadas y multi-ítem). Se documentan como pendiente de análisis adicional en Etapa 02.4.

---

## EI-02 — Bounds MAT 4° mayores al estimado

**Severidad:** MEDIA  
**Estado:** CORREGIDO — Etapa 02.3.1

**Descripción original:**  
El algoritmo `scan_bounds()` usaba búsqueda de texto completo de página, que coincidía con palabras de contenido como "cuartos" o "quintos" (fracciones matemáticas), no solo headings de año.

**Causa raíz corregida:**  
Búsqueda full-text sin filtro de tamaño de fuente → falsos positivos con contenido curricular.

**Correcciones aplicadas en Etapa 02.3.1:**
- `scan_bounds()` reescrito para buscar headings a nivel de span con size ≥ 14pt
- Whitespace normalizado para manejar "QUINTO  AÑO" (2 espacios en este PDF)
- Caso especial: MAT 4° no tiene heading explícito → usa d135 (inicio implícito Segundo Ciclo)
- La normalización funciona también para CSN ("QUINTO AÑO" size=16 en d272)

**Resultado verificado:**
- MAT 4°: d135–d146 ✓ (d147 = "Quinto año" size=18, inicio de 5°)
- MAT 5°: d147–d160 ✓ (d161 = "Sexto año" size=18, inicio de 6°)
- MAT 6°: d161–d179 ✓ (fin de área MAT)

---

## EI-03 — Incertidumbre en año de GC-007

**Severidad:** MEDIA  
**Estado:** RESUELTO — Etapa 02.3.1

**Descripción original:**  
El algoritmo `verify_gc007()` determinaba año = 4° erróneamente porque encontraba "CUARTO AÑO" en el índice d261 antes que "QUINTO AÑO" en el heading real d272.

**Corrección aplicada en Etapa 02.3.1:**
- `verify_gc007()` reescrito con detección span-level (size ≥ 14pt)
- Sobrescribe con la aparición MÁS RECIENTE del heading (evita el ToC d261)
- Whitespace normalizado

**Resultado:**
- GC-007 año = **5° (QUINTO AÑO)** ✓
- Heading d272 "QUINTO AÑO" size=16 → ciclo hidrológico d279 → heading d282 "SEXTO AÑO" size=16
- I-12 actualizado a VERIFICADO en ISSUES_REGISTER.md
- GOLDEN_CASES.json GC-007 actualizado: year="5°", year_scope="YEAR", bloque="La Tierra y el universo"

---

## EI-04 — Gap entre filas insuficiente para separar items

**Severidad:** BAJA  
**Estado:** DOCUMENTADO

**Descripción:**  
El reconstructor usa un umbral de `1.2 × font_size` para detectar nuevos ítems en col0. Con fuente de 10 pt, el umbral es 12 pt. En algunas páginas del DC, el espaciado entre filas de tabla puede ser menor a 12 pt (especialmente en bloques densamente tipografiados), provocando que dos ítems se fusionen en uno.

**Consecuencia:** Texto combinado en una sola celda que representa dos ítems distintos. `review_status` no se marca como `ambiguous` automáticamente.

**Acción requerida para Etapa 02.4:**  
Revisar casos donde `raw_text` contenga más de ~80 caracteres (probable fusión) y marcar como `pending`.

---

## EI-05 — Bloque omitido cuando dos bloques empiezan en la misma página

**Severidad:** BAJA  
**Estado:** CORREGIDO — Etapa 02.3.3

**Descripción:**  
El bloque 5 (Proporcionalidad, d143) tenía rango calculado d143–d142 con `start > end`. Dos bloques consecutivos (`Proporcionalidad` y `Geometría`) comienzan en la misma página d143, por lo que `find_block_starts()` asignaba `blk_end = siguiente_bloque.start - 1 = 143 - 1 = 142`.

**Causa raíz:**  
`find_block_starts()` asigna a cada bloque hasta la página anterior al siguiente. Cuando dos bloques comienzan en la misma página, el rango queda como `[143, 142]`. `range(143, 143)` es vacío → el bloque se saltaba silenciosamente sin ningún mensaje de error, solo la nota "sin spans" que era difícil de distinguir de otros casos.

**Corrección (Etapa 02.3.3):**  
En `extract_pilot()`, antes de iterar el rango, se agrega:
```python
if blk_end < blk_start:
    ambiguities.append(
        f"EI-05: bloque '{block_info['block_name']}' d{blk_start}: "
        f"blk_end={blk_end} < blk_start={blk_start} ..."
    )
    blk_end = blk_start
```
Esto garantiza que el bloque procese al menos su página de inicio. El contenido de d143 queda incluido tanto en Proporcionalidad como en Geometría (solapamiento explícito, registrado como ambigüedad).

**Resultado post-corrección (Etapa 02.3.3, d135–d146):**
- Bloques omitidos: **0** (antes: 1 — Proporcionalidad omitido)
- Elementos totales: **625** (antes: 570, +55 de Proporcionalidad)
- Ambigüedades: 1 (EI-05 registrada, antes era silenciosa)

**Nota:** El solapamiento de d143 (contenido compartido entre Proporcionalidad y Geometría) queda registrado en ambiguities. Los elementos de d143 pueden aparecer duplicados entre ambos bloques. Se resuelve en Etapa 02.4 con segmentación por Y dentro de la misma página.

---

## EI-07 — Thresholds calibrados para página A4 portrait, el PDF usa A4 landscape

**Severidad:** CRÍTICA  
**Estado:** CORREGIDO — Etapa 02.3.2

**Descripción:**  
Los thresholds de columna (0.27, 0.54, 0.84) se calibraron visualmente asumiendo A4 portrait (595.3pt). El DC PBA 2018 usa A4 landscape (841.9pt × 595.3pt). Al multiplicar ratios × 841.9pt, los límites absolutos eran incorrectos:
- Límite col0/col1: 0.27 × 841.9 = **227.3pt** → incluía todo Modos de conocer (x0=163–339)
- Límite col1/col2: 0.54 × 841.9 = **454.6pt** → incluía todo Indicadores (x0=341–511)
- Límite col2/col3: 0.84 × 841.9 = **707.2pt** → incluía todo Situaciones (x0=513–777)

**Efecto:** Todo el texto de col1–col3 era clasificado una columna a la izquierda de lo correcto. Modos de conocer terminaba en col0 (como CONCEPT), Indicadores en col1 (como WAY_OF_KNOWING), Situaciones en col2 (como PROGRESS_INDICATOR). Los 3 TEACHING_SITUATION del piloto v2 eran ruido.

**Corrección (Etapa 02.3.2):**  
Thresholds recalibrados midiendo x0 reales en d136–d145:
- col0/col1: 0.27 → **0.192** (límite absoluto ~161pt, entre col0 max=161.2 y col1 min=163.9)
- col1/col2: 0.54 → **0.404** (límite absoluto ~340pt, entre col1 max=338.7 y col2 min=341.3)
- col2/col3: 0.84 → **0.608** (límite absoluto ~512pt, entre col2 max=511.3 y col3 min=513.4)

`classify_column()` ahora lee thresholds desde `TRICOLUMN_THRESHOLDS` en config.py (antes tenía valores hardcodeados).  
`PAGE_WIDTH` en fixtures.py actualizado de 595.0 a 841.9.

**Resultado piloto v3 (d135–d146):**
- Elementos: 570 (antes 619 con mezcla de columnas)
- CONCEPT: 125, WAY_OF_KNOWING: 158, PROGRESS_INDICATOR: 136, TEACHING_SITUATION: **151** (antes 3)
- Relaciones: 2498 (antes 9526)
- Avg rels/elem: 4.38 (antes 15.39)

---

## EI-08 — items() divide texto multi-línea en ítems separados

**Severidad:** BAJA  
**Estado:** DOCUMENTADO

**Descripción:**  
`RawCell.raw_text` usa comparación y0-to-y0 con umbral 3pt para detectar saltos de línea. Para texto que continúa en líneas adyacentes dentro de una misma celda (font size 8pt, interlineado ~9.5pt), el gap y0-to-y0 (9.5pt) supera los 3pt → inserta `\n` → `items()` divide en ítems separados.

Ejemplo en d136 col0: "Números hasta el orden" (y0=114.8) + "de los millones." (y0=124.4):
- gap = 9.6pt > 3pt → raw_text = "Números hasta el orden \nde los millones."
- items() devuelve ["Números hasta el orden", "de los millones."] — 2 ítems para 1 concepto

**Consecuencia:** El número de CONCEPT, WAY_OF_KNOWING y PROGRESS_INDICATOR es mayor al real (~2× por promedio de 2 líneas por ítem). Genera producto cartesiano intra-row entre líneas del mismo concepto y los modos de conocer correspondientes.

**Interacción con  bullet:** Los bullets del PDF tienen y0 ligeramente mayor al del texto de su misma línea (1-2pt), lo que complica cualquier fix basado en y0-to-y1. Ver análisis detallado en ETAPA_02_3_2 commit notes.

**Acción requerida para Etapa 02.4:**  
Reemplazar la lógica y0-to-y0 en `raw_text` por una que detecte bullets  como separadores de ítems y agrupe líneas adyacentes del mismo ítem. Alternativa: usar el gap real (y0_next - y1_prev) > N×font_size como umbral.

---

## EI-06 — Encabezados repetidos capturados en spans

**Severidad:** BAJA  
**Estado:** DOCUMENTADO

**Descripción:**  
Algunos spans de encabezado de página ("Matemática", "Diseño Curricular...") pueden no ser filtrados si su posición Y no está en la zona esperada (< 60 pt o > 780 pt). Los encabezados tipográficos del DC PBA 2018 no tienen posición Y consistente en todas las páginas.

**Acción requerida para Etapa 02.4:**  
Ampliar el conjunto de `RUNNING_HEADERS` en `config.py` y/o aumentar el margen de detección de zona de encabezado.
