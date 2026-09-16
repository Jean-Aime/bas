'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { Logo } from '@/components/ui/logo';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentBusiness, loading: bizLoading } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();
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
    if (!authLoading && !bizLoading && !currentBusiness) router.push('/onboarding');
  }, [user, authLoading, bizLoading, currentBusiness, router]);

  if (authLoading || bizLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <Logo size="lg" />
          <Loader2 className="absolute -right-1 -top-1 h-4 w-4 animate-spin rounded-full bg-background text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  if (!user || !currentBusiness) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-col transition-[padding] duration-200 ease-out lg:pl-[var(--sidebar-w,15rem)]">
        <DashboardTopbar />
        {/* key remounts main on route change so the page fade-in replays */}
        <main key={pathname} className="animate-fade-in flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
