import { forwardRef, isValidElement, cloneElement } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Render the button's styles on the first child element (e.g. a Link) */
  asChild?: boolean;
}

export const BASE_BTN =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

// Contrast check on key pairs:
//   primary:     #FFFFFF on #635BDB = 4.72:1 ✓ AA
//   secondary:   #243047 on #14B8A6 = 5.37:1 ✓ AA  (dark text — teal bg too light for white)
//   destructive: #FFFFFF on #991B1B = 7.74:1 ✓ AA
export const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-text-on-brand hover:bg-brand-primary-hover focus-visible:ring-brand-primary',
  secondary:
    'bg-brand-secondary text-text-primary hover:bg-brand-secondary-hover focus-visible:ring-brand-secondary',
  outline:
    'border border-border-strong bg-transparent text-text-primary hover:bg-surface-bg focus-visible:ring-brand-primary',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-bg hover:text-text-primary focus-visible:ring-brand-primary',
  destructive:
    'bg-status-error text-white hover:bg-red-900 focus-visible:ring-status-error',
};

export const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild,
      ...props
    },
    ref
  ) => {
    const classes = cn(BASE_BTN, VARIANTS[variant], SIZES[size], className);
    const inner = (
      <>
        {isLoading ? <Spinner /> : leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </>
    );

    if (asChild && isValidElement(children)) {
      type AnyProps = { className?: string; children?: React.ReactNode };
      const child = children as React.ReactElement<AnyProps>;
      return cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className),
        children: (
          <>
            {isLoading ? <Spinner /> : leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {child.props.children}
            {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        ),
      } as AnyProps);
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {inner}
      </button>
    );
  }
);

Button.displayName = 'Button';
