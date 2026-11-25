import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Sparkles, BarChart3,
  CalendarCheck, Users, Shield, CheckCircle2,
  GraduationCap, FileText, Lightbulb, Clock,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { APP_SCOPE, GRADE_RANGE, APP_VERSION } from '@educar/shared';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Planificación curricular',
    desc: 'Organizá tus unidades didácticas con respaldo en el Diseño Curricular DGCyE.',
    color: 'bg-brand-primary-light text-brand-primary',
  },
  {
    icon: Sparkles,
    title: 'Generador de actividades',
    desc: 'Creá fichas, dictados, evaluaciones y cuadernillos adaptados a tu grado y área.',
    color: 'bg-brand-secondary-light text-teal-700',
  },
  {
    icon: BookOpen,
    title: 'Biblioteca inteligente',
    desc: 'Accedé a cuentos, textos y recursos con licencias verificadas, organizados por grado.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: BarChart3,
    title: 'Seguimiento pedagógico',
    desc: 'Visualizá la evolución de cada alumno y los contenidos que necesitan refuerzo.',
    color: 'bg-brand-primary-light text-brand-primary',
  },
  {
    icon: CalendarCheck,
    title: 'Agenda y calendario',
    desc: 'Organizá tus clases según el calendario escolar oficial con replanificación automática.',
    color: 'bg-brand-secondary-light text-teal-700',
  },
  {
    icon: Users,
    title: 'Portal del alumno',
    desc: 'Asigná ejercicios autocorregibles y revisá el progreso sin que el alumno necesite cuenta.',
    color: 'bg-amber-50 text-amber-700',
  },
];

const PILLARS = [
  { icon: FileText, label: 'Planificación' },
  { icon: Sparkles, label: 'Producción didáctica' },
  { icon: BookOpen, label: 'Biblioteca' },
  { icon: Lightbulb, label: 'Laboratorios' },
  { icon: Clock, label: 'Organización' },
  { icon: Users, label: 'Aula de refuerzo' },
  { icon: Shield, label: 'Educación inclusiva' },
];

const TESTIMONIALS = [
  {
    text: 'Ahorro dos horas por semana en planificación. Los materiales ya tienen el respaldo curricular que necesito para la inspección.',
    name: 'María G.',
    role: 'Maestra de 4.° grado · Lomas de Zamora',
    initials: 'MG',
  },
  {
    text: 'Las fichas salen listas para imprimir, con el solucionario aparte. Ya no pierdo tiempo en formato.',
    name: 'Carlos R.',
    role: 'Maestro de 2.° grado · La Plata',
    initials: 'CR',
  },
  {
    text: 'El portal del alumno es perfecto para los chicos que faltaron. Pueden retomar desde casa sin que yo tenga que imprimir de nuevo.',
    name: 'Sandra V.',
    role: 'Maestra de 6.° grado · Quilmes',
    initials: 'SV',
  },
];

export function LandingPage() {
  return (
    <>
      {/* Skip content link (handled by Layout) */}

      {/* HERO */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden bg-gradient-to-br from-[#EEF0FB] via-white to-[#E6F7F5]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <Badge variant="primary" className="mb-6">{APP_SCOPE} · {GRADE_RANGE}</Badge>
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-text-primary leading-tight mb-5 tracking-tight"
              >
                La carpeta docente<br />
                <span className="text-brand-primary">inteligente</span> para la<br />
                Primaria PBA
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed mb-8 max-w-lg">
                Planificá, creá materiales, encontrá recursos y hacé el seguimiento
                de tus alumnos con respaldo curricular verificable.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  asChild
                >
                  <Link to="/panel">Ver el panel docente</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/demo">Explorar componentes</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
                {['Sin tarjeta requerida', 'Prototipo gratuito', 'WCAG 2.2 AA'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Product mockup */}
            <div aria-hidden="true" className="hidden lg:block">
              <div className="rounded-2xl border border-border-default shadow-xl bg-surface-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default bg-surface-bg">
                  <div className="flex gap-1.5">
                    {['bg-red-400','bg-amber-400','bg-green-400'].map(c => (
                      <div key={c} className={`h-3 w-3 rounded-full ${c}`} />
                    ))}
                  </div>
                  <div className="flex-1 h-6 rounded-md bg-border-default mx-2" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary-light flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">Próxima clase</p>
                      <p className="text-xs text-text-secondary">Hoy · Lunes 9:00 hs</p>
                    </div>
                    <Badge variant="success" className="ml-auto" size="sm">Lista</Badge>
                  </div>
                  <div className="rounded-xl bg-surface-bg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-text-primary">Matemática</span>
                      <Badge variant="primary" size="sm">3.° B</Badge>
                    </div>
                    <p className="text-xs text-text-secondary">Fracciones equivalentes — Secuencia 4, Clase 2</p>
                    <div className="flex gap-2 pt-1">
                      {['Planificación', 'Ficha alumno', 'Solucionario'].map((item) => (
                        <span key={item} className="text-xs bg-white border border-border-default text-text-secondary rounded-md px-2 py-0.5">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Contenidos cubiertos', val: '68%', color: 'text-status-success' },
                      { label: 'Clases dadas', val: '24', color: 'text-brand-primary' },
                      { label: 'Materiales creados', val: '41', color: 'text-teal-700' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="rounded-xl bg-white p-3 text-center">
                        <p className={`text-lg font-bold ${color}`}>{val}</p>
                        <p className="text-xs text-text-muted mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-text-muted">Interfaz simulada · Datos ficticios · Prototipo v{APP_VERSION}</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="how-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="how-heading" className="text-3xl font-bold text-text-primary mb-3">
              Diseñado para ahorrar tiempo real
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Cada función tiene un propósito concreto. Sin funciones innecesarias,
              sin suscripciones a servicios que no usás.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Seleccionás grado y área',
                desc: 'El sistema conoce el Diseño Curricular DGCyE 2018. No tenés que buscar ni copiar nada.',
              },
              {
                step: '02',
                title: 'Generás el material',
                desc: 'Fichas, evaluaciones, cuadernillos, dictados. Listos para imprimir en A4, con solucionario separado.',
              },
              {
                step: '03',
                title: 'Seguís el progreso',
                desc: 'Registrás qué contenidos se dieron, quiénes necesitan refuerzo y qué falta cubrir antes de fin de año.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-5xl font-black text-text-muted mb-4" aria-hidden="true">{step}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section aria-labelledby="features-heading" className="py-20 bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="features-heading" className="text-3xl font-bold text-text-primary mb-3">
              Todo lo que necesitás en un lugar
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Siete pilares pedagógicos. Ninguna función de relleno.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-border-default hover:border-brand-primary/30 transition-colors">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 PILLARS */}
      <section aria-labelledby="pillars-heading" className="py-16 bg-white border-y border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="pillars-heading" className="sr-only">Siete pilares pedagógicos</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {PILLARS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center w-20">
                <div className="h-12 w-12 rounded-2xl bg-brand-primary-light flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                </div>
                <span className="text-xs font-medium text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section aria-labelledby="testimonials-heading" className="py-20 bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-2xl font-bold text-text-primary mb-2">
              Lo que dicen las docentes
            </h2>
            <p className="text-sm text-text-secondary">
              Testimonios simulados · Datos ficticios · No representan resultados reales
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-white rounded-2xl p-6 border border-border-default">
                <div className="flex gap-0.5 mb-4" role="img" aria-label="5 estrellas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand-accent text-brand-accent" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-sm text-text-secondary leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-primary-light flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand-primary" aria-hidden="true">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-heading" className="py-20 bg-brand-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold text-white mb-4">
            Probá el prototipo ahora
          </h2>
          <p className="text-brand-primary-light text-lg mb-8">
            Navegá el panel docente, la biblioteca y el generador de actividades.
            Todo con datos simulados, sin registrarte.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              asChild
            >
              <Link to="/panel">Abrir panel docente</Link>
            </Button>
            <Button
              className="hover:bg-white/10 text-white border-white/40 border"
              variant="outline"
              size="lg"
              asChild
            >
              <Link to="/alumno">Portal del alumno</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
