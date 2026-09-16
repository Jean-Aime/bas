'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, Building2 } from 'lucide-react';

interface AuditRow {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export function AuditTab() {
  const { currentBusiness } = useBusiness();
  const [logs, setLogs] = useState<AuditRow[]>([]);

  useEffect(() => {
    if (currentBusiness) loadLogs();
  }, [currentBusiness]);

  const loadLogs = async () => {
    if (!currentBusiness) return;
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setLogs((data || []) as AuditRow[]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><ScrollText className="h-5 w-5" /> Audit Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <ScrollText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No audit events yet. Important actions like chat processing and workflows will appear here.</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.entity_type || 'system'}{log.entity_id ? ` · ${log.entity_id}` : ''}
                  </p>
                  {Object.keys(log.details || {}).length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground font-mono break-all">
                      {JSON.stringify(log.details).substring(0, 200)}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}