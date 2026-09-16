import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

/** BAS brand mark with configurable size. */
export function Logo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const box = size === 'sm' ? 'h-7 w-7 rounded-md' : size === 'lg' ? 'h-10 w-10 rounded-lg' : 'h-8 w-8 rounded-lg';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-info text-primary-foreground shadow-sm',
        box,
        className
      )}
    >
      <Zap className={icon} strokeWidth={2.5} />
    </div>
  );
}
