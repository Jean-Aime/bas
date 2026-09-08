'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BusinessHour } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function HoursTab() {
  const { currentBusiness } = useBusiness();
  const [hours, setHours] = useState<BusinessHour[]>([]);

  useEffect(() => {
    if (currentBusiness) loadHours();
  }, [currentBusiness]);

  const loadHours = async () => {
    if (!currentBusiness) return;
    const { data } = await supabase.from('business_hours').select('*').eq('business_id', currentBusiness.id).order('day_of_week', { ascending: true });
    setHours((data || []) as BusinessHour[]);
  };

  const updateHour = async (id: string, field: string, value: string | boolean) => {
    const update: Record<string, unknown> = { [field]: value };
    if (field === 'is_closed' && value === true) {
      update.open_time = null;
      update.close_time = null;
    }
    await supabase.from('business_hours').update(update).eq('id', id);
    loadHours();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Business Hours</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {hours.map((h) => (
          <div key={h.id} className="flex items-center gap-3 rounded-lg border p-3">
            <span className="w-28 font-medium text-sm">{DAYS[h.day_of_week]}</span>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!h.is_closed} onChange={(e) => updateHour(h.id, 'is_closed', !e.target.checked)} className="rounded" />
              Open
            </label>
            {!h.is_closed && (
              <div className="flex items-center gap-2">
                <Input type="time" value={h.open_time || '09:00'} onChange={(e) => updateHour(h.id, 'open_time', e.target.value)} className="w-32" />
                <span className="text-muted-foreground">—</span>
                <Input type="time" value={h.close_time || '18:00'} onChange={(e) => updateHour(h.id, 'close_time', e.target.value)} className="w-32" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}