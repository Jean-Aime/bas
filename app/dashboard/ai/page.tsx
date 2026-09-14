'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AiPage() {
  return (
    <ComingSoon
      title="AI Assistant"
      description="Controls for how the assistant behaves for your business. The assistant is already live in customer chat; these settings are not built yet."
      items={[
        'Assistant configuration — provider, model, response behavior',
        'Test playground — ask questions against your business knowledge',
        'Confidence & escalation — thresholds and human handover rules',
        'Safety — guardrails so the AI never invents prices, availability, or policies',
      ]}
    />
  );
}
