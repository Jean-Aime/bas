'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help center"
      description="Documentation and support for running your business on BAS."
      items={[
        'Getting started guides',
        'Feature documentation',
        'Contact support',
      ]}
    />
  );
}