'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import { PermissionDenied } from '@/components/ui/page-states';
import { DemoModeToggle } from '@/components/demo/demo-mode-toggle';
import { Loader2, LayoutDashboard, Building2, Users, Workflow, Plug, Bot, Settings, ScrollText, HeartPulse, ArrowLeft, Zap } from 'lucide-react';

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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'platform_admin')
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
        setChecking(false);
      });
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2 p-4">
        <div className="w-full max-w-md">
          <PermissionDenied
            title="Platform admins only"
            description="The platform administration area is restricted to users with the platform_admin role. Tenant members cannot open it."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-2">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight">BAS Platform</p>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Business app
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-border bg-background/60 px-4 py-2">
          <DemoModeToggle />
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}