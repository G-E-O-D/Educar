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

## EI-05 — Ambigüedad detectada en bloque Proporcionalidad (d143)

**Severidad:** BAJA  
**Estado:** DOCUMENTADO

**Descripción:**  
El bloque 5 (Proporcionalidad, d143) tiene un rango calculado de d143–d142, con `start > end`. Esto ocurre porque los bloques 5 (Proporcionalidad) y 6 (Geometría) se detectaron en la misma página d143 y la diferencia entre ellos es 0 páginas.

**Causa raíz:**  
`find_block_starts()` asigna a cada bloque hasta la página anterior al siguiente bloque. Cuando dos bloques están en la misma página, el rango queda como `[143, 142]`.

**Consecuencia:**  
El bloque Proporcionalidad d143 se omite en la extracción (rango inválido). La ambigüedad registrada corresponde a este caso.

**Acción requerida para Etapa 02.4:**  
En `extract_pilot()`, agregar validación: si `blk_end < blk_start`, usar `blk_end = blk_start` y agregar nota de ambigüedad.

---

## EI-06 — Encabezados repetidos capturados en spans

**Severidad:** BAJA  
**Estado:** DOCUMENTADO

**Descripción:**  
Algunos spans de encabezado de página ("Matemática", "Diseño Curricular...") pueden no ser filtrados si su posición Y no está en la zona esperada (< 60 pt o > 780 pt). Los encabezados tipográficos del DC PBA 2018 no tienen posición Y consistente en todas las páginas.

**Acción requerida para Etapa 02.4:**  
Ampliar el conjunto de `RUNNING_HEADERS` en `config.py` y/o aumentar el margen de detección de zona de encabezado.
