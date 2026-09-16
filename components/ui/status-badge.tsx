import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone =
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  | 'default'
  | 'secondary'
  | 'outline';

/** Canonical map from app entity statuses to visual tones. */
const STATUS_TONES: Record<string, StatusTone> = {
  // General lifecycle
  active: 'success',
  completed: 'success',
  resolved: 'success',
  connected: 'success',
  paid: 'success',
  confirmed: 'success',
  delivered: 'success',

  // Pending / processing
  pending: 'warning',
  processing: 'info',
  scheduled: 'info',
  draft: 'secondary',
  paused: 'warning',
  handover: 'warning',
  'needs attention': 'warning',

  // Failure states
  failed: 'destructive',
  error: 'destructive',
  cancelled: 'destructive',
  canceled: 'destructive',
  disconnected: 'destructive',
  overdue: 'destructive',

  // Neutral
  inactive: 'outline',
  archived: 'outline',
  closed: 'outline',
};

/** Get the visual tone for a status string. */
export function statusTone(status?: string | null): StatusTone {
  if (!status) return 'outline';
  return STATUS_TONES[status.toLowerCase().trim()] ?? 'outline';
}

/**
 * Consistent status indicator for any entity. Maps a raw status string to a
 * soft, color-coded badge so the whole product reads the same way.
 */
export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  return (
    <Badge variant={statusTone(status)} className={cn('capitalize', className)}>
      {status || '—'}
    </Badge>
  );
}
