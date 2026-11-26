# EXTRACTION_STRATEGY.md — Estrategia de extracción
**Etapa 02.1 · Fecha: 2026-11-26**

---

## Principios generales

1. **No inventar relaciones**: toda relación semántica debe estar respaldada por texto o posición en la fuente.
2. **Trazabilidad obligatoria**: cada contenido extraído debe registrar página digital, página impresa y área/bloque/año de origen.
3. **Texto original preservado**: el texto del DC se almacena tal cual; la normalización es un proceso separado y reversible.
4. **Validación humana**: los casos ambiguos se marcan y no se publican hasta revisión.
5. **Incremental y auditado**: el extractor procesa secciones, no el documento completo de una vez.

---

## Tipos de estructuras identificadas

### Tipo A — Tabla tricolumna (Matemática, Ciencias Sociales, Ciencias Naturales)

La estructura dominante en las tres áreas principales:

```
BLOQUE: [nombre del bloque]
┌──────────────────────┬──────────────────────┬──────────────────────────┐
│ Conceptos            │ Modos de conocer     │ Indicadores de avance    │
│                      │                      │ (Se considerará indicio  │
│                      │                      │ de progreso si el        │
│                      │                      │ estudiante...)           │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ Concepto 1           │ Modo A               │ Indicador X              │
│   · sub-contenido    │ Modo B               │ Indicador Y              │
│ Concepto 2           │ Modo C               │                          │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

**Situaciones de enseñanza** aparecen en página(s) inmediatamente posterior(es) a la tabla.

**Riesgo de extracción**: Las celdas de la columna Modos de conocer se combinan verticalmente abarcando múltiples conceptos; la correspondencia 1:1 entre concepto y modo de conocer no es siempre unívoca.

**Estrategia recomendada**:
1. Detectar heading "BLOQUE:" por texto y/o coordenada vertical ≥ 90% del ancho de la página.
2. Detectar las 3 celdas de encabezado por texto y posición X.
3. Usar coordenadas X de las columnas para asignar cada span a su columna.
4. Reconstruir celdas combinadas: el span de Modos de conocer que cubre varias filas de Conceptos debe asociarse a todos ellos.
5. Las tablas que continúan en la página siguiente se detectan por la ausencia de encabezado de tabla al inicio de la siguiente página (no hay "CONTENIDOS / INDICADORES / Conceptos / Modos de conocer" en la primera línea).
6. Registrar ambigüedades para validación humana.

### Tipo B — Tabla bicolumna (Prácticas del Lenguaje)

```
┌────────────────────────────────┬────────────────────────────────┐
│ Contenidos y modos de conocer  │ Situaciones de enseñanza       │
├────────────────────────────────┼────────────────────────────────┤
│ ...                            │ ...                            │
└────────────────────────────────┴────────────────────────────────┘
```

Los indicadores de avance están integrados en los modos de conocer o en secciones separadas (no en columna propia).

**Estrategia**: similar al Tipo A pero con 2 columnas. Separación por X ≈ mitad del ancho de la página.

### Tipo C — Texto narrativo con listas (Inglés, Ed. Artística, Ed. Física)

No hay tablas de 3 columnas. Los contenidos se presentan como texto corrido con listas de ítems con guion (–) o punto (·).

**Estrategia**:
1. Identificar heading de sección y sub-sección.
2. Extraer texto completo del bloque.
3. Parsear listas por patrones de inicio de línea (`– `, `· `, `\t`).
4. No forzar estructura tabular donde no existe.

### Tipo D — Encabezados repetidos (a filtrar)

Cada par de páginas (par/impar) tiene encabezados:
- Página par: "Diseño Curricular para la Enseñanza Primaria · Dirección General de Cultura y Educación"
- Página impar: "[Nombre del área]"

**Estrategia**: filtrar los spans que coincidan exactamente con estos patrones antes de procesar el contenido de la página.

---

## Metodología de procesamiento por área

### Prioridad 1 — Matemática (Tipo A, mejor definida)

1. Detectar boundary de área por heading de nivel 1 (font size ≥ 50pt).
2. Detectar año: buscar heading "Primer año", "Segundo año", ..., "Sexto año" (font size ~18pt, bold).
3. Detectar bloque: buscar líneas que comiencen con "BLOQUE:" o que tengan texto en mayúsculas con font size ~14pt.
4. Extraer tabla tricolumna por coordenadas X.
5. Extraer "SITUACIONES DE ENSEÑANZA" como texto narrativo inmediatamente posterior.
6. Asignar identificador: `MAT-{año}-{bloque}-{n}` (ej. `MAT-4-FRACCIONES-001`).

### Prioridad 2 — Ciencias Sociales (Tipo A, 2 bloques repetidos)

1. Detectar boundary de área.
2. Detectar ciclo: "Primer Ciclo" / "Segundo Ciclo" (font size ~22pt).
3. Detectar año: "CUARTO AÑO", "QUINTO AÑO", etc. (all-caps en el texto).
4. Detectar bloque: "BLOQUE: Sociedades, culturas: Cambios y continuidades" / "BLOQUE: Sociedades, culturas y organización del espacio".
5. Extraer tabla tricolumna.
6. Extraer situaciones de enseñanza.
7. Asignar identificador: `CS-{ciclo}-{año}-{bloque}-{n}`.

**Nota importante**: dentro del Primer Ciclo, los contenidos de 1°, 2° y 3° año no siempre están separados en secciones distintas; algunos contenidos son del ciclo como unidad. Marcar nivel de granularidad en cada registro.

### Prioridad 3 — Ciencias Naturales (Tipo A, estructura similar a CS)

Misma estrategia que CS Sociales. Los 3 bloques son los ejes estructurantes.

### Prioridad 4 — Prácticas del Lenguaje (Tipo B)

1. Detectar ámbito (Literatura / Estudio / Formación Ciudadana / Reflexión sobre el lenguaje).
2. Detectar año.
3. Extraer tabla bicolumna.
4. Identificar "ortografía / acentuación" como sub-contenido de "Reflexión sobre el lenguaje".

### Prioridad 5 — Inglés, Ed. Artística, Ed. Física (Tipo C)

Extracción por secciones textuales. Validación humana de estructura antes de publicar.

---

## Identificadores estables

Formato propuesto: `[AREA]-[CICLO/AÑO]-[BLOQUE]-[TIPO]-[N]`

| Código área | Área |
|-------------|------|
| `LEN` | Prácticas del Lenguaje |
| `MAT` | Matemática |
| `CSS` | Ciencias Sociales |
| `CSN` | Ciencias Naturales |
| `ING` | Inglés |
| `ART` | Educación Artística |
| `EDF` | Educación Física |
| `INC` | Módulo Educación Inclusiva |
| `TIC` | Módulo TIC |

Tipos: `CON` (concepto), `MDC` (modo de conocer), `IDA` (indicador de avance), `SIT` (situación de enseñanza), `PRO` (propósito), `OBJ` (objetivo).

Ejemplo: `CSS-4-BLQ1-CON-003` = Ciencias Sociales, 4° año, Bloque 1, Concepto #3.

---

## Prioridades de extracción para Etapa 02.2

1. Matemática completa (mejor estructura, más demandada en prototipo)
2. Prácticas del Lenguaje Segundo Ciclo
3. Ciencias Sociales Segundo Ciclo (4°, 5°, 6°)
4. Ciencias Naturales completa
5. Resto de áreas

---

## Validaciones antes de publicar cualquier contenido extraído

- [ ] El rango de páginas citado existe en el documento (1–433)
- [ ] El texto original fue preservado sin modificación
- [ ] La columna asignada es correcta (verificación por muestra de 5% del total)
- [ ] No existen duplicados por identificador
- [ ] Las tablas multi-página están reconstruidas correctamente
- [ ] Los casos de texto hipenado fueron reconstruidos
- [ ] La relación concepto ↔ modo de conocer fue validada donde hubo celdas combinadas
