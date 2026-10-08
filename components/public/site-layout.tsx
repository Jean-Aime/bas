'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col ">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-fill transition-transform duration-300 ease-out group-hover:scale-105">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-bold tracking-[0.1em]">BAS</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (                <Link href="/dashboard">
                  <Button size="sm" className="brand-fill border-0">
                    Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="brand-fill border-0">Get started</Button>
                </Link>
              </>
            )}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background px-5 py-4 md:hidden animate-in-up-sm">
            <div className="space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-foreground py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-fill">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-sm text-background">BAS</span>
              </div>
              <p className="text-sm text-background/40 leading-relaxed">
                Business Automation System.<br />AI-powered customer operations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-background/40">Product</p>
                <ul className="space-y-2">
                  {[
                    { href: '/features', label: 'Features' },
                    { href: '/solutions', label: 'Solutions' },
                    { href: '/integrations', label: 'Integrations' },
                    { href: '/pricing', label: 'Pricing' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-background/50 hover:text-background transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-background/40">Company</p>
                <ul className="space-y-2">
                  {[
                    { href: '/about', label: 'About' },
                    { href: '/contact', label: 'Contact' },
                    { href: '/faq', label: 'FAQ' },
                    { href: '/privacy', label: 'Privacy' },
                    { href: '/terms', label: 'Terms' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-background/50 hover:text-background transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-background/40">Try it live</p>
              <p className="text-sm text-background/50 mb-4 leading-relaxed">
                Chat with a demo business AI assistant right now.
              </p>
              <Link href="/chat">
                <Button size="sm" variant="outline" className="border-background/20 text-background hover:bg-background/10 hover:text-background">
                  Open customer chat
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-background/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-background/30">© 2025 BAS. All rights reserved.</p>
            <p className="text-xs text-background/30">v0.1 Prototype</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
