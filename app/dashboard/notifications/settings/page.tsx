'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function NotificationSettingsPage() {
  return (
    <ComingSoon
      title="Notification settings"
      description="Choose which events notify you."
      items={[
        'New orders, bookings, and escalations',
        'Workflow failures',
        'In-app vs email delivery',
      ]}
    />
  );
}