'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function HelpDocumentationPage() {
  return (
    <ComingSoon
      title="Documentation"
      description="Guides for setting up and running your business on BAS."
      items={[
        'Getting started',
        'Setting up knowledge and the assistant',
        'Building workflows',
        'Managing orders, bookings, and team',
      ]}
    />
  );
}