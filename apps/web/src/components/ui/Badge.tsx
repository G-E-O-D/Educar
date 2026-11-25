import { cn } from '@/lib/cn';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

// Text colors are darker-on-light to meet WCAG 2.2 AA (≥4.5:1 on the respective bg)
const variants: Record<BadgeVariant, string> = {
  default:   'bg-surface-bg text-text-secondary border border-border-default',
  primary:   'bg-brand-primary-light text-brand-primary',          // #635BDB on #EEF0FB ≈ 4.5:1
  secondary: 'bg-brand-secondary-light text-teal-800',             // #115E59 on #E6F7F5 ≈ 6.8:1
  accent:    'bg-brand-accent-light text-amber-900',               // dark on light amber
  success:   'bg-status-success-bg text-status-success',           // #166534 on #F0FDF4
  warning:   'bg-status-warning-bg text-status-warning',           // #92400E on #FFFBEB ≈ 6.2:1
  error:     'bg-status-error-bg text-status-error',               // #991B1B on #FEF2F2
  outline:   'bg-transparent border border-border-strong text-text-secondary',
};

export function Badge({ variant = 'default', size = 'md', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
