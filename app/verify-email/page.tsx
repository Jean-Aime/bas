'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, MailCheck, MailWarning } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const confirmed = status === 'confirmed';

  return (
    <div className="flex min-h-screen items-center justify-center  px-5 py-12">
      <div className="w-full max-w-sm animate-in-up text-center">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-fill shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">BAS</span>
        </Link>

        <div className="surface-raised rounded-2xl p-8 space-y-5">
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${confirmed ? 'bg-success/10' : 'bg-primary/10'}`}>
            {confirmed
              ? <MailCheck className="h-7 w-7 text-success" />
              : <MailWarning className="h-7 w-7 text-primary" />}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-base font-semibold text-foreground">
              {confirmed ? 'Email verified!' : 'Verify your email'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {confirmed
                ? 'Your email address has been confirmed. You can now sign in.'
                : "We sent a confirmation link to your inbox. Open it to activate your account."}
            </p>
          </div>

          {confirmed ? (
            <Link href="/login">
              <Button className="w-full brand-fill border-0 shadow-sm">Go to sign in</Button>
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or try signing in to resend.
              </p>
              <div className="flex gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full brand-fill border-0">Sign up</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
