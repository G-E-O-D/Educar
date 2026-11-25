import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { APP_VERSION, APP_NAME, APP_SCOPE } from '@educar/shared';

export function Footer() {
  return (
    <footer className="bg-surface-card border-t border-border-default mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-bold text-base mb-2">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
              <span>{APP_NAME}</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {APP_SCOPE} · Prototipo en desarrollo.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Navegación secundaria" className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Navegación</p>
            <Link to="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Inicio
            </Link>
            <Link to="/demo" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Demostración de componentes
            </Link>
          </nav>

          {/* Build info */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Versión</p>
            <dl className="space-y-1">
              <div className="flex gap-2 text-xs text-text-muted">
                <dt>Versión:</dt>
                <dd className="font-mono text-text-secondary">{APP_VERSION}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Legal notice */}
        <div className="mt-8 pt-6 border-t border-border-default">
          <p className="text-xs text-text-muted text-center">
            Plataforma en etapa de prototipo (Etapa 01). No usar con datos reales de alumnos ni docentes.
            No realizar despliegues en producción hasta aprobación del propietario.
          </p>
        </div>
      </div>
    </footer>
  );
}
