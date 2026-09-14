'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function SettingsWebhooksPage() {
  return (
    <ComingSoon
      title="Webhooks"
      description="Deliver business events to your own systems."
      items={[
        'Create webhook endpoints',
        'Signed payloads and retries',
        'Delivery logs',
      ]}
    />
  );
}