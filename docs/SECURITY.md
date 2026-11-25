# Seguridad del sistema

## Estado actual (Etapa 01 — Prototipo local)

### Controles implementados
| Control | Estado | Notas |
|---------|--------|-------|
| .gitignore para .env y secretos | ✅ | Ver .gitignore |
| .env.example sin credenciales reales | ✅ | — |
| Headers seguros en API (X-Content-Type-Options, Cache-Control, etc.) | ✅ | apps/api/src/index.ts |
| Sin stack traces en respuestas de error | ✅ | Testeado en api.test.ts |
| CSP via meta tag (dev) | ⚠️ | 'unsafe-inline' requerido por Vite. Producción debe usar headers HTTP con hashes. |
| Sin credenciales ni datos reales en código | ✅ | Solo datos ficticios explícitamente marcados |

### Controles pendientes (implementar antes de producción)
| Control | Etapa | Prioridad |
|---------|-------|-----------|
| Autenticación real con MFA | Etapa 03 | Crítica |
| RLS y aislamiento de tenant en BD | Etapa 03 | Crítica |
| Privacidad de menores (LPDP Argentina) | Etapa 03 | Crítica |
| Rate limiting distribuido (Cloudflare) | Etapa 03 | Alta |
| R2 con acceso privado (sin URLs públicas) | Etapa 04 | Alta |
| CSP con hashes (sin 'unsafe-inline') | Producción | Media |
| Backup y restore de base de datos | Producción | Alta |
| Logging de auditoría de acceso | Etapa 03 | Media |
| Revisión de dependencias automatizada | CI activo | Media |

## Modelo de amenazas (simplificado)

### Amenazas consideradas
1. **Datos de menores expuestos**: mitigación futura via RLS + privacidad + MFA.
2. **Inyección (XSS, SQLi)**: React escapa por defecto; parametrizar queries en Etapa DB.
3. **CSRF**: cookies SameSite=Strict en Etapa Auth.
4. **Secretos en git**: .gitignore + .env.example + revisión en CI.
5. **Dependencias vulnerables**: `npm audit` en CI (continue-on-error hasta estabilizar).

### No aplicables en Etapa 01
- Ataques autenticados (no hay auth).
- Fuga de datos de alumnos (no hay datos reales ni BD).
- CORS abierto (proxy same-origin en dev; sin CORS headers en API por diseño).

## Declaración de limitaciones
Este sistema NO está listo para producción. Ausentes: Auth, RLS, aislamiento tenant,
privacidad de menores, rate limit distribuido, backup/restore, MFA.
No operar con datos reales de alumnos en ninguna etapa anterior a la Etapa 03 completa.
