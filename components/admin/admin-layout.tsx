'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import { ErrorState, PermissionDenied } from '@/components/ui/page-states';
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
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    // A response landing after the signed-in user changed or signed out must
    // not grant this component admin access.
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
        // A failed lookup is not proof that this user lacks the role.
        if (checkError) {
          setError(checkError.message || 'Could not verify your platform access.');
          setChecking(false);
          return;
        }
        setError(null);
        setIsAdmin(!!data);
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, attempt]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md">
          <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
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
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white lg:flex">
        <Link href="/admin" className="flex items-center gap-2 border-b px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">BAS Platform</p>
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Business app
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}