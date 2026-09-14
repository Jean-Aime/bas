'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function DeveloperApiKeysPage() {
  return (
    <ComingSoon
      title="API keys"
      description="Scoped keys for programmatic access to your business data."
      items={[
        'Create and revoke keys',
        'Scope keys to read / write per module',
        'Last-used and audit trail',
      ]}
    />
  );
}