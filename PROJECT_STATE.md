# PROJECT_STATE.md — Plataforma educativa PBA

> **Última actualización:** 2026-11-25  
> **Versión:** 0.2.0  
> **Estado:** Etapa 01.3 completada — commit `1e05841`

---

## Estado general

| Dimensión        | Estado |
|------------------|--------|
| Monorepo         | ✅ Configurado (npm workspaces) |
| TypeScript       | ✅ Typecheck limpio, strict mode |
| ESLint           | ✅ 0 errores (`react/no-unescaped-entities` corregido en ActivitiesPage) |
| Build producción | ✅ Vite 8 — pendiente re-verificar con cambios 01.3 |
| Tests unitarios (web) | ✅ Vitest — 16 tests previos + 8 nuevos (fixtures.test.ts) |
| Tests unitarios (api)  | ✅ Vitest + coverage-v8 configurado |
| Tests E2E        | ⏳ Playwright — pendiente correr tras actualizaciones 01.3 (última ejecución: 138/138) |
| Accesibilidad    | ⏳ WCAG 2.2 AA — pendiente re-correr axe con páginas actualizadas |
| Seguridad (devDeps) | ⚠️ Vulnerabilidades solo en devDependencies — no afectan build de producción |
| Versionado       | ✅ gen-version.mjs con detección dirty; version-data.ts gitignoreado |
| Cache headers    | ✅ _headers Cloudflare Pages + vite.config.ts dev server |
| Git              | ✅ Commit 01.2 — 01.3 pendiente de commit final |
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
- Vitest (web) — 16 tests previos + 8 nuevos en `fixtures.test.ts`
- Vitest (api) — `vitest.config.ts` con coverage-v8 configurado
- Playwright — `home.spec.ts` y `prototype.spec.ts` actualizados: H1 "Primaria bonaerense", "Prácticas del Lenguaje", tests 320px para todas las rutas (/panel /biblioteca /actividades /alumno /seguimiento /demo), test Modo tranquilo
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

## Próximo paso

Presentar el prototipo al propietario para **aprobación visual** antes de comenzar Etapa 02. No avanzar sin confirmación explícita.
