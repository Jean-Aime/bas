'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5  px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-heading text-foreground">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. If this keeps happening, please contact support.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
        <Link href="/dashboard">
          <Button className="brand-fill border-0 shadow-sm">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
