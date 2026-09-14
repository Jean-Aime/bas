'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminAiPage() {
  return (
    <ComingSoon
      title="AI configuration"
      description="Platform-level AI provider and model management."
      items={[
        'Configure AI providers behind the abstraction',
        'Default models, quotas, and cost tracking',
        'Content and safety policies',
        'Fallback and failover rules',
      ]}
    />
  );
}