'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminUsersPage() {
  return (
    <ComingSoon
      title="Platform users"
      description="All user accounts registered on BAS."
      items={[
        'Search and inspect user accounts',
        'Membership and role overview across businesses',
        'Suspend or verify accounts',
        'Login activity and security events',
      ]}
    />
  );
}