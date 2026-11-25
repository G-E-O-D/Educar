import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Star, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type Screen = 'welcome' | 'exercise' | 'feedback' | 'progress';

interface Option {
  id: string;
  text: string;
  correct: boolean;
}

const EXERCISE = {
  subject: 'MatemÃ¡tica',
  grade: '3.Â° B',
  topic: 'Fracciones equivalentes',
  instruction: 'LeÃ© la pregunta y elegÃ­ la respuesta correcta.',
  question: 'Â¿CuÃ¡l de estas fracciones es equivalente a 1/2?',
  options: [
    { id: 'a', text: '1/3', correct: false },
    { id: 'b', text: '2/4', correct: true  },
    { id: 'c', text: '3/8', correct: false },
    { id: 'd', text: '2/5', correct: false },
  ] as Option[],
  hint: 'PensÃ¡: si dividÃ­s algo en 4 partes iguales y agarrÃ¡s 2, Â¿es lo mismo que la mitad?',
};

const PROGRESS_ITEMS = [
  { subject: 'MatemÃ¡tica',    topic: 'Fracciones equivalentes', status: 'done',    score: 90   },
  { subject: 'MatemÃ¡tica',    topic: 'MultiplicaciÃ³n',          status: 'done',    score: 75   },
  { subject: 'Prac. Lenguaje',topic: 'ComprensiÃ³n lectora',     status: 'pending', score: null },
  { subject: 'Prac. Lenguaje',topic: 'Uso de la H',             status: 'done',    score: 85   },
  { subject: 'Cs. Naturales', topic: 'El ciclo del agua',       status: 'pending', score: null },
];

// Solo logros de progreso personal, sin rachas ni rankings
const ACHIEVEMENTS = [
  { icon: Star,    label: '10 ejercicios completos', color: 'text-brand-primary' },
  { icon: BookOpen,label: 'Primera lectura',          color: 'text-teal-600'     },
  { icon: Trophy,  label: '5 correctas seguidas',     color: 'text-brand-accent' },
];

export function StudentPage() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [calmMode, setCalmMode] = useState(false);

  const answered = selected !== null;
  const selectedOption = EXERCISE.options.find(o => o.id === selected);

  function handleSubmit() {
    if (selected) setScreen('feedback');
  }

  // Modo tranquilo: sin gradientes, tipografÃ­a mÃ¡s grande, paleta neutra
  const pageClass = calmMode
    ? 'bg-white text-text-primary'
    : 'bg-gradient-to-br from-[#EEF0FB] via-white to-[#E6F7F5]';

  const cardClass = calmMode
    ? 'bg-white border border-border-default rounded-xl'
    : 'bg-surface-card border border-border-default rounded-2xl';


  return (
    <div className={`min-h-screen ${pageClass} transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Modo tranquilo â€” siempre visible */}
        <div className="flex justify-end mb-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className={`text-xs font-medium ${calmMode ? 'text-text-primary' : 'text-text-muted'}`}>
              Modo tranquilo
            </span>
            <button
              role="switch"
              aria-checked={calmMode}
              aria-label="Activar modo tranquilo"
              onClick={() => setCalmMode(!calmMode)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                calmMode ? 'bg-brand-primary' : 'bg-border-default'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                calmMode ? 'translate-x-4' : ''
              }`} />
            </button>
          </label>
        </div>

        {/* DescripciÃ³n del modo tranquilo */}
        {calmMode && (
          <div className="mb-6 p-4 rounded-xl bg-brand-primary-light/50 border border-brand-primary/20 text-sm text-brand-primary">
            Modo tranquilo activo: sin colores intensos, texto mÃ¡s grande, sin elementos de distracciÃ³n.
          </div>
        )}

        {/* BIENVENIDA */}
        {screen === 'welcome' && (
          <div className={`text-center space-y-6 ${calmMode ? 'text-lg' : ''}`}>
            {!calmMode && (
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-3xl bg-brand-primary-light flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-brand-primary" aria-hidden="true" />
                </div>
              </div>
            )}
            <div>
              <h1 className={`font-bold text-text-primary mb-2 ${calmMode ? 'text-3xl' : 'text-3xl'}`}>
                Â¡Hola!
              </h1>
              <p className={`text-text-secondary ${calmMode ? 'text-xl' : 'text-lg'}`}>
                Tu docente te dejÃ³ ejercicios de hoy.
              </p>
            </div>

            <div className={`${cardClass} p-6 text-left`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl bg-brand-primary-light flex items-center justify-center shrink-0 ${calmMode ? 'hidden' : ''}`}>
                  <BookOpen className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className={`font-semibold text-text-primary ${calmMode ? 'text-lg' : ''}`}>
                    {EXERCISE.subject}
                  </p>
                  <p className="text-sm text-text-muted">{EXERCISE.topic}</p>
                </div>
                <Badge variant="primary" size="sm" className="ml-auto">{EXERCISE.grade}</Badge>
              </div>
              <p className={`text-text-secondary ${calmMode ? 'text-base' : 'text-sm'}`}>
                1 ejercicio Â· aprox. 5 minutos
              </p>
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

            {/* Logros personales (sin rachas ni rankings) */}
            <div className="pt-4">
              <p className="text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">Mis logros</p>
              <div className="flex flex-wrap justify-center gap-3">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.label} className={`flex items-center gap-2 border border-border-default rounded-xl px-3 py-2 ${calmMode ? 'bg-white' : 'bg-surface-card'}`}>
                    <a.icon className={`h-4 w-4 ${calmMode ? 'text-text-secondary' : a.color}`} aria-hidden="true" />
                    <span className={`text-xs font-medium text-text-secondary ${calmMode ? 'text-sm' : ''}`}>
                      {a.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EJERCICIO */}
        {screen === 'exercise' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">{EXERCISE.subject} Â· {EXERCISE.grade}</Badge>
              <span className="text-xs text-text-muted">Ejercicio 1 de 1</span>
            </div>

            <div className={cardClass + ' p-6'}>
              <p className={`text-text-muted mb-2 font-medium ${calmMode ? 'text-base' : 'text-sm'}`}>
                {EXERCISE.instruction}
              </p>
              <h2 className={`font-bold text-text-primary leading-snug ${calmMode ? 'text-2xl' : 'text-xl'}`}>
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
                    <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-strong text-text-secondary'
                    } ${calmMode ? 'text-base font-bold' : 'text-sm font-bold'}`} aria-hidden="true">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className={calmMode ? 'text-xl' : 'text-base'}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {!answered && (
              <div>
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-sm text-brand-primary underline underline-offset-2 hover:no-underline"
                  >
                    Â¿NecesitÃ¡s una pista?
                  </button>
                ) : (
                  <div className={`${calmMode ? 'bg-surface-bg border border-border-default' : 'bg-amber-50 border border-amber-200'} rounded-xl px-4 py-3 text-sm ${calmMode ? 'text-text-secondary' : 'text-amber-800'}`} role="note">
                    Pista: {EXERCISE.hint}
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

        {/* RESULTADO */}
        {screen === 'feedback' && selectedOption && (
          <div className="text-center space-y-6">
            {selectedOption.correct ? (
              <>
                {!calmMode && (
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-status-success-bg flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-status-success" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div>
                  <h2 className={`font-bold mb-2 ${calmMode ? 'text-2xl text-text-primary' : 'text-3xl text-status-success'}`}>
                    Â¡Correcto!
                  </h2>
                  <p className={`text-text-secondary ${calmMode ? 'text-lg' : ''}`}>
                    2/4 y 1/2 son fracciones equivalentes porque si dividÃ­s el numerador y el denominador de 2/4 por 2, obtenÃ©s 1/2.
                  </p>
                </div>
              </>
            ) : (
              <>
                {!calmMode && (
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-status-error-bg flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-status-error" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div>
                  <h2 className={`font-bold mb-2 ${calmMode ? 'text-2xl text-text-primary' : 'text-3xl text-status-error'}`}>
                    Casi&hellip;
                  </h2>
                  <p className={`text-text-secondary ${calmMode ? 'text-lg' : ''}`}>
                    La respuesta correcta era <strong>2/4</strong>. {EXERCISE.hint}
                  </p>
                </div>
              </>
            )}

            <div className={cardClass + ' p-5 text-left'}>
              <p className={`font-semibold text-text-primary mb-1 ${calmMode ? 'text-base' : 'text-sm'}`}>Tu respuesta:</p>
              <p className={`text-text-secondary ${calmMode ? 'text-base' : 'text-sm'}`}>{selectedOption.text}</p>
              {!selectedOption.correct && (
                <>
                  <p className={`font-semibold text-text-primary mt-3 mb-1 ${calmMode ? 'text-base' : 'text-sm'}`}>
                    Respuesta correcta:
                  </p>
                  <p className={`text-status-success font-medium ${calmMode ? 'text-base' : 'text-sm'}`}>
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

        {/* PROGRESO */}
        {screen === 'progress' && (
          <div className="space-y-6">
            <div>
              <h2 className={`font-bold text-text-primary mb-1 ${calmMode ? 'text-2xl' : 'text-xl'}`}>
                Mi progreso
              </h2>
              <p className={`text-text-muted ${calmMode ? 'text-base' : 'text-sm'}`}>
                Actividades asignadas en este perÃ­odo
              </p>
            </div>

            <div className="space-y-3">
              {PROGRESS_ITEMS.map((p) => (
                <div
                  key={p.topic}
                  className={`${cardClass} flex items-center gap-4 p-4`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    p.status === 'done'
                      ? 'bg-status-success-bg'
                      : 'bg-surface-bg border border-border-default'
                  }`}>
                    {p.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden="true" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-border-default" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-text-primary truncate ${calmMode ? 'text-base' : 'text-sm'}`}>
                      {p.topic}
                    </p>
                    <p className={`text-text-muted ${calmMode ? 'text-sm' : 'text-xs'}`}>{p.subject}</p>
                  </div>
                  {p.score !== null ? (
                    <span className={`font-bold shrink-0 ${calmMode ? 'text-base text-text-primary' : 'text-sm text-status-success'}`}>
                      {p.score}%
                    </span>
                  ) : (
                    <span className={`text-text-muted shrink-0 ${calmMode ? 'text-sm' : 'text-xs'}`}>Pendiente</span>
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
