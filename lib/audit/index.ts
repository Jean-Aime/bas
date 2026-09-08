import { supabase } from '@/lib/supabase/client';
import type { AuditLog } from '@/lib/types';

export interface CreateAuditEntryInput {
  businessId: string | null;
  userId: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: Record<string, unknown>;
}

export async function createAuditEntry(input: CreateAuditEntryInput): Promise<AuditLog | null> {
  const { data, error } = await supabase.from('audit_logs').insert({
    business_id: input.businessId,
    user_id: input.userId,
    action: input.action,
    entity_type: input.entityType || null,
    entity_id: input.entityId || null,
    details: input.details || {},
  }).select().single();

  if (error) {
    console.error('Failed to create audit log:', error.message);
    return null;
  }
  return data as AuditLog;
}
