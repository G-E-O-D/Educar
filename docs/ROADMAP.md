# Roadmap del proyecto

## Etapa 00 — Auditoría competitiva (en curso, externa)
- Análisis de competidores y oportunidad de mercado.
- **Puerta**: aprobación del propietario para continuar con desarrollo.

## Etapa 01 — Fundación técnica y prototipo visual ✅ EN CURSO
- [x] Monorepo npm workspaces
- [x] apps/web: React + Vite + TypeScript + Tailwind v4
- [x] apps/api: Cloudflare Worker con /health y /version
- [x] packages/shared: contratos de tipos
- [x] Sistema de diseño: tokens, componentes UI accesibles
- [x] Prototipo visual responsivo (inicio + catálogo de componentes)
- [x] Tests unitarios (Vitest) y E2E (Playwright)
- [x] CI/CD local con GitHub Actions (sin deploy)
- [ ] **Puerta**: aprobación visual del propietario → avanzar a Etapa 02

## Etapa 02 — Motor curricular (bloqueada)
- Ingestión de diseños curriculares PBA (1.° a 6.° año).
- Modelo de datos: área, año, bloque, contenido, capacidad.
- Búsqueda y navegación por el currículo.
- **Requisito previo**: aprobación de Etapa 01.

## Etapa 03 — Autenticación y multi-tenant (bloqueada)
- Auth con MFA y sesiones seguras.
- Aislamiento por institución (tenant) con RLS en base de datos.
- Privacidad de menores (COPPA/LPDP Argentina).
- **Requisito previo**: aprobación de Etapa 02.

## Etapa 04 — Módulos docentes (bloqueada)
- Planificación curricular, libro de calificaciones, asistencia.
- Comunicación con familias, gestión de materiales.
- **Requisito previo**: Etapa 03 completa.

## Etapas futuras (sin fecha)
- Portal alumno y familias.
- Módulos de IA pedagógica (aprobación específica requerida).
- Cobros y facturación.
- App móvil (PWA o nativa).
