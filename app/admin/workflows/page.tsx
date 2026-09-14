'use client';

import { ComingSoon } from '@/components/ui/page-states';

export default function AdminWorkflowsPage() {
  return (
    <ComingSoon
      title="Workflow templates"
      description="Platform-wide automation templates that businesses can apply."
      items={[
        'Maintain the template library',
        'Publish, deprecate, and version templates',
        'See which businesses use each template',
        'Template performance and failure rates',
      ]}
    />
  );
}