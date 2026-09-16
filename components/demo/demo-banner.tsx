'use client';

import { useEffect, useState } from 'react';
import { isDemoModeActive } from '@/lib/demo/demo-mode';
import { resetDemoData } from '@/lib/demo/demo-client';
import { FlaskConical, RotateCcw, X } from 'lucide-react';

/**
 * Floating demo-mode indicator. Only rendered when demo mode is active (env
 * flag or runtime override). Shows a persistent badge (bottom-left) with an
 * optional explainer popover and a reset action that rebuilds the seeded
 * dataset. Reads the flag after mount so SSR/hydration never mismatch.
 */
export function DemoBanner() {
  const [expanded, setExpanded] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setDemo(isDemoModeActive());
  }, []);

  if (!demo) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden">
      {expanded ? (
        <div className="w-72 rounded-xl border border-primary/30 bg-background/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Demo mode</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close demo info"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            You&apos;re viewing realistic sample data — 3 demo businesses with conversations, orders,
            bookings, and workflow runs. Nothing you do here is saved; reload or reset to restore the
            original seed. Set <code className="rounded bg-secondary px-1 py-0.5">NEXT_PUBLIC_DEMO_MODE=false</code> to connect a real workspace.
          </p>
          <button
            type="button"
            onClick={() => {
              resetDemoData();
              window.location.reload();
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo data
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur transition-colors hover:bg-primary/20"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Demo data
        </button>
      )}
    </div>
  );
}
