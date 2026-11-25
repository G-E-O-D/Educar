import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { APP_VERSION } from '@educar/shared';

export function LayoutStudent() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Encabezado mínimo: solo identidad del portal */}
      <header className="bg-surface-card border-b border-border-default px-4 sm:px-6 h-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-brand-primary">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold">Portal del alumno</span>
        </div>
        <span className="text-xs text-text-muted font-mono">v{APP_VERSION} · Prototipo</span>
      </header>

      <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer simplificado */}
      <footer className="bg-surface-card border-t border-border-default px-4 py-4 text-center">
        <p className="text-xs text-text-muted">
          Plataforma en etapa de prototipo. No usar con datos reales de alumnos.
        </p>
      </footer>
    </div>
  );
}
