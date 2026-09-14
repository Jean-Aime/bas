'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function DeveloperWebhooksPage() {
  return (
    <ComingSoon
      title="Webhooks"
      description="Receive business events in your own systems."
      items={[
        'Endpoints and signing secrets',
        'Event subscriptions',
        'Delivery attempts and logs',
      ]}
    />
  );
}