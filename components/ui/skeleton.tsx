import { cn } from '@/lib/utils';

function Skeleton({
  className,
  shimmer = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        shimmer
          ? 'bg-[linear-gradient(90deg,hsl(var(--muted))_0%,hsl(var(--secondary))_50%,hsl(var(--muted))_100%)] bg-[length:200%_100%] animate-shimmer'
          : 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
