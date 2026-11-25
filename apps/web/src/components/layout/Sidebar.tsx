import { NavLink, Link } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, BookOpen, Sparkles,
  BarChart3, Settings, X, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { APP_VERSION } from '@educar/shared';

const NAV = [
  { to: '/panel',       label: 'Inicio',       icon: LayoutDashboard },
  { to: '/biblioteca',  label: 'Biblioteca',   icon: BookOpen },
  { to: '/actividades', label: 'Actividades',  icon: Sparkles },
  { to: '/seguimiento', label: 'Seguimiento',  icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavItem({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: React.ElementType; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-primary text-white'
            : 'text-text-secondary hover:bg-surface-bg hover:text-text-primary'
        )
      }
    >
      <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      {label}
      {!['/', '/panel'].includes(to) ? null : null}
    </NavLink>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border-default shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-brand-primary font-bold text-base"
          onClick={onClose}
        >
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
          <span>Plataforma</span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-surface-bg"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Menú principal" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Panel docente</p>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}

        <div className="pt-4">
          <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Próximamente</p>
          {[
            'Planificación curricular',
            'Calificaciones',
            'Asistencia',
            'Comunicaciones',
          ].map((name) => (
            <div
              key={name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted cursor-not-allowed"
              aria-disabled="true"
            >
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              {name}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-default shrink-0 space-y-3">
        <NavLink
          to="/panel"
          className={({ isActive }) =>
            cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive ? 'bg-surface-bg text-text-primary' : 'text-text-secondary hover:bg-surface-bg')
          }
          onClick={onClose}
        >
          <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
          Configuración
        </NavLink>
        <div className="px-3">
          <p className="text-xs text-text-muted">Prototipo</p>
          <Badge variant="default" className="mt-1">v{APP_VERSION}</Badge>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 bg-surface-card border-r border-border-default h-screen sticky top-0"
        aria-label="Navegación lateral"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          <div
            className="fixed inset-0 bg-black/40"
            aria-hidden="true"
            onClick={onClose}
          />
          <aside className="relative flex flex-col w-72 max-w-full bg-surface-card border-r border-border-default h-full z-50">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
