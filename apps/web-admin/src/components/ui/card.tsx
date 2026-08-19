import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'glass' | 'interactive' | 'gradient' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    const base = 'rounded-xl border transition-all duration-200';
    const variants = {
      default: 'bg-card border-card-border shadow-sm hover:border-border-hover hover:shadow-lg',
      glass: 'bg-background-elevated/80 backdrop-blur-xl border-card-border/50 shadow-xl',
      interactive: 'bg-card border-card-border cursor-pointer hover:bg-card-hover hover:border-border-hover hover:shadow-xl active:scale-[0.99]',
      gradient: 'bg-card border-transparent relative overflow-hidden',
    };
    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'h3';
    return (
      <Comp
        ref={ref}
        className={cn('text-2xl font-semibold leading-none tracking-tight text-foreground', className)}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0 border-t border-card-border', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };