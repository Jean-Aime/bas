'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function SettingsBillingPage() {
  return (
    <ComingSoon
      title="Billing"
      description="Plan and subscription management."
      items={[
        'Plan overview (Starter / Business / Professional / Enterprise)',
        'Payment methods and invoices',
        'Usage and limits',
      ]}
    />
  );
}