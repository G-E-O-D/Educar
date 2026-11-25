# Matriz de pruebas — Etapa 01

## Pruebas automatizadas

### Vitest — apps/api (api.test.ts)
| Caso | Cobertura esperada |
|------|-------------------|
| GET /api/health → 200 + {status:"ok", version, timestamp} | ✅ |
| POST /api/health → 405 | ✅ |
| DELETE /api/health → 405 | ✅ |
| GET /api/version → 200 + {version, buildId, commit, builtAt} | ✅ |
| PUT /api/version → 405 | ✅ |
| GET /api/unknown → 404 + {error:"NOT_FOUND"} | ✅ |
| Sin stack traces en respuestas | ✅ |
| Content-Type: application/json | ✅ |
| Cache-Control: no-store | ✅ |
| X-Content-Type-Options: nosniff | ✅ |

### Vitest — apps/web (components.test.tsx)
| Caso | Cobertura esperada |
|------|-------------------|
| Button: render, variantes, disabled, isLoading, onClick | ✅ |
| Badge: render, variante primary | ✅ |
| Alert: role=alert, título, onDismiss | ✅ |
| Input: label asociado, error+aria-invalid, hint | ✅ |
| Card: render de contenido | ✅ |
| Button asChild: render como link con estilos | ✅ |

### Playwright E2E — 3 viewports (1440×900, 768×1024, 390×844)
| Caso | Página |
|------|--------|
| Título correcto en pestaña | Inicio |
| Encabezado principal visible | Inicio |
| Aviso de datos ficticios | Inicio |
| Navegación a /demo | Inicio |
| Logo navega a inicio | Inicio |
| Sin overflow horizontal a 320px | Inicio + Demo |
| Accesibilidad axe WCAG 2.1 AA | Inicio + Demo |
| Encabezado "Catálogo de componentes" | Demo |
| Secciones presentes (Tipografía, Colores, etc.) | Demo |
| Foco en botón | Demo |

## Cobertura
- Denominador: 10 casos API + 6 unit web + 10 E2E × 3 viewports = 46 verificaciones
- Meta futura: 95% lógica crítica, 85% backend, 80% frontend, 100% obligatorias
- Cobertura actual de módulos: `npm run test:coverage` en apps/web

## Verificaciones manuales pendientes
- [ ] Composición visual: proporciones, espaciado, tipografía → revisión humana
- [ ] Capturas de pantalla en resoluciones indicadas (ver docs/DESIGN_SYSTEM.md para rutas)
- [ ] Foco visible en todos los elementos interactivos
- [ ] Navegación completa por teclado (Tab, Enter, Space, Escape en dropdown)
- [ ] Reflow en 320px: texto no truncado, sin scroll horizontal
- [ ] Contraste en colores de estado (success/warning/error/info sobre fondos claros)

## Tests no ejecutados (bloqueados)
- E2E completos: requieren Playwright instalado (`npx playwright install chromium`)
- Capturas automáticas: `page.screenshot()` requiere servidor activo
- Verificación de headers en producción: Cloudflare no desplegado
