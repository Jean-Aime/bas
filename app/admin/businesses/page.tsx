'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminBusinessesPage() {
  return (
    <ComingSoon
      title="Businesses"
      description="Every business tenant on the BAS platform."
      items={[
        'List all businesses with plan, status, and activity',
        'Open a business administration view',
        'Suspend or deactivate tenants',
        'Platform-wide usage and conversation counts',
      ]}
    />
  );
}