'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminHealthPage() {
  return (
    <ComingSoon
      title="System health"
      description="Planned health checks for platform services. No probe runs yet, so no status is reported on this page."
      items={[
        'Database',
        'AI service',
        'Integrations',
        'Background jobs',
        'API status',
      ]}
    />
  );
}
