'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/logo';
import { Zap, ShieldCheck, Workflow, MessageSquare } from 'lucide-react';

/**
 * Shared auth layout: brand statement panel (desktop) + centered form card.
 * Keeps every auth page visually identical and on-brand.
 */
export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel — desktop only */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-foreground p-10 text-white lg:flex">
        {/* Photographic backdrop under a brand-blue wash */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=70"
            alt=""
            fill
            className="object-cover opacity-45"
            sizes="46vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-info/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        </div>
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-15 invert" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">BAS</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Automate your business.
            <br />
            Keep your systems.
          </h2>
          <ul className="mt-8 space-y-4 text-white/85">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><MessageSquare className="h-4 w-4" /></span>
              <span className="text-sm">AI answers customers 24/7 across channels</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><Workflow className="h-4 w-4" /></span>
              <span className="text-sm">Automate orders, bookings and follow-ups</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><ShieldCheck className="h-4 w-4" /></span>
              <span className="text-sm">Enterprise-grade security from day one</span>
            </li>
          </ul>
        </div>

        <p className="relative text-sm text-white/60">Business Automation System — v0.1</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2.5 p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-bold tracking-tight">BAS</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md animate-fade-in-up">
            <h1 className="text-h2">{title}</h1>
            <p className="mt-1.5 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
