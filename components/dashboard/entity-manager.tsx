'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, type LucideIcon } from 'lucide-react';

interface EntityColumn<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

interface EntityManagerProps<T extends { id: string }> {
  /** Changes when the active business changes, triggering a reload. */
  businessId: string;
  title: string;
  description: string;
  entityLabel: string;
  icon: LucideIcon;
  emptyMessage: string;
  columns: EntityColumn<T>[];
  /** Map a row to form values; null means a fresh (empty) form. */
  toForm: (row: T | null) => Record<string, string>;
  renderForm: (form: Record<string, string>, onChange: (next: Record<string, string>) => void) => React.ReactNode;
  load: () => Promise<T[]>;
  save: (form: Record<string, string>, editing: T | null) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

export function EntityManager<T extends { id: string }>({
  businessId,
  title,
  description,
  entityLabel,
  icon: Icon,
  emptyMessage,
  columns,
  toForm,
  renderForm,
  load,
  save,
  remove,
}: EntityManagerProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await load();
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [businessId]);

  const reload = async () => {
    setRows(await load());
  };

  const openAdd = () => {
    setEditing(null);
    setForm(toForm(null));
    setDialogOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setForm(toForm(row));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (await save(form, editing)) {
      setDialogOpen(false);
      reload();
    }
  };

  const handleRemove = async (id: string) => {
    if (await remove(id)) reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add {entityLabel}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit' : 'Add'} {entityLabel}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {renderForm(form, setForm)}
                <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} {entityLabel}</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">{emptyMessage}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Entries you add here are available to the AI assistant and your workflows immediately.
            </p>
            <Button onClick={openAdd} size="sm" className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add {entityLabel}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={c.header}>{c.header}</TableHead>)}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="group">
                  {columns.map((c) => <TableCell key={c.header}>{c.render(row)}</TableCell>)}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleRemove(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
