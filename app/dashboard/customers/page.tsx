'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { fetchCustomers } from '@/lib/services/crm-service';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Users, UserSearch } from 'lucide-react';
import Link from 'next/link';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
  const { currentBusiness } = useBusiness();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    let cancelled = false;
    setLoading(true);
    fetchCustomers(currentBusiness.id).then((rows) => {
      if (!cancelled) { setCustomers(rows); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [currentBusiness]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Customer records from conversations and orders" />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <UserSearch className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-medium">No customers yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                When customers chat with your AI assistant, their records appear here automatically.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/customers/${c.id}`} className="transition-colors hover:text-primary hover:underline">{c.name || 'Anonymous'}</Link>
                    </TableCell>
                    <TableCell>{c.email || '—'}</TableCell>
                    <TableCell>{c.phone || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
