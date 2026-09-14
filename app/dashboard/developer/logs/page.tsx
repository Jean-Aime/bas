'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function DeveloperLogsPage() {
  return (
    <ComingSoon
      title="Integration logs"
      description="Requests, webhooks, and connector activity."
      items={[
        'API request history',
        'Webhook delivery attempts',
        'Connector sync status',
      ]}
    />
  );
}