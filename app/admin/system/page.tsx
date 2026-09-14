'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminSystemPage() {
  return (
    <ComingSoon
      title="System settings"
      description="Platform configuration and feature management."
      items={[
        'Platform-wide settings and defaults',
        'Maintenance mode and announcements',
        'Background jobs and queue management',
        'Feature flags',
      ]}
    />
  );
}