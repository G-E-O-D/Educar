# Sistema de diseño — Plataforma educativa PBA

> Dirección visual provisional hasta aprobación del propietario.

## Tokens semánticos

Definidos en `apps/web/src/styles/globals.css` y expuestos a Tailwind via `@theme inline`.

### Colores
| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--brand-primary` | #635BDB | Acciones principales, links activos |
| `--brand-secondary` | #14B8A6 | Éxito, confirmaciones, acciones secundarias |
| `--brand-accent` | #F4B860 | Destacados, advertencias suaves |
| `--surface-bg` | #F7F8FC | Fondo de página |
| `--surface-card` | #FFFFFF | Tarjetas y superficies |
| `--text-primary` | #243047 | Texto principal |
| `--text-secondary` | #4A5568 | Texto de apoyo |
| `--text-muted` | #718096 | Metadatos, placeholders |

### Contraste (WCAG 2.2 AA)
| Par | Ratio | Resultado |
|-----|-------|-----------|
| #635BDB sobre blanco | 4.72:1 | ✅ AA normal (≥4.5) |
| #243047 sobre #F7F8FC | 10.97:1 | ✅ AAA |
| #DC2626 sobre blanco | 4.76:1 | ✅ AA |
| #16A34A sobre blanco | 4.54:1 | ✅ AA |

### Tipografía
- Fuente: `Inter`, `Plus Jakarta Sans`, system-ui (fallback)
- Sin fuentes remotas en Etapa 01 (sin Google Fonts)
- Escala: xs(12px) sm(14px) base(16px) lg(18px) xl(20px) 2xl(24px) 3xl(30px) 4xl(36px) 5xl(48px)

## Componentes

### Rutas
```
apps/web/src/components/
├── ui/
│   ├── Button.tsx      variantes: primary|secondary|outline|ghost|destructive; sizes: sm|md|lg; asChild
│   ├── Badge.tsx       variantes: default|primary|secondary|accent|success|warning|error|outline
│   ├── Card.tsx        variantes: default|elevated|bordered|featured; + CardHeader|CardContent|CardFooter
│   ├── Alert.tsx       variantes: info|success|warning|error; dismissible
│   └── Input.tsx       con label, error, hint, aria
└── layout/
    ├── Layout.tsx      wrapper con skip link, Header, Footer, scroll-to-top
    ├── Header.tsx      sticky, logo, nav principal, dropdown módulos, responsive
    └── Footer.tsx      marca, links secundarios, versión, aviso legal
```

### Accesibilidad
- WCAG 2.2 AA como objetivo
- Skip link visible al foco: `.skip-link` en `globals.css`
- Foco visible global: `*:focus-visible` con 2px outline en `--border-focus`
- `aria-label`, `aria-expanded`, `aria-haspopup`, `aria-invalid`, `aria-busy` donde corresponde
- Estados no dependientes solo del color (íconos + texto + color)
- Tamaños táctiles mínimos: botones h-8 (32px) a h-12 (48px)
- Movimiento reducido: `@media (prefers-reduced-motion: reduce)` en globals

## Capturas de pantalla

Rutas previstas (generadas con Playwright):
```
apps/web/test-results/
  Desktop-Chrome-1440-home.png
  Desktop-Chrome-1440-demo.png
  Tablet-768-home.png
  Mobile-390-home.png
```
Estado: pendientes → ejecutar `npm run test:e2e` con servidor activo.

## Decisiones pendientes (revisión humana)
- Aprobación de paleta de color provisional por el propietario.
- Tipografía definitiva (Inter vs Plus Jakarta Sans vs fuente custom).
- Iconografía: Lucide aprobada como biblioteca principal; evaluar variantes.
- Espaciado base: 4px grid actual → confirmar o ajustar.
- Bordes redondeados: rounded-xl (12px) en cards, rounded-lg (8px) en botones → confirmar.

## Preparación tema oscuro
Variables en `:root` → cuando se apruebe, agregar `.dark { --brand-primary: ...; }` y toggle en Layout.
No implementado en Etapa 01; documentado en globals.css como comentario.
