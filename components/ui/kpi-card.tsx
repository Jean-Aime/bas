'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

/**
 * Premium KPI card: metric, label, optional trend delta and contextual icon.
 * Used in a grid on dashboards. Compact by design — hierarchy comes from
 * the grid, not from oversized cards.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel = 'vs last period',
  tone = 'default',
  loading = false,
  href,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Percentage change, e.g. 18.4 or -4.2. Shown only when provided. */
  delta?: number | null;
  deltaLabel?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
  loading?: boolean;
  href?: string;
  className?: string;
}) {
  const toneClasses: Record<string, string> = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success-soft text-success-soft-fg',
    warning: 'bg-warning-soft text-warning-soft-fg',
  };
  const up = (delta ?? 0) >= 0;

  const body = (
    <div
      className={cn(
        'group rounded-xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover',
        href && 'hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-caption font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          {loading ? (
            <Skeleton className="mt-2 h-3.5 w-28" />
          ) : delta !== undefined && delta !== null ? (
            <p className="mt-2 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium',
                  up ? 'text-success' : 'text-destructive'
                )}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {up ? '+' : ''}
                {Math.abs(delta).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">{deltaLabel}</span>
            </p>
          ) : null}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
              toneClasses[tone]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {body}
      </a>
    );
  }
  return body;
}
