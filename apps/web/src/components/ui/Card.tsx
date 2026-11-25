import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'elevated' | 'bordered' | 'featured';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  default:  'bg-surface-card border border-border-default',
  elevated: 'bg-surface-card shadow-md',
  bordered: 'bg-surface-card border-2 border-brand-primary',
  featured: 'bg-surface-card border border-border-default shadow-lg',
};

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl', variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pt-5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pb-5 pt-2 border-t border-border-default', className)} {...props}>
      {children}
    </div>
  );
}
