'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ArrowUpDown, Inbox } from 'lucide-react';

export interface DataTableColumn<T> {
  header: string;
  /** CSS class for the cell; also applied to header. */
  className?: string;
  /** Enable sort toggle on this column. */
  sortable?: boolean;
  /** Value used for sorting and search. */
  value: (row: T) => string | number;
  /** Cell content. */
  render: (row: T) => React.ReactNode;
  /** Hide this column below the given breakpoint (mobile-first responsive tables). */
  hideBelow?: 'sm' | 'md' | 'lg';
  /** Cell alignment. */
  align?: 'left' | 'right';
}

const HIDE_BELOW: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

/**
 * Modern data table: search across string columns, client-side sort,
 * responsive column hiding, skeleton loading, and a guided empty state.
 * Subtle styling — rows separate with hairlines, hover only.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading = false,
  searchPlaceholder = 'Search…',
  emptyTitle,
  emptyDescription,
  emptyAction,
  rowHref,
  toolbar,
  className,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  rowHref?: (row: T) => string;
  toolbar?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);

  const searchable = useMemo(
    () => columns.some((c) => typeof c.value === 'function'),
    [columns]
  );

  const filtered = useMemo(() => {
    let out = rows;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((row) =>
        columns.some(
          (c) =>
            typeof c.value === 'function' &&
            String(c.value(row)).toLowerCase().includes(q)
        )
      );
    }
    if (sort) {
      const col = columns[sort.col];
      if (col) {
        out = [...out].sort((a, b) => {
          const av = col.value(a);
          const bv = col.value(b);
          if (typeof av === 'number' && typeof bv === 'number')
            return (av - bv) * sort.dir;
          return String(av).localeCompare(String(bv)) * sort.dir;
        });
      }
    }
    return out;
  }, [rows, columns, query, sort]);

  const toggleSort = (i: number) => {
    setSort((s) =>
      s && s.col === i ? { col: i, dir: s.dir === 1 ? -1 : 1 } : { col: i, dir: 1 }
    );
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-card', className)}>
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-9"
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {loading ? (
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b px-4 py-4 last:border-0"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {query ? 'No results' : emptyTitle}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {query
                ? 'Try a different search term.'
                : emptyDescription}
            </p>
          </div>
          {!query && emptyAction}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c, i) => (
                <TableHead
                  key={c.header}
                  className={cn(
                    c.hideBelow && HIDE_BELOW[c.hideBelow],
                    c.align === 'right' && 'text-right',
                    c.className
                  )}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(i)}
                      className="inline-flex items-center gap-1 rounded transition-colors hover:text-foreground"
                    >
                      {c.header}
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow
                key={row.id}
                className={cn(rowHref && 'cursor-pointer')}
                onClick={rowHref ? () => router.push(rowHref(row)) : undefined}
              >
                {columns.map((c) => (
                  <TableCell
                    key={c.header}
                    className={cn(
                      c.hideBelow && HIDE_BELOW[c.hideBelow],
                      c.align === 'right' && 'text-right',
                      c.className
                    )}
                  >
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
