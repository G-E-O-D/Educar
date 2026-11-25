import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Menu, Bell, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/cn';

const PAGE_TITLES: Record<string, string> = {
  '/panel':       'Panel docente',
  '/biblioteca':  'Biblioteca inteligente',
  '/actividades': 'Generador de actividades',
  '/seguimiento': 'Seguimiento pedagógico',
};

export function LayoutApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
  }, [pathname]);

  const title = PAGE_TITLES[pathname] ?? 'Panel';

  return (
    <div className="min-h-screen flex bg-surface-bg">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface-card border-b border-border-default h-16 flex items-center px-4 sm:px-6 gap-4 shrink-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-bg transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link to="/" className="lg:hidden flex items-center gap-1.5 text-brand-primary font-bold" aria-label="Inicio">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </Link>

          <h1 className={cn('text-base font-semibold text-text-primary flex-1', 'lg:text-lg')}>
            {title}
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative p-2 rounded-xl text-text-secondary hover:bg-surface-bg transition-colors"
              aria-label="Notificaciones (sin leer: 0)"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="h-8 w-8 rounded-full bg-brand-primary-light flex items-center justify-center">
              <span className="text-xs font-bold text-brand-primary" aria-hidden="true">MG</span>
            </div>
          </div>
        </header>

        {/* Fictional data notice */}
        <div
          className="bg-status-warning-bg border-b border-amber-200 px-4 py-2 text-xs text-status-warning font-medium"
          role="note"
          aria-label="Aviso de datos ficticios"
        >
          ⚠ Datos ficticios — prototipo de diseño. No usar con información real.
        </div>

        <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
