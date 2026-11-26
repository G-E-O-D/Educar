# Reporte de Extraccion MAT — Etapas 02.4A / 02.4B

**Fecha:** 2026-11-26  
**Extractor:** 0.1.0-pilot (EI-08 corregido; EI-09 resuelto con PC12Extractor en 02.4B)  
**Area:** Matematica (MAT) — d98–d179  
**Estado:** COMPLETO — 1°/2°/3°/4°/5°/6° extraidos

---

## 1. Mapa de limites del area MAT

| Rango digital | Contenido | Estado extraccion |
|---------------|-----------|-------------------|
| d98 | Titulo del area "Matematica" | No extraible (pagina de titulo) |
| d99–d100 | Enfoque Curricular y Orientaciones para la Ensenanza | No extraible (texto continuo) |
| d101 | Primer Ciclo intro + Propositos del Ciclo + Objetivos | No extraible (texto continuo) |
| d102–d120 | Primer Ciclo 1° y 2° — tablas con sub-cabeceras internas | EI-09 (estructura incompatible) |
| d121–d134 | Primer Ciclo 3° — tablas compatibles | Extraido correctamente |
| d135–d146 | Segundo Ciclo 4° | Extraido (piloto v5 con EI-08 fix) |
| d147–d160 | Segundo Ciclo 5° | Extraido correctamente |
| d161–d173 | Segundo Ciclo 6° | Extraido correctamente |
| d174–d179 | Bibliografia (no curricular) | No aplica |

**Paginas de contenido curricular extraibles:** d102–d173 (72 paginas, incluyendo PC12)  
**Total rango nominal:** d98–d173 (76 paginas curriculares; d174+ es bibliografia)

---

## 2. Inventario por ciclo, año y bloque

### Primer Ciclo — 3° año (d121–d134)

| Bloque | Paginas | CONCEPT | WAY | PROG | TEACH | Rels |
|--------|---------|---------|-----|------|-------|------|
| Numeros Naturales | d122 | — | — | — | — | — |
| Operaciones con Numeros Naturales | d123–d128 | — | — | — | — | — |
| Medida | d129 | — | — | — | — | — |
| Geometria | d130–d132 | — | — | — | — | — |
| Espacio | d133–d134 | — | — | — | — | — |
| **TOTAL 3°** | d121–d134 | **27** | **81** | **82** | **79** | **242** |

*Nota: desglose por bloque requiere extraccion bloque a bloque; datos por año disponibles.*

### Segundo Ciclo — 4° año (d135–d146)

| Bloque | Paginas detectadas |
|--------|--------------------|
| Numeros Naturales | d136 |
| Operaciones con Numeros Naturales | d137–d139 |
| Numeros Racionales | d140–d141 |
| Medidas | d142 |
| Proporcionalidad | d143 (con EI-05 solapa d143 con Geometria) |
| Geometria | d143–d145 |
| Espacio | d146 |

| **TOTAL 4°** | d135–d146 | **45** | **109** | **87** | **85** | **294** |

### Segundo Ciclo — 5° año (d147–d160)

| Bloque | Paginas detectadas |
|--------|--------------------|
| Numeros Naturales | d148 |
| Operaciones con Numeros Naturales | d149–d151 |
| Numeros Racionales | d152–d154 |
| Proporcionalidad | d155 |
| Medidas | d156 |
| Geometria | d157–d158 |
| Espacio | d159–d160 |

| **TOTAL 5°** | d147–d160 | **41** | **115** | **102** | **90** | **319** |

### Segundo Ciclo — 6° año (d161–d173)

| Bloque | Paginas detectadas |
|--------|--------------------|
| Numeros Naturales | d162 |
| Operaciones con Numeros Naturales | d163–d165 |
| Numeros Racionales | d166–d167 |
| Proporcionalidad | d168–d169 |
| Medidas | d170 |
| Geometria y espacio | d171–d173 |

| **TOTAL 6°** | d161–d173 | **34** | **95** | **106** | **18** | **219** |

*Nota: TEACHING_SITUATION=18 en 6° es inusualmente bajo respecto a 4°/5°. Se registra para verificacion manual.*

---

## 3. Resumen total MAT extraible (3°/4°/5°/6°)

| Año | Paginas | Bloques | CONCEPT | WAY | PROG | TEACH | Elementos | Relaciones |
|-----|---------|---------|---------|-----|------|-------|-----------|------------|
| 3° PC | d121–d134 | 5 | 27 | 81 | 82 | 79 | 269 | 242 |
| 4° SC | d135–d146 | 7 | 45 | 109 | 87 | 85 | 326 | 294 |
| 5° SC | d147–d160 | 7 | 41 | 115 | 102 | 90 | 348 | 319 |
| 6° SC | d161–d173 | 6 | 34 | 95 | 106 | 18 | 253 | 219 |
| **TOTAL** | **d121–d173** | **25** | **147** | **400** | **377** | **272** | **1196** | **1074** |

**Rango con EI-09 (1°/2°, NO incluido en total):** d102–d120, 5 bloques, ~328 elementos con errores de asignacion.

---

## 4. Impacto del fix EI-08

La correccion de EI-08 (Etapa 02.4A) reduce el conteo de elementos porque elimina la sobreparticion de texto en lineas de continuacion:

| Metrica | Pre-EI-08 (v4) | Post-EI-08 (v5) | Cambio |
|---------|----------------|-----------------|--------|
| Elementos 4° (d135–d146) | 625 | 326 | -48% |
| Relaciones 4° | 2612 | 294 | -89% |
| CONCEPT 4° | 140 | 45 | -68% |
| Rels/concepto 4° (real) | 4.18 (falso) | 6.5 (real) | +55% |

La reduccion es ESPERADA y representa mejora en calidad: conceptos como "Numeros hasta el orden de los millones." ya no se fragmentan en 2-3 pseudo-conceptos.

---

## 5. Issue EI-09 — Primer Ciclo 1° y 2°

**Paginas afectadas:** d102–d120 (Bloque Numeros Naturales, Operaciones, Medida, Geometria)

**Estructura incompatible:**
- Sub-cabeceras de año "Primer año" / "Segundo año" (sz=12) a y0~93-95 dentro del area de contenido
- El extractor las clasifica como TEACHING_SITUATION (x0=639, col3)
- Sub-cabeceras "Conceptos", "Modos de conocer" a y0=95 incluidas en el primer elemento de cada bloque
- Super-header "USAR Y CONOCER LOS NUMEROS" (sz=9, y0=58) no reconocido

**Resultado de extraccion tentativa (d102–d120):**
- 328 elementos con year=4 (incorrecto; deberia ser year=1 o year=2)
- Texto de cabeceras mezclado en elementos (EJ: "Conceptos Conceptos Numeros hasta el 100...")
- NO incluido en los totales del reporte

**Accion:** Documentado como EI-09 en EXTRACTION_ISSUES.md. Requiere adaptador especifico para Etapa 02.5+.

---

## 6. Golden Cases GC-008, GC-009, GC-010 — Progresion Fracciones

| GC | Año | Paginas | Conceptos | Descripcion |
|----|-----|---------|-----------|-------------|
| GC-008 | 3° PC | d129 | 1 (medios y cuartos en contexto de Medida) | Fracciones cotidianas introducidas en Medida |
| GC-009 | 5° SC | d152–d153 | 7+ relacionados a Fracciones | Fracciones y divisiones, equivalencias, recta numerica |
| GC-010 | 6° SC | d166–d167 | 10 relacionados a Fracciones/Racionales | Fracciones como cociente, comparacion avanzada, operaciones |

**Correccion aplicada (02.4A):**
- GC-009 tenia year="4°" (incorrecto) — las paginas d152-d153 estan en el rango d147–d160 (5° SC). Corregido a year="5°".
- GC-010 tenia year="5° y 6°" (impreciso) — las paginas d166-d167 estan en el rango d161–d173 (6° SC). Corregido a year="6°".
- GC-008: year="3°" era correcto (d129 en rango d121–d134, 3° PC).

**Progresion verificada:**
- 3° PC: Fracciones introducidas como medios y cuartos en contexto de medida (Bloque Medida, d129)
- 4° SC: Fracciones de uso frecuente, equivalencias, suma/resta, decimales hasta milesimos (d140–d141)
- 5° SC: Fracciones y divisiones, comparacion avanzada, multiplicacion/division, decimales operaciones (d152–d154)
- 6° SC: Fracciones como cociente, fracciones entre fracciones, proporcionalidad, equivalencias complejas (d166–d167)

---

## 7. Archivos JSON con contenido DC — estado

| Archivo | En indice actual | Texto DC verbatim | Accion recomendada |
|---------|-----------------|-------------------|--------------------|
| `GOLDEN_CASES.json` | Si | Fragmentos en `text_original` | Reemplazar con referencias de pagina en Etapa 02.5+ |
| `raw_golden_cases.json` | Si | 27 entradas con texto verbatim (incluye PUA) | Idem |
| `pilot_MAT_4.json` | No (eliminado) | Si (en historial) | Historial no reescrito (restriccion del brief) |

**02.4A:** No se agregaron nuevas reproducciones extensas del DC.

---

*Extractor curricular v0.1.0-pilot — DC PBA 2018 SHA-256: 1c53a2cc9d8aacc1d1b4cfd6deac2af7fcdad0834d232c9c391705eb46271a38*

---

## 8. Resolucion EI-09 — PC12Extractor (Etapa 02.4B)

**Accion implementada:** Se construyo `adapters/pc12.py` con `PC12Extractor` que maneja la estructura de sub-cabeceras de Primer Ciclo 1°/2°.

**Estrategia:**
- Detecta marcadores "Primer año" / "Segundo año" (sz=12, en col3 o como sub-cabecera) dentro del bloque
- Separa los spans por año según la posicion Y de esos marcadores
- Extrae conceptos/modos/indicadores con year=1 o year=2 correctamente asignado
- Ítems que abarcan ambos años (zona compartida entre marcadores) se asignan year=None (joint)

**Resultados PC12 (d102–d120, 5 bloques):**

| Bloque | Paginas | 1° | 2° | Joint |
|--------|---------|----|----|-------|
| Numeros Naturales | d102–d104 | — | — | — |
| Operaciones con Numeros Naturales | d105–d111 | — | — | — |
| Medida | d112–d113 | — | — | — |
| Geometria | d114–d116 | — | — | — |
| Espacio | d117–d120 | — | — | — |
| **TOTAL PC12** | **d102–d120** | **132** | **103** | **1** | 236 elementos |

**Resumen total MAT con PC12 (Etapa 02.4B):**

| Año | CONCEPT | WAY | PROG | TEACH | Elementos | Relaciones |
|-----|---------|-----|------|-------|-----------|------------|
| 1°/2° PC | — | — | — | — | 236 | 173 |
| 3° PC | 27 | 81 | 82 | 79 | 269 | 242 |
| 4° SC | 45 | 109 | 87 | 85 | 326 | 294 |
| 5° SC | 41 | 115 | 102 | 90 | 348 | 319 |
| 6° SC | 34 | 95 | 106 | 18 | 252 | 218 |
| **TOTAL** | **210** | **462** | **433** | **326** | **1431** | **1246** |

*Validacion: 0 errores, 0 warnings.*
