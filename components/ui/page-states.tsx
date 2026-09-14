'use client';

import { Loader2, Inbox, AlertTriangle, Lock, Wrench, Plug2, ShieldX, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Loading state used across all module pages. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/** Empty state with an optional action. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon?: typeof Inbox;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button size="sm" variant="outline">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}

/** Error state with a retry action. */
export function ErrorState({ message = 'Something went wrong while loading this page.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="font-medium">Unable to load</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

/**
 * Coming soon placeholder — the page/route exists as part of the future
 * architecture but is intentionally not implemented in the prototype.
 * No fake functionality is shown (BAS spec: page status COMING SOON).
 */
export function ComingSoon({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items?: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium">Coming soon</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This area is part of the planned BAS architecture and will be implemented in a later phase.
        </p>
        {items && items.length > 0 && (
          <ul className="mt-2 max-w-md space-y-1 text-left text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" /> {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Not connected state — an integration or channel that is not configured. */
export function NotConnected({
  title,
  description,
  requirements,
}: {
  title: string;
  description: string;
  requirements?: string[];
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Plug2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {requirements && (
        <ul className="mt-2 max-w-md space-y-1 text-left text-sm text-muted-foreground">
          {requirements.map((r) => (
            <li key={r} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" /> {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Permission denied — shown when a route requires a role the user lacks. */
export function PermissionDenied({ title = 'Access restricted', description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <ShieldX className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {description ?? 'Your role does not grant access to this area. Contact your business owner if you believe this is a mistake.'}
      </p>
      <Link href="/dashboard"><Button size="sm" variant="outline">Back to dashboard</Button></Link>
    </div>
  );
}

/** Under construction badge for UI sections. */
export function UnderConstruction() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <Wrench className="h-3 w-3" /> Prototype
    </span>
  );
}

/** Public "service unavailable" full-page state (maintenance etc.). */
export function MaintenanceState({ title = 'We\'ll be right back', description }: { title?: string; description?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-md text-muted-foreground">
        {description ?? 'BAS is temporarily undergoing maintenance. Please check back shortly.'}
      </p>
      <Link href="/"><Button variant="outline">Back to home</Button></Link>
    </div>
  );
}