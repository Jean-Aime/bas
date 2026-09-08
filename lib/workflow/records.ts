import { createServerSupabase } from '@/lib/supabase/server';

export interface OrderRecordInput {
  businessId: string;
  conversationId: string;
  productName: string;
  price: number;
  currency: string;
}

export async function createOrderRecord(input: OrderRecordInput): Promise<{ id: string } | null> {
  const { data, error } = await createServerSupabase().from('orders').insert({
    business_id: input.businessId,
    conversation_id: input.conversationId,
    product_id: null,
    quantity: 1,
    total_amount: input.price,
    currency: input.currency,
    status: 'pending',
    notes: `Order request from chat: ${input.productName}`,
  }).select('id').single();

  if (error) {
    console.error('Failed to create order record:', error.message);
    return null;
  }
  return data as { id: string };
}

export interface BookingRecordInput {
  businessId: string;
  conversationId: string;
  customerMessage: string;
}

export async function createBookingRecord(input: BookingRecordInput): Promise<{ id: string } | null> {
  const { data, error } = await createServerSupabase().from('bookings').insert({
    business_id: input.businessId,
    conversation_id: input.conversationId,
    status: 'pending',
    notes: `Booking request from chat: ${input.customerMessage.substring(0, 200)}`,
  }).select('id').single();

  if (error) {
    console.error('Failed to create booking record:', error.message);
    return null;
  }
  return data as { id: string };
}