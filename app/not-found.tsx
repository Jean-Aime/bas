import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6  px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl brand-fill shadow-lg">
        <Zap className="h-7 w-7 text-white" />
      </div>
      <div className="space-y-2">
        <p className="text-label text-primary">404</p>
        <h1 className="text-display-sm text-foreground">Page not found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline">Back to home</Button>
        </Link>
        <Link href="/dashboard">
          <Button className="brand-fill border-0 shadow-sm">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
