# Registro de Problemas de Extracción — Etapas 02.3 / 02.3.1 / 02.4A

**Fecha última actualización:** 2026-11-26  
**Extractor:** 0.1.0-pilot  
**Área procesada:** Matemática (MAT) — completa d98–d173 (EI-08 fix 02.4A)

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
**Estado:** CORREGIDO — Etapa 02.4A

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
**Estado:** CORREGIDO — Etapa 02.4A

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
**Estado:** CORREGIDO — Etapa 02.4A

**Descripción:**  
Algunos spans de encabezado de página ("Matemática", "Diseño Curricular...") pueden no ser filtrados si su posición Y no está en la zona esperada (< 60 pt o > 780 pt). Los encabezados tipográficos del DC PBA 2018 no tienen posición Y consistente en todas las páginas.

**Acción requerida para Etapa 02.4:**  
Ampliar el conjunto de `RUNNING_HEADERS` en `config.py` y/o aumentar el margen de detección de zona de encabezado.


---

## EI-09 — Estructura de tabla incompatible en Primer Ciclo 1 y 2

**Severidad:** MEDIA  
**Estado:** DOCUMENTADO — Etapa 02.4A

**Descripcion:**  
Las tablas de Primer Ciclo 1 y 2 (d102-d120) tienen estructura incompatible con el TricolumnAdapter actual. El Segundo Ciclo tiene una tabla por año con cabecera de año en la pagina. El Primer Ciclo 1/2 tiene:
- Dentro de cada pagina de BLOQUE, los headers "Primer año" y "Segundo año" aparecen como sub-cabeceras de fila (sz=12, y0~93-95), NO como cabeceras de pagina
- Los sub-headers de columna ("CONTENIDOS", "Modos de conocer") aparecen en y0~76-95, dentro del rango que el extractor procesa como contenido
- El layout tiene un super-header "USAR Y CONOCER LOS NUMEROS" en y0~58-60 que el extractor no reconoce

**Consecuencias observadas (d102-d120, extracción 02.4A):**
- Año asignado incorrectamente (year=4 por defecto, deberia ser year=1 o year=2)
- Sub-headers "Conceptos" y "Modos de conocer" (y0=95) incluidos en el primer elemento de col0
- Sub-header "(Se considerará un indicio de progreso si...)" incluido en PROGRESS_INDICATOR
- Etiquetas de año "Primer año" / "Segundo año" (x0=639, col3) incluidas en TEACHING_SITUATION

**Ejemplo de elemento erroneo:**
- type=CONCEPT, text="Conceptos Conceptos Números hasta el 100 o 150. Valor de las..."
- type=TEACHING_SITUATION, text="Segundo año Primer año Recuperar y sistematizar la lectura..."

**Tablas afectadas:** d102-d120 (Primer Ciclo 1 y 2):
- d102-d104: BLOQUE Numeros Naturales (1 y 2)
- d105-d111: BLOQUE Operaciones con Numeros Naturales (1 y 2)
- d112-d113: BLOQUE Medida (1 y 2)
- d114-d120: BLOQUE Geometria (1 y 2) + BLOQUE Espacio (1 y 2)

**Tablas NO afectadas:**
- d121-d134: Primer Ciclo 3° — estructura compatible (cabecera de año en pagina, igual que Segundo Ciclo)
- d135-d173: Segundo Ciclo 4°/5°/6° — estructura compatible

**Accion requerida (Etapa 02.5+):**  
Implementar un adaptador especifico para tablas Primer Ciclo 1/2 que:
1. Detecte el patron de sub-cabecera "Primer año"/"Segundo año" dentro del rango de contenido (y0 < 100, sz=12)
2. Use la y0 de estos marcadores para separar el contenido de 1 y 2 dentro de cada pagina
3. Filtre los sub-headers de columna de y0<100

---

## EI-10 — Situaciones de enseñanza contamina extracción de conceptos CSS

**Severidad:** MEDIA  
**Estado:** PARCIALMENTE CORREGIDO — Etapa 02.4B

**Descripción:**  
En CSS, las páginas de "Situaciones de enseñanza" son páginas narrativas (sin columna Modos de conocer). El TricolumnReconstructor las incluía en el mismo bloque que las páginas de tabla porque el rango de bloque cubre ambas. El texto narrativo aparecía como ítems CONCEPT/WAY_OF_KNOWING contaminados.

**Causas y evidencia:**  
- d196 (3°), d203, d206–d208 (4°), d215–d219 (5°), d223–d224, d227–d232 (6°) son páginas situaciones
- En esas páginas col1 (Modos de conocer) tiene 0 spans → no hay contenido de tabla
- El texto narrativo (x0≈60–130pt) queda en col0 → se extrae como CONCEPT

**Corrección aplicada en Etapa 02.4B:**  
En `extract_standard_year()` de `extract_all.py`, después del header filtering, se agrega un "table page cutoff": se detecta la última página del bloque con contenido en `way_col` (col1 para CSS 3°+, col2 para CSS 1°/2°). Las páginas posteriores a esa última página de tabla se eliminan de `spans_by_page` antes de la reconstrucción.

**Efecto de la corrección:**  
- 3°: 76 → 89 elementos  
- 4°: 83 → 106 elementos  
- 5°: 69 → 133 elementos  
- Total CSS: 411 → 533 elementos (+30%)

**Contaminación residual:**  
Algunos elementos CONCEPT con texto de cabecera "Situaciones de enseñanza" persisten en la primera página de ciertos bloques (donde el cutoff no aplica). Documentado como pendiente para Etapa 02.5+.

---

## EI-11 — Artefactos de texto en css_split_items (concatenaciones)

**Severidad:** BAJA  
**Estado:** DOCUMENTADO — Etapa 02.4B

**Descripción:**  
La función `css_split_items()` une los spans de un mismo grupo con `"".join(s.text for s in grp)` sin agregar espacio entre spans. En el PDF algunos spans terminan sin espacio y el siguiente comienza sin espacio, produciendo palabras pegadas:

- `"dimensión"` + `"comunidad local."` → `"dimensióncomunidad local."` (artefacto por corte de línea)
- `"transformar la"` + `"moración..."` → texto ilegible (ligatura PDF no decodificada)
- `"Los pueblos originarios americanos en el siglo XV."` + `"La signifi"` → concatenación entre ítems

La causa raíz combina:
1. PDF con spans sin trailing space en fin de línea
2. Reglas 0–4 de css_split_items no cubren todos los casos de inicio de nuevo ítem
3. Algunos caracteres con ligatura (fi, fl, etc.) se codifican en la zona PUA del PDF → no son el PUA de bullets de MAT, sino artefactos tipográficos

**Acción requerida para Etapa 02.5+:**  
Mejorar texto_join: agregar espacio cuando el span anterior termina sin espacio y el siguiente no comienza con espacio. Revisar decodificación de ligaturasEn el PDF.

---

## EI-12 — digital_page no poblado en elementos CSS

**Severidad:** BAJA  
**Estado:** DOCUMENTADO — Etapa 02.4B

**Descripción:**  
Todos los elementos CSS tienen `digital_page=None` y `printed_page=None` en la salida JSON. El valor esperado es el número de página digital (1-based) donde inicia el span del elemento.

**Causa raíz:**  
`RawCell.page_start` retorna `None` cuando no se ha establecido el atributo `page` en los `Span` objects. `extract_spans()` y `extract_page_content()` crean spans sin asignar `digital_page` a nivel de span individual. El `TricolumnReconstructor` reconstruye celdas pero no propaga el número de página a `RawCell.page_start`.

**Efecto:**  
Los campos `digital_page` y `printed_page` no permiten trazar el elemento a su página de origen. `printed_page = page - 1` donde `page=None` debería generar TypeError pero no lo hace porque el adaptador no llega a ese código (hay un default `0` en el dataclass que se pisa con `None`).

**Acción requerida para Etapa 02.5+:**  
En `TricolumnReconstructor._group_col_spans_into_items()`, almacenar el número de página del primer span en la `RawCell` resultante. O en `extract_spans()`, asignar `page_num` a cada `Span`.

---

## EI-13 — Números de página PDF capturados como TEACHING_SITUATION en CSS

**Severidad:** BAJA  
**Estado:** DOCUMENTADO — Etapa 02.4B

**Descripción:**  
En CSS 3°–6°, el TricolumnAdapter asigna `TEACHING_SITUATION` al contenido de col3 (x0 > 511pt). En el DC PBA 2018, CSS no tiene columna "Situaciones de enseñanza" en su tabla; col3 en CSS corresponde a:
- Números de página del documento (ej: "195", "201", "209")
- Nombre del área ("Ciencias Sociales")
- Encabezados repetidos de tipo EI-06 no filtrados

Esto genera 15 elementos TEACHING_SITUATION espurios en CSS (13 con texto de número de página o área).

**Corrección para Etapa 02.5+:**  
Para CSS, el TricolumnAdapter debería ignorar col3. Opciones: post-filtrar elementos TEACHING_SITUATION cuyo `original_text` sea un número o un nombre de área, o extender CSSAdapter/TricolumnAdapter con un parámetro `max_col=2` para CSS.

---

## EI-14 — Bibliografía bleed en 6° CSS Bloque 2

**Severidad:** BAJA  
**Estado:** DOCUMENTADO — Etapa 02.4B

**Descripción:**  
El bloque "Sociedades y territorios" (6°, d225–d232) contiene al final del bloque texto de bibliografía ("Bibliografía General Disciplinar – Segundo Ciclo", referencias de publicaciones) que se extrae como CONCEPT. Esto ocurre porque:
1. El rango 6° termina en d232 (bibliography_start=233 en config)
2. Las páginas d229–d232 tienen col1 ≥ 17 spans (pasan el cutoff EI-10)
3. Sin embargo, parte del texto en col0 de esas páginas corresponde a referencias bibliográficas mezcladas con contenido curricular

**Acción requerida para Etapa 02.5+:**  
Verificar si la bibliografía comienza antes de d233 en la zona de 6° y ajustar `bibliography_start` o agregar un filtro por keywords ("Bibliografía", "Buenos Aires:", "Editorial").
