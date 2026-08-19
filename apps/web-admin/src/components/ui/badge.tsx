import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 '
  + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground border border-border',
        primary: 'bg-primary-subtle text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border border-border',
        destructive: 'bg-destructive-subtle text-destructive border border-destructive/20',
        outline: 'bg-transparent text-muted-foreground border border-border hover:bg-background-hover',
        success: 'bg-success-subtle text-success border border-success/20',
        warning: 'bg-warning-subtle text-warning-foreground border border-warning/20',
        accent: 'bg-accent-subtle text-accent-foreground border border-accent/20',
        accentSolid: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover',
        primarySolid: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };