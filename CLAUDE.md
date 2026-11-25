# CLAUDE.md — Reglas invariantes del proyecto

## Identidad
- Proyecto: Plataforma educativa para docentes de Primaria PBA
- Versión actual: 0.1.0 (Etapa 01 — Prototipo local)
- Propietario: revisar docs/PRODUCT_MASTER.md cuando exista

## Estructura del monorepo
```
apps/web/      React + Vite + Tailwind v4 (puerto 5173)
apps/api/      Cloudflare Worker + Wrangler (puerto 8787)
packages/shared/  Contratos de tipos (sin build propio)
scripts/       gen-version.mjs (ejecutar antes de cada build)
docs/          Documentación técnica
```

## Reglas de no-acción (NUNCA hacer sin autorización explícita)
1. No crear cuentas ni proyectos en Cloudflare, Supabase ni servicios pagos.
2. No hacer `git push`, deploy, ni publicar en producción.
3. No implementar autenticación real, base de datos remota, cobros ni portal alumno.
4. No usar datos reales de alumnos ni docentes en ningún archivo.
5. No modificar otros proyectos dentro de d:\Sistemas\.
6. No inicializar Git sobre un repositorio padre ajeno.
7. No avanzar a Etapa 02 sin aprobación visual explícita del propietario.

## Reglas de desarrollo
- TypeScript estricto en todos los workspaces (ver tsconfig.base.json).
- CSS tokens: definir en `src/styles/globals.css` → `@theme inline`, no hardcodear colores.
- Componentes UI: `src/components/ui/` — siempre accesibles (WCAG 2.2 AA).
- Datos ficticios: siempre acompañados de `<Alert variant="warning">` que lo indique.
- Dependencias nuevas: verificar licencia (MIT/ISC/Apache-2) antes de agregar.

## Comandos esenciales
```bash
npm ci               # Instalar (nunca npm install en CI)
npm run dev          # Dev: web :5173 + api :8787
npm run build        # Genera versión + compila todo
npm run typecheck    # Verificar tipos
npm run test         # Vitest unitarios
npm run test:e2e     # Playwright E2E
```

## Puertas de etapa
- Etapa 01 completa → requiere aprobación visual del propietario antes de continuar.
- docs/PRODUCT_MASTER.md faltante al inicio de Etapa 01 → registrado en PROJECT_STATE.md.
