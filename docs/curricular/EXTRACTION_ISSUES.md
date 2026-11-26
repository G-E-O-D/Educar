# Registro de Problemas de Extracción — Etapa 02.3

**Fecha:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Área procesada:** Matemática (MAT) — Segundo Ciclo (4°, 5°, 6°)

---

## EI-01 — Relaciones por producto cartesiano

**Severidad:** ALTA  
**Estado:** ABIERTO

**Descripción:**  
El adaptador tricolumna genera relaciones `CONCEPT_WAY_OF_KNOWING` como producto cartesiano de todos los conceptos de col0 con todos los modos de conocer de col1 dentro de un mismo bloque. Para un bloque con 10 conceptos y 20 modos de conocer, esto genera 200 relaciones en lugar de ~20.

**Evidencia:**  
- Piloto: 706 conceptos × ~26 modos de conocer ≈ 18220 relaciones `CONCEPT_WAY_OF_KNOWING`.
- Relación real esperada: cada concepto se vincula solo con los modos de conocer de su fila (1:1 o 1:N por celdas combinadas).

**Causa raíz:**  
`adapters/tricolumn.py`: La función `adapt()` vincula todos los conceptos con todos los modos de conocer en la misma instancia del bloque, en lugar de usar la correspondencia por fila de la tabla.

**Acción requerida para Etapa 02.4:**  
Modificar `TricolumnAdapter.adapt()` para crear relaciones por fila: `cell[0]` de la misma `RawTableRow` con `cell[1]` de esa misma fila. Para celdas combinadas (row_span > 1), vincular el modo de conocer con los N conceptos que cubre.

---

## EI-02 — Bounds MAT 4° mayores al estimado

**Severidad:** MEDIA  
**Estado:** DOCUMENTADO

**Descripción:**  
El rango real de Matemática 4° no es d135–d146 (estimado preliminar) sino d135–d179. Esto se debe a que el Segundo Ciclo de Matemática en el DC PBA 2018 no segmenta los contenidos por año en secciones separadas. Los tres años (4°, 5°, 6°) están agrupados en bloques temáticos sucesivos dentro del mismo apartado.

**Evidencia:**  
- Scan_bounds detectó inicio en d135 (patrón "CUARTO AÑO") y fin en d179 (límite del área MAT).
- Los 20 bloques detectados incluyen 3 repeticiones de los mismos nombres de bloque (un conjunto por año).

**Acción requerida para Etapa 02.4:**  
Implementar segmentación por año dentro del área: buscar los headings de año (CUARTO AÑO, QUINTO AÑO, SEXTO AÑO) como delimitadores internos y procesar solo el rango entre el inicio de 4° y el inicio de 5°.

---

## EI-03 — Incertidumbre en año de GC-007

**Severidad:** MEDIA  
**Estado:** PARCIALMENTE RESUELTO — pendiente verificación manual

**Descripción:**  
El término "ciclo hidrológico" fue encontrado en d279 (p278) y d280 (p279). El algoritmo `verify_gc007()` determina el año mirando el heading de año más reciente antes de d279. Sin embargo, los headings "CUARTO AÑO", "QUINTO AÑO" y "SEXTO AÑO" aparecen todos en d261 (página de índice del área CS Naturales), haciendo que la determinación del año sea no confiable.

**Resultado del algoritmo:** Año = 4° (no determinista cuando hay empate de páginas).

**Evidencia del contexto en d279:**  
*"Cambios en la hidrosfera: el ciclo hidrológico. Mareas y corrientes marinas. Movimiento del agua en diferentes materiales del suelo..."*

**Hipótesis:** El ciclo hidrológico corresponde a 4° (primer año del Segundo Ciclo) por ser una introducción a la hidrosfera. Los contenidos de 5° y 6° típicamente profundizan temas como ecosistemas y procesos geológicos.

**Acción requerida:**  
Verificar manualmente d261–d280 para identificar los headings de año dentro del cuerpo del texto (no solo en la tabla de contenidos). Actualizar I-12 cuando se confirme.

**Actualización I-12:** De "pendiente" a "PARCIALMENTE VERIFICADO — probablemente 4°".

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
