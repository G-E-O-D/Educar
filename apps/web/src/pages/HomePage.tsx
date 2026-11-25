import { Link } from 'react-router-dom';
import {
  BookOpen, CalendarCheck, Users, FileText,
  BarChart3, MessageSquare, ArrowRight, Clock,
  BookMarked, Image, FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { APP_VERSION, APP_SCOPE, GRADE_RANGE } from '@educar/shared';
import type { Module, FictionalClass, FictionalMaterial } from '@/types';

const MODULES: Module[] = [
  { id: 'planning',   name: 'Planificación curricular',    description: 'Organizá tus unidades didácticas, secuencias y planes de clase.', icon: 'BookOpen',    status: 'coming-soon' },
  { id: 'grades',     name: 'Libro de calificaciones',     description: 'Registrá evaluaciones y seguí el progreso de cada alumno.',       icon: 'BarChart3',   status: 'coming-soon' },
  { id: 'comms',      name: 'Comunicación con familias',   description: 'Enviá circulares y notificaciones a las familias.',               icon: 'MessageSquare', status: 'coming-soon' },
  { id: 'attendance', name: 'Seguimiento de asistencia',   description: 'Registrá asistencia diaria y generá reportes mensuales.',         icon: 'CalendarCheck', status: 'coming-soon' },
  { id: 'materials',  name: 'Recursos y materiales',       description: 'Organizá archivos, actividades y recursos por área y año.',       icon: 'FileText',    status: 'coming-soon' },
  { id: 'reports',    name: 'Informes y estadísticas',     description: 'Generá informes de evaluación y progreso grupal.',                icon: 'Users',       status: 'coming-soon' },
];

const ICONS: Record<string, React.ElementType> = {
  BookOpen, BarChart3, MessageSquare, CalendarCheck, FileText, Users,
};

const FICTIONAL_CLASS: FictionalClass = {
  subject: 'Matemática',
  grade: '3.°',
  section: 'B',
  day: 'Lunes',
  time: '09:00 – 09:40',
  topic: 'Fracciones equivalentes',
};

const FICTIONAL_MATERIALS: FictionalMaterial[] = [
  { title: 'Guía de fracciones equivalentes', type: 'PDF',      subject: 'Matemática',          gradeSection: '3.° B' },
  { title: 'Mapa del tiempo: otoño',           type: 'Imagen',   subject: 'Ciencias Naturales',  gradeSection: '4.° A' },
  { title: 'Actividad: escritura creativa',    type: 'Documento', subject: 'Lengua',              gradeSection: '2.° C' },
];

const materialIcons: Record<FictionalMaterial['type'], React.ElementType> = {
  PDF: BookMarked, Imagen: Image, Documento: FileEdit, Video: FileText,
};

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="bg-surface-bg border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="mb-5">{APP_SCOPE} · {GRADE_RANGE}</Badge>
              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-4"
              >
                La plataforma docente para la{' '}
                <span className="text-brand-primary">Primaria PBA</span>
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
                Organizá tu práctica docente, planificá clases y hacé seguimiento
                de tus alumnos en un único lugar. Actualmente en etapa de prototipo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  asChild
                >
                  <Link to="/demo">Ver demostración</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#modulos">Explorar módulos</a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                <Badge variant="default">v{APP_VERSION}</Badge>
                <Badge variant="warning">Prototipo · No usar con datos reales</Badge>
              </div>
            </div>

            {/* Hero visual decoration */}
            <div aria-hidden="true" className="hidden lg:block">
              <Card variant="elevated" className="p-6 max-w-sm mx-auto rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-primary-light flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">Próxima clase</p>
                    <p className="text-xs text-text-secondary">Hoy · Lunes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border-default">
                    <span className="text-sm font-medium text-text-primary">Matemática</span>
                    <Badge variant="primary" size="sm">3.° B</Badge>
                  </div>
                  <p className="text-sm text-text-secondary">Fracciones equivalentes</p>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary pt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>09:00 – 09:40</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <div className="bg-surface-card border-b border-border-default" role="complementary" aria-label="Información de la plataforma">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            {[
              { label: 'Nivel', value: 'Primaria' },
              { label: 'Jurisdicción', value: 'Provincia de Buenos Aires' },
              { label: 'Grados', value: GRADE_RANGE },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <dt className="text-text-secondary">{label}:</dt>
                <dd className="font-medium text-text-primary">{value}</dd>
              </div>
            ))}
            <div className="flex gap-2">
              <dt className="text-text-secondary">Estado:</dt>
              <dd className="font-medium text-brand-primary">Prototipo v{APP_VERSION}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Próxima clase ficticia */}
        <section aria-labelledby="proxima-clase-heading">
          <h2 id="proxima-clase-heading" className="text-xl font-bold text-text-primary mb-4">
            Próxima clase
          </h2>
          <Alert variant="warning" className="mb-4">
            Los datos mostrados a continuación son <strong>completamente ficticios</strong> y solo
            ilustran el diseño del sistema. No representan información real de alumnos ni docentes.
          </Alert>
          <Card variant="default" className="max-w-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-text-primary text-lg">{FICTIONAL_CLASS.subject}</h3>
                    <Badge variant="primary">
                      {FICTIONAL_CLASS.grade} {FICTIONAL_CLASS.section}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{FICTIONAL_CLASS.day} · {FICTIONAL_CLASS.time}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-3">
                <span className="font-medium text-text-primary">Tema: </span>
                {FICTIONAL_CLASS.topic}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled aria-label="Ver planificación (no disponible)">
                  Ver planificación
                </Button>
                <Button variant="ghost" size="sm" disabled aria-label="Ver materiales (no disponible)">
                  Ver materiales
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Materiales recientes ficticios */}
        <section aria-labelledby="materiales-heading">
          <h2 id="materiales-heading" className="text-xl font-bold text-text-primary mb-4">
            Materiales recientes
          </h2>
          <Alert variant="warning" className="mb-4">
            Datos ficticios para ilustrar el diseño. No representan archivos reales.
          </Alert>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FICTIONAL_MATERIALS.map((mat) => {
              const Icon = materialIcons[mat.type];
              return (
                <Card key={mat.title} variant="default" className="flex flex-col">
                  <CardContent className="pt-5 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-surface-bg flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-brand-secondary" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary text-sm leading-snug mb-1">{mat.title}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" size="sm">{mat.type}</Badge>
                          <Badge variant="default" size="sm">{mat.subject}</Badge>
                          <Badge variant="default" size="sm">{mat.gradeSection}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Módulos en desarrollo */}
        <section id="modulos" aria-labelledby="modulos-heading">
          <div className="mb-6">
            <h2 id="modulos-heading" className="text-xl font-bold text-text-primary mb-1">
              Módulos en desarrollo
            </h2>
            <p className="text-text-secondary text-sm">
              Estas funcionalidades se incorporarán progresivamente. Ninguna está disponible en esta etapa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((mod) => {
              const Icon = ICONS[mod.icon] ?? BookOpen;
              return (
                <Card
                  key={mod.id}
                  variant="default"
                  className="flex flex-col hover:border-border-strong transition-colors"
                >
                  <CardContent className="pt-5 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-surface-bg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                      </div>
                      <Badge variant="outline" size="sm">Próximamente</Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary text-sm mb-1">{mod.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{mod.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-brand-primary-light rounded-2xl p-8 text-center" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-xl font-bold text-text-primary mb-2">
            ¿Querés ver los componentes de diseño?
          </h2>
          <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
            Explorá el catálogo de componentes reutilizables de la plataforma: botones, tarjetas,
            formularios, alertas y más.
          </p>
          <Button
            variant="primary"
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            asChild
          >
            <Link to="/demo">Ver catálogo de componentes</Link>
          </Button>
        </section>
      </div>
    </>
  );
}
