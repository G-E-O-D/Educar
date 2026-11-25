import { useState } from 'react';
import {
  BarChart3, TrendingUp, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Users, BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

type ViewMode = 'resumen' | 'alumnos' | 'contenidos';

const STUDENTS = [
  { id: 's1', name: 'Agustina R.', initials: 'AR', avgScore: 92, completed: 8, pending: 1, alert: false },
  { id: 's2', name: 'Bruno M.', initials: 'BM', avgScore: 71, completed: 6, pending: 3, alert: true },
  { id: 's3', name: 'Camila F.', initials: 'CF', avgScore: 88, completed: 8, pending: 1, alert: false },
  { id: 's4', name: 'Diego V.', initials: 'DV', avgScore: 65, completed: 5, pending: 4, alert: true },
  { id: 's5', name: 'Emilia P.', initials: 'EP', avgScore: 95, completed: 9, pending: 0, alert: false },
  { id: 's6', name: 'Franco L.', initials: 'FL', avgScore: 78, completed: 7, pending: 2, alert: false },
  { id: 's7', name: 'Gabriela S.', initials: 'GS', avgScore: 83, completed: 8, pending: 1, alert: false },
  { id: 's8', name: 'Hernán T.', initials: 'HT', avgScore: 59, completed: 4, pending: 5, alert: true },
];

const CURRICULUM = [
  { area: 'Matemática', topic: 'Números hasta el 1000', status: 'completo', coverage: 100, grade: 'A' },
  { area: 'Matemática', topic: 'Multiplicación', status: 'completo', coverage: 100, grade: 'A' },
  { area: 'Matemática', topic: 'Fracciones equivalentes', status: 'en-curso', coverage: 68, grade: null },
  { area: 'Matemática', topic: 'Medidas de longitud', status: 'pendiente', coverage: 0, grade: null },
  { area: 'Lengua', topic: 'Comprensión lectora', status: 'completo', coverage: 100, grade: 'A' },
  { area: 'Lengua', topic: 'Uso de la H y la Y', status: 'en-curso', coverage: 50, grade: null },
  { area: 'Lengua', topic: 'El sustantivo y adjetivo', status: 'pendiente', coverage: 0, grade: null },
  { area: 'Cs. Naturales', topic: 'El ciclo del agua', status: 'completo', coverage: 100, grade: 'B' },
  { area: 'Cs. Naturales', topic: 'Las plantas', status: 'en-curso', coverage: 30, grade: null },
  { area: 'Cs. Sociales', topic: 'Los Virreinatos', status: 'completo', coverage: 100, grade: 'A' },
  { area: 'Cs. Sociales', topic: 'La Revolución de Mayo', status: 'pendiente', coverage: 0, grade: null },
];

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

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 85 ? 'bg-status-success' : pct >= 70 ? 'bg-brand-primary' : pct >= 50 ? 'bg-brand-accent' : 'bg-status-error';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-border-default overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`${value}%`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
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

  const alertCount = STUDENTS.filter(s => s.alert).length;
  const avgScore = Math.round(STUDENTS.reduce((sum, s) => sum + s.avgScore, 0) / STUDENTS.length);
  const completedTopics = CURRICULUM.filter(c => c.status === 'completo').length;
  const totalTopics = CURRICULUM.length;

  const areas = [...new Set(CURRICULUM.map(c => c.area))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Resumen del seguimiento">
        {[
          { label: 'Promedio general', val: `${avgScore}%`, icon: TrendingUp, color: 'text-brand-primary', sub: '3.° B' },
          { label: 'Alumnos con alerta', val: alertCount.toString(), icon: AlertCircle, color: 'text-status-warning', sub: 'necesitan atención' },
          { label: 'Contenidos cubiertos', val: `${completedTopics}/${totalTopics}`, icon: BookOpen, color: 'text-status-success', sub: `${Math.round(completedTopics/totalTopics*100)}% del currículo` },
          { label: 'Alumnos activos', val: STUDENTS.length.toString(), icon: Users, color: 'text-teal-700', sub: 'en el seguimiento' },
        ].map(({ label, val, icon: Icon, color, sub }) => (
          <div key={label} className="bg-surface-card rounded-2xl border border-border-default p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted font-medium">{label}</p>
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-text-muted mt-0.5">{sub}</p>
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
          {/* Distribution */}
          <section aria-labelledby="dist-heading" className="bg-surface-card rounded-2xl border border-border-default p-5">
            <h2 id="dist-heading" className="font-semibold text-text-primary mb-4">Distribución de resultados</h2>
            <div className="space-y-3">
              {[
                { label: 'Excelente (90–100%)', count: STUDENTS.filter(s => s.avgScore >= 90).length, color: 'bg-status-success' },
                { label: 'Muy bien (75–89%)', count: STUDENTS.filter(s => s.avgScore >= 75 && s.avgScore < 90).length, color: 'bg-brand-primary' },
                { label: 'Regular (60–74%)', count: STUDENTS.filter(s => s.avgScore >= 60 && s.avgScore < 75).length, color: 'bg-brand-accent' },
                { label: 'Necesita apoyo (<60%)', count: STUDENTS.filter(s => s.avgScore < 60).length, color: 'bg-status-error' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full shrink-0 ${color}`} aria-hidden="true" />
                  <span className="text-sm text-text-secondary flex-1">{label}</span>
                  <span className="text-sm font-semibold text-text-primary">{count} alumnos</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum coverage */}
          <section aria-labelledby="cov-heading" className="bg-surface-card rounded-2xl border border-border-default p-5">
            <h2 id="cov-heading" className="font-semibold text-text-primary mb-4">
              Cobertura curricular
            </h2>
            <div className="space-y-3">
              {areas.map((area) => {
                const areaItems = CURRICULUM.filter(c => c.area === area);
                const done = areaItems.filter(c => c.status === 'completo').length;
                const pct = Math.round(done / areaItems.length * 100);
                return (
                  <div key={area}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-text-primary">{area}</span>
                      <span className="text-text-muted">{done}/{areaItems.length} temas</span>
                    </div>
                    <CoverageBar value={pct} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Alerts */}
          {alertCount > 0 && (
            <section aria-labelledby="alerts-heading" className="lg:col-span-2 bg-status-warning-bg rounded-2xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-status-warning" aria-hidden="true" />
                <h2 id="alerts-heading" className="font-semibold text-status-warning">
                  {alertCount} alumnos necesitan atención
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STUDENTS.filter(s => s.alert).map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-amber-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-700">{s.initials}</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                    </div>
                    <ScoreBar value={s.avgScore} />
                    <p className="text-xs text-text-muted mt-2">{s.pending} ejercicio(s) sin completar</p>
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
              return (
                <div key={s.id} className="bg-surface-card rounded-2xl border border-border-default overflow-hidden">
                  <button
                    onClick={() => setExpandedStudent(isExpanded ? null : s.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-bg transition-colors"
                    aria-expanded={isExpanded}
                    aria-controls={`student-detail-${s.id}`}
                  >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      s.alert ? 'bg-status-warning-bg' : 'bg-brand-primary-light'
                    }`}>
                      <span className={`text-xs font-bold ${s.alert ? 'text-status-warning' : 'text-brand-primary'}`}>
                        {s.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                        {s.alert && (
                          <AlertCircle className="h-3.5 w-3.5 text-status-warning" aria-label="Necesita atención" />
                        )}
                      </div>
                      <ScoreBar value={s.avgScore} />
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs text-text-muted">{s.completed} completos</p>
                      <p className="text-xs text-text-muted">{s.pending} pendientes</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                    }
                  </button>
                  {isExpanded && (
                    <div id={`student-detail-${s.id}`} className="border-t border-border-default px-5 py-4 bg-surface-bg">
                      <p className="text-sm font-semibold text-text-primary mb-3">Detalle por área</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Matemática', 'Lengua', 'Cs. Naturales', 'Cs. Sociales'].map((area) => (
                          <div key={area} className="bg-surface-card rounded-xl border border-border-default p-3">
                            <p className="text-xs font-medium text-text-secondary mb-2">{area}</p>
                            <ScoreBar value={Math.min(100, s.avgScore + Math.round(Math.random() * 15 - 7))} />
                          </div>
                        ))}
                      </div>
                      {s.pending > 0 && (
                        <div className="mt-3 text-xs text-status-warning font-medium flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Sugerencia: repaso de fracciones y ejercitación adicional en Lengua
                        </div>
                      )}
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
                            {item.coverage > 0 && item.coverage < 100 && (
                              <span className="text-xs text-text-muted w-10 text-right">{item.coverage}%</span>
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
