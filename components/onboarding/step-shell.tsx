'use client';

import Link from 'next/link';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { Loader2 } from 'lucide-react';

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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Create an account before setting up your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signup"><Button className="w-full">Create account</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold">BAS</span>
          </div>
          <div className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
            {ONBOARDING_STEPS.map((s, i) => (
              <span key={s.href} className="flex items-center gap-1">
                {i > 0 && <ArrowRight className="h-3 w-3" />}
                <span className={i === current ? 'font-semibold text-primary' : i < current ? 'text-foreground' : ''}>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>
        <div className="mt-4 flex justify-between">
          {onBack || backHref ? (
            backHref ? (
              <Link href={backHref}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
            ) : (
              <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            )
          ) : <span />}
          {onNext && (
            <Button onClick={onNext}>{nextLabel} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}