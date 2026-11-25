import { useState } from 'react';
import { Check, Info, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';

type TypoTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20">
      <h2 id={`${id}-heading`} className="text-lg font-bold text-text-primary mb-4 pb-2 border-b border-border-default">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ColorSwatch({ name, hex, textClass }: { name: string; hex: string; textClass?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {/* role="img" is required so aria-label is permitted on a div */}
      <div
        role="img"
        aria-label={`Color ${name}: ${hex}`}
        className="h-14 w-full rounded-lg border border-border-default shadow-sm"
        style={{ backgroundColor: hex }}
      />
      <p className="text-xs font-medium text-text-primary">{name}</p>
      <p className={`text-xs font-mono ${textClass ?? 'text-text-muted'}`}>{hex}</p>
    </div>
  );
}

const TYPO_ITEMS: Array<{ tag: TypoTag; cls: string; label: string }> = [
  { tag: 'h1', cls: 'text-4xl font-bold',          label: 'Encabezado 1 — 36px bold' },
  { tag: 'h2', cls: 'text-3xl font-bold',          label: 'Encabezado 2 — 30px bold' },
  { tag: 'h3', cls: 'text-2xl font-semibold',      label: 'Encabezado 3 — 24px semibold' },
  { tag: 'h4', cls: 'text-xl font-semibold',       label: 'Encabezado 4 — 20px semibold' },
  { tag: 'h5', cls: 'text-base font-semibold',     label: 'Encabezado 5 — 16px semibold' },
  { tag: 'p',  cls: 'text-base',                   label: 'Cuerpo regular — 16px · Para párrafos y descripciones principales.' },
  { tag: 'p',  cls: 'text-sm text-text-secondary', label: 'Cuerpo secundario — 14px · Para ayuda y texto de apoyo.' },
  { tag: 'p',  cls: 'text-xs text-text-muted',     label: 'Cuerpo pequeño — 12px · Para metadatos y etiquetas.' },
];

export function ComponentsPage() {
  const [dismissedAlert, setDismissedAlert] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <Badge variant="primary" className="mb-3">Sistema de Diseño</Badge>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Catálogo de componentes</h1>
        <p className="text-text-secondary max-w-2xl">
          Componentes reutilizables de la plataforma docente. Cada elemento cumple con WCAG 2.2 AA:
          contraste, navegación por teclado, foco visible y etiquetas ARIA.
        </p>
      </div>

      <div className="space-y-14">

        <Section id="tipografia" title="Tipografía">
          <div className="space-y-3 bg-surface-card rounded-xl border border-border-default p-6">
            <p className="text-xs text-text-muted font-mono mb-2">Inter / Plus Jakarta Sans (fallback sistema)</p>
            {TYPO_ITEMS.map(({ tag: Tag, cls, label }, i) => (
              <Tag key={i} className={`${cls} text-text-primary leading-snug`}>{label}</Tag>
            ))}
          </div>
        </Section>

        <Section id="colores" title="Paleta de colores">
          <div className="bg-surface-card rounded-xl border border-border-default p-6">
            <p className="text-sm text-text-muted mb-4">
              Tokens semánticos en CSS variables. Preparado para tema oscuro mediante variables en <code className="font-mono text-xs">.dark</code>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <ColorSwatch name="Primario"   hex="#635BDB" />
              <ColorSwatch name="Secundario" hex="#14B8A6" />
              <ColorSwatch name="Acento"     hex="#F4B860" />
              <ColorSwatch name="Fondo"      hex="#F7F8FC" />
              <ColorSwatch name="Superficie" hex="#FFFFFF" />
              <ColorSwatch name="Texto"      hex="#243047" />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Éxito"       hex="#166534" textClass="text-green-700" />
              <ColorSwatch name="Advertencia" hex="#D97706" textClass="text-amber-700" />
              <ColorSwatch name="Error"       hex="#991B1B" textClass="text-red-700" />
              <ColorSwatch name="Info"        hex="#1E40AF" textClass="text-blue-700" />
            </div>
          </div>
        </Section>

        <Section id="botones" title="Botones">
          <div className="bg-surface-card rounded-xl border border-border-default p-6 space-y-6">
            <div>
              <p className="text-xs text-text-muted mb-3">Variantes</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primario</Button>
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Contorno</Button>
                <Button variant="ghost">Fantasma</Button>
                <Button variant="destructive">Destructivo</Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-3">Tamaños</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Pequeño</Button>
                <Button size="md">Mediano</Button>
                <Button size="lg">Grande</Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-3">Estados</p>
              <div className="flex flex-wrap gap-3">
                <Button isLoading>Cargando</Button>
                <Button disabled>Deshabilitado</Button>
                <Button leftIcon={<Check className="h-4 w-4" />}>Con ícono izq.</Button>
              </div>
            </div>
          </div>
        </Section>

        <Section id="tarjetas" title="Tarjetas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['default', 'elevated', 'bordered', 'featured'] as const).map((v) => (
              <Card key={v} variant={v}>
                <CardHeader>
                  <h3 className="font-semibold text-text-primary text-sm capitalize">Tarjeta {v}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary">
                    Contenido para variante <code className="font-mono text-xs">{v}</code>.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">Acción</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="insignias" title="Insignias">
          <div className="bg-surface-card rounded-xl border border-border-default p-6">
            <div className="flex flex-wrap gap-3">
              {(['default', 'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'outline'] as const).map((v) => (
                <Badge key={v} variant={v} className="capitalize">{v}</Badge>
              ))}
            </div>
          </div>
        </Section>

        <Section id="alertas" title="Alertas">
          <div className="space-y-3">
            <Alert variant="info" title="Información">
              Esta es una alerta informativa. Usá este componente para comunicar novedades al docente.
            </Alert>
            <Alert variant="success" title="Acción completada">
              Los cambios se guardaron correctamente.
            </Alert>
            <Alert variant="warning" title="Atención">
              Los datos mostrados son <strong>ficticios</strong>. No usar con información real.
            </Alert>
            {!dismissedAlert ? (
              <Alert variant="error" title="Error de ejemplo" dismissible onDismiss={() => setDismissedAlert(true)}>
                Ocurrió un error al procesar la solicitud. Intentá nuevamente.
              </Alert>
            ) : (
              <p className="text-sm text-text-muted italic">Alerta descartada.</p>
            )}
          </div>
        </Section>

        <Section id="formularios" title="Formularios">
          <div className="bg-surface-card rounded-xl border border-border-default p-6">
            <form className="space-y-5 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <Input label="Nombre del docente" placeholder="Ej.: María García" />
              <Input label="Correo electrónico" type="email" placeholder="docente@escuela.edu.ar"
                hint="Se usará solo para comunicaciones de la plataforma." />
              <Input label="Campo con error" defaultValue="valor inválido"
                error="Este campo no es válido. Revisá el formato." />
              <Input label="Campo requerido" required placeholder="Requerido" />
            </form>
          </div>
        </Section>

        <Section id="estados" title="Estados del sistema">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="default">
              <CardContent className="pt-5">
                <p className="text-xs text-text-muted mb-3">Cargando</p>
                <div className="flex items-center justify-center py-8 gap-3" aria-live="polite" aria-label="Cargando contenido">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-primary" aria-hidden="true" />
                  <span className="text-sm text-text-secondary">Cargando datos...</span>
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="pt-5">
                <p className="text-xs text-text-muted mb-3">Vacío</p>
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <div className="h-12 w-12 rounded-full bg-surface-bg flex items-center justify-center mb-1">
                    <Info className="h-6 w-6 text-text-secondary" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Sin contenido todavía</p>
                  <p className="text-xs text-text-muted">Cuando haya datos, aparecerán aquí.</p>
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="pt-5">
                <p className="text-xs text-text-muted mb-3">Error</p>
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center" role="alert">
                  <div className="h-12 w-12 rounded-full bg-status-error-bg flex items-center justify-center mb-1">
                    <XCircle className="h-6 w-6 text-status-error" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">No se pudo cargar</p>
                  <p className="text-xs text-text-muted">Verificá tu conexión y volvé a intentarlo.</p>
                  <Button variant="outline" size="sm" className="mt-1">Reintentar</Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="pt-5">
                <p className="text-xs text-text-muted mb-3">Éxito</p>
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center" role="status">
                  <div className="h-12 w-12 rounded-full bg-status-success-bg flex items-center justify-center mb-1">
                    <Check className="h-6 w-6 text-status-success" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">¡Guardado correctamente!</p>
                  <p className="text-xs text-text-muted">Los cambios están disponibles.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

      </div>
    </div>
  );
}
