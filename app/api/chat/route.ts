import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { executeWorkflowForMessage, loadBusinessContext } from '@/lib/workflow/engine';
import { emit } from '@/lib/events';
import { createAuditEntry } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { businessId, message, conversationId, customerName } = await req.json();

    if (!businessId || typeof businessId !== 'string' || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'businessId and a non-empty message are required' }, { status: 400 });
    }
    const trimmed = message.trim();

    const supabase = createServerSupabase();

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .maybeSingle();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    let convId = typeof conversationId === 'string' ? conversationId : undefined;
    let customerId: string | null = null;

    if (convId) {
      // Reuse the conversation only if it exists and belongs to this business;
      // a stale or foreign conversation id starts a fresh conversation instead
      // of writing a message into another tenant's thread.
      const { data: existing } = await supabase
        .from('conversations')
        .select('id, business_id, customer_id')
        .eq('id', convId)
        .maybeSingle();

      if (!existing || existing.business_id !== businessId) {
        convId = undefined;
      } else {
        customerId = existing.customer_id || null;
      }
    }

    if (!convId) {
      // Every new visitor gets a customer record so the dashboard Customers
      // page and conversations always have an owner.
      const name = customerName && typeof customerName === 'string' ? customerName.trim() : null;

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({ business_id: businessId, name: name || null })
        .select('id')
        .single();

      if (customerError) {
        throw new Error(`Failed to create customer: ${customerError.message}`);
      }
      customerId = customer?.id || null;

      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          business_id: businessId,
          customer_id: customerId,
          channel: 'web_chat',
          status: 'active',
        })
        .select('id')
        .single();

      if (convError) {
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }
      convId = conv?.id;
      if (!convId) {
        throw new Error('Failed to create conversation');
      }

      await emit('conversation.created', businessId, { conversationId: convId, customerId, channel: 'web_chat' });
      if (customerId) await emit('customer.created', businessId, { customerId, name });
    }

    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: convId,
      business_id: businessId,
      sender_type: 'customer',
      content: trimmed,
    });
    if (messageError) {
      throw new Error(`Failed to store message: ${messageError.message}`);
    }

    await emit('message.received', businessId, { conversationId: convId, content: trimmed });

    const context = await loadBusinessContext(businessId);

    const result = await executeWorkflowForMessage(businessId, convId, trimmed, context);

    await supabase
      .from('conversations')
      .update({
        detected_intent: result.response.intent,
        confidence: result.response.confidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', convId);

    await emit('intent.detected', businessId, { conversationId: convId, intent: result.response.intent, confidence: result.response.confidence });

    if (result.response.shouldEscalate) {
      await emit('handover.requested', businessId, { conversationId: convId, reason: 'AI escalation' });
    }

    await createAuditEntry({
      businessId,
      userId: null,
      action: 'chat.message_processed',
      entityType: 'conversation',
      entityId: convId,
      details: { intent: result.response.intent, confidence: result.response.confidence },
    });

    return NextResponse.json({
      conversationId: convId,
      reply: result.response.reply,
      intent: result.response.intent,
      confidence: result.response.confidence,
      shouldEscalate: result.response.shouldEscalate,
      steps: result.steps,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Chat processing failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}