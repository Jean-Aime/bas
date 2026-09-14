'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col bg-white">
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">BAS</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
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

      <footer className="border-t bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-semibold">BAS</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">Business Automation System — v0.1 Prototype</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="mb-3 font-medium text-white">Product</p>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/features" className="hover:text-white">Features</Link></li>
                  <li><Link href="/solutions" className="hover:text-white">Solutions</Link></li>
                  <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-3 font-medium text-white">Company</p>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/about" className="hover:text-white">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                  <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div>
              <p className="mb-3 font-medium text-white">Chat with a demo business</p>
              <p className="text-sm text-slate-400">Try the customer AI assistant on a real business.</p>
              <Link href="/chat" className="mt-3 inline-block">
                <Button size="sm" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 hover:text-white">
                  Open customer chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}