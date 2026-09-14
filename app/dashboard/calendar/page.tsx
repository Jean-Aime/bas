'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Calendar"
      description="A visual calendar of bookings and appointments across your business."
      items={[
        'Day / week / month views of bookings',
        'Filter by service, staff, and status',
        'Drag-and-drop rescheduling',
        'External calendar integrations (Google, Outlook)',
      ]}
    />
  );
}