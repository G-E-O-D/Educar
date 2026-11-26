# ISSUES_REGISTER.md — Registro de problemas y ambigüedades
**Etapa 02.1 · Fecha: 2026-11-26**

---

## Convenciones

| Código | Tipo |
|--------|------|
| `NOR` | Normativa — vigencia o interpretación legal |
| `EST` | Estructura — organización del documento |
| `EXT` | Extracción — dificultad técnica al procesar el PDF |
| `SEM` | Semántica — término o concepto ambiguo |
| `ENV` | Entorno — condición del entorno de desarrollo |

| Prioridad | Significado |
|-----------|-------------|
| `ALTA` | Bloquea o distorsiona resultados del motor curricular |
| `MEDIA` | Requiere decisión antes de publicar contenido extraído |
| `BAJA` | Registrar para control de calidad; no bloquea |

---

## I-01 — Vigencia normativa no verificable localmente

| Campo | Valor |
|-------|-------|
| Código | I-01 |
| Tipo | NOR |
| Prioridad | ALTA |
| Estado | PENDIENTE — requiere acción externa |

**Descripción:**
La Resolución N° 1482/17 consta en el cuerpo del documento (p. 7) como acto de aprobación del DC. Sin embargo, la vigencia normativa en el ciclo lectivo 2026 no puede acreditarse únicamente con esta fuente: el documento podría haber sido parcialmente modificado por resoluciones posteriores no incluidas en el PDF.

**Acción requerida:**
Verificar en el Boletín Oficial de la Provincia de Buenos Aires o en el SINBA (Sistema de Información Normativa de Buenos Aires) si la Resolución N° 1482/17 sigue vigente en su totalidad, si fue modificada parcialmente, o si fue reemplazada.

**Impacto:**
Si se detectaran modificaciones normativas posteriores, el contenido extraído del DC 2018 podría no reflejar el currículo vigente. Esta verificación es necesaria antes de cualquier uso educativo en producción.

---

## I-02 — Formación Ética y Ciudadana sin sección propia

| Campo | Valor |
|-------|-------|
| Código | I-02 |
| Tipo | EST |
| Prioridad | MEDIA |
| Estado | CONFIRMADO — sin acción inmediata requerida |

**Descripción:**
La Resolución N° 1482/17 incluye observaciones explícitas sobre Formación Ética y Ciudadana, lo que podría interpretarse como que tiene status de área curricular. Sin embargo, el documento no le dedica una sección independiente. Sus contenidos aparecen distribuidos en:
- Como denominación del "Ámbito de la Formación Ciudadana" dentro de Prácticas del Lenguaje
- Como contenido transversal en Ciencias Sociales y en los Principios generales

**Decisión pendiente:**
Definir si el extractor debe crear un área virtual `FEyC` consolidando los contenidos transversales, o si debe mapearse solo como sub-ámbito de Prácticas del Lenguaje.

---

## I-03 — Educación Tecnológica sin sección propia

| Campo | Valor |
|-------|-------|
| Código | I-03 |
| Tipo | EST |
| Prioridad | MEDIA |
| Estado | CONFIRMADO — sin acción inmediata requerida |

**Descripción:**
Similar a I-02. Educación Tecnológica es mencionada en la Resolución N° 1482/17 con observaciones. En el documento aparece integrada en:
- El Módulo TIC (como marco pedagógico)
- Orientaciones didácticas de Ciencias Naturales y Matemática

No tiene bloque ni tabla de contenidos propios.

**Decisión pendiente:**
Definir si se extrae como área virtual `TEC` o se deja exclusivamente bajo el Módulo TIC.

---

## I-04 — Discrepancia de paginación (433 vs 450 p.)

| Campo | Valor |
|-------|-------|
| Código | I-04 |
| Tipo | EST |
| Prioridad | BAJA |
| Estado | DOCUMENTADO — no afecta la extracción |

**Descripción:**
El registro bibliográfico cita "450 p." mientras que el PDF tiene 433 páginas digitales. La diferencia de 17 páginas corresponde probablemente a guardas, contratapa y páginas de diseño de la edición impresa que no fueron incluidas en la digitalización.

**Verificación:**
Ninguna página identificada en la estructura curricular queda fuera del rango 1–433. La regla `printed_page = digital_page - 1` es consistente en los 12 puntos de muestreo verificados.

**Acción:**
Ninguna. Registrar en la documentación de cualquier referencia bibliográfica que cite el DC.

---

## I-05 — Tablas multi-página con celdas combinadas

| Campo | Valor |
|-------|-------|
| Código | I-05 |
| Tipo | EXT |
| Prioridad | ALTA |
| Estado | PENDIENTE — a resolver en Etapa 02.2 |

**Descripción:**
En la mayoría de las áreas, las tablas de contenidos abarcan 2 o más páginas y contienen celdas combinadas verticalmente (especialmente en la columna "Modos de conocer"). La correspondencia entre un Concepto y su Modo de conocer no siempre es 1:1: un único Modo de conocer puede cubrir múltiples Conceptos dentro de una misma celda combinada.

**Riesgo:**
Un extractor ingenuo que procese cada span de texto de forma independiente generará relaciones incorrectas o duplicadas.

**Estrategia recomendada:**
Usar coordenadas verticales (Y) del span dentro del PDF para detectar si una celda de Modos de conocer abarca el rango vertical de múltiples celdas de Conceptos. Ver EXTRACTION_STRATEGY.md, Tipo A.

---

## I-06 — Hiphenación tipográfica en texto justificado

| Campo | Valor |
|-------|-------|
| Código | I-06 |
| Tipo | EXT |
| Prioridad | MEDIA |
| Estado | PENDIENTE — a resolver en Etapa 02.2 |

**Descripción:**
Adobe InDesign justifica el texto usando hiphenación automática. Las palabras divididas al final de línea aparecen en el texto extraído como dos fragmentos separados por un guion (`-`) y un salto de línea. Ejemplo del documento: `ca-\nracterísticas` → debe reconstruirse como `características`.

**Estrategia:**
Al finalizar cada línea de texto que termina en `-`, verificar si la próxima línea comienza en minúscula (hiphenación) o en mayúscula (guion real). Reconstruir la palabra en el primer caso.

---

## I-07 — "Ciclo del agua" no aparece como término canónico

| Campo | Valor |
|-------|-------|
| Código | I-07 |
| Tipo | SEM |
| Prioridad | MEDIA |
| Estado | CONFIRMADO — documentado en GOLDEN_CASES.json |

**Descripción:**
El término coloquial "ciclo del agua" no aparece en el DC. El término usado en el documento es "ciclo hidrológico". Búsquedas de sinónimos en el motor curricular deben mapear "ciclo del agua" → "ciclo hidrológico" para devolver resultados.

**Verificado en:** GC-007 (d280, Ciencias Naturales, Segundo Ciclo).

---

## I-08 — Ortografía/acentuación no tiene bloque independiente

| Campo | Valor |
|-------|-------|
| Código | I-08 |
| Tipo | SEM |
| Prioridad | MEDIA |
| Estado | CONFIRMADO — documentado en GOLDEN_CASES.json |

**Descripción:**
En Prácticas del Lenguaje, ortografía y acentuación son tratadas como contenidos integrados a las prácticas de escritura, bajo el ámbito de "Reflexión sobre el lenguaje". No existe un bloque titulado "Ortografía" ni "Acentuación" independiente.

**Implicación para el motor curricular:**
Consultas sobre "reglas de acentuación" o "ortografía" deben resolverse devolviendo contenidos del ámbito "Reflexión sobre el lenguaje" de Prácticas del Lenguaje, con el año correspondiente.

**Verificado en:** GC-011 (d53) y GC-012 (d63).

---

## I-09 — Páginas de sub-áreas de Educación Artística son estimaciones

| Campo | Valor |
|-------|-------|
| Código | I-09 |
| Tipo | EST |
| Prioridad | BAJA |
| Estado | PENDIENTE — a verificar en Etapa 02.2 |

**Descripción:**
Los rangos exactos de páginas de las 4 sub-áreas de Educación Artística (Plástica Visual, Música, Danza, Teatro) dentro del rango d312–d371 son estimaciones basadas en el análisis de headings. No fueron verificados con la misma precisión que las demás áreas.

**Acción:**
En Etapa 02.2, al procesar Educación Artística, verificar los headings de inicio de cada sub-área y actualizar CURRICULAR_STRUCTURE.md con los rangos exactos.

---

## I-10 — docs/.venv/ debe excluirse del repositorio

| Campo | Valor |
|-------|-------|
| Código | I-10 |
| Tipo | ENV |
| Prioridad | ALTA |
| Estado | PENDIENTE — verificar antes del commit |

**Descripción:**
Durante Etapa 02.1 se creó un entorno virtual Python en `docs/.venv/` para instalar PyMuPDF y ejecutar los scripts de análisis. Este directorio contiene binarios de Python (~100 MB) y no debe incluirse en el repositorio de git.

**Acción inmediata:**
Verificar que `docs/.venv/` esté en `.gitignore` antes de cualquier `git add`. Si no está ignorado, agregarlo.

**Nota adicional:**
Los scripts en `docs/curricular/scripts/` son entregables de auditoría y sí deben incluirse en el commit.

---

## I-11 — PDF fuente: verificar permisos antes de incluir en git

| Campo | Valor |
|-------|-------|
| Código | I-11 |
| Tipo | NOR |
| Prioridad | ALTA |
| Estado | PENDIENTE — requiere decisión del propietario |

**Descripción:**
El archivo `docs/dis-curricular-PBA-completo.pdf` es un documento de distribución pública de la DGCyE PBA, publicado bajo Ley N° 11.723 (Ley de Propiedad Intelectual argentina). La redistribución en un repositorio git privado puede estar permitida bajo el artículo 36 de esa ley (uso educativo), pero requiere evaluación por parte del propietario del proyecto.

**Acción requerida:**
El propietario del proyecto debe decidir si incluir el PDF en el commit o mantenerlo fuera del control de versiones (agregándolo a `.gitignore`). Por defecto, **el PDF no se incluirá en el commit de Etapa 02.1** hasta que se tome esta decisión.

---

## Resumen de issues por prioridad

| Prioridad | Issues |
|-----------|--------|
| ALTA | I-01, I-05, I-10, I-11 |
| MEDIA | I-02, I-03, I-06, I-07, I-08 |
| BAJA | I-04, I-09 |

## Issues que bloquean Etapa 02.2

Los siguientes deben resolverse antes de iniciar la extracción de contenido:
- **I-01** — verificar vigencia normativa (decisión editorial)
- **I-05** — estrategia para celdas combinadas (técnico)
- **I-10** — .gitignore para docs/.venv/ (entorno)
- **I-11** — permisos de redistribución del PDF (decisión propietario)
