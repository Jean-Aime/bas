'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';
import { toast } from 'sonner';

export function CategoryManager({
  businessId,
  table,
  title,
  description,
}: {
  businessId: string;
  table: 'product_categories' | 'service_categories';
  title: string;
  description: string;
}) {
  const [rows, setRows] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from(table)
      .select('id, name')
      .eq('business_id', businessId)
      .order('name');
    setRows((data || []) as { id: string; name: string }[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [businessId, table]);

  const add = async () => {
    if (!name.trim()) return;
    setAdding(true);
    const { error } = await supabase.from(table).insert({ business_id: businessId, name: name.trim() });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setName('');
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id).eq('business_id', businessId);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            />
            <Button onClick={add} disabled={adding || !name.trim()}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No categories yet" description="Add your first category above." />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
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