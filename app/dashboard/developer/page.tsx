'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function DeveloperPage() {
  return (
    <ComingSoon
      title="Developer"
      description="API keys, webhooks, and developer integrations for your business."
      items={[
        'API keys with scoped permissions',
        'Webhook endpoints and delivery logs',
        'API documentation',
        'Integration request logs',
      ]}
    />
  );
}