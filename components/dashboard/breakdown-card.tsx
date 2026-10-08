'use client';

import { Loader2 } from 'lucide-react';

export function BreakdownCard({
  title,
  rows,
  loading,
  emptyLabel = 'No data yet',
}: {
  title: string;
  rows: { label: string; count: number }[];
  loading: boolean;
  emptyLabel?: string;
}) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.count)) : 1;

  return (
    <div className="surface-raised rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="badge-neutral">{total}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize text-foreground">{r.label.replace(/_/g, ' ')}</span>
                <span className="font-semibold tabular-nums text-foreground">{r.count}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full brand-fill transition-all duration-500"
                  style={{ width: `${max > 0 ? (r.count / max) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
