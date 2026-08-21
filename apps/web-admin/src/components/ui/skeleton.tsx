'use client';

import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] bg-[length:200%_100%]',
        'shimmer',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full max-w-[80%]" />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-32 w-full rounded-xl', className)} />
  );
}

export function SkeletonAvatar({ className, size = 'h-20 w-20' }: { className?: string; size?: string }) {
  return (
    <Skeleton className={cn('rounded-full', size, className)} />
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />
  );
}

export function SkeletonInput({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-10 w-full rounded-lg', className)} />
  );
}

export function SkeletonSelect({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('h-10 w-full rounded-lg', className)} />
  );
}

export function SkeletonGrid({
  columns = 3,
  rows = 2,
  gap = 'gap-4',
  className,
}: {
  columns?: number;
  rows?: number;
  gap?: string;
  className?: string;
}) {
  return (
    <div className={cn(`grid ${gap} grid-cols-${columns}`, className)}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}