import { createServerSupabase } from '@/lib/supabase/server';

export interface BusinessNotificationInput {
  title: string;
  message: string;
  type: string;
  link?: string;
}

/**
 * Single owner of in-app notification creation for a business tenant.
 * Best-effort by design: anonymous requests cannot read memberships or write
 * notifications, so failures are dropped silently rather than failing the
 * calling flow (e.g. the customer chat).
 */
async function getNotifiedUserId(businessId: string): Promise<string | null> {
  const supabase = createServerSupabase();

  const { data: owner } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('business_id', businessId)
    .eq('role', 'business_owner')
    .limit(1)
    .maybeSingle();

  if (owner?.user_id) return owner.user_id;

  const { data: member } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('business_id', businessId)
    .limit(1)
    .maybeSingle();

  return member?.user_id || null;
}

export async function notifyBusinessOwner(businessId: string, input: BusinessNotificationInput): Promise<void> {
  const userId = await getNotifiedUserId(businessId);
  if (!userId) return;
  await createServerSupabase().from('notifications').insert({
    business_id: businessId,
    user_id: userId,
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link || null,
    is_read: false,
  });
}