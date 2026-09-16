'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailQuestion } from 'lucide-react';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <MailQuestion className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Team invitation</CardTitle>
          <CardDescription>
            {token ? 'Accepting your invitation…' : 'This link is missing its invitation token.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Team invitations are part of the planned BAS architecture but are not yet implemented in the prototype.
            Business owners can add team members from the dashboard <span className="font-medium">Settings → Team</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login"><Button variant="outline">Sign in</Button></Link>
            <Link href="/dashboard/settings"><Button>Go to dashboard</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}