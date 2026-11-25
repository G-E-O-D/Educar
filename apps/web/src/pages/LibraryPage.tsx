import { useState } from 'react';
import { Search, BookOpen, FileText, Video, Mic, Filter, ExternalLink, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

type ResourceType = 'all' | 'texto' | 'ficha' | 'video' | 'audio';
type Grade = 'all' | '1' | '2' | '3' | '4' | '5' | '6';
type Area = 'all' | 'matematica' | 'lengua' | 'ciencias' | 'sociales';

interface Resource {
  id: string;
  title: string;
  author: string;
  area: Exclude<Area, 'all'>;
  grade: Exclude<Grade, 'all'>[];
  type: Exclude<ResourceType, 'all'>;
  license: string;
  source: string;
  tags: string[];
  excerpt: string;
}

const RESOURCES: Resource[] = [
  {
    id: 'r1', title: 'El patito feo — versión adaptada nivel 1',
    author: 'Dominio público', area: 'lengua', grade: ['1', '2'],
    type: 'texto', license: 'CC0', source: 'Biblioteca Digital CRA',
    tags: ['cuento', 'comprensión lectora', 'valores'],
    excerpt: 'El patito feo nació diferente a sus hermanos. Al principio nadie lo quería...',
  },
  {
    id: 'r2', title: 'Fracciones en la vida cotidiana',
    author: 'Educar Argentina', area: 'matematica', grade: ['3', '4'],
    type: 'ficha', license: 'CC BY', source: 'Portal Educ.ar',
    tags: ['fracciones', 'vida cotidiana', 'ejercicios'],
    excerpt: 'Fichas con situaciones de la vida cotidiana para trabajar fracciones equivalentes...',
  },
  {
    id: 'r3', title: 'El ciclo del agua — animación interactiva',
    author: 'Ministerio de Educación PBA', area: 'ciencias', grade: ['3', '4', '5'],
    type: 'video', license: 'CC BY-SA', source: 'ABC Digital PBA',
    tags: ['agua', 'ciclo', 'naturaleza', 'animación'],
    excerpt: 'Animación de 4 minutos que muestra el ciclo del agua paso a paso, con pausas para reflexión.',
  },
  {
    id: 'r4', title: 'Trabalenguas para trabajar la R doble',
    author: 'Dominio público', area: 'lengua', grade: ['1', '2', '3'],
    type: 'audio', license: 'CC0', source: 'Colección folklórica argentina',
    tags: ['oralidad', 'fonología', 'trabalenguas'],
    excerpt: 'Colección de trabalenguas tradicionales para trabajar la pronunciación de la R doble.',
  },
  {
    id: 'r5', title: 'Los Pueblos Originarios de Argentina',
    author: 'CONICET / MEN', area: 'sociales', grade: ['4', '5', '6'],
    type: 'texto', license: 'CC BY-NC', source: 'Portal Educ.ar',
    tags: ['diversidad cultural', 'pueblos originarios', 'historia'],
    excerpt: 'Texto de divulgación sobre los principales pueblos originarios y sus territorios actuales.',
  },
  {
    id: 'r6', title: 'Multiplicación por 2 y 3 — Ficha con guía',
    author: 'Educar Argentina', area: 'matematica', grade: ['2', '3'],
    type: 'ficha', license: 'CC BY', source: 'Portal Educ.ar',
    tags: ['multiplicación', 'tablas', 'ejercicios', 'guía docente'],
    excerpt: 'Ficha de ejercitación con guía docente y solucionario. Lista para imprimir en A4.',
  },
  {
    id: 'r7', title: 'Noticias del barrio — taller de escritura',
    author: 'Universidad Nacional de La Plata', area: 'lengua', grade: ['5', '6'],
    type: 'ficha', license: 'CC BY-SA', source: 'FaHCE-UNLP',
    tags: ['escritura', 'noticias', 'género textual', 'taller'],
    excerpt: 'Propuesta de taller para escribir noticias sobre el barrio. Incluye modelo y rúbrica.',
  },
  {
    id: 'r8', title: 'Las plantas y la fotosíntesis',
    author: 'Ministerio de Educación PBA', area: 'ciencias', grade: ['4', '5'],
    type: 'video', license: 'CC BY', source: 'ABC Digital PBA',
    tags: ['plantas', 'fotosíntesis', 'biología', 'experimento'],
    excerpt: 'Video explicativo de 6 minutos seguido de una propuesta de experimento casero.',
  },
];

const TYPE_ICONS: Record<Exclude<ResourceType, 'all'>, React.ElementType> = {
  texto: FileText,
  ficha: BookOpen,
  video: Video,
  audio: Mic,
};

const LICENSE_COLORS: Record<string, string> = {
  CC0: 'bg-status-success-bg text-status-success',
  'CC BY': 'bg-brand-primary-light text-brand-primary',
  'CC BY-SA': 'bg-brand-secondary-light text-teal-700',
  'CC BY-NC': 'bg-amber-50 text-amber-700',
};

export function LibraryPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType>('all');
  const [gradeFilter, setGradeFilter] = useState<Grade>('all');
  const [areaFilter, setAreaFilter] = useState<Area>('all');

  const filtered = RESOURCES.filter((r) => {
    const matchQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.tags.some(t => t.includes(query.toLowerCase()));
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchGrade = gradeFilter === 'all' || r.grade.includes(gradeFilter as Exclude<Grade, 'all'>);
    const matchArea = areaFilter === 'all' || r.area === areaFilter;
    return matchQuery && matchType && matchGrade && matchArea;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-text-secondary text-sm">
          {RESOURCES.length} recursos con licencias verificadas. Organizados por grado y área.
        </p>
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

        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-text-muted shrink-0" aria-hidden="true" />

          <fieldset>
            <legend className="sr-only">Tipo de recurso</legend>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'texto', 'ficha', 'video', 'audio'] as ResourceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    typeFilter === t
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-bg border-border-default text-text-secondary hover:border-brand-primary/50'
                  }`}
                  aria-pressed={typeFilter === t}
                >
                  {t === 'all' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="sr-only">Grado</legend>
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
            <legend className="sr-only">Área</legend>
            <div className="flex flex-wrap gap-1.5">
              {([
                { val: 'all', label: 'Todas' },
                { val: 'matematica', label: 'Matemática' },
                { val: 'lengua', label: 'Lengua' },
                { val: 'ciencias', label: 'Ciencias' },
                { val: 'sociales', label: 'Sociales' },
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

      {/* Results */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
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
            const Icon = TYPE_ICONS[r.type];
            const licenseClass = LICENSE_COLORS[r.license] ?? 'bg-surface-bg text-text-secondary';
            return (
              <article
                key={r.id}
                role="listitem"
                className="bg-surface-card rounded-2xl border border-border-default p-5 flex flex-col hover:border-brand-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-primary-light flex items-center justify-center shrink-0">
                    <Icon className="h-4.5 w-4.5 text-brand-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1">{r.title}</h3>
                    <p className="text-xs text-text-muted">{r.author}</p>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">{r.excerpt}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-default">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${licenseClass}`}>
                      {r.license}
                    </span>
                    <span className="text-xs text-text-muted">· {r.source}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" aria-label={`Descargar ${r.title}`}>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={`Ver fuente de ${r.title}`}>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
