'use client';

import { useBusiness } from '@/lib/auth/business-context';
import { CategoryManager } from '@/components/dashboard/category-manager';
import { LoadingState } from '@/components/ui/page-states';

export default function ServiceCategoriesPage() {
  const { currentBusiness } = useBusiness();
  if (!currentBusiness) return <LoadingState />;
  return (
    <CategoryManager
      businessId={currentBusiness.id}
      table="service_categories"
      title="Service categories"
      description="Organize your services into categories."
    />
  );
}