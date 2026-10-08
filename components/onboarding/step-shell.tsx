'use client';

import Link from 'next/link';
import { Zap, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ONBOARDING_STEPS = [
  { href: '/onboarding/business', label: 'Business' },
  { href: '/onboarding/channels', label: 'Channels' },
  { href: '/onboarding/business-info', label: 'Info' },
  { href: '/onboarding/products', label: 'Products' },
  { href: '/onboarding/services', label: 'Services' },
  { href: '/onboarding/knowledge', label: 'Knowledge' },
  { href: '/onboarding/automation', label: 'Automation' },
  { href: '/onboarding/complete', label: 'Review' },
];

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
      <div className="flex min-h-screen items-center justify-center ">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center  px-5">
        <div className="surface-raised rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
          <h2 className="text-base font-semibold">Sign in required</h2>
          <p className="text-sm text-muted-foreground">Create an account before setting up your business.</p>
          <Link href="/signup">
            <Button className="w-full brand-fill border-0 shadow-sm">Create account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Nav */}
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-fill shadow-sm">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">BAS</span>
          </Link>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {ONBOARDING_STEPS.map((s, i) => (
              <div
                key={s.href}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                  i < current
                    ? 'brand-fill text-white'
                    : i === current
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground'
                )}
                title={s.label}
              >
                {i < current ? <Check className="h-3 w-3" /> : i + 1}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="animate-in-up space-y-6">
          <div>
            <h1 className="text-heading text-foreground mb-1">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="surface-raised rounded-2xl p-6 space-y-4">
            {children}
          </div>

          <div className="flex justify-between">
            {onBack || backHref ? (
              backHref ? (
                <Link href={backHref}>
                  <Button variant="outline" className="h-11 px-5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={onBack} className="h-11 px-5">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )
            ) : <span />}

            {onNext && (
              <Button
                onClick={onNext}
                className="brand-fill border-0 shadow-sm hover:opacity-90 transition-all h-11 px-6 font-semibold"
              >
                {nextLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
