'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentBusiness, loading: bizLoading, error: bizError, refreshBusinesses } = useBusiness();
  const router = useRouter();
  const resolvedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    const uid = user?.id ?? null;
    if (uid !== resolvedUserId.current) { resolvedUserId.current = uid; return; }
    if (bizError) return;
    if (!authLoading && !bizLoading && !currentBusiness) router.push('/onboarding');
  }, [user, authLoading, bizLoading, currentBusiness, bizError, router]);

  if (authLoading || bizLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-fill shadow-lg">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (bizError && !currentBusiness) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center ">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-base font-semibold mb-1">Could not load your business</h1>
          <p className="text-sm text-muted-foreground max-w-sm">{bizError}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refreshBusinesses()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!user || !currentBusiness) return null;

  return (
    <div className="flex min-h-screen bg-[hsl(var(--surface-1))]">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:pl-[var(--sidebar-width)]">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-5 pb-28 lg:px-8 lg:py-7 lg:pb-7">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
