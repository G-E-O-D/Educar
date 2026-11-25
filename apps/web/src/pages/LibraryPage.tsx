import { useState } from 'react';
import { Search, BookOpen, FileText, Video, Mic, Filter, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type ResourceType = 'all' | 'texto' | 'ficha' | 'video' | 'audio';
type Grade = 'all' | '1' | '2' | '3' | '4' | '5' | '6';
type Area = 'all' | 'matematica' | 'lenguaje' | 'ciencias' | 'sociales';

interface Resource {
  id: string;
  title: string;
  author: string;
  area: Exclude<Area, 'all'>;
  grade: Exclude<Grade, 'all'>[];
  type: Exclude<ResourceType, 'all'>;
  license: string;
  licenseUse: string;
  source: string;
  tags: string[];
  excerpt: string;
}

const RESOURCES: Resource[] = [
  {
    id: 'r1', title: 'El patito feo — versión adaptada nivel 1',
    author: 'Dominio público', area: 'lenguaje', grade: ['1', '2'],
    type: 'texto', license: 'CC0', licenseUse: 'Uso libre, sin restricciones',
    source: 'Biblioteca Digital CRA',
    tags: ['cuento', 'comprensión lectora', 'valores'],
    excerpt: 'El patito feo nació diferente a sus hermanos. Al principio nadie lo quería...',
  },
  {
    id: 'r2', title: 'Fracciones en la vida cotidiana',
    author: 'Educar Argentina', area: 'matematica', grade: ['3', '4'],
    type: 'ficha', license: 'CC BY', licenseUse: 'Requiere atribución al autor',
    source: 'Portal Educ.ar',
    tags: ['fracciones', 'vida cotidiana', 'ejercicios'],
    excerpt: 'Fichas con situaciones de la vida cotidiana para trabajar fracciones equivalentes...',
  },
  {
    id: 'r3', title: 'El ciclo del agua — animación interactiva',
    author: 'Ministerio de Educación PBA', area: 'ciencias', grade: ['3', '4', '5'],
    type: 'video', license: 'CC BY-SA', licenseUse: 'Atribución y compartir igual',
    source: 'ABC Digital PBA',
    tags: ['agua', 'ciclo', 'naturaleza', 'animación'],
    excerpt: 'Animación de 4 minutos que muestra el ciclo del agua paso a paso, con pausas para reflexión.',
  },
  {
    id: 'r4', title: 'Trabalenguas para trabajar la R doble',
    author: 'Dominio público', area: 'lenguaje', grade: ['1', '2', '3'],
    type: 'audio', license: 'CC0', licenseUse: 'Uso libre, sin restricciones',
    source: 'Colección folklórica argentina',
    tags: ['oralidad', 'fonología', 'trabalenguas'],
    excerpt: 'Colección de trabalenguas tradicionales para trabajar la pronunciación de la R doble.',
  },
  {
    id: 'r5', title: 'Los Pueblos Originarios de Argentina',
    author: 'CONICET / MEN', area: 'sociales', grade: ['4', '5', '6'],
    type: 'texto', license: 'CC BY-NC', licenseUse: 'No uso comercial — verificar antes de adaptar',
    source: 'Portal Educ.ar',
    tags: ['diversidad cultural', 'pueblos originarios', 'historia'],
    excerpt: 'Texto de divulgación sobre los principales pueblos originarios y sus territorios actuales.',
  },
  {
    id: 'r6', title: 'Multiplicación por 2 y 3 — Ficha con guía',
    author: 'Educar Argentina', area: 'matematica', grade: ['2', '3'],
    type: 'ficha', license: 'CC BY', licenseUse: 'Requiere atribución al autor',
    source: 'Portal Educ.ar',
    tags: ['multiplicación', 'tablas', 'ejercicios', 'guía docente'],
    excerpt: 'Ficha de ejercitación con guía docente y solucionario. Lista para imprimir en A4.',
  },
  {
    id: 'r7', title: 'Noticias del barrio — taller de escritura',
    author: 'Universidad Nacional de La Plata', area: 'lenguaje', grade: ['5', '6'],
    type: 'ficha', license: 'CC BY-SA', licenseUse: 'Atribución y compartir igual',
    source: 'FaHCE-UNLP',
    tags: ['escritura', 'noticias', 'género textual', 'taller'],
    excerpt: 'Propuesta de taller para escribir noticias sobre el barrio. Incluye modelo y rúbrica.',
  },
  {
    id: 'r8', title: 'Las plantas y la fotosíntesis',
    author: 'Ministerio de Educación PBA', area: 'ciencias', grade: ['4', '5'],
    type: 'video', license: 'CC BY', licenseUse: 'Requiere atribución al autor',
    source: 'ABC Digital PBA',
    tags: ['plantas', 'fotosíntesis', 'biología', 'experimento'],
    excerpt: 'Video explicativo de 6 minutos seguido de una propuesta de experimento casero.',
  },
];

const TYPE_META: Record<Exclude<ResourceType, 'all'>, { icon: React.ElementType; label: string; color: string; cardColor: string }> = {
  texto: { icon: BookOpen,  label: 'Texto/Cuento', color: 'bg-brand-primary-light text-brand-primary',    cardColor: 'border-indigo-200 bg-indigo-50/30'    },
  ficha: { icon: FileText,  label: 'Ficha',        color: 'bg-amber-50 text-amber-700',                   cardColor: 'border-amber-200 bg-amber-50/30'       },
  video: { icon: Video,     label: 'Video',        color: 'bg-brand-secondary-light text-teal-700',       cardColor: 'border-teal-200 bg-teal-50/30'         },
  audio: { icon: Mic,       label: 'Audio',        color: 'bg-status-success-bg text-status-success',     cardColor: 'border-green-200 bg-green-50/30'       },
};

const LICENSE_COLORS: Record<string, string> = {
  CC0:       'bg-status-success-bg text-status-success',
  'CC BY':   'bg-brand-primary-light text-brand-primary',
  'CC BY-SA':'bg-brand-secondary-light text-teal-700',
  'CC BY-NC':'bg-amber-50 text-amber-700',
};

export function LibraryPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType>('all');
  const [gradeFilter, setGradeFilter] = useState<Grade>('all');
  const [areaFilter, setAreaFilter] = useState<Area>('all');

  const filtered = RESOURCES.filter((r) => {
    const matchQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.tags.some(t => t.includes(query.toLowerCase()));
    const matchType  = typeFilter === 'all' || r.type === typeFilter;
    const matchGrade = gradeFilter === 'all' || r.grade.includes(gradeFilter as Exclude<Grade, 'all'>);
    const matchArea  = areaFilter === 'all' || r.area === areaFilter;
    return matchQuery && matchType && matchGrade && matchArea;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
        <p className="text-text-secondary text-sm flex-1">
          {RESOURCES.length} recursos con fuentes documentadas.
          <span className="text-text-secondary ml-1">
            Registros ficticios — licencias indicadas pero no verificadas comercialmente en este prototipo.
          </span>
        </p>
        <Badge variant="warning" size="sm">Datos ficticios</Badge>
      </div>

      {/* Search + filters */}
      <div className="bg-surface-card rounded-2xl border border-border-default p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por título, etiqueta, tema..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-border-default bg-surface-bg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
            aria-label="Buscar recursos"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-start">
          <Filter className="h-4 w-4 text-text-muted shrink-0 mt-1" aria-hidden="true" />

          <fieldset>
            <legend className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Tipo</legend>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'texto', 'ficha', 'video', 'audio'] as ResourceType[]).map((t) => {
                const meta = t !== 'all' ? TYPE_META[t] : null;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      typeFilter === t
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-surface-bg border-border-default text-text-secondary hover:border-brand-primary/50'
                    }`}
                    aria-pressed={typeFilter === t}
                  >
                    {meta && <meta.icon className="h-3 w-3" aria-hidden="true" />}
                    {t === 'all' ? 'Todos' : meta?.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Grado</legend>
            <div className="flex flex-wrap gap-1.5">
              {(['all', '1', '2', '3', '4', '5', '6'] as Grade[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    gradeFilter === g
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-bg border-border-default text-text-secondary hover:border-brand-primary/50'
                  }`}
                  aria-pressed={gradeFilter === g}
                >
                  {g === 'all' ? 'Todos' : `${g}.°`}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Área</legend>
            <div className="flex flex-wrap gap-1.5">
              {([
                { val: 'all',       label: 'Todas' },
                { val: 'matematica',label: 'Matemática' },
                { val: 'lenguaje',  label: 'Prac. Lenguaje' },
                { val: 'ciencias',  label: 'Cs. Naturales' },
                { val: 'sociales',  label: 'Cs. Sociales' },
              ] as { val: Area; label: string }[]).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setAreaFilter(val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    areaFilter === val
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-bg border-border-default text-text-secondary hover:border-brand-primary/50'
                  }`}
                  aria-pressed={areaFilter === val}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Announcement live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {filtered.length} resultados
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="font-medium">Sin resultados</p>
          <p className="text-sm mt-1">Probá con otros términos o filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Resultados de búsqueda">
          {filtered.map((r) => {
            const meta = TYPE_META[r.type];
            const Icon = meta.icon;
            const licenseClass = LICENSE_COLORS[r.license] ?? 'bg-surface-bg text-text-secondary';
            return (
              <article
                key={r.id}
                role="listitem"
                className={`rounded-2xl border p-5 flex flex-col hover:shadow-sm transition-shadow ${meta.cardColor}`}
              >
                {/* Header con tipo de recurso diferenciado */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Badge className={`text-xs ${meta.color} border-0 px-2`} size="sm">{meta.label}</Badge>
                      <Badge className={`text-xs ${licenseClass} border-0 px-2`} size="sm">
                        {r.license}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-text-primary text-sm leading-snug">{r.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-3 flex-1">{r.excerpt}</p>

                {/* Metadata */}
                <div className="space-y-1 mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {r.grade.map((g) => (
                      <span key={g} className="text-xs text-text-muted bg-white/60 rounded-md px-1.5 py-0.5 border border-border-default">
                        {g}.° grado
                      </span>
                    ))}
                    <span className="text-xs text-text-muted bg-white/60 rounded-md px-1.5 py-0.5 border border-border-default capitalize">
                      {r.area === 'lenguaje' ? 'Prac. Lenguaje' : r.area}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {r.author} · {r.source}
                  </p>
                  <p className="text-xs text-amber-700 italic">{r.licenseUse}</p>
                </div>

                {/* Acciones diferenciadas */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />} className="flex-1 text-xs">
                    Consultar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
                    className="flex-1 text-xs text-brand-primary hover:bg-brand-primary-light"
                    aria-label={`Generar actividad con ${r.title}`}
                  >
                    Actividad
                  </Button>
                </div>
                <p className="text-xs text-text-secondary text-center mt-2">
                  Descarga y actividades: simuladas en este prototipo
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
