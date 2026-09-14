'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminIntegrationsPage() {
  return (
    <ComingSoon
      title="Platform integrations"
      description="Connector management across all tenants."
      items={[
        'Connector health and connection counts',
        'Credential and webhook administration',
        'Rate limits and API usage per integration',
        'Feature flags for rolling out connectors',
      ]}
    />
  );
}