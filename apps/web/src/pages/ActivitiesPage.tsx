import { useState, useRef } from 'react';
import { Sparkles, FileText, RefreshCw, Printer, Download, Eye, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type AreaKey = 'matematica' | 'lenguaje' | 'ciencias' | 'sociales' | 'plastica' | 'musica';
type GradeKey = '1' | '2' | '3' | '4' | '5' | '6';
type FormatKey = 'ficha' | 'evaluacion' | 'cuadernillo' | 'dictado' | 'tp';

const AREAS: { key: AreaKey; label: string }[] = [
  { key: 'matematica', label: 'Matemática' },
  { key: 'lenguaje',   label: 'Prácticas del Lenguaje' },
  { key: 'ciencias',   label: 'Cs. Naturales' },
  { key: 'sociales',   label: 'Cs. Sociales' },
  { key: 'plastica',   label: 'Ed. Visual' },
  { key: 'musica',     label: 'Música' },
];

const GRADES: GradeKey[] = ['1', '2', '3', '4', '5', '6'];

const FORMATS: { key: FormatKey; label: string; desc: string }[] = [
  { key: 'ficha',      label: 'Ficha de trabajo',  desc: 'Ejercicios impresos, 1–2 carillas' },
  { key: 'evaluacion', label: 'Evaluación',         desc: 'Con consignas y espacio de respuesta' },
  { key: 'cuadernillo',label: 'Cuadernillo',        desc: 'Secuencia completa, varios temas' },
  { key: 'dictado',    label: 'Dictado',            desc: 'Texto para Prácticas del Lenguaje' },
  { key: 'tp',         label: 'Trabajo práctico',   desc: 'Para resolver en casa o en pareja' },
];

const SAMPLE_TOPICS: Record<AreaKey, string[]> = {
  matematica: ['Fracciones equivalentes', 'Multiplicación por 2 y 3', 'Números hasta el 1000', 'Medidas de longitud', 'Figuras geométricas'],
  lenguaje:   ['Comprensión lectora', 'Uso de la H', 'Punto y coma', 'El sustantivo y adjetivo', 'Escritura de noticias'],
  ciencias:   ['El ciclo del agua', 'Las plantas y la fotosíntesis', 'Los animales vertebrados', 'La célula', 'El sistema solar'],
  sociales:   ['Pueblos originarios', 'Los Virreinatos', 'El trabajo y la economía', 'Los mapas y la orientación', 'La revolución de Mayo'],
  plastica:   ['El color y sus variaciones', 'Figuras y fondos', 'Modelado con arcilla'],
  musica:     ['El ritmo y la melodía', 'Instrumentos de percusión', 'Canciones folklóricas'],
};

const SIMULATED_PREVIEW = `
**FICHA DE TRABAJO — MATEMÁTICA · 3.° GRADO**
*Fracciones equivalentes*
━━━━━━━━━━━━━━━━━━━━━━━━━

**Nombre:** _______________________ **Fecha:** ___________

**1. Completá los dibujos para representar cada fracción:**

□ 1/2 = ___/4 = ___/8

**2. Rodeá las fracciones que son equivalentes a 1/3:**

   2/6  •  3/9  •  4/9  •  6/18  •  2/9

**3. Juan comió 2/4 de una pizza y Ana comió 4/8 de otra pizza del mismo tamaño. ¿Comieron la misma cantidad? Explicá con un dibujo.**

   Espacio de dibujo:
   ┌─────────────────────────────┐
   │                             │
   │                             │
   │                             │
   └─────────────────────────────┘

**4. Completá la tabla:**

   Fracción | Fracción equivalente
   ─────────|────────────────────
   1/2      | ___/6
   2/3      | ___/9
   3/4      | ___/8

━━━━━━━━━━━━━━━━━━━━━━━━━
*Diseño Curricular DGCyE 2018 · Matemática 3.° grado*
*Eje: Números y operaciones · Contenido: Fracciones*
`.trim();

export function ActivitiesPage() {
  const [area, setArea] = useState<AreaKey>('matematica');
  const [grade, setGrade] = useState<GradeKey>('3');
  const [format, setFormat] = useState<FormatKey>('ficha');
  const [topic, setTopic] = useState('Fracciones equivalentes');
  const [quantity, setQuantity] = useState(4);
  const [difficulty, setDifficulty] = useState<'baja' | 'media' | 'alta'>('media');
  const [includeSolution, setIncludeSolution] = useState(true);
  const [accessibility, setAccessibility] = useState({
    bigFont: false,
    highContrast: false,
    simplified: false,
  });
  const [advanced, setAdvanced] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const topicList = SAMPLE_TOPICS[area] ?? [];

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      // En móvil, hacer scroll a la vista previa después de generar
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 1200);
  }

  function handleAreaChange(a: AreaKey) {
    setArea(a);
    setTopic(SAMPLE_TOPICS[a][0] ?? '');
    setGenerated(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formulario de configuración */}
        <div className="lg:col-span-2 space-y-5">

          {/* Área curricular */}
          <section aria-labelledby="area-label">
            <label id="area-label" className="block text-sm font-semibold text-text-primary mb-2">
              Área curricular
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => handleAreaChange(a.key)}
                  className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-left transition-colors ${
                    area === a.key
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-card border-border-default text-text-secondary hover:border-brand-primary/50'
                  }`}
                  aria-pressed={area === a.key}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </section>

          {/* Grado */}
          <section aria-labelledby="grade-label">
            <label id="grade-label" className="block text-sm font-semibold text-text-primary mb-2">
              Grado
            </label>
            <div className="flex gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => { setGrade(g); setGenerated(false); }}
                  className={`flex-1 h-10 rounded-xl text-sm font-semibold border transition-colors ${
                    grade === g
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-card border-border-default text-text-secondary hover:border-brand-primary/50'
                  }`}
                  aria-pressed={grade === g}
                  aria-label={`${g}.° grado`}
                >
                  {g}.°
                </button>
              ))}
            </div>
          </section>

          {/* Contenido curricular */}
          <div>
            <label htmlFor="topic-select" className="block text-sm font-semibold text-text-primary mb-2">
              Contenido curricular
            </label>
            <select
              id="topic-select"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setGenerated(false); }}
              className="w-full h-10 rounded-xl border border-border-default bg-surface-bg text-sm text-text-primary px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {topicList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <p className="text-xs text-text-secondary mt-1.5">
              Referencia: DGCyE 2018 · La selección de contenidos se verificará contra el currículo oficial en Etapa 02.
            </p>
          </div>

          {/* Formato */}
          <section aria-labelledby="format-label">
            <p id="format-label" className="text-sm font-semibold text-text-primary mb-2">
              Formato
            </p>
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setFormat(f.key); setGenerated(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                    format === f.key
                      ? 'bg-brand-primary-light border-brand-primary/40 text-brand-primary'
                      : 'bg-surface-card border-border-default text-text-secondary hover:border-brand-primary/30'
                  }`}
                  aria-pressed={format === f.key}
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-text-secondary">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Opciones avanzadas (acordeón) */}
          <div className="bg-surface-card rounded-2xl border border-border-default overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvanced(!advanced)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-text-primary hover:bg-surface-bg transition-colors"
              aria-expanded={advanced}
              aria-controls="advanced-options"
            >
              <span>Opciones avanzadas</span>
              <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${advanced ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {advanced && (
              <div id="advanced-options" className="px-4 pb-4 space-y-4 border-t border-border-default pt-3">
                {/* Cantidad */}
                <div>
                  <label htmlFor="quantity" className="block text-xs font-semibold text-text-primary mb-2">
                    Cantidad de ejercicios: <span className="font-normal text-brand-primary">{quantity}</span>
                  </label>
                  <input
                    id="quantity"
                    type="range"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
                  <div className="flex justify-between text-xs text-text-secondary mt-0.5">
                    <span>1</span><span>10</span>
                  </div>
                </div>

                {/* Dificultad */}
                <fieldset>
                  <legend className="text-xs font-semibold text-text-primary mb-2">Dificultad</legend>
                  <div className="flex gap-2">
                    {(['baja', 'media', 'alta'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                          difficulty === d
                            ? 'bg-brand-primary text-white border-brand-primary'
                            : 'bg-surface-bg border-border-default text-text-secondary hover:border-brand-primary/40'
                        }`}
                        aria-pressed={difficulty === d}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Solucionario */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSolution}
                    onChange={(e) => setIncludeSolution(e.target.checked)}
                    className="h-4 w-4 rounded border-border-default text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-text-secondary">Incluir solucionario separado</span>
                </label>

                {/* Accesibilidad */}
                <fieldset>
                  <legend className="text-xs font-semibold text-text-primary mb-2">Apoyos de accesibilidad</legend>
                  <div className="space-y-2">
                    {[
                      { key: 'bigFont'      as const, label: 'Texto grande (14 pt)' },
                      { key: 'highContrast' as const, label: 'Alto contraste' },
                      { key: 'simplified'  as const, label: 'Consignas simplificadas' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accessibility[key]}
                          onChange={(e) => setAccessibility(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="h-4 w-4 rounded border-border-default text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-text-secondary">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <p className="text-xs text-text-secondary italic">
                  Opciones avanzadas son configurables. El resultado simulado no varía en este prototipo.
                </p>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            isLoading={generating}
            leftIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
            aria-busy={generating}
          >
            {generating ? 'Generando…' : 'Generar material'}
          </Button>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-3" ref={previewRef}>
          <div className="bg-surface-card rounded-2xl border border-border-default h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <span className="text-sm font-semibold text-text-primary">Vista previa</span>
              </div>
              {generated && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" aria-hidden="true" />}>
                    Imprimir
                  </Button>
                  <Button variant="primary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}>
                    Descargar PDF
                  </Button>
                </div>
              )}
            </div>

            {!generated && !generating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16 text-text-muted">
                <div className="h-16 w-16 rounded-2xl bg-brand-primary-light flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-brand-primary" aria-hidden="true" />
                </div>
                <p className="font-medium text-text-secondary mb-1">
                  Configurá el material y hacé clic en &ldquo;Generar&rdquo;
                </p>
                <p className="text-sm">La vista previa aparecerá aquí</p>
              </div>
            )}

            {generating && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16 text-text-muted" role="status" aria-label="Generando material">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent mb-4" />
                <p className="font-medium text-text-secondary">
                  Generando {FORMATS.find(f => f.key === format)?.label.toLowerCase()}&hellip;
                </p>
                <p className="text-sm mt-1">{AREAS.find(a => a.key === area)?.label} · {grade}.° grado · {topic}</p>
              </div>
            )}

            {generated && !generating && (
              <div className="flex-1 overflow-auto">
                <div className="p-5 pb-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="primary" size="sm">{AREAS.find(a => a.key === area)?.label}</Badge>
                    <Badge variant="default" size="sm">{grade}.° grado</Badge>
                    <Badge variant="secondary" size="sm">{FORMATS.find(f => f.key === format)?.label}</Badge>
                    {accessibility.bigFont    && <Badge variant="warning" size="sm">Texto grande</Badge>}
                    {accessibility.simplified && <Badge variant="warning" size="sm">Simplificado</Badge>}
                  </div>
                </div>
                <div className="mx-5 mb-5 rounded-xl bg-white border border-border-default p-6 shadow-sm">
                  <pre className="font-sans text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                    {SIMULATED_PREVIEW}
                  </pre>
                </div>
                <div className="mx-5 mb-5 flex items-center gap-2 text-xs text-text-muted">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Simulación · El contenido real se generará con IA en Etapa 02</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
