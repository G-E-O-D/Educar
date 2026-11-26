# DECISIONS.md — Decisiones técnicas del modelo de datos curricular
**Etapa 02.2 · Fecha: 2026-11-26**

---

## D-01 — Aclaración de la discrepancia entre 10 secciones y 9 áreas

**Contexto:** El informe de Etapa 02.1 mencionó "10 secciones auditadas" pero el resumen previo enumeró 9 áreas.

**Resolución:**
El DC tiene 10 secciones en su cuerpo:

| N° | Sección | Categoría en el modelo |
|----|---------|------------------------|
| 0 | Principios organizadores (pp. 13–22) | Marco general (no es área ni módulo) |
| 1 | Módulo Educación Inclusiva | `MODULE` (transversal) |
| 2 | Módulo TIC | `MODULE` (transversal) |
| 3 | Prácticas del Lenguaje | `AREA` (oficial) |
| 4 | Matemática | `AREA` (oficial) |
| 5 | Ciencias Sociales | `AREA` (oficial) |
| 6 | Ciencias Naturales | `AREA` (oficial) |
| 7 | Inglés | `AREA` (oficial) |
| 8 | Educación Artística | `AREA` (oficial, con 4 sub-áreas) |
| 9 | Educación Física | `AREA` (oficial) |

**Resultado:** 7 áreas oficiales + 2 módulos transversales + 1 marco general = 10 secciones.
Los "9 items" del informe anterior (excluyendo "Principios organizadores") son correctos para las secciones que aportan contenido curricular extracción.
"Principios organizadores" se modela en `document_sections` como sección de marco general, no como área ni módulo.

---

## D-02 — Tratamiento de FEyC y Educación Tecnológica

**Decisión:** Se representan como `curriculum_areas` con `area_kind = 'TRANSVERSAL_CONTENT'`, no como `'AREA'` ni `'MODULE'`.

**Justificación:** Tienen mención en la Resolución N° 1482/17 con observaciones propias, pero no tienen sección ni tabla de contenidos en el DC. Inventarles una estructura tabular sería falsificar el documento. Modelarlas como `TRANSVERSAL_CONTENT` permite:
- Registrar las menciones que sí existen en el documento
- Marcar explícitamente la ausencia de contenidos tabulados
- No presentarlas como áreas con desarrollo curricular pleno

**Alternativas descartadas:**
- `'MODULE'`: reservado para módulos con desarrollo propio (Inclusiva, TIC)
- `'AREA'`: implicaría que tienen bloque/concepto/indicador propio
- Ignorarlas: perdería información normativa relevante

---

## D-03 — Polimorfismo de curriculum_elements vs tablas separadas

**Decisión:** Una sola tabla `curriculum_elements` con columna discriminadora `element_type`.

**Justificación:**
- Las 10 áreas tienen estructuras distintas; forzar tablas por tipo genera joins complejos sin beneficio en este prototipo
- El campo `element_type` permite filtros eficientes con índice parcial
- pgvector necesita una sola tabla de embeddings futura; mapear 7 tipos a 1 simplifica ese paso
- La trazabilidad documental (tabla `element_source_refs`) es idéntica para todos los tipos

**Alternativas descartadas:**
- Tabla por tipo (`concepts`, `teaching_situations`, etc.): 7+ tablas con lógica de joins duplicada
- Herencia PostgreSQL: complejidad sin beneficio para este volumen (~5.000 registros estimados)

---

## D-04 — Estrategia de identificadores estables

**Decisión:** Identificadores compuestos legibles + UUID interno.

**Formato:** `{AREA_CODE}-{CICLO_CODE}-{YEAR_CODE}-{BLOCK_CODE}-{TYPE_CODE}-{SEQ:04d}`

Ejemplo: `CSS-2C-4-BLQ1-CON-0003` = Ciencias Sociales, Segundo Ciclo, 4° año, Bloque 1, Concepto #3

**Regla de generación:**
- Calculado deterministamente desde la combinación (area, ciclo, año, bloque, tipo, posición en tabla)
- Almacenado como `stable_id` en `curriculum_elements`
- El UUID (`id`) es el PK interno; `stable_id` tiene restricción UNIQUE

**Por qué no solo posición PDF:** Un re-procesamiento del PDF podría alterar el orden de spans → los identificadores basados en posición cambiarían. El `stable_id` se fija al momento de la primera validación humana.

**Alternativas descartadas:**
- UUIDs puros: no legibles ni verificables por docentes o auditores
- Solo posición PDF: frágil ante re-extracciones

---

## D-05 — Estados de revisión

**Decisión:** Enum `review_status` con 6 valores: `extracted`, `pending`, `ambiguous`, `validated`, `rejected`, `replaced`.

**Semántica:**
- `extracted`: importado automáticamente, sin revisión humana
- `pending`: marcado para revisión (caso de celda combinada, texto hiphenado, etc.)
- `ambiguous`: revisado pero sin resolución posible; documentado en `notes`
- `validated`: revisado y aprobado por persona; puede usarse en producción
- `rejected`: erróneo o no pertinente; conservado por trazabilidad
- `replaced`: reemplazado por otro registro; apunta al sucesor via `replaced_by_id`

**Regla:** Solo registros `validated` pueden publicarse en la interfaz docente. Los demás son internos.

---

## D-06 — Separación de relaciones expresadas por la fuente vs inferidas

**Decisión:** Columna `relation_basis` en `element_relations` con valores `SOURCE_EXPRESSED` / `PEDAGOGICALLY_INFERRED` / `TERMINOLOGICAL`.

**Justificación:**
- Una relación `SOURCE_EXPRESSED` (ej.: concepto en columna A ↔ modo de conocer en columna B de la misma fila) tiene evidencia documental directa
- Una `PEDAGOGICALLY_INFERRED` (ej.: "fracciones en 3° son prerrequisito de fracciones en 4°") es una afirmación pedagógica sin referencia explícita en el DC
- La mezcla sin distinción induciría a error en el motor de búsqueda

---

## D-07 — Cobertura de ciclo vs año en curriculum_elements

**Decisión:** Columna `year_scope` con valores `YEAR` / `CYCLE` / `DOCUMENT`.

**Casos reales:**
- `YEAR`: contenido explícitamente asignado a un año (ej.: "CUARTO AÑO")
- `CYCLE`: contenido de Primer Ciclo como unidad (ej.: Ciencias Sociales Primer Ciclo, sin desagregar por año)
- `DOCUMENT`: contenido transversal a todo el documento (ej.: módulo Ed. Inclusiva)

**Relación:** `element_year_scope` (tabla puente many-to-many) permite que un elemento con `year_scope = YEAR` apunte a uno o varios años; con `CYCLE`, apunta al ciclo entero.

---

## D-08 — Versionado curricular

**Decisión:** `document_sources` lleva `version_tag` y relaciones `source_relations` (tipo: `UPDATES`, `SUPERSEDES`, `SUPPLEMENTS`).

**Escenario futuro:** Si DGCyE publica un DC 2028, se crea un nuevo `document_source`; los elementos del DC 2028 con `review_status = validated` apuntan al nuevo source. Los elementos del DC 2018 no se eliminan: su `review_status` pasa a `replaced`, con `replaced_by_id` apuntando al sucesor.

**Importancia:** Preserva la integridad de planificaciones docentes que referencien elementos del DC 2018.

---

## D-09 — GC-007: ciclo hidrológico — alcance de año

**Hallazgo en GOLDEN_CASES.json:** GC-007 dice `"year": "no especificado en bloque — Segundo Ciclo general"`.

**Decisión:** Modelar con `year_scope = CYCLE`, apuntando a Segundo Ciclo de Ciencias Naturales, hasta que una revisión del PDF con un script específico (ej.: extracción de headings de CS Naturales 2°C) determine el año exacto.

**Acción:** Crear issue I-12 en ISSUES_REGISTER.md para esta verificación pendiente.
El registro en `curriculum_elements` tendrá `review_status = ambiguous` con nota explicativa.

---

## D-10 — Tablas separadas para alias/sinónimos

**Decisión:** Tabla `term_aliases` independiente, no embebida en `curriculum_elements`.

**Justificación:** Un alias ("ciclo del agua") puede apuntar a múltiples elementos (el concepto de ciclo hidrológico puede aparecer en varios años/bloques). La relación es 1 alias → N elementos, mejor modelada en tabla aparte.

**Tipos de alias:** `OFFICIAL_NAME`, `SEARCH_ALIAS`, `VALIDATED_SYNONYM`, `RELATED_TERM`, `PARTIAL_EQUIVALENCE`, `AMBIGUOUS`.

---

## D-11 — Decisiones pendientes (requieren resolución del propietario)

| ID | Decisión pendiente | Impacto |
|----|-------------------|---------|
| DP-01 | Incluir DC PDF en git (I-11) | Habilita scripts reproducibles en CI |
| DP-02 | FEyC como área virtual con contenidos capturados | Ampliaría el scope de extracción |
| DP-03 | Estrategia de búsqueda: FTS solo vs FTS + pgvector | Afecta diseño de `embeddings` table |
| DP-04 | Separación física de repositorios (curricular vs docente) | Puede requerir multi-schema o multi-DB |
| DP-05 | Verificar GC-007 en PDF (año exacto del ciclo hidrológico) | Cierra I-09 parcial y GC-007 |
