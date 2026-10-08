'use client';

import { Loader2, Inbox, AlertTriangle, Lock, Wrench, Plug2, ShieldX, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Quiet, centered loading — no chrome, no noise. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center animate-in-fade">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-muted" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </span>
      <p className="text-label text-muted-foreground">{label}</p>
    </div>
  );
}

function StateFrame({ children, dashed = true }: { children: React.ReactNode; dashed?: boolean }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl py-20 text-center animate-in-up-sm ${
        dashed ? 'border border-dashed border-border' : 'surface-raised'
      }`}
    >
      {children}
    </div>
  );
}

function StateIcon({ icon: Icon, tone = 'default' }: { icon: React.ElementType; tone?: 'default' | 'danger' }) {
  return (
    <div
      className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${
        tone === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <StateFrame>
      <StateIcon icon={Icon} />
      <div className="relative space-y-1.5 px-6">
        <p className="text-subheading text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
        )}
      </div>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="relative">
          <Button size="sm" className="brand-fill border-0">
            {actionLabel}
          </Button>
        </Link>
      )}
    </StateFrame>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <StateFrame>
      <StateIcon icon={AlertTriangle} tone="danger" />
      <div className="relative space-y-1.5 px-6">
        <p className="text-subheading text-foreground">Unable to load</p>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="relative gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      )}
    </StateFrame>
  );
}

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
    <div className="space-y-7 animate-in-up-sm">
      <div className="max-w-2xl">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="text-label text-primary">Roadmap</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <h1 className="text-heading text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card">
        <div className="relative flex flex-col items-start gap-5 px-7 py-9 sm:items-center sm:text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5 sm:max-w-sm">
            <p className="text-subheading text-foreground">Coming soon</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This area is part of the planned BAS architecture and will ship in a later phase.
            </p>
          </div>
          {items && items.length > 0 && (
            <ul className="w-full max-w-sm space-y-2 text-left sm:mx-auto">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3.5 py-2.5 text-sm text-foreground/80"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <StateFrame>
      <StateIcon icon={Plug2} />
      <div className="relative space-y-1.5 px-6">
        <p className="text-subheading text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {requirements && (
        <ul className="relative w-full max-w-sm space-y-2 px-6 text-left">
          {requirements.map((r) => (
            <li
              key={r}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3.5 py-2.5 text-sm text-foreground/80"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </StateFrame>
  );
}

export function PermissionDenied({
  title = 'Access restricted',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <StateFrame>
      <StateIcon icon={ShieldX} />
      <div className="relative space-y-1.5 px-6">
        <p className="text-subheading text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description ??
            'Your role does not grant access to this area. Contact your business owner if you believe this is a mistake.'}
        </p>
      </div>
      <Link href="/dashboard" className="relative">
        <Button size="sm" variant="outline">
          Back to dashboard
        </Button>
      </Link>
    </StateFrame>
  );
}

export function UnderConstruction() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <Wrench className="h-3 w-3" /> Prototype
    </span>
  );
}

export function MaintenanceState({
  title = "We'll be right back",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6  px-4 text-center animate-in-fade">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl brand-fill shadow-lg">
        <Lock className="h-6 w-6 text-white" />
      </div>
      <div className="space-y-2.5">
        <h1 className="text-display-sm text-foreground">{title}</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          {description ?? 'BAS is temporarily undergoing maintenance. Please check back shortly.'}
        </p>
      </div>
      <Link href="/">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
