import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 '
  + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background '
  + 'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed '
  + 'active:scale-[0.98] hover:shadow-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-primary-glow/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm',
        outline: 'border border-border bg-transparent hover:bg-background-hover hover:border-border-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted hover:text-foreground border border-border',
        ghost: 'bg-transparent hover:bg-background-hover',
        link: 'text-primary underline-offset-4 hover:underline',
        accent: 'bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm hover:shadow-accent-glow/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        xl: 'h-12 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
        iconLg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };