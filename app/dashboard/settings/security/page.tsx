'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function SettingsSecurityPage() {
  return (
    <ComingSoon
      title="Security"
      description="Password, sessions, and account security."
      items={[
        'Change password',
        'Active sessions and sign-out everywhere',
        'Two-factor authentication',
        'Login activity',
      ]}
    />
  );
}