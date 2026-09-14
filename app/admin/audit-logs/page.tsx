'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminAuditLogsPage() {
  return (
    <ComingSoon
      title="Platform audit logs"
      description="A single audit trail across every tenant and administrator action."
      items={[
        'Administrator actions and system events',
        'Tenant lifecycle events (create, suspend, delete)',
        'Search, filter, and export',
        'Retention policy',
      ]}
    />
  );
}