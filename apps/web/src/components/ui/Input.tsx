import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-status-error ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-10 w-full rounded-lg border bg-surface-card px-3 text-sm text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
            error
              ? 'border-status-error focus:ring-status-error'
              : 'border-border-default hover:border-border-strong',
            className
          )}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-text-muted">{hint}</p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-status-error" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
