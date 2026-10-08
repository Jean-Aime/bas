'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import { ErrorState, PermissionDenied } from '@/components/ui/page-states';
import {
  Loader2, LayoutDashboard, Building2, Users, Workflow,
  Plug, Bot, Settings, ScrollText, HeartPulse, ArrowLeft, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/workflows', label: 'Workflow templates', icon: Workflow },
  { href: '/admin/integrations', label: 'Integrations', icon: Plug },
  { href: '/admin/ai', label: 'AI configuration', icon: Bot },
  { href: '/admin/system', label: 'System settings', icon: Settings },
  { href: '/admin/audit-logs', label: 'Audit logs', icon: ScrollText },
  { href: '/admin/health', label: 'Health', icon: HeartPulse },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    let cancelled = false;
    setChecking(true);

    supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'platform_admin')
      .maybeSingle()
      .then(({ data, error: checkError }) => {
        if (cancelled) return;
        if (checkError) { setError(checkError.message || 'Could not verify platform access.'); setChecking(false); return; }
        setError(null);
        setIsAdmin(!!data);
        setChecking(false);
      });

    return () => { cancelled = true; };
  }, [user, authLoading, router, attempt]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground shadow-lg">
            <Loader2 className="h-5 w-5 text-background animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center  p-4">
        <div className="w-full max-w-md">
          <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center  p-4">
        <div className="w-full max-w-md">
          <PermissionDenied
            title="Platform admins only"
            description="The administration area is restricted to users with the platform_admin role."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--surface-1))]">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-chrome-border bg-chrome lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b border-chrome-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-fill">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-chrome-fg leading-tight">BAS Platform</p>
            <p className="text-[10px] text-chrome-muted uppercase tracking-widest">Administration</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150',
                  active
                    ? 'bg-chrome-fg/10 text-chrome-fg'
                    : 'text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-chrome-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Compact chrome header — keeps the admin shell coherent on mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-chrome-border bg-chrome px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-fill">
              <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold tracking-wide text-chrome-fg">Administration</span>
          </div>
          <Link href="/dashboard" className="text-xs font-medium text-chrome-muted hover:text-chrome-fg">
            Back to app
          </Link>
        </header>
        <main className="flex-1 p-5 pb-24 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
