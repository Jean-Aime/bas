'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ENV_DEFAULT, getDemoModeOverride, setDemoModeOverride } from '@/lib/demo/demo-mode';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Demo-mode toggle for the dashboard topbar and the admin panel.
 *
 * Writes a localStorage override on top of NEXT_PUBLIC_DEMO_MODE and reloads
 * the app so the Supabase clients re-create in the chosen mode. The switch
 * shows the effective state; the caption shows where that default comes from
 * (runtime override vs environment default).
 */
export function DemoModeToggle() {
  const router = useRouter();
  const [active, setActive] = useState<boolean | null>(null);
  const [overridden, setOverridden] = useState(false);

  useEffect(() => {
    setActive(getDemoModeOverride() ?? DEMO_ENV_DEFAULT);
    setOverridden(getDemoModeOverride() !== null);
  }, []);

  if (active === null) return null; // pre-mount

  const handleChange = (next: boolean) => {
    setDemoModeOverride(next);
    setActive(next);
    setOverridden(true);
    toast.success(next ? 'Demo mode on — reloading…' : 'Demo mode off — reloading…');
    // Full reload so every module re-evaluates the flag and the Supabase
    // clients (browser + API routes) are re-created in the new mode.
    setTimeout(() => router.refresh(), 450);
    setTimeout(() => window.location.reload(), 700);
  };

  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-secondary/40 px-3 py-2">
      <FlaskConical className="h-4 w-4 text-primary" />
      <div className="space-y-0.5">
        <Label htmlFor="demo-mode-switch" className="text-sm font-medium leading-none">
          Demo mode
        </Label>
        <p className="text-[11px] text-muted-foreground">
          {overridden ? 'Override for this browser' : DEMO_ENV_DEFAULT ? 'Default from .env' : 'Off by default (.env)'}
        </p>
      </div>
      <Switch
        id="demo-mode-switch"
        checked={active}
        onCheckedChange={handleChange}
        aria-label="Toggle demo mode"
      />
    </div>
  );
}
