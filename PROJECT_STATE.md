# PROJECT_STATE.md — Plataforma educativa PBA

> **Última actualización:** 2026-11-25  
> **Versión:** 0.1.0  
> **Estado:** Etapa 01.2 completada ✅ — 6 páginas prototipo con datos simulados, 138 tests E2E, 0 violaciones axe WCAG 2.2 AA

---

## Estado general

| Dimensión        | Estado |
|------------------|--------|
| Monorepo         | ✅ Configurado (npm workspaces) |
| TypeScript       | ✅ Typecheck limpio, strict mode |
| ESLint           | ✅ 0 errores/advertencias |
| Build producción | ✅ 1529 módulos, 1.01 s |
| Tests unitarios  | ✅ 16/16 (Vitest) |
| Tests E2E        | ✅ 138/138 (Playwright, 3 viewports) |
| Accesibilidad    | ✅ WCAG 2.2 AA — 0 violaciones axe en 6 rutas × 3 viewports |
| Seguridad        | ⚠️ 19 vulnerabilidades en devDeps (ver abajo) |
| Git              | ✅ Commit inicial — Etapa 01.2 |
| Deploy           | 🚫 Ninguno — solo prototipo local |

---

## Qué está implementado (Etapa 01 + 01.1 + 01.2)

### Monorepo
- `packages/shared` — contratos TypeScript compartidos (`HealthResponse`, `VersionResponse`, `ApiError`, constantes de app)
- `apps/api` — Cloudflare Worker con `GET /api/health`, `GET /api/version`, headers de seguridad, 404/405 handlers
- `apps/web` — SPA React 18 + Vite 8 + Tailwind v4 + React Router v7

### UI prototipo (apps/web) — 6 páginas nuevas en Etapa 01.2
- **Landing** (`/`) — Hero comercial, sección "Cómo funciona", grilla de features, 7 pilares, testimonios ficticios, CTA
- **Panel docente** (`/panel`) — Stats, acciones rápidas, próxima clase, materiales recientes, agenda, módulos
- **Biblioteca** (`/biblioteca`) — 8 recursos con licencia CC, búsqueda, filtros por tipo/grado/área
- **Generador de actividades** (`/actividades`) — Formulario configurable + vista previa simulada con delay
- **Portal del alumno** (`/alumno`) — Flujo multi-pantalla: bienvenida → ejercicio → feedback → progreso
- **Seguimiento pedagógico** (`/seguimiento`) — Tabs resumen/alumnos/contenidos, barras de progreso, alertas
- **Catálogo de componentes** (`/demo`) — Design system completo
- **Ruta 404** — Página no encontrada con navegación

### Calidad
- Vitest 5.1.2 — 16 tests unitarios (componentes UI, contratos API); cobertura Statements 96.66%
- Playwright — 138 tests E2E en Desktop 1440 · Tablet 768 · Mobile 390 (Chrome)
  - axe-core WCAG 2.2 AA: 0 violaciones en 6 rutas × 3 viewports
  - Screenshots: 18 capturas (6 rutas × 3 viewports) en `docs/evidence/visual/`
  - Sidebar hamburger mobile, navegación cross-viewport, preview con timeout
- ESLint flat config (v9) — 0 errores
- TypeScript strict — 0 errores (`tsc --noEmit`)

### Seguridad baseline
- `.gitignore` completo — secrets, dist, logs, OS files
- `.env.example` — sin valores reales
- CSP en `<meta>` (dev) con nota de limitación `unsafe-inline`
- Headers de seguridad en la API Worker (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cache-Control: no-store`)
- Sin datos reales de alumnos ni docentes en ninguna parte del código

### Documentación
- `README.md` — instalación, scripts, estructura
- `CLAUDE.md` — guía de trabajo para Claude Code
- `docs/ARCHITECTURE.md` — stack, decisiones, diagrama de módulos
- `docs/ROADMAP.md` — etapas 01→07
- `docs/SECURITY.md` — modelo de amenazas, controles, dependencias
- `docs/QA.md` — plan de pruebas, cobertura
- `docs/DESIGN_SYSTEM.md` — tokens, componentes, guías WCAG
- `docs/PRODUCT_MASTER.md` — documento maestro funcional (v0.2, 25-nov-2026)
- `.github/workflows/ci.yml` — pipeline CI (Node 22, typecheck → lint → build → unit → E2E)

---

## Vulnerabilidades npm (devDependencies únicamente)

```
19 vulnerabilidades (8 moderate, 8 high, 3 critical)
```

**Todas en dependencias de desarrollo**, no en código de producción:

| Paquete | Vulnerabilidad | Fix disponible |
|---------|---------------|----------------|
| `tinypool` (vía Vitest) | Prototype Pollution → RCE en `run()` | `vitest@5.1.2` (breaking) |
| `ws` (vía Miniflare/Wrangler) | Memory exhaustion DoS | `wrangler@4.168.0` (breaking) |
| `zod` (vía Wrangler) | Memory exhaustion en colecciones | `wrangler@4.168.0` (breaking) |

**Acción recomendada (post-aprobación Etapa 01):** actualizar Vitest y Wrangler en rama separada y validar que la suite de tests no se rompa con los cambios breaking.

---

## Lo que NO está implementado (bloqueado hasta aprobación explícita)

- Autenticación real
- Base de datos remota (D1 u otra)
- Módulos pedagógicos (planificación, calificaciones, asistencia, comunicaciones, materiales, informes)
- Motor curricular / RAG / IA
- Portal de alumnos o familias
- Deploy a Cloudflare Pages/Workers production
- Cobros / suscripciones

---

## Árbol de archivos clave

```
educar/
├── package.json              # workspace root, scripts globales
├── tsconfig.base.json        # TypeScript strict base
├── eslint.config.js          # ESLint v9 flat config
├── scripts/
│   └── gen-version.mjs       # genera version.json + version-data.ts
├── packages/
│   └── shared/src/index.ts   # contratos compartidos
├── apps/
│   ├── api/
│   │   ├── src/index.ts      # Cloudflare Worker
│   │   └── tests/api.test.ts # 10 tests unitarios
│   └── web/
│       ├── src/
│       │   ├── components/   # ui/ + layout/
│       │   ├── pages/        # HomePage, ComponentsPage, NotFoundPage
│       │   ├── styles/       # globals.css (Tailwind v4 + CSS vars)
│       │   └── types/        # index.ts (tipos UI)
│       ├── tests/            # 6 tests unitarios (Vitest)
│       ├── e2e/              # home.spec.ts + components.spec.ts (Playwright)
│       └── playwright.config.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── QA.md
│   └── DESIGN_SYSTEM.md
├── .github/workflows/ci.yml
├── README.md
├── CLAUDE.md
├── ROADMAP.md
└── PROJECT_STATE.md          # este archivo
```

---

## Limitaciones del prototipo (Etapa 01.2)

- Todos los datos son **ficticios y simulados** — sin conexión a base de datos real
- El "Generador de actividades" simula un delay de 1.2s y muestra contenido fijo
- El "Portal del alumno" tiene flujo fijo sin persistencia de respuestas
- No hay autenticación, sesión ni perfil de usuario real
- Los recursos de la Biblioteca no son descargables en este prototipo

## Próximo paso

Presentar el prototipo al propietario para **aprobación visual** antes de comenzar Etapa 02 (motor curricular o autenticación). No avanzar sin confirmación explícita.
