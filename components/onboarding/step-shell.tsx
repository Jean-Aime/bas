'use client';

import Link from 'next/link';
import { Zap, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

export const ONBOARDING_STEPS = [
  { href: '/onboarding/business', label: 'Business' },
  { href: '/onboarding/channels', label: 'Channels' },
  { href: '/onboarding/business-info', label: 'Business info' },
  { href: '/onboarding/products', label: 'Products' },
  { href: '/onboarding/services', label: 'Services' },
  { href: '/onboarding/knowledge', label: 'Knowledge' },
  { href: '/onboarding/automation', label: 'Automation' },
  { href: '/onboarding/complete', label: 'Review' },
];

/**
 * Guided onboarding shell: brand bar, progress bar, clickable stepper and a
 * focused step card with consistent back/continue actions.
 */
export function OnboardingStepShell({
  title,
  description,
  current,
  children,
  onNext,
  nextLabel = 'Continue',
  onBack,
  backHref,
}: {
  title: string;
  description: string;
  current: number;
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  onBack?: () => void;
  backHref?: string;
}) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-2 px-4">
        <Logo size="lg" />
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-card">
          <h1 className="text-lg font-semibold">Sign in required</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an account before setting up your business.
          </p>
          <Link href="/signup" className="mt-4 block">
            <Button className="w-full">Create account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((current + 1) / ONBOARDING_STEPS.length) * 100;
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Brand + progress bar */}
      <nav className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5">
          <Link href="/onboarding" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-bold tracking-tight">BAS</span>
          </Link>
          <span className="text-xs font-medium text-muted-foreground">
            Step {current + 1} of {total}
          </span>
        </div>
        <div className="h-0.5 w-full bg-border/60">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Stepper — desktop */}
        <ol className="mb-8 hidden items-center sm:flex" aria-label="Onboarding progress">
          {ONBOARDING_STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={s.href} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200',
                      done && 'border-primary bg-primary text-primary-foreground',
                      active && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/15',
                      !done && !active && 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap text-[11px] font-medium',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < total - 1 && (
                  <span
                    className={cn(
                      'mx-2 mb-5 h-px flex-1 transition-colors duration-300',
                      i < current ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Step card */}
        <div key={current} className="animate-fade-in-up">
          <div className="mb-6">
            <h1 className="text-h3 font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
            {children}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            {onBack || backHref ? (
              backHref ? (
                <Link href={backHref}>
                  <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )
            ) : (
              <span />
            )}
            {onNext && (
              <Button onClick={onNext}>
                {nextLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
