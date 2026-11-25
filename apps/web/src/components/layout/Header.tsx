import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { APP_VERSION } from '@educar/shared';

const APP_PAGES = [
  { name: 'Panel docente', to: '/panel' },
  { name: 'Biblioteca', to: '/biblioteca' },
  { name: 'Generador de actividades', to: '/actividades' },
  { name: 'Seguimiento pedagógico', to: '/seguimiento' },
  { name: 'Portal del alumno', to: '/alumno' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors px-1 py-0.5 rounded',
      isActive
        ? 'text-brand-primary'
        : 'text-text-secondary hover:text-text-primary'
    );

  return (
    <header className="sticky top-0 z-50 bg-surface-card border-b border-border-default shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-brand-primary font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="h-7 w-7" aria-hidden="true" />
            <span className="hidden sm:inline">Plataforma educativa</span>
            <span className="sm:hidden">Educar</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/demo" className={navLinkClass}>
              Demostración
            </NavLink>

            {/* Módulos dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModulesOpen((o) => !o)}
                className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                aria-expanded={modulesOpen}
                aria-haspopup="true"
              >
                Módulos
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', modulesOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
              {modulesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden="true"
                    onClick={() => setModulesOpen(false)}
                  />
                  <div
                    className="absolute top-full right-0 mt-2 w-56 bg-surface-card rounded-xl border border-border-default shadow-lg z-20 py-1"
                    role="menu"
                  >
                    <p className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Prototipo
                    </p>
                    {APP_PAGES.map((m) => (
                      <NavLink
                        key={m.name}
                        to={m.to}
                        role="menuitem"
                        onClick={() => setModulesOpen(false)}
                        className={({ isActive }) =>
                          cn('block px-4 py-2.5 text-sm transition-colors',
                            isActive ? 'text-brand-primary font-medium' : 'text-text-secondary hover:bg-surface-bg hover:text-text-primary')
                        }
                      >
                        {m.name}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Version badge + mobile toggle */}
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="hidden sm:inline-flex">
              v{APP_VERSION}
            </Badge>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-bg transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label="Abrir menú de navegación"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          aria-label="Navegación móvil"
          className="md:hidden border-t border-border-default bg-surface-card px-4 py-3 space-y-1"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn('block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary hover:bg-surface-bg')
            }
            onClick={() => setMobileOpen(false)}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/demo"
            className={({ isActive }) =>
              cn('block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary hover:bg-surface-bg')
            }
            onClick={() => setMobileOpen(false)}
          >
            Demostración
          </NavLink>
          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Prototipo</p>
            {APP_PAGES.map((m) => (
              <NavLink
                key={m.name}
                to={m.to}
                className={({ isActive }) =>
                  cn('block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-primary-light text-brand-primary' : 'text-text-secondary hover:bg-surface-bg')
                }
                onClick={() => setMobileOpen(false)}
              >
                {m.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
