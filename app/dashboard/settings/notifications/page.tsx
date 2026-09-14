'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function SettingsNotificationsPage() {
  return (
    <ComingSoon
      title="Notification preferences"
      description="Choose which events notify you and your team."
      items={[
        'Orders, bookings, and escalations',
        'In-app vs email delivery',
        'Per-role defaults',
      ]}
    />
  );
}