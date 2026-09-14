'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentBusiness, loading: bizLoading, error: bizError, refreshBusinesses } = useBusiness();
  const router = useRouter();
  // Tracks the user the membership fetch has resolved for. On the commit where
  // the user first appears (async session restore), the layout's effect runs
  // before BusinessProvider's load effect, so memberships are still stale —
  // skip that pass to avoid bouncing members to /onboarding on hard deep-loads.
  const resolvedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    const uid = user?.id ?? null;
    if (uid !== resolvedUserId.current) {
      resolvedUserId.current = uid;
      return;
    }
    // A failed membership fetch says nothing about whether this user has a
    // business — never send them to onboarding because of it.
    if (bizError) return;
    if (!authLoading && !bizLoading && !currentBusiness) router.push('/onboarding');
  }, [user, authLoading, bizLoading, currentBusiness, bizError, router]);

  if (authLoading || bizLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bizError && !currentBusiness) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h1 className="text-lg font-semibold">Could not load your business</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{bizError}</p>
        <Button variant="outline" size="sm" onClick={() => refreshBusinesses()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!user || !currentBusiness) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:pl-0">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
