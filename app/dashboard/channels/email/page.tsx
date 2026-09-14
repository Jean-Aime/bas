'use client';

import { NotConnected } from '@/components/ui/page-states';

export default function EmailConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email</h1>
        <p className="text-muted-foreground">Handle support and order conversations by email.</p>
      </div>
      <NotConnected
        title="Not connected"
        description="The email channel is planned but not implemented in the prototype."
        requirements={[
          'Mailbox connection (IMAP/SMTP or provider API)',
          'Inbound email → conversation routing',
          'Sending with customer-facing reply addresses',
        ]}
      />
    </div>
  );
}