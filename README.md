# Plataforma educativa — Primaria PBA

Plataforma SaaS para docentes de Educación Primaria de la Provincia de Buenos Aires (1.° a 6.° año).
Estado actual: **Prototipo (Etapa 01)**. No usar con datos reales de alumnos.

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 20.x LTS      |
| npm         | 10.x          |
| Git         | 2.40+         |

## Instalación y desarrollo local

```bash
# 1. Clonar el repositorio
git clone <repo-url> educar && cd educar

# 2. Instalar dependencias (usar lockfile)
npm ci

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Iniciar dev (web en :5173, API en :8787)
npm run dev
```

## Comandos disponibles

```bash
npm run dev          # Inicia web (Vite :5173) + API (Wrangler :8787)
npm run build        # Genera versión y compila todos los workspaces
npm run typecheck    # Verifica tipos TypeScript en todos los workspaces
npm run lint         # ESLint en todo el monorepo
npm run test         # Vitest: tests unitarios de api + web
npm run test:e2e     # Playwright E2E (requiere servidor corriendo o arranca automáticamente)
```

## Endpoints API (dev: http://localhost:8787)

```
GET /api/health   → { status, timestamp, version, environment }
GET /api/version  → { version, buildId, commit, builtAt, environment }
```

## Estructura

```
educar/
├── apps/
│   ├── web/           React + Vite + TypeScript + Tailwind v4
│   └── api/           Cloudflare Worker TypeScript (Wrangler)
├── packages/
│   └── shared/        Contratos de tipos compartidos
├── scripts/
│   └── gen-version.mjs  Genera version.json por build
└── docs/              Documentación técnica
```

## Verificar versión

```bash
# En dev (con servidor corriendo):
curl http://localhost:8787/api/health
curl http://localhost:8787/api/version
curl http://localhost:5173/version.json
```

## Notas de seguridad

- No commitear `.env` o `.dev.vars` con credenciales reales.
- No desplegar en producción hasta aprobación del propietario (ver docs/SECURITY.md).
- Autenticación, RLS, aislamiento de tenant y privacidad de menores son futuros (Etapa Auth).
