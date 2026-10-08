'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, type LucideIcon } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="brand-fill border-0 shadow-sm hover:opacity-90 transition-all"><Plus className="mr-2 h-4 w-4" /> Add {entityLabel}</Button>
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
      </div>

      <div className="surface-raised rounded-2xl overflow-hidden">
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="flex h-10 w-10 items-center justify-center rounded-xl brand-fill shadow-sm"><Loader2 className="h-5 w-5 text-white animate-spin" /></div></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{emptyMessage}</p>
              <p className="text-xs text-muted-foreground mb-5">Get started by adding your first {entityLabel.toLowerCase()}.</p>
              <Button onClick={openAdd} size="sm" className="brand-fill border-0 shadow-sm"><Plus className="mr-2 h-4 w-4" /> Add {entityLabel}</Button>
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
                  <TableRow key={row.id}>
                    {columns.map((c) => <TableCell key={c.header}>{c.render(row)}</TableCell>)}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}