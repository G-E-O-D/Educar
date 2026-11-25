# Arquitectura del sistema

## Visión general (Etapa 01 — Local)

```
┌─────────────────────────────────────────────────────┐
│  Navegador                                           │
│  ┌────────────────────┐  ┌──────────────────────┐  │
│  │  apps/web           │  │  apps/web/public/    │  │
│  │  React + Vite       │◄─┤  version.json        │  │
│  │  :5173              │  └──────────────────────┘  │
│  │  proxy /api → :8787 │                            │
│  └─────────┬───────────┘                            │
│            │ /api/*                                  │
│  ┌─────────▼───────────┐                            │
│  │  apps/api           │                            │
│  │  Cloudflare Worker  │                            │
│  │  (Wrangler dev)     │                            │
│  │  :8787              │                            │
│  └─────────────────────┘                            │
└─────────────────────────────────────────────────────┘
```

## Decisiones de arquitectura (ADRs)

### ADR-001: Monorepo npm workspaces
**Decisión**: npm workspaces sin herramientas adicionales (no Turborepo, no Lerna).
**Motivo**: mínima complejidad en etapa de prototipo; npm workspaces es suficiente.
**Consecuencia**: builds secuenciales; migrar a Turborepo si el tiempo de build supera 60s.

### ADR-002: Cloudflare Worker como API
**Decisión**: API como Cloudflare Worker TypeScript con Wrangler.
**Motivo**: target de deploy es Cloudflare Pages + Workers; consistencia local/prod.
**Consecuencia**: limitaciones del runtime Workers (sin Node APIs); usar `nodejs_compat` donde necesario.

### ADR-003: Tailwind v4 con @theme inline
**Decisión**: Tailwind v4 con tokens en CSS variables y `@theme inline`.
**Motivo**: preparación para tema oscuro; tokens semánticos desacoplados del framework.
**Consecuencia**: clases como `bg-brand-primary` mapean a `var(--brand-primary)`.

### ADR-004: React Router v6 SPA
**Decisión**: react-router-dom v6 con `createBrowserRouter`.
**Motivo**: versión estable, API conocida; v7 es un framework full-stack que no aplica aquí.
**Consecuencia**: no hay SSR; en producción Cloudflare Pages sirve index.html para todas las rutas.

### ADR-005: Sin service worker en Etapa 01
**Decisión**: no implementar SW hasta Etapa 03+.
**Motivo**: contrato de actualización segura (sin pérdida de borradores) requiere diseño cuidadoso.
**Futuro**: implementar con Workbox, estrategia network-first para datos, stale-while-revalidate para assets.

## Límites de etapa actual

- **Sin implementar**: Auth, RLS, aislamiento tenant, base de datos remota, R2, MFA, privacidad menores.
- **Sin probar en producción**: headers CSP (mejorar de meta a HTTP headers), rate limiting distribuido.
- **No disponible**: módulos pedagógicos, portal alumno, cobros.
