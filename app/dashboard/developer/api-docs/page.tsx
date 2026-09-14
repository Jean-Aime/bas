'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function DeveloperApiDocsPage() {
  return (
    <ComingSoon
      title="API documentation"
      description="Reference for the BAS business API."
      items={[
        'Authentication and rate limits',
        'Endpoints for conversations, orders, bookings',
        'Webhook event reference',
      ]}
    />
  );
}