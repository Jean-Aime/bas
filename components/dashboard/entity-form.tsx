'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

export function EntityForm({
  fields,
  initial,
  submitLabel,
  onSubmit,
  onCancelHref,
  loading = false,
}: {
  fields: FormField[];
  initial: Record<string, string>;
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => void;
  onCancelHref: string;
  loading?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const set = (name: string, value: string) => setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      {fields.map((f) => (
        <div key={f.name} className="space-y-2">
          <Label htmlFor={f.name}>{f.label}{f.required ? ' *' : ''}</Label>
          {f.type === 'textarea' ? (
            <Textarea
              id={f.name}
              rows={3}
              placeholder={f.placeholder}
              value={values[f.name] || ''}
              onChange={(e) => set(f.name, e.target.value)}
            />
          ) : (
            <Input
              id={f.name}
              type={f.type || 'text'}
              required={f.required}
              placeholder={f.placeholder}
              value={values[f.name] || ''}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        <a href={onCancelHref}>
          <Button type="button" variant="outline">Cancel</Button>
        </a>
      </div>
    </form>
  );
}