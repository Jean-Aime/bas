'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, MailWarning } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {status === 'confirmed' ? <MailCheck className="h-6 w-6 text-success" /> : <MailWarning className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'confirmed' ? 'Email verified' : 'Verify your email'}
          </CardTitle>
          <CardDescription>
            {status === 'confirmed'
              ? 'Your email address has been confirmed. You can now sign in.'
              : 'We sent a confirmation link to your inbox. Open it to activate your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {status === 'confirmed' ? (
            <Link href="/login"><Button>Go to login</Button></Link>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or try signing in to resend.
              </p>
              <div className="flex gap-3">
                <Link href="/login"><Button variant="outline">Back to login</Button></Link>
                <Link href="/signup"><Button>Create account</Button></Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}