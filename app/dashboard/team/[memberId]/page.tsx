'use client';

import { useParams } from 'next/navigation';
import { ComingSoon } from '@/components/ui/page-states';

export default function TeamMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  return (
    <ComingSoon
      title="Team member"
      description={`Member profile ${memberId}.`}
      items={[
        'Contact and role',
        'Assigned conversations and operations',
        'Activity history',
      ]}
    />
  );
}