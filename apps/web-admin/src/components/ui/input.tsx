import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground '
            + 'transition-all duration-200 '
            + 'focus:border-border-focus focus:bg-input-focus focus:outline-none focus:ring-2 focus:ring-ring/20 '
            + 'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-disabled '
            + 'aria-invalid:border-destructive aria-invalid:focus:border-destructive aria-invalid:focus:ring-destructive/20',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={cn(helperId, errorId)}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };