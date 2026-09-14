'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function ActivityPage() {
  return (
    <ComingSoon
      title="Activity"
      description="A timeline of everything happening across your business."
      items={[
        'Conversations, orders, bookings, and requests',
        'Automation runs and escalations',
        'Team member actions',
        'Filters by entity type and date',
      ]}
    />
  );
}