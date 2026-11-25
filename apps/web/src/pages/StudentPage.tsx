import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Star, Trophy, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Screen = 'welcome' | 'exercise' | 'feedback' | 'progress';

interface Option {
  id: string;
  text: string;
  correct: boolean;
}

const EXERCISE = {
  subject: 'Matemática',
  grade: '3.° B',
  topic: 'Fracciones equivalentes',
  instruction: 'Leé la pregunta y elegí la respuesta correcta.',
  question: '¿Cuál de estas fracciones es equivalente a 1/2?',
  options: [
    { id: 'a', text: '1/3', correct: false },
    { id: 'b', text: '2/4', correct: true },
    { id: 'c', text: '3/8', correct: false },
    { id: 'd', text: '2/5', correct: false },
  ] as Option[],
  hint: 'Pensá: si dividís algo en 4 partes iguales y agarrás 2, ¿es lo mismo que la mitad?',
};

const PROGRESS_ITEMS = [
  { subject: 'Matemática', topic: 'Fracciones equivalentes', status: 'done', score: 90 },
  { subject: 'Matemática', topic: 'Multiplicación', status: 'done', score: 75 },
  { subject: 'Lengua', topic: 'Comprensión lectora', status: 'pending', score: null },
  { subject: 'Lengua', topic: 'Uso de la H', status: 'done', score: 85 },
  { subject: 'Cs. Naturales', topic: 'El ciclo del agua', status: 'pending', score: null },
];

const ACHIEVEMENTS = [
  { icon: Trophy, label: '¡Racha de 3 días!', color: 'text-brand-accent' },
  { icon: Star, label: '10 ejercicios completos', color: 'text-brand-primary' },
  { icon: BookOpen, label: 'Primera lectura', color: 'text-teal-600' },
];

export function StudentPage() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [lowStim, setLowStim] = useState(false);

  const answered = selected !== null;
  const selectedOption = EXERCISE.options.find(o => o.id === selected);

  function handleSubmit() {
    if (selected) setScreen('feedback');
  }

  const bgClass = lowStim ? 'bg-white' : 'bg-gradient-to-br from-[#EEF0FB] via-white to-[#E6F7F5]';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Low stimulation toggle */}
        <div className="flex justify-end mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-text-muted font-medium">Modo calmo</span>
            <button
              role="switch"
              aria-checked={lowStim}
              onClick={() => setLowStim(!lowStim)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                lowStim ? 'bg-brand-primary' : 'bg-border-default'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                lowStim ? 'translate-x-4' : ''
              }`} />
            </button>
          </label>
        </div>

        {/* WELCOME */}
        {screen === 'welcome' && (
          <div className="text-center space-y-6">
            {!lowStim && (
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-3xl bg-brand-primary-light flex items-center justify-center">
                  <Sun className="h-10 w-10 text-brand-primary" aria-hidden="true" />
                </div>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">¡Hola!</h1>
              <p className="text-text-secondary text-lg">Tu docente te dejó ejercicios de hoy.</p>
            </div>

            <div className="bg-surface-card rounded-2xl border border-border-default p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-brand-primary-light flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{EXERCISE.subject}</p>
                  <p className="text-sm text-text-muted">{EXERCISE.topic}</p>
                </div>
                <Badge variant="primary" size="sm" className="ml-auto">{EXERCISE.grade}</Badge>
              </div>
              <p className="text-sm text-text-secondary">1 ejercicio · aprox. 5 minutos</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setScreen('exercise')}
                className="sm:w-auto w-full"
              >
                Empezar
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setScreen('progress')}
                className="sm:w-auto w-full"
              >
                Ver mi progreso
              </Button>
            </div>

            {/* Achievements */}
            <div className="pt-4">
              <p className="text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">Mis logros</p>
              <div className="flex flex-wrap justify-center gap-3">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.label} className="flex items-center gap-2 bg-surface-card border border-border-default rounded-xl px-3 py-2">
                    <a.icon className={`h-4 w-4 ${a.color}`} aria-hidden="true" />
                    <span className="text-xs font-medium text-text-secondary">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXERCISE */}
        {screen === 'exercise' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">{EXERCISE.subject} · {EXERCISE.grade}</Badge>
              <span className="text-xs text-text-muted">Ejercicio 1 de 1</span>
            </div>

            <div className="bg-surface-card rounded-2xl border border-border-default p-6">
              <p className="text-sm text-text-muted mb-2 font-medium">{EXERCISE.instruction}</p>
              <h2 className="text-xl font-bold text-text-primary leading-snug">
                {EXERCISE.question}
              </h2>
            </div>

            <div className="space-y-3" role="group" aria-label="Opciones de respuesta">
              {EXERCISE.options.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => !answered && setSelected(opt.id)}
                    disabled={answered}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-primary-light border-brand-primary text-brand-primary font-semibold'
                        : answered
                          ? 'bg-surface-bg border-border-default text-text-muted cursor-default'
                          : 'bg-surface-card border-border-default text-text-primary hover:border-brand-primary/50 hover:bg-brand-primary-light/30'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${
                      isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-strong text-text-secondary'
                    }`} aria-hidden="true">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="text-base">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            {!answered && (
              <div>
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-sm text-brand-primary underline underline-offset-2 hover:no-underline"
                  >
                    ¿Necesitás una pista?
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800" role="note">
                    💡 {EXERCISE.hint}
                  </div>
                )}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!answered}
              onClick={handleSubmit}
            >
              Enviar respuesta
            </Button>
          </div>
        )}

        {/* FEEDBACK */}
        {screen === 'feedback' && selectedOption && (
          <div className="text-center space-y-6">
            {selectedOption.correct ? (
              <>
                {!lowStim && (
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-status-success-bg flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-status-success" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-status-success mb-2">¡Correcto!</h2>
                  <p className="text-text-secondary">
                    2/4 y 1/2 son fracciones equivalentes porque si dividís el numerador y el denominador de 2/4 por 2, obtenés 1/2.
                  </p>
                </div>
              </>
            ) : (
              <>
                {!lowStim && (
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-status-error-bg flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-status-error" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-status-error mb-2">Casi...</h2>
                  <p className="text-text-secondary">
                    La respuesta correcta era <strong>2/4</strong>. {EXERCISE.hint}
                  </p>
                </div>
              </>
            )}

            <div className="bg-surface-card rounded-2xl border border-border-default p-5 text-left">
              <p className="text-sm font-semibold text-text-primary mb-1">Tu respuesta:</p>
              <p className="text-sm text-text-secondary">{selectedOption.text}</p>
              {!selectedOption.correct && (
                <>
                  <p className="text-sm font-semibold text-text-primary mt-3 mb-1">Respuesta correcta:</p>
                  <p className="text-sm text-status-success font-medium">
                    {EXERCISE.options.find(o => o.correct)?.text}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setScreen('progress')}
                className="sm:w-auto w-full"
              >
                Ver mi progreso
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => { setSelected(null); setShowHint(false); setScreen('exercise'); }}
                className="sm:w-auto w-full"
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {screen === 'progress' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary mb-1">Mi progreso</h2>
              <p className="text-text-muted text-sm">3.° B · 2025</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Completados', val: '3', color: 'text-status-success' },
                { label: 'Pendientes', val: '2', color: 'text-status-warning' },
                { label: 'Promedio', val: '83%', color: 'text-brand-primary' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-surface-card rounded-2xl border border-border-default p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{val}</p>
                  <p className="text-xs text-text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2" role="list" aria-label="Lista de temas">
              {PROGRESS_ITEMS.map((item) => (
                <div
                  key={`${item.subject}-${item.topic}`}
                  role="listitem"
                  className="flex items-center gap-3 bg-surface-card rounded-xl border border-border-default px-4 py-3"
                >
                  {item.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" aria-label="Completado" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-border-strong shrink-0" aria-label="Pendiente" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{item.topic}</p>
                    <p className="text-xs text-text-muted">{item.subject}</p>
                  </div>
                  {item.score !== null && (
                    <Badge variant={item.score >= 80 ? 'success' : 'warning'} size="sm">
                      {item.score}%
                    </Badge>
                  )}
                  {item.status === 'pending' && (
                    <Badge variant="default" size="sm">Pendiente</Badge>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setScreen('welcome')}
            >
              Volver al inicio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
