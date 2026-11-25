import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Sparkles, BarChart3,
  CalendarCheck, Users, Shield, CheckCircle2,
  FileText, Lightbulb, Clock,
  Lock, Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { APP_SCOPE, GRADE_RANGE, APP_VERSION } from '@educar/shared';

const FEATURES_AVAILABLE = [
  {
    icon: Sparkles,
    title: 'Generador de actividades',
    desc: 'Creá fichas, dictados, evaluaciones y cuadernillos. Vista previa simulada — el motor curricular real llega en Etapa 02.',
    color: 'bg-brand-secondary-light text-teal-700',
  },
  {
    icon: BookOpen,
    title: 'Biblioteca de recursos',
    desc: 'Catálogo organizado por grado y área con cuentos, fichas, videos y audios. Datos ficticios en este prototipo.',
    color: 'bg-amber-50 text-amber-700',
  },
  {
    icon: BarChart3,
    title: 'Seguimiento pedagógico',
    desc: 'Visualizá cobertura curricular, actividades completadas y quiénes necesitan acompañamiento. Datos ficticios.',
    color: 'bg-brand-primary-light text-brand-primary',
  },
  {
    icon: Users,
    title: 'Portal del alumno',
    desc: 'Ejercicios autocorregibles con modo tranquilo y apoyos de accesibilidad. Sin almacenamiento de datos en este prototipo.',
    color: 'bg-brand-secondary-light text-teal-700',
  },
];

const FEATURES_PLANNED = [
  {
    icon: FileText,
    title: 'Planificación curricular',
    desc: 'Organizá unidades didácticas con respaldo en el Diseño Curricular DGCyE 2018. Auditoría de cobertura y trazabilidad oficial.',
    color: 'bg-surface-bg text-text-secondary',
  },
  {
    icon: CalendarCheck,
    title: 'Agenda y calendario',
    desc: 'Clases según el calendario escolar oficial, replanificación automática y paquete “Preparar mi clase”.',
    color: 'bg-surface-bg text-text-secondary',
  },
  {
    icon: Lightbulb,
    title: 'Laboratorios y herramientas',
    desc: 'Juegos, atlas, experimentos, actos escolares, comunicaciones familiares y más.',
    color: 'bg-surface-bg text-text-secondary',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Elegí grado y área',
    desc: 'Seleccioná el curso y la materia. El sistema ya conoce el Diseño Curricular oficial.',
    icon: BookOpen,
  },
  {
    step: '02',
    title: 'Configurá el material',
    desc: 'Tipo de actividad, cantidad, dificultad, apoyos de accesibilidad y formato de impresión.',
    icon: Wrench,
  },
  {
    step: '03',
    title: 'Revisá y exportá',
    desc: 'Vista previa antes de descargar. DOCX y PDF listos para imprimir o compartir.',
    icon: CheckCircle2,
  },
  {
    step: '04',
    title: 'Seguimiento automático',
    desc: 'El sistema registra qué contenidos trabajaste y te avisa cuándo retomar.',
    icon: Clock,
  },
];

const INCLUSIVE_AVAILABLE = [
  'Instrucciones directas y una consigna por vez',
  'Tipografía ampliada e interlineado',
  'Modo tranquilo en portal alumno (menos estímulos)',
  'Atributos ARIA y navegación por teclado',
];

const INCLUSIVE_PLANNED = [
  'Adaptaciones automáticas con aprobación docente',
  'Pictogramas y agendas visuales',
  'Configuraciones de apoyo por alumno',
  'Lectura en voz alta y alternativas de respuesta',
];

export function LandingPage() {
  return (
    <div className="bg-surface-bg">

      {/* HERO */}
      <section className="pt-16 pb-20 px-4 sm:px-6 max-w-7xl mx-auto" aria-labelledby="hero-heading">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="primary" size="sm">Prototipo local — sin datos reales</Badge>
              <Badge variant="default" size="sm">Diseño Curricular DGCyE 2018</Badge>
              <Badge variant="default" size="sm">WCAG 2.2 AA en progreso</Badge>
            </div>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-6"
            >
              La carpeta docente inteligente para la{' '}
              <span className="text-brand-primary">Educación Primaria bonaerense</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              Planificá, encontrá recursos, prepará clases y registrá el avance de tu grupo. {APP_SCOPE} &middot; {GRADE_RANGE}.
            </p>
            <p className="text-sm text-text-secondary mb-8">
              Versión {APP_VERSION} &middot; Todos los datos son simulados &middot; Sin conexión a servicios externos
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                asChild
              >
                <Link to="/panel">Ver el panel docente</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/alumno">Portal del alumno</Link>
              </Button>
            </div>
          </div>

          {/* Mockup didáctico */}
          <div className="hidden lg:block" aria-hidden="true">
            <div className="bg-white rounded-3xl shadow-xl border border-border-default p-6 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-status-error opacity-70" />
                <div className="h-3 w-3 rounded-full bg-status-warning opacity-70" />
                <div className="h-3 w-3 rounded-full bg-status-success opacity-70" />
                <span className="text-xs text-text-secondary ml-2">Ficha de trabajo &mdash; Fracciones equivalentes</span>
              </div>
              <div className="bg-brand-primary-light rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide mb-1">Matemática &middot; 3.° Grado B</p>
                <p className="text-sm font-bold text-text-primary">Fracciones equivalentes</p>
              </div>
              <div className="space-y-3">
                <div className="bg-surface-bg rounded-lg p-3 border border-border-default">
                  <p className="text-xs text-text-secondary mb-2 font-medium">1. ¿Cuál de estas fracciones es equivalente a 1/2?</p>
                  <div className="flex gap-2">
                    {['1/3', '2/4', '3/8', '2/5'].map((opt, i) => (
                      <span key={opt} className={`text-xs px-2 py-1 rounded-md border ${i === 1 ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-border-default text-text-secondary'}`}>
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-bg rounded-lg p-3 border border-border-default">
                  <p className="text-xs text-text-secondary font-medium">2. Completá: 2/4 = …/8 = …/12</p>
                  <div className="flex gap-2 mt-1.5">
                    <div className="flex-1 h-6 bg-white border border-border-default rounded" />
                    <div className="flex-1 h-6 bg-white border border-border-default rounded" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-text-secondary">Generado con respaldo DGCyE 2018</span>
                <Badge variant="success" size="sm">Lista</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISPONIBLE EN EL PROTOTIPO */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-labelledby="available-heading">
        <div className="text-center mb-10">
          <h2 id="available-heading" className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            Disponible en el prototipo
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Estas funciones están implementadas y navegables en esta versión local. Los datos son ficticios.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES_AVAILABLE.map((f) => (
            <div key={f.title} className="bg-surface-card rounded-2xl border border-border-default p-5 hover:shadow-sm transition-shadow">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
                <f.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EN DESARROLLO */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-labelledby="planned-heading">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="h-5 w-5 text-text-secondary" aria-hidden="true" />
            <h2 id="planned-heading" className="text-2xl sm:text-3xl font-bold text-text-primary">
              En desarrollo
            </h2>
          </div>
          <p className="text-text-secondary max-w-xl mx-auto">
            Funciones planificadas para etapas siguientes, sujetas a aprobación del propietario.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES_PLANNED.map((f) => (
            <div key={f.title} className="relative bg-surface-card rounded-2xl border border-dashed border-border-strong p-6">
              <div className="absolute top-3 right-3">
                <Lock className="h-3.5 w-3.5 text-text-secondary" aria-hidden="true" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-surface-bg flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
              <Badge variant="default" size="sm" className="mt-3">Proyectado</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto bg-surface-card rounded-3xl border border-border-default" aria-labelledby="how-heading">
        <div className="text-center mb-10">
          <h2 id="how-heading" className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            Cómo funciona
          </h2>
          <p className="text-text-secondary">El flujo de trabajo pensado para ahorrar tiempo real.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-brand-primary">{step.step}</span>
                <div className="h-8 w-8 rounded-lg bg-brand-primary-light flex items-center justify-center">
                  <step.icon className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                </div>
              </div>
              <h3 className="font-semibold text-text-primary mb-1 text-sm">{step.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCACIÓN INCLUSIVA */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-labelledby="inclusive-heading">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-brand-primary" aria-hidden="true" />
              <h2 id="inclusive-heading" className="text-2xl font-bold text-text-primary">
                Educación inclusiva transversal
              </h2>
            </div>
            <p className="text-text-secondary mb-6 leading-relaxed">
              La accesibilidad no es un módulo separado. Está integrada en cada actividad, desde el diseño. Basado en DUA (CAST), Resolución PBA 1664/17 y CFE 311/16.
            </p>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-text-primary mb-2">Disponible ahora</p>
                <ul className="space-y-2">
                  {INCLUSIVE_AVAILABLE.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4 w-4 text-status-success shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-2">En desarrollo</p>
                <ul className="space-y-2">
                  {INCLUSIVE_PLANNED.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Lock className="h-4 w-4 text-border-strong shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-surface-card rounded-2xl border border-border-default p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-brand-accent" aria-hidden="true" />
              <h3 className="font-semibold text-text-primary">Generador de actividades inclusivas</h3>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Configuraciones de apoyo disponibles en el generador del prototipo:
            </p>
            <div className="space-y-2">
              {[
                'Consignas simplificadas',
                'Tipografía ampliada',
                'Reducción de distractores visuales',
                'Opciones de respuesta alternativas',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-surface-bg rounded-lg px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-success shrink-0" aria-hidden="true" />
                  <span className="text-xs text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/actividades">Explorar el generador</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 sm:px-6 text-center" aria-labelledby="cta-heading">
        <div className="max-w-2xl mx-auto">
          <h2 id="cta-heading" className="text-3xl font-bold text-text-primary mb-4">
            Recorré el prototipo
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Todas las páginas son navegables. Los datos son ficticios. No se requiere registro ni conexión a internet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              asChild
            >
              <Link to="/panel">Ver el panel docente</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/demo">Ver diseño del sistema</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
