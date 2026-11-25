import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, BarChart3, CalendarCheck,
  ArrowRight, Clock, FileText, Lightbulb, ChevronRight,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Nueva planificación', to: '/actividades', color: 'bg-brand-primary-light text-brand-primary' },
  { icon: BookOpen, label: 'Buscar recursos', to: '/biblioteca', color: 'bg-brand-secondary-light text-teal-700' },
  { icon: Lightbulb, label: 'Generar actividad', to: '/actividades', color: 'bg-amber-50 text-amber-700' },
  { icon: BarChart3, label: 'Ver seguimiento', to: '/seguimiento', color: 'bg-status-success-bg text-status-success' },
];

const NEXT_CLASS = {
  subject: 'Matemática',
  grade: '3.° B',
  time: 'Hoy · 9:00 hs',
  topic: 'Fracciones equivalentes',
  sequence: 'Secuencia 4, Clase 2 de 4',
  status: 'Lista',
  materials: ['Planificación', 'Ficha alumno', 'Solucionario'],
};

const AGENDA = [
  { day: 'Hoy', subject: 'Matemática', grade: '3.° B', time: '9:00', done: false },
  { day: 'Hoy', subject: 'Lengua', grade: '3.° B', time: '11:00', done: false },
  { day: 'Martes', subject: 'Ciencias Nat.', grade: '3.° B', time: '9:00', done: false },
  { day: 'Martes', subject: 'Matemática', grade: '3.° B', time: '11:00', done: false },
  { day: 'Miércoles', subject: 'Lengua', grade: '3.° B', time: '9:00', done: false },
];

const RECENT_MATERIALS = [
  { title: 'Ficha: Fracciones equivalentes', subject: 'Matemática', grade: '3.° B', type: 'Ficha alumno', date: 'Hoy' },
  { title: 'Evaluación: Comprensión lectora', subject: 'Lengua', grade: '3.° B', type: 'Evaluación', date: 'Ayer' },
  { title: 'Cuadernillo: Multiplicación', subject: 'Matemática', grade: '3.° B', type: 'Cuadernillo', date: 'Lun' },
  { title: 'Dictado: Uso de la H', subject: 'Lengua', grade: '3.° B', type: 'Dictado', date: 'Vie' },
];

const ALERTS = [
  { text: '3 alumnos con contenidos pendientes de refuerzo', variant: 'warning' as const },
  { text: 'Quedan 12 semanas para fin de año — 68% del currículo cubierto', variant: 'primary' as const },
];

const MODULES = [
  { icon: BookOpen, label: 'Biblioteca', to: '/biblioteca', desc: 'Recursos con licencia verificada', badge: null },
  { icon: Sparkles, label: 'Generador', to: '/actividades', desc: 'Fichas, evaluaciones, dictados', badge: 'Nuevo' },
  { icon: CalendarCheck, label: 'Agenda', to: '/panel', desc: 'Próximas clases y fechas', badge: null },
  { icon: BarChart3, label: 'Seguimiento', to: '/seguimiento', desc: 'Evolución por alumno y contenido', badge: null },
];

export function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Alerts */}
      {ALERTS.map((a, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
            a.variant === 'warning'
              ? 'bg-status-warning-bg text-status-warning border border-amber-200'
              : 'bg-brand-primary-light text-brand-primary border border-indigo-200'
          }`}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          {a.text}
        </div>
      ))}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Resumen estadístico">
        {[
          { label: 'Contenidos cubiertos', val: '68%', sub: 'de 3.° B', icon: TrendingUp, color: 'text-status-success' },
          { label: 'Clases dadas', val: '24', sub: 'este año', icon: CalendarCheck, color: 'text-brand-primary' },
          { label: 'Materiales creados', val: '41', sub: 'este año', icon: FileText, color: 'text-teal-700' },
          { label: 'Alumnos activos', val: '28', sub: 'en 3.° B', icon: BarChart3, color: 'text-amber-700' },
        ].map(({ label, val, sub, icon: Icon, color }) => (
          <div key={label} className="bg-surface-card rounded-2xl p-5 border border-border-default">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-muted font-medium">{label}</p>
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-text-muted mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <section aria-labelledby="qa-heading">
            <h2 id="qa-heading" className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Acciones rápidas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface-card border border-border-default p-4 hover:border-brand-primary/30 transition-colors text-center group"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${a.color}`}>
                    <a.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Next class */}
          <section aria-labelledby="next-class-heading" className="bg-surface-card rounded-2xl border border-border-default p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="next-class-heading" className="font-semibold text-text-primary">Próxima clase</h2>
              <Badge variant="success" size="sm">{NEXT_CLASS.status}</Badge>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-primary-light flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-text-primary">{NEXT_CLASS.subject}</p>
                  <Badge variant="primary" size="sm">{NEXT_CLASS.grade}</Badge>
                </div>
                <p className="text-sm text-text-secondary mb-0.5">{NEXT_CLASS.topic}</p>
                <p className="text-xs text-text-muted mb-3">{NEXT_CLASS.sequence}</p>
                <div className="flex flex-wrap gap-2">
                  {NEXT_CLASS.materials.map((m) => (
                    <span
                      key={m}
                      className="text-xs bg-surface-bg border border-border-default text-text-secondary rounded-lg px-2.5 py-1"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <Clock className="h-4 w-4 text-text-muted ml-auto mb-1" aria-hidden="true" />
                <p className="text-xs text-text-muted">{NEXT_CLASS.time}</p>
              </div>
            </div>
          </section>

          {/* Recent materials */}
          <section aria-labelledby="recent-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="recent-heading" className="font-semibold text-text-primary">Materiales recientes</h2>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" aria-hidden="true" />} asChild>
                <Link to="/biblioteca">Ver todos</Link>
              </Button>
            </div>
            <div className="bg-surface-card rounded-2xl border border-border-default divide-y divide-border-default overflow-hidden">
              {RECENT_MATERIALS.map((m) => (
                <div key={m.title} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-bg transition-colors">
                  <FileText className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{m.title}</p>
                    <p className="text-xs text-text-muted">{m.subject} · {m.grade}</p>
                  </div>
                  <Badge variant="default" size="sm">{m.type}</Badge>
                  <span className="text-xs text-text-muted shrink-0">{m.date}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Agenda */}
          <section aria-labelledby="agenda-heading" className="bg-surface-card rounded-2xl border border-border-default p-5">
            <h2 id="agenda-heading" className="font-semibold text-text-primary mb-4">Agenda</h2>
            <div className="space-y-2">
              {AGENDA.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-right w-14 shrink-0">
                    <p className="text-xs font-medium text-text-secondary">{item.day}</p>
                    <p className="text-xs text-text-muted">{item.time}</p>
                  </div>
                  <div className="h-full w-px bg-border-default shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.subject}</p>
                    <p className="text-xs text-text-muted">{item.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Modules */}
          <section aria-labelledby="modules-heading">
            <h2 id="modules-heading" className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Módulos
            </h2>
            <div className="space-y-2">
              {MODULES.map((m) => (
                <Link
                  key={m.label}
                  to={m.to}
                  className="flex items-center gap-3 bg-surface-card rounded-xl border border-border-default px-4 py-3 hover:border-brand-primary/30 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-brand-primary-light flex items-center justify-center shrink-0">
                    <m.icon className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                      {m.badge && <Badge variant="accent" size="sm">{m.badge}</Badge>}
                    </div>
                    <p className="text-xs text-text-muted">{m.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand-primary transition-colors" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
