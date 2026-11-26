# PROJECT_STATE.md — Plataforma educativa PBA

> **Última actualización:** 2026-11-26  
> **Versión:** 0.2.0  
> **Estado:** Etapa 02.3 completada — motor de extracción curricular y prueba piloto

---

## Estado general

| Dimensión        | Estado |
|------------------|--------|
| Monorepo         | ✅ Configurado (npm workspaces) |
| TypeScript       | ✅ Typecheck limpio, strict mode |
| ESLint           | ✅ 0 errores (`react/no-unescaped-entities` corregido en ActivitiesPage) |
| Build producción | ✅ Vite 8 — limpio |
| Tests unitarios (web) | ✅ Vitest — 24/24 (components.test.tsx + fixtures.test.ts) |
| Tests unitarios (api)  | ✅ Vitest + coverage-v8 configurado |
| Tests E2E        | ✅ Playwright — 162/162 en 3 viewports (Desktop 1440, Tablet 768, Mobile 390) |
| Accesibilidad    | ✅ WCAG 2.2 AA — axe pasa en todas las rutas (incluido landing post opacity-80 fix) |
| Seguridad (devDeps) | ⚠️ Vulnerabilidades solo en devDependencies — no afectan build de producción |
| Versionado       | ✅ gen-version.mjs con detección dirty; version-data.ts gitignoreado |
| Cache headers    | ✅ _headers Cloudflare Pages + vite.config.ts dev server |
| Git              | ✅ Commit `1e05841` — Etapa 01.3 completa |
| Deploy           | 🚫 Ninguno — solo prototipo local |

---

## Qué está implementado (Etapas 01 → 01.3)

### Monorepo
- `packages/shared` — contratos TypeScript compartidos (`HealthResponse`, `VersionResponse`, `ApiError`, `APP_VERSION: '0.2.0'`)
- `apps/api` — Cloudflare Worker con `GET /api/health`, `GET /api/version`, headers de seguridad, `vitest.config.ts` con coverage-v8
- `apps/web` — SPA React 18 + Vite 8.3.8 + Tailwind v4 + React Router v7

### UI prototipo (apps/web) — 6 páginas (Etapas 01.2 + 01.3)
- **Landing** (`/`) — H1: "La carpeta docente inteligente para la Educación Primaria bonaerense"; chips de estado; features disponibles vs proyectadas; sin testimonios ficticios; sin claim WCAG AA no verificado
- **Panel docente** (`/panel`) — Saludo contextual (buenos días/tardes/noches); "Preparar una clase completa" CTA (proyectado); datos de fixtures compartidas; módulos Ed. inclusiva y Laboratorios visibles (proyectados)
- **Biblioteca** (`/biblioteca`) — Identidad visual por tipo de recurso (texto/ficha/video/audio); acciones diferenciadas "Consultar" vs "Actividad"; licencias con descripción de uso; sin claim "verificadas"
- **Generador de actividades** (`/actividades`) — Área "Prácticas del Lenguaje" (renombrado de Lengua); opciones avanzadas desplegables; nota curricular DGCyE 2018; scroll al resultado en mobile; ESLint unescaped entities corregido
- **Portal del alumno** (`/alumno`) — Layout `LayoutStudent` (sin nav comercial); "Modo tranquilo" (renombrado de Modo calmo) con cambios visuales perceptibles (fondo blanco, tipografía más grande, sin gradientes); sin rachas consecutivas; logros personales mantenidos
- **Seguimiento pedagógico** (`/seguimiento`) — Importa fixtures compartidos; métricas diferenciadas (% respuestas correctas / actividades / cobertura curricular); sin `Math.random()`; sin "Sugerencia:" auto-inferida; "Prácticas del Lenguaje" en CURRICULUM
- **Catálogo de componentes** (`/demo`) — Design system completo
- **Ruta 404** — Página no encontrada con navegación

### Datos compartidos
- `apps/web/src/data/fixtures.ts` — `STUDENTS` (8 registros), `CURRICULUM` (11 items), `deriveStats()`, `FIXTURE_GRADE`, `FIXTURE_PERIOD`; importado por DashboardPage y TrackingPage

### Layouts
- `LayoutApp` — sidebar docente
- `Layout` — comercial con Header/Footer
- `LayoutStudent` — portal alumno, sin navegación comercial

### Infraestructura
- `scripts/gen-version.mjs` — detección de árbol sucio (`isDirty`), ambos artefactos gitignoreados
- `apps/web/public/_headers` — cache policy Cloudflare Pages (no-store, immutable, no-cache)
- `.github/workflows/ci.yml` — genera versión antes de typecheck y tests

### Calidad
- Vitest (web) — 24 tests: `components.test.tsx` (16) + `fixtures.test.ts` (8)
- Vitest (api) — `vitest.config.ts` con coverage-v8 configurado
- Playwright — 162/162 en Desktop/Tablet/Mobile: H1 "Primaria bonaerense", "Prácticas del Lenguaje", 320px todas las rutas, axe A/AA en todas las páginas, test Modo tranquilo
- ESLint flat config — 0 errores (react/no-unescaped-entities resuelto)

### Documentación
- `docs/PRODUCT_MASTER.md` — v0.2, sección 18 con hallazgos P01 y 8 nuevos requerimientos
- `README.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/SECURITY.md`, `docs/QA.md`, `docs/DESIGN_SYSTEM.md`
- `.github/workflows/ci.yml`

---

## Vulnerabilidades npm (devDependencies únicamente)

Todas en dependencias de desarrollo, no afectan build de producción. Acción recomendada post-aprobación Etapa 01: actualizar en rama separada.

---

## Lo que NO está implementado (bloqueado hasta aprobación explícita)

- Autenticación real
- Base de datos remota (D1 u otra)
- Módulos pedagógicos (planificación, calificaciones, asistencia, comunicaciones, materiales, informes)
- Motor curricular / RAG / IA
- Persistencia de respuestas de alumnos
- Deploy a Cloudflare Pages/Workers production
- Cobros / suscripciones

---

## Árbol de archivos clave

```
educar/
├── package.json              # workspace root v0.2.0
├── tsconfig.base.json
├── eslint.config.js
├── scripts/
│   └── gen-version.mjs       # genera version.json + version-data.ts (gitignoreados)
├── packages/
│   └── shared/src/index.ts   # APP_VERSION 0.2.0
├── apps/
│   ├── api/
│   │   ├── src/index.ts
│   │   ├── vitest.config.ts  # coverage-v8
│   │   └── tests/api.test.ts
│   └── web/
│       ├── public/
│       │   └── _headers      # cache policy Cloudflare Pages
│       ├── src/
│       │   ├── data/
│       │   │   └── fixtures.ts        # datos ficticios compartidos
│       │   ├── components/
│       │   │   └── layout/
│       │   │       ├── LayoutApp.tsx
│       │   │       ├── Layout.tsx
│       │   │       └── LayoutStudent.tsx
│       │   └── pages/
│       │       ├── LandingPage.tsx
│       │       ├── DashboardPage.tsx
│       │       ├── LibraryPage.tsx
│       │       ├── ActivitiesPage.tsx
│       │       ├── StudentPage.tsx
│       │       └── TrackingPage.tsx
│       ├── tests/
│       │   ├── components.test.tsx
│       │   └── fixtures.test.ts      # 8 tests consistencia fixtures
│       └── e2e/
│           ├── home.spec.ts          # H1 "Primaria bonaerense"
│           └── prototype.spec.ts     # "Prácticas del Lenguaje", 320px todas las rutas
├── docs/
│   └── PRODUCT_MASTER.md     # v0.2 con sección 18 (P01 + 8 reqs)
├── .github/workflows/ci.yml  # gen-version antes de tests
└── PROJECT_STATE.md          # este archivo
```

---

## Limitaciones del prototipo (Etapa 01.3)

- Todos los datos son **ficticios y simulados** — `apps/web/src/data/fixtures.ts` es la única fuente
- El "Generador de actividades" simula un delay de 1.2s y muestra contenido fijo
- El "Portal del alumno" tiene flujo fijo sin persistencia de respuestas
- El "Modo tranquilo" aplica cambios visuales pero no persiste la preferencia
- No hay autenticación, sesión ni perfil de usuario real
- Los recursos de la Biblioteca no son descargables en este prototipo

---

## Etapa 02.1 — Auditoría documental curricular (2026-11-26)

### Fuente documental identificada

| Campo | Valor |
|-------|-------|
| Archivo | `docs/dis-curricular-PBA-completo.pdf` |
| SHA-256 | `1C53A2CC9D8AACC1D1B4CFD6DEAC2AF7FCDAD0834D232C9C391705EB46271A38` |
| Título | *Diseño Curricular para la Educación Primaria — Primer Ciclo y Segundo Ciclo* |
| Organismo | DGCyE, Provincia de Buenos Aires |
| Resolución | N° 1482/17 · Vigencia desde ciclo lectivo 2018 |
| Páginas | 433 (digital); regla: `printed_page = digital_page − 1` |
| Calidad | Texto directo (no OCR); hiphenación tipográfica presente |

### Entregables generados

| Archivo | Descripción |
|---------|-------------|
| `docs/curricular/SOURCE_MANIFEST.json` | Metadatos técnicos del PDF, SHA-256, referencias normativas |
| `docs/curricular/DOCUMENT_AUDIT.md` | Auditoría de integridad, vigencia y calidad del documento |
| `docs/curricular/CURRICULAR_STRUCTURE.md` | Mapa completo de áreas, rangos de páginas, estructura interna |
| `docs/curricular/EXTRACTION_STRATEGY.md` | 4 tipos de estructura + metodología de extracción por área |
| `docs/curricular/GOLDEN_CASES.json` | 13 casos de referencia verificados para pruebas de regresión |
| `docs/curricular/ISSUES_REGISTER.md` | 11 problemas registrados (4 ALTA, 5 MEDIA, 2 BAJA) |

### Validaciones ejecutadas

- SHA-256 calculado y confirmado
- Regla de desplazamiento de páginas verificada en 12 puntos de muestreo
- 13 casos de referencia (golden cases) verificados con texto exacto del documento
- Estructura de las 10 secciones principales auditada
- Términos canónicos verificados: "ciclo hidrológico" (no "ciclo del agua"), ortografía/acentuación integrada (no como bloque separado)

### Problemas encontrados

Ver `docs/curricular/ISSUES_REGISTER.md` para detalle completo.

| Prioridad | Issues |
|-----------|--------|
| ALTA | I-01 (vigencia normativa), I-05 (celdas combinadas), I-10 (docs/.venv/), I-11 (permisos PDF) |
| MEDIA | I-02, I-03, I-06, I-07, I-08 |
| BAJA | I-04, I-09 |

### Decisiones pendientes

1. **I-01** — Verificar vigencia de Resolución N° 1482/17 en 2026 (SINBA / Boletín Oficial PBA)
2. **I-11** — Decidir si el PDF fuente se incluye en git o se mantiene fuera del control de versiones
3. **I-02 / I-03** — Definir tratamiento de Formación Ética y Ciudadana y Educación Tecnológica como áreas virtuales o contenidos transversales únicamente
4. **Aprobación visual del propietario** requerida antes de Etapa 02.2

### Scripts de análisis (en `docs/curricular/scripts/`)

10 scripts Python que requieren `docs/.venv/` (PyMuPDF 2.2). El directorio `.venv/` **no se incluye en git** (ver I-10).

---

## Etapa 02.2 — Diseño del modelo de datos curricular (2026-11-26)

### Entregables generados

| Archivo | Descripción |
|---------|-------------|
| `docs/curricular/model/DATA_MODEL.md` | Descripción completa del modelo en 4 capas |
| `docs/curricular/model/ER_DIAGRAM.md` | Diagrama ER en Mermaid (principal + 3 vistas simplificadas) |
| `docs/curricular/model/DATA_DICTIONARY.md` | Entidades, campos, tipos, restricciones |
| `docs/curricular/model/SCHEMA_DRAFT.sql` | Borrador de esquema PostgreSQL (no ejecutar) |
| `docs/curricular/model/RELATIONSHIP_RULES.md` | 7 tipos de relación + reglas semánticas |
| `docs/curricular/model/VALIDATION_RULES.md` | 10 restricciones DB + 10 casos de prueba estructurales |
| `docs/curricular/model/GOLDEN_CASE_MAPPING.json` | Mapeo de los 13 golden cases al modelo |
| `docs/curricular/model/DECISIONS.md` | 11 decisiones técnicas con justificaciones |

### Decisiones clave de diseño

- Tabla central polimórfica `curriculum_elements` (11 tipos, discriminador `element_type`)
- Trazabilidad en tabla separada `element_source_refs` (página, fila, columna, coordenadas PDF)
- Estados de revisión: extracted → pending → ambiguous → validated → rejected → replaced
- 7 áreas oficiales + 2 módulos + FEyC/EdTec como TRANSVERSAL_CONTENT (no AREA)
- Principios organizadores como FRAMEWORK en `document_sections`
- Identificadores estables: `{AREA}-{CICLO}-{AÑO}-{BLOQUE}-{TIPO}-{SEQ:04d}`
- Alias/sinónimos en tabla separada con 6 tipos (SEARCH_ALIAS, VALIDATED_SYNONYM, etc.)
- Separación `SOURCE_EXPRESSED` vs `PEDAGOGICALLY_INFERRED` en todas las relaciones
- Vigencia DC PBA 2018: `partially_verified` (evidencia DGCyE 2026-04-24 registrada)

### Issues actualizados

- **I-01** — estado actualizado a PARCIALMENTE VERIFICADO (evidencia externa aportada)
- **I-10** — RESUELTO (docs/.venv/ en .gitignore)
- **I-12** — NUEVO: año exacto del ciclo hidrológico en CS Naturales 2°C (BAJA prioridad)

### Cobertura del modelo

- 13/13 golden cases representables sin pérdida de significado
- 12/13 completamente determinados; 1/13 (GC-007) con year_scope=CYCLE hasta I-12
- Todas las estructuras curriculares del DC PBA 2018 tienen representación
- Preparado para FTS, pgvector (sin embeddings todavía), búsqueda híbrida, alias

---

## Etapa 02.3 — Motor de extracción curricular y prueba piloto (2026-11-26)

### Entregables generados

| Archivo | Descripción |
|---------|-------------|
| `tools/curricular-extractor/` | Extractor modular (10 módulos Python) |
| `tools/curricular-extractor/tests/` | 85 tests automatizados (5 suites) |
| `docs/curricular/EXTRACTOR_ARCHITECTURE.md` | Arquitectura detallada del extractor |
| `docs/curricular/PILOT_EXTRACTION_REPORT.md` | Reporte de extracción MAT Segundo Ciclo |
| `docs/curricular/EXTRACTION_ISSUES.md` | 6 issues técnicos del extractor (EI-01 a EI-06) |
| `docs/curricular/PILOT_VALIDATION_REPORT.md` | Validación contra golden cases |
| `docs/curricular/model/SCHEMA_DRAFT.sql` | Corregido: PK surrogate, import_batches, stable_id |

### Resultados del piloto

- SHA-256 del PDF verificado ✓
- Rango real MAT 4°: **d135–d179** (Segundo Ciclo completo, 44 páginas)
- Bloques detectados: 20 (3 repeticiones × 7 bloques temáticos = 3 años)
- Elementos extraídos: 1551 (706 CONCEPT, 726 WAY_OF_KNOWING, 119 PROGRESS_INDICATOR)
- Relaciones generadas: 22726 (issue EI-01: producto cartesiano — a corregir en 02.4)
- Validación: 0 errores, 0 warnings
- Tests: **85/85 pasan** (incluye 2 tests de integración con PDF real)

### GC-007 verificado

- Ciclo hidrológico encontrado en d279 (p278) y d280 (p279)
- Año determinado: **4°** (confianza media — headings de año en d261 incluyen 4°, 5° y 6°)
- I-12 actualizado: "PARCIALMENTE VERIFICADO — muy probablemente 4°"

### Correcciones al esquema

- `element_year_scope`: PK surrogate + 3 partial unique indexes (reemplaza COALESCE PK)
- Nuevas tablas: `import_batches` + `import_conflicts` (idempotencia)
- `curriculum_elements.stable_id`: unicidad por `(stable_id, area_id)` no global

### Issues identificados en el extractor

| ID | Severidad | Descripción |
|---|---|---|
| EI-01 | ALTA | Relaciones como producto cartesiano (22726 en lugar de ~1500) |
| EI-02 | MEDIA | Bounds MAT 4° = rango Segundo Ciclo completo (no sección individual) |
| EI-03 | MEDIA | Año GC-007 determinado con baja confianza (headings en página de índice) |
| EI-04 | BAJA | Gap entre filas insuficiente para filas muy compactas |
| EI-05 | BAJA | Rango inválido cuando dos bloques están en la misma página |
| EI-06 | BAJA | Encabezados de página pueden no filtrarse por posición Y atípica |

---

---

## Etapa 02.3.1 — Correcciones semanticas (2026-11-26)

4 columnas (EI-01 corregido), segmentacion por ano (EI-02), GC-007 = 5° (EI-03). 36 tests nuevos.

---

## Etapa 02.3.2 — EI-07 y validacion (2026-11-26)

EI-07 corregido: thresholds recalibrados para A4 landscape (841.9pt). 12 tests nuevos. Validacion independiente: precision 100%, recall 56%. Schema multi-revision disenado. 137/137 tests.

---

## Etapa 02.3.3 — EI-05 y cierre del piloto (2026-11-26)

### Correcciones

- **EI-05 CORREGIDO** (extract.py): bloque Proporcionalidad ya no se omite. `blk_end = max(blk_start, blk_end)` + ambiguedad registrada.

### Resultados piloto v4 (d135–d146)

| Metrica | Valor |
|---------|-------|
| Elementos | 625 (antes 570, +55) |
| Relaciones | 2612 (antes 2498, +114) |
| Bloques omitidos | 0 (antes 1) |
| Precision elementos | 100% |
| Precision relaciones | 100% |
| Exactitud de ano | 100% |
| Trazabilidad | 100% |
| Tests | 145/145 |

### Criterios de aceptacion

✅ Precision 100%, ✅ 0 bloques omitidos, ✅ 0 errores de validacion, ✅ 145/145 tests  
⚠️ Exhaustividad de elementos: 56.6% de spans (limite inferior; elementos reales no calculables sin anotacion manual)  
⚠️ Schema multi-revision: 2 gaps de constraints identificados (revision_snapshot_id, current_revision FK)

### JSON con contenido del DC PBA 2018

Ver PILOT_VALIDATION_REPORT.md Section 8. Archivos en indice y en historial documentados. Historial no reescrito (restriccion del brief).

### Entregables

| Archivo | Cambio |
|---------|--------|
| `tools/curricular-extractor/extract.py` | EI-05 fix + ambiguedad EI-05 |
| `tools/curricular-extractor/tests/test_regression_02_3_3.py` | 8 tests nuevos (145 total) |
| `docs/curricular/EXTRACTION_ISSUES.md` | EI-05 actualizado a CORREGIDO |
| `docs/curricular/PILOT_VALIDATION_REPORT.md` | Reescrito con v4 metrics + Sections 2-8 |
| `docs/curricular/SEMANTIC_VALIDATION_REPORT.md` | Metricas v4 actualizadas |
| `docs/curricular/model/SCHEMA_DRAFT.sql` | element_revisions + current_revision |

---

## Proximo paso

**Etapa 02.4** — bloqueada hasta aprobacion explicita del propietario.

Prioridades: (1) EI-08 (items() sobreparticion multilínea); (2) EI-04 (filas compactas); (3) solapamiento d143 Proporcionalidad/Geometria; (4) gaps de schema multi-revision; (5) anotar 10 filas de tabla como referencia de relaciones.
