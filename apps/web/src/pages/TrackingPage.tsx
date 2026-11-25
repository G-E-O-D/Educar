import { useState } from 'react';
import {
  BarChart3, TrendingUp, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Users, BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { STUDENTS, CURRICULUM, FIXTURE_GRADE, deriveStats } from '@/data/fixtures';

type ViewMode = 'resumen' | 'alumnos' | 'contenidos';

const STATUS_LABEL: Record<string, string> = {
  completo: 'Completo',
  'en-curso': 'En curso',
  pendiente: 'Pendiente',
};

const STATUS_BADGE: Record<string, 'success' | 'primary' | 'default'> = {
  completo: 'success',
  'en-curso': 'primary',
  pendiente: 'default',
};

// Deterministic per-student area offsets (no Math.random) — ficticios, basados en id
const AREA_OFFSETS: Record<string, Record<string, number>> = {
  s1: { Matemática: 5,  'Prácticas del Lenguaje': -3, 'Cs. Naturales': 2,  'Cs. Sociales': 1  },
  s2: { Matemática: -8, 'Prácticas del Lenguaje': 4,  'Cs. Naturales': -5, 'Cs. Sociales': 6  },
  s3: { Matemática: 3,  'Prácticas del Lenguaje': 6,  'Cs. Naturales': -2, 'Cs. Sociales': 4  },
  s4: { Matemática: -6, 'Prácticas del Lenguaje': -4, 'Cs. Naturales': 2,  'Cs. Sociales': -3 },
  s5: { Matemática: 2,  'Prácticas del Lenguaje': 1,  'Cs. Naturales': 3,  'Cs. Sociales': -1 },
  s6: { Matemática: 4,  'Prácticas del Lenguaje': -6, 'Cs. Naturales': 5,  'Cs. Sociales': 2  },
  s7: { Matemática: -2, 'Prácticas del Lenguaje': 5,  'Cs. Naturales': 4,  'Cs. Sociales': -4 },
  s8: { Matemática: -5, 'Prácticas del Lenguaje': -3, 'Cs. Naturales': 6,  'Cs. Sociales': -4 },
};

function clamp(val: number) { return Math.min(100, Math.max(0, val)); }

function ScoreBar({ value, label }: { value: number; label?: string }) {
  const color = value >= 85 ? 'bg-status-success' : value >= 70 ? 'bg-brand-primary' : value >= 50 ? 'bg-brand-accent' : 'bg-status-error';
  const ariaLabel = label ? `${label}: ${value}%` : `${value}%`;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-border-default overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-text-secondary w-8 text-right">{value}%</span>
    </div>
  );
}

function CoverageBar({ value }: { value: number }) {
  const color = value === 100 ? 'bg-status-success' : value > 0 ? 'bg-brand-primary' : 'bg-border-default';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-border-default overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${value}% cubierto`}>
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-text-secondary w-8 text-right">{value}%</span>
    </div>
  );
}

export function TrackingPage() {
  const [view, setView] = useState<ViewMode>('resumen');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>('Matemática');

  const { supportCount, avgCorrect, doneTopics, totalTopics, coveragePct } = deriveStats();

  const areas = [...new Set(CURRICULUM.map(c => c.area))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Encabezado con aclaración de métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Seguimiento · {FIXTURE_GRADE}</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Métricas ficticias — % respuestas correctas, actividades completadas y cobertura curricular son indicadores distintos.
          </p>
        </div>
        <Badge variant="warning" size="sm">Datos ficticios</Badge>
      </div>

      {/* Stats row — métricas diferenciadas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Resumen del seguimiento">
        {[
          {
            label: '% respuestas correctas',
            val: `${avgCorrect}%`,
            icon: TrendingUp,
            color: 'text-brand-primary',
            sub: 'Promedio · actividades autocorregibles',
          },
          {
            label: 'Con necesidad de apoyo',
            val: supportCount.toString(),
            icon: AlertCircle,
            color: 'text-status-warning',
            sub: `de ${STUDENTS.length} alumnos`,
          },
          {
            label: 'Cobertura curricular',
            val: `${coveragePct}%`,
            icon: BookOpen,
            color: 'text-status-success',
            sub: `${doneTopics}/${totalTopics} contenidos`,
          },
          {
            label: 'Alumnos en seguimiento',
            val: STUDENTS.length.toString(),
            icon: Users,
            color: 'text-teal-700',
            sub: FIXTURE_GRADE,
          },
        ].map(({ label, val, icon: Icon, color, sub }) => (
          <div key={label} className="bg-surface-card rounded-2xl border border-border-default p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-secondary font-medium leading-tight">{label}</p>
              <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-surface-bg rounded-xl p-1 w-fit border border-border-default" role="tablist" aria-label="Vistas de seguimiento">
        {(['resumen', 'alumnos', 'contenidos'] as ViewMode[]).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === v
                ? 'bg-surface-card text-text-primary shadow-sm border border-border-default'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* RESUMEN view */}
      {view === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución — % respuestas correctas */}
          <section aria-labelledby="dist-heading" className="bg-surface-card rounded-2xl border border-border-default p-5">
            <h2 id="dist-heading" className="font-semibold text-text-primary mb-1">Distribución de resultados</h2>
            <p className="text-xs text-text-secondary mb-4">Basada en % de respuestas correctas en actividades autocorregibles</p>
            <div className="space-y-3">
              {[
                { label: 'Excelente (90–100%)', count: STUDENTS.filter(s => s.correctAnswersPct >= 90).length, color: 'bg-status-success' },
                { label: 'Muy bien (75–89%)',   count: STUDENTS.filter(s => s.correctAnswersPct >= 75 && s.correctAnswersPct < 90).length, color: 'bg-brand-primary' },
                { label: 'Regular (60–74%)',    count: STUDENTS.filter(s => s.correctAnswersPct >= 60 && s.correctAnswersPct < 75).length, color: 'bg-brand-accent' },
                { label: 'Necesita apoyo (<60%)',count: STUDENTS.filter(s => s.correctAnswersPct < 60).length, color: 'bg-status-error' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full shrink-0 ${color}`} aria-hidden="true" />
                  <span className="text-sm text-text-secondary flex-1">{label}</span>
                  <span className="text-sm font-semibold text-text-primary">{count} alumnos</span>
                </div>
              ))}
            </div>
          </section>

          {/* Cobertura curricular */}
          <section aria-labelledby="cov-heading" className="bg-surface-card rounded-2xl border border-border-default p-5">
            <h2 id="cov-heading" className="font-semibold text-text-primary mb-1">
              Cobertura curricular
            </h2>
            <p className="text-xs text-text-secondary mb-4">Contenidos trabajados sobre total planificado (DGCyE 2018)</p>
            <div className="space-y-3">
              {areas.map((area) => {
                const areaItems = CURRICULUM.filter(c => c.area === area);
                const done = areaItems.filter(c => c.status === 'completo').length;
                const pct = Math.round(done / areaItems.length * 100);
                return (
                  <div key={area}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-text-primary">{area}</span>
                      <span className="text-text-secondary">{done}/{areaItems.length} temas</span>
                    </div>
                    <CoverageBar value={pct} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Alertas */}
          {supportCount > 0 && (
            <section aria-labelledby="alerts-heading" className="lg:col-span-2 bg-status-warning-bg rounded-2xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-status-warning" aria-hidden="true" />
                <h2 id="alerts-heading" className="font-semibold text-status-warning">
                  {supportCount} {supportCount === 1 ? 'alumno' : 'alumnos'} con actividades pendientes
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STUDENTS.filter(s => s.needsSupport).map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-amber-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-700">{s.initials}</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                    </div>
                    <ScoreBar value={s.correctAnswersPct} label="% respuestas correctas" />
                    <p className="text-xs text-text-secondary mt-2">{s.activitiesPending} actividad(es) pendiente(s)</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ALUMNOS view */}
      {view === 'alumnos' && (
        <section aria-labelledby="students-heading">
          <h2 id="students-heading" className="sr-only">Seguimiento por alumno</h2>
          <div className="space-y-2">
            {STUDENTS.map((s) => {
              const isExpanded = expandedStudent === s.id;
              const offsets = AREA_OFFSETS[s.id] ?? {};
              return (
                <div key={s.id} className="bg-surface-card rounded-2xl border border-border-default overflow-hidden">
                  <button
                    onClick={() => setExpandedStudent(isExpanded ? null : s.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-bg transition-colors"
                    aria-expanded={isExpanded}
                    aria-controls={`student-detail-${s.id}`}
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      s.needsSupport ? 'bg-status-warning-bg' : 'bg-brand-primary-light'
                    }`}>
                      <span className={`text-xs font-bold ${s.needsSupport ? 'text-status-warning' : 'text-brand-primary'}`}>
                        {s.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                        {s.needsSupport && (
                          <AlertCircle className="h-3.5 w-3.5 text-status-warning" aria-label="Con actividades pendientes" />
                        )}
                      </div>
                      <ScoreBar value={s.correctAnswersPct} label="% respuestas correctas" />
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs text-text-secondary">{s.activitiesCompleted} completadas</p>
                      <p className="text-xs text-text-secondary">{s.activitiesPending} pendientes</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                    }
                  </button>
                  {isExpanded && (
                    <div id={`student-detail-${s.id}`} className="border-t border-border-default px-5 py-4 bg-surface-bg">
                      <p className="text-sm font-semibold text-text-primary mb-1">% respuestas correctas por área</p>
                      <p className="text-xs text-text-secondary mb-3">Scores ficticios para prototipo — no representan evaluaciones reales</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Matemática', 'Prácticas del Lenguaje', 'Cs. Naturales', 'Cs. Sociales'] as const).map((area) => {
                          const score = clamp(s.correctAnswersPct + (offsets[area] ?? 0));
                          return (
                            <div key={area} className="bg-surface-card rounded-xl border border-border-default p-3">
                              <p className="text-xs font-medium text-text-secondary mb-2">{area}</p>
                              <ScoreBar value={score} label={area} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CONTENIDOS view */}
      {view === 'contenidos' && (
        <section aria-labelledby="curriculum-heading">
          <h2 id="curriculum-heading" className="sr-only">Cobertura por contenido curricular</h2>
          <div className="space-y-3">
            {areas.map((area) => {
              const isOpen = expandedArea === area;
              const items = CURRICULUM.filter(c => c.area === area);
              const done = items.filter(c => c.status === 'completo').length;
              return (
                <div key={area} className="bg-surface-card rounded-2xl border border-border-default overflow-hidden">
                  <button
                    onClick={() => setExpandedArea(isOpen ? null : area)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-bg transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`area-${area}`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-brand-primary-light flex items-center justify-center shrink-0">
                      <BarChart3 className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-semibold text-text-primary">{area}</p>
                        <Badge variant={done === items.length ? 'success' : 'primary'} size="sm">
                          {done}/{items.length} temas
                        </Badge>
                      </div>
                      <CoverageBar value={Math.round(done / items.length * 100)} />
                    </div>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                    }
                  </button>
                  {isOpen && (
                    <div id={`area-${area}`} className="border-t border-border-default px-5 py-4 bg-surface-bg">
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.topic} className="flex items-center gap-3 py-2">
                            {item.status === 'completo' ? (
                              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" aria-label="Completo" />
                            ) : item.status === 'en-curso' ? (
                              <div className="h-4 w-4 rounded-full border-2 border-brand-primary shrink-0" aria-label="En curso" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-border-strong shrink-0" aria-label="Pendiente" />
                            )}
                            <span className="text-sm text-text-primary flex-1">{item.topic}</span>
                            <Badge variant={STATUS_BADGE[item.status]} size="sm">
                              {STATUS_LABEL[item.status]}
                            </Badge>
                            {item.coveragePct > 0 && item.coveragePct < 100 && (
                              <span className="text-xs text-text-secondary w-10 text-right">{item.coveragePct}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
