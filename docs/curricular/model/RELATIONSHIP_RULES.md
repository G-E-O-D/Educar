# RELATIONSHIP_RULES.md — Reglas semánticas y relaciones
**Etapa 02.2 · Fecha: 2026-11-26**

---

## 1. Tipos de relaciones y sus reglas

### R-01 — CONCEPT_WAY_OF_KNOWING (Concepto ↔ Modo de conocer)

**Origen en el DC:** columnas 1 y 2 de la tabla tricolumna.  
**Basis:** `SOURCE_EXPRESSED` — la posición en la misma fila de la tabla es evidencia suficiente.  
**Cardinalidad:** N:M — una celda de Modos de conocer puede abarcar varios conceptos (celdas combinadas).  
**Regla de creación:** se crea durante la extracción cuando el span de Modo de conocer tiene coordenada Y dentro del rango vertical del span de Concepto.  
**Restricción de integridad:** ambos extremos deben pertenecer al mismo bloque (`block_id` igual).  
**Estado de revisión recomendado:** `pending` si la celda era combinada; `validated` si era 1:1 y sin ambigüedad.

---

### R-02 — CONTENT_PROGRESS_INDICATOR (Contenido ↔ Indicador de avance)

**Origen:** columnas 1 y 3 de la tabla tricolumna; o columna 1 de la bicolumna cuando el indicador está integrado.  
**Basis:** `SOURCE_EXPRESSED`.  
**Cardinalidad:** N:M — un indicador puede cubrir múltiples contenidos en la misma fila combinada.  
**Regla de creación:** misma lógica de coordenadas Y que R-01.

---

### R-03 — CONTENT_TEACHING_SITUATION (Contenido ↔ Situación de enseñanza)

**Origen:** secciones "Situaciones de enseñanza" que siguen a cada tabla en el DC.  
**Basis:** `SOURCE_EXPRESSED` cuando la situación de enseñanza está explícitamente referida al bloque/concepto; `PEDAGOGICALLY_INFERRED` cuando la vinculación surge de interpretación del docente.  
**Regla de creación:** un elemento `TEACHING_SITUATION` se vincula al bloque (`block_id`) donde aparece. La relación individual con conceptos específicos puede ser `PEDAGOGICALLY_INFERRED`.  
**Nota:** no siempre el DC establece una relación explícita 1:1 entre situación de enseñanza y concepto particular.

---

### R-04 — YEAR_PROGRESSION (Progresión entre años)

**Ejemplo:** fracciones en 3° → fracciones en 4° → fracciones en 5°/6° (GC-008 → GC-009 → GC-010).  
**Basis:** `PEDAGOGICALLY_INFERRED` — el DC no establece explícitamente la relación de progresión en ese texto, pero la secuencia de los bloques la implica.  
**Regla:** el campo `notes` es obligatorio para este tipo de relación. Debe indicar qué bloque del DC antecede al otro y en qué página.  
**Cardinalidad:** 1:1 (un elemento es predecesor de otro en el año siguiente).  
**Prohibición:** no crear relaciones de progresión basadas únicamente en intuición pedagógica; debe existir respaldo en la secuencia de bloques del DC.

---

### R-05 — PREREQUISITE (Prerrequisito)

**Basis:** solo `SOURCE_EXPRESSED` si el DC lo menciona explícitamente, o `PEDAGOGICALLY_INFERRED` con `notes` obligatorias.  
**Restricción:** no crear relaciones de prerrequisito especulativas. En la extracción inicial, marcar como `PEDAGOGICALLY_INFERRED` y dejar para validación humana.

---

### R-06 — TRANSVERSAL_LINK (Enlace transversal)

**Uso:** relaciona un contenido de un área oficial con un contenido transversal (ESI, FEyC, Ed. Ambiental, DUA).  
**Basis:** `SOURCE_EXPRESSED` si el DC lo indica explícitamente (ej. "(ESI)" anotado en la tabla); `PEDAGOGICALLY_INFERRED` si es una propuesta del extractor.  
**Restricción:** no crear relaciones transversales automáticas para FEyC o Ed. Tecnológica sin respaldo textual, dado que no tienen sección propia.

---

### R-07 — CYCLE_TO_YEAR (Refinamiento ciclo → año)

**Uso:** cuando un contenido del DC aparece solo con alcance de Primer Ciclo (sin desagregar por año) pero un revisor humano puede asignarlo a un año específico.  
**Basis:** `PEDAGOGICALLY_INFERRED` — no existe en el DC, es una asignación pedagógica posterior.  
**Regla:** el `source_element_id` debe tener `year_scope = CYCLE`; el `target_element_id` debe tener `year_scope = YEAR`.  
**Restricción:** solo crear esta relación si el revisor la documenta con justificación curricular.

---

## 2. Reglas de cardinalidad de element_year_scope

| Escenario | year_scope | year_id | cycle_id |
|-----------|-----------|---------|----------|
| Contenido de 4° año | YEAR | year_id=4° | NULL |
| Contenido de Primer Ciclo sin desagregar | CYCLE | NULL | cycle_id=C1 |
| Unidad Pedagógica (1°+2°) | YEAR | year_id=UP_1_2 | NULL |
| Módulo Ed. Inclusiva (todo el nivel) | DOCUMENT | NULL | NULL |
| Contenido transversal ESI | DOCUMENT | NULL | NULL |
| GC-007 ciclo hidrológico (año desconocido) | CYCLE | NULL | cycle_id=C2 |

---

## 3. Reglas de relaciones en tablas bicolumnas (Prácticas del Lenguaje)

La tabla bicolumna de Prácticas del Lenguaje tiene columnas:
- Columna 0: "Contenidos y modos de conocer"
- Columna 1: "Situaciones de enseñanza"

No hay indicadores de avance en columna separada (están integrados en los contenidos/modos de conocer o en secciones aparte).

**Regla:** los elementos extraídos de la columna 0 se tipan como `CONTENT` o `WAY_OF_KNOWING` según el sub-contexto. No se crean relaciones `CONTENT_PROGRESS_INDICATOR` desde la tabla principal; los indicadores, si aparecen, se extraen de secciones separadas con `TEACHING_SITUATION` o `EVAL_GUIDANCE`.

---

## 4. Reglas para módulos transversales (Ed. Inclusiva, TIC)

Los módulos no tienen tabla tricolumna ni bicolumna. Sus elementos se tipan como:
- `AREA_PURPOSE`: propósitos del módulo
- `DIDACTIC_GUIDANCE`: orientaciones para la enseñanza
- `EVAL_GUIDANCE`: criterios de evaluación (si existen)

No se crean relaciones `CONCEPT_WAY_OF_KNOWING` para estos módulos.

---

## 5. Regla de integridad de relaciones

**Regla general:** los dos extremos de cualquier relación (`source_element_id` y `target_element_id`) deben ser elementos con `review_status ≠ 'rejected'`.  
**Si un elemento pasa a `rejected`:** sus relaciones se marcan con `relation_basis = 'PEDAGOGICALLY_INFERRED'` y se agrega nota explicativa. No se eliminan.  
**Si un elemento pasa a `replaced`:** las relaciones apuntan al elemento original hasta que el revisor las migra manualmente al sucesor.

---

## 6. Restricción de relaciones entre elementos de distintas fuentes documentales

Dos elementos que pertenecen a versiones curriculares distintas (ej. DC 2018 vs DC 2028 hipotético) **no deben** tener relaciones de tipo `CONCEPT_WAY_OF_KNOWING`, `CONTENT_PROGRESS_INDICATOR` ni `CONTENT_TEACHING_SITUATION`.

Sí pueden tener: `YEAR_PROGRESSION` (inter-versional con `notes` obligatorias indicando que cruza versiones).

---

## 7. Alias y sinónimos — reglas de uso en búsqueda

1. `OFFICIAL_NAME` → no afecta la búsqueda; es el término canónico en la fuente.
2. `SEARCH_ALIAS` → la consulta del usuario se expande automáticamente para incluir el `canonical_term`.
3. `VALIDATED_SYNONYM` → tratado igual que `SEARCH_ALIAS` a efectos de recuperación.
4. `RELATED_TERM` → no expande la búsqueda; solo aparece como sugerencia de términos relacionados.
5. `PARTIAL_EQUIVALENCE` → no expande la búsqueda automáticamente; requiere confirmación del usuario.
6. `AMBIGUOUS` → no participa en ningún mecanismo automático; solo para registro.

**Regla clave:** un alias `SEARCH_ALIAS` no implica que los contenidos sean pedagógicamente equivalentes. "Ciclo del agua" recupera el texto sobre "ciclo hidrológico" pero el sistema muestra el término oficial en el resultado.
