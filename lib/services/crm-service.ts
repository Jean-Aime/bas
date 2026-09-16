import { supabase } from '@/lib/supabase/client';
import type { Booking, Conversation, Customer, Order } from '@/lib/types';

/**
 * CRM service (client-side). Customer, order, booking, and conversation
 * reads/status updates — the last direct Supabase calls move behind here.
 */

/* ----------------------------- Customers ------------------------------ */

export async function fetchCustomers(businessId: string): Promise<Customer[]> {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return (data || []) as Customer[];
}

/* ------------------------------- Orders ------------------------------- */

export async function fetchOrders(businessId: string): Promise<Order[]> {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return (data || []) as Order[];
}

export async function updateOrderStatus(id: string, status: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  return { error: error?.message ?? null };
}

/* ------------------------------ Bookings ------------------------------ */

export async function fetchBookings(businessId: string): Promise<Booking[]> {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return (data || []) as Booking[];
}

export async function updateBookingStatus(id: string, status: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  return { error: error?.message ?? null };
}

/* ---------------------------- Conversations --------------------------- */

export async function fetchConversations(businessId: string): Promise<Conversation[]> {
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });
  return (data || []) as Conversation[];
}

/* --------------------- Command menu data search ----------------------- */

export interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  kind: 'conversation' | 'customer' | 'workflow';
}

async function searchConversations(businessId: string, q: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('conversations')
    .select('id, channel, detected_intent, status')
    .eq('business_id', businessId)
    .or(`detected_intent.ilike.%${q}%,channel.ilike.${q}%,status.ilike.${q}%`)
    .limit(4);
  return ((data || []) as Array<{ id: string; channel: string; detected_intent: string | null; status: string }>).map((c) => ({
    id: c.id,
    label: `${c.channel} — ${c.detected_intent || 'general'}`,
    sublabel: `Conversation · ${c.status}`,
    href: `/dashboard/conversations/${c.id}`,
    kind: 'conversation',
  }));
}

async function searchCustomers(businessId: string, q: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('customers')
    .select('id, name, email, phone')
    .eq('business_id', businessId)
    .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    .limit(4);
  return ((data || []) as Array<{ id: string; name: string | null; email: string | null; phone: string | null }>).map((c) => ({
    id: c.id,
    label: c.name || c.email || 'Anonymous',
    sublabel: [c.email, c.phone].filter(Boolean).join(' · ') || 'Customer',
    href: `/dashboard/customers/${c.id}`,
    kind: 'customer',
  }));
}

async function searchWorkflows(businessId: string, q: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('workflows')
    .select('id, name, status')
    .eq('business_id', businessId)
    .ilike('name', `%${q}%`)
    .limit(4);
  return ((data || []) as Array<{ id: string; name: string; status: string }>).map((w) => ({
    id: w.id,
    label: w.name,
    sublabel: `Workflow · ${w.status}`,
    href: `/dashboard/automation/${w.id}`,
    kind: 'workflow',
  }));
}

/** Parallel data search across the three entities. Errors resolve to []. */
export async function searchBusinessData(businessId: string, query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const [convs, customers, workflows] = await Promise.all([
    searchConversations(businessId, q).catch(() => []),
    searchCustomers(businessId, q).catch(() => []),
    searchWorkflows(businessId, q).catch(() => []),
  ]);
  return [...convs, ...customers, ...workflows].slice(0, 10);
}
