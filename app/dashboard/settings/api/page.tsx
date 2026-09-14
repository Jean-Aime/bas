'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function SettingsApiPage() {
  return (
    <ComingSoon
      title="API settings"
      description="Prepare for API keys, webhooks, and developer integrations."
      items={[
        'Scoped API keys',
        'Webhook endpoints',
        'Developer integrations',
      ]}
    />
  );
}