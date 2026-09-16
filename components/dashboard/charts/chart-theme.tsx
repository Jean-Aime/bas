/**
 * Chart theme — single source of truth for chart colors and shared parts.
 * Colors come from the CSS token palette (--chart-1..5, --border, --card)
 * so charts adapt to dark mode automatically. All parts are client-agnostic
 * (pure objects/components) so both client pages and stories can use them.
 */

export const CHART_PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
] as const;

export const AXIS_DEFAULTS = {
  tick: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
  axisLine: false as const,
  tickLine: false as const,
};

export const GRID_DEFAULTS = {
  strokeDasharray: '3 6',
  stroke: 'hsl(var(--border))',
  vertical: false as const,
};

/** Shared recharts <Tooltip content> renderer themed from tokens. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string | number }>;
  label?: string | number;
  formatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-lg border bg-card px-3 py-2 shadow-card-hover"
      style={{ fontSize: 12 }}
      role="status"
    >
      {label !== undefined && (
        <p className="mb-1 font-medium text-foreground">{label}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {formatter ? formatter(Number(entry.value), String(entry.name)) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
