import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const configs: Record<AlertVariant, { bg: string; text: string; icon: React.ElementType }> = {
  info:    { bg: 'bg-status-info-bg',    text: 'text-status-info',    icon: Info },
  success: { bg: 'bg-status-success-bg', text: 'text-status-success', icon: CheckCircle2 },
  warning: { bg: 'bg-status-warning-bg', text: 'text-status-warning', icon: AlertTriangle },
  error:   { bg: 'bg-status-error-bg',   text: 'text-status-error',   icon: XCircle },
};

export function Alert({ variant = 'info', title, dismissible, onDismiss, className, children, ...props }: AlertProps) {
  const { bg, text, icon: Icon } = configs[variant];
  return (
    <div
      role="alert"
      className={cn('flex gap-3 p-4 rounded-lg border', bg, `border-[color:var(--status-${variant})]`, className)}
      {...props}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', text)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-semibold text-sm mb-0.5', text)}>{title}</p>}
        <div className="text-sm text-text-secondary">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 -mt-0.5 -mr-1 p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Cerrar alerta"
        >
          <X className="h-4 w-4 text-text-muted" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
