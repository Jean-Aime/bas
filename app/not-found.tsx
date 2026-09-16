import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-2 px-4 text-center">
      <p className="text-7xl font-bold tracking-tight text-primary">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="flex gap-3">
        <Link href="/"><Button>Back to home</Button></Link>
        <Link href="/dashboard"><Button variant="outline">Go to dashboard</Button></Link>
      </div>
    </div>
  );
}