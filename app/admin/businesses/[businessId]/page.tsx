'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ComingSoon } from '@/components/ui/page-states';
import { ArrowLeft } from 'lucide-react';

export default function AdminBusinessDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();

  return (
    <div className="space-y-4">
      <Link href="/admin/businesses">
        <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> All businesses</Button>
      </Link>
      <ComingSoon
        title="Business administration"
        description={`Administration view for business ${businessId}.`}
        items={[
          'Business profile, plan, and billing status',
          'Members and their roles',
          'Conversation, order, and booking activity',
          'Data export and tenant deletion',
        ]}
      />
    </div>
  );
}