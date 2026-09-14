'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title} <Badge variant="secondary" className="ml-1">{total}</Badge></CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="font-medium capitalize">{r.label.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}