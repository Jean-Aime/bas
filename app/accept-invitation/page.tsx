'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Users } from 'lucide-react';

export default function AcceptInvitationPage() {
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-base font-semibold text-foreground">Team invitation</h1>
            <p className="text-sm text-muted-foreground">
              Team invitations are not yet implemented in this prototype. Business owners can add team members from{' '}
              <span className="font-medium text-foreground">Dashboard → Team</span>.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full">Sign in</Button>
            </Link>
            <Link href="/dashboard/team" className="flex-1">
              <Button className="w-full brand-fill border-0 shadow-sm">Go to team</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
