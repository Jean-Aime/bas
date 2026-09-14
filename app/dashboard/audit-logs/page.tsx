'use client';

import { AuditTab } from '@/components/dashboard/settings/audit-tab';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit logs</h1>
        <p className="text-muted-foreground">A trace of every important automation and business action.</p>
      </div>
      <AuditTab />
    </div>
  );
}