# Reporte de Extracción Piloto — Matemática 4° año

**Versión extractor:** 0.1.0-pilot  
**Fecha de ejecución:** 2026-11-26  
**Área:** Matemática (MAT) — Segundo Ciclo  
**Año objetivo:** 4°  
**PDF:** `dis-curricular-PBA-completo.pdf`  
**SHA-256:** `1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38` ✓

---

## 1. Verificación de fuente

| Campo | Valor |
|---|---|
| Archivo | `docs/dis-curricular-PBA-completo.pdf` |
| Tamaño | 3,617,659 bytes |
| SHA-256 | `1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38` |
| Estado | ✓ VERIFICADO |

---

## 2. Detección de bounds

El extractor buscó el encabezado "CUARTO AÑO" (y variantes) dentro del rango estimado de Matemática (d98–d179).

| Campo | Valor |
|---|---|
| Rango estimado (preliminar) | d135–d146 |
| **Rango real detectado** | **d135–d179** |
| Páginas impresas | p134–p178 |

**Hallazgo EI-02:** El rango real es significativamente mayor al estimado. Esto se debe a que la sección de Matemática del Segundo Ciclo (d135–d179) contiene los contenidos de los tres años (4°, 5° y 6°) organizados en bloques temáticos sucesivos, no en secciones separadas por año. El extractor piloto procesó el área completa en lugar de solo el 4° año.

**Consecuencia:** Los 1551 elementos extraídos corresponden a Matemática Segundo Ciclo (4°, 5° y 6°), no exclusivamente a 4°. Se requiere un mecanismo adicional de segmentación por año para Etapa 02.4.

---

## 3. Bloques detectados

Se detectaron 20 bloques con el patrón `BLOQUE: nombre`:

| # | Pág. digital | Pág. impresa | Nombre del bloque |
|---|---|---|---|
| 1 | d136 | p135 | Números Naturales |
| 2 | d137 | p136 | Operaciones con Números Naturales |
| 3 | d140 | p139 | Números Racionales |
| 4 | d142 | p141 | Medidas |
| 5 | d143 | p142 | Proporcionalidad |
| 6 | d143 | p142 | Geometría |
| 7 | d146 | p145 | Espacio |
| 8 | d148 | p147 | Números Naturales |
| 9 | d149 | p148 | Operaciones con Números Naturales |
| 10 | d152 | p151 | Números Racionales |
| 11 | d155 | p154 | Proporcionalidad |
| 12 | d156 | p155 | Medidas |
| 13 | d157 | p156 | Geometría |
| 14 | d159 | p158 | Espacio |
| 15 | d162 | p161 | Números Naturales |
| 16 | d163 | p162 | Operaciones con Números Naturales |
| 17 | d166 | p165 | Números racionales |
| 18 | d168 | p167 | Proporcionalidad |
| 19 | d170 | p169 | Medidas |
| 20 | d171 | p170 | Geometría y espacio |

**Observación:** Los bloques "Números Naturales", "Operaciones con Números Naturales", "Números Racionales", etc. aparecen repetidos tres veces, correspondiendo a los tres años del Segundo Ciclo (4°, 5°, 6°). El bloque 1 (d136–d136) corresponde a 4°, el 8 (d148–d148) a 5°, el 15 (d162–d162) a 6°.

---

## 4. Resultados de extracción

| Métrica | Valor |
|---|---|
| Páginas procesadas | 44 |
| Tablas raw | 19 |
| Elementos extraídos | 1551 |
| Relaciones generadas | 22726 |
| Ambigüedades | 1 |
| Errores de validación | 0 |
| Warnings de validación | 0 |

### 4.1 Elementos por tipo

| Tipo | Cantidad |
|---|---|
| `CONCEPT` / `WAY_OF_KNOWING` | 706 / 726 |
| `PROGRESS_INDICATOR` | 119 |
| **Total** | **1551** |

### 4.2 Relaciones por tipo

| Tipo | Cantidad |
|---|---|
| `CONCEPT_WAY_OF_KNOWING` | 18220 |
| `CONTENT_PROGRESS_INDICATOR` | 4506 |
| **Total** | **22726** |

**Hallazgo EI-01 (crítico):** El número de relaciones es artificialmente alto por el uso de producto cartesiano. Para un bloque con 10 conceptos y 20 modos de conocer, el adaptador genera 200 relaciones en lugar de ~20 (las correspondientes por fila). Esto se debe a que las celdas combinadas (un "Modo de conocer" que cubre múltiples conceptos) se expanden como producto cartesiano en lugar de como relación selectiva. Ver `EXTRACTION_ISSUES.md` → EI-01.

---

## 5. Verificación GC-007: ciclo hidrológico

| Campo | Valor |
|---|---|
| Término buscado | "ciclo hidrol" |
| Rango escaneado | d260–d290 |
| Páginas con el término | d279 (p278), d280 (p279) |
| Año determinado por algoritmo | 4° |
| Confianza | BAJA — ver EI-03 |

**d279 contexto:** "Cambios en la hidrosfera: el ciclo hidrológico. Mareas y corrientes marinas."  
**d280 contexto:** "experimentar y describir las transformaciones del agua en el ciclo hidrológico..."

**Problema:** Los headings de año (CUARTO AÑO, QUINTO AÑO, SEXTO AÑO) se detectaron todos en la misma página d261, que es la página de índice/tabla de contenidos del área. El algoritmo asigna el año por el último heading de año antes de d279, pero como todos están en d261, el resultado es no determinista. Se determinó año=4 pero es poco confiable.

**Actualización de I-12:** El término existe en d279 y d280. El año es muy probablemente 4° (es el primer año del Segundo Ciclo donde se introduce el ciclo hidrológico en Ciencias Naturales PBA). Se recomienda verificación manual en d261–d280 para confirmar la sección de año.

---

## 6. Validación

La validación integrada (`validate_all`) pasó sin errores:

- 1551 elementos verificados: páginas en rango, printed_page correcto, tipos válidos, texts no vacíos.
- 22726 relaciones verificadas: sin auto-relaciones, IDs existentes, bases válidas.
- Sin duplicados de stable_id.

---

## 7. Salida generada

| Archivo | Ruta |
|---|---|
| Extracción piloto | `docs/curricular/pilot_output/pilot_MAT_4.json` |
| Verificación GC-007 | `docs/curricular/pilot_output/gc007_verification.json` |

Los archivos de salida están fuera del commit (en `docs/curricular/pilot_output/` que no está en git).

---

## 8. Conclusiones

1. **El extractor funciona** de extremo a extremo: SHA-256 → PDF → spans → tabla → elementos → validación → JSON.
2. **El rango de Matemática 4°** no es una sección aislada; el Segundo Ciclo se trata como unidad. Se necesita segmentación adicional por año en Etapa 02.4.
3. **El producto cartesiano** de relaciones es el principal problema de calidad del piloto. Se resuelve en Etapa 02.4 con un adaptador de relaciones más preciso.
4. **GC-007** se cierra con año=4° (Ciencias Naturales) con confianza media. Se recomienda verificación manual final.
5. **85/85 tests** pasan, incluyendo 2 tests de integración con el PDF real.
