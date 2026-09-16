'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, MessageSquare } from 'lucide-react';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-white shadow-sm">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">BAS</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link href="/signup"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-white">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-semibold">BAS</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Business Automation System — v0.1</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm md:col-span-2">
              <div>
                <p className="mb-3 font-medium">Product</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/features" className="transition-colors hover:text-foreground">Features</Link></li>
                  <li><Link href="/solutions" className="transition-colors hover:text-foreground">Solutions</Link></li>
                  <li><Link href="/integrations" className="transition-colors hover:text-foreground">Integrations</Link></li>
                  <li><Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-3 font-medium">Company</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
                  <li><Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
                  <li><Link href="/faq" className="transition-colors hover:text-foreground">FAQ</Link></li>
                  <li><Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link></li>
                  <li><Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div>
              <p className="mb-3 font-medium">Chat with a demo business</p>
              <p className="text-sm text-muted-foreground">Try the customer AI assistant on a real business.</p>
              <Link href="/chat" className="mt-3 inline-block">
                <Button size="sm" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" /> Open customer chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
