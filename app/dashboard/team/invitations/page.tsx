'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function TeamInvitationsPage() {
  return (
    <ComingSoon
      title="Invitations"
      description="Pending team invitations sent by email."
      items={[
        'Invite by email with a role',
        'Accept / revoke pending invites',
        'Invitation links (accept-invitation route)',
      ]}
    />
  );
}