import { createServerSupabase } from '@/lib/supabase/server';
import { processMessage } from '@/lib/ai';
import { LocalAIProvider } from '@/lib/ai/local-provider';
import type { BusinessContextData } from '@/lib/ai/provider';
import type { IntentType } from '@/lib/types';
import { emit } from '@/lib/events';
import { notifyBusinessOwner } from '@/lib/notifications';
import { createOrderRecord, createBookingRecord } from '@/lib/workflow/records';

export interface WorkflowExecutionResult {
  executionId: string;
  status: 'completed' | 'failed';
  steps: Array<{
    name: string;
    status: 'completed' | 'failed' | 'skipped';
    message: string;
  }>;
  response: {
    intent: IntentType;
    confidence: number;
    reply: string;
    shouldEscalate: boolean;
    actionType: string;
  };
}

export async function executeWorkflowForMessage(
  businessId: string,
  conversationId: string,
  customerMessage: string,
  context: BusinessContextData
): Promise<WorkflowExecutionResult> {
  const supabase = createServerSupabase();
  const steps: WorkflowExecutionResult['steps'] = [];

  try {
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    let matchedWorkflow = null;
    if (workflows && workflows.length > 0) {
      const provider = new LocalAIProvider();
      const { intent: detectedIntent } = await provider.detectIntent(customerMessage, context);

      matchedWorkflow = workflows.find((w: Record<string, unknown>) => {
        const triggerIntent = (w.trigger_condition as Record<string, string>)?.intent;
        return !triggerIntent || triggerIntent === detectedIntent;
      }) || workflows[0];
    }

    steps.push({ name: 'Detect Intent', status: 'completed', message: 'Intent detected from customer message' });

    const aiResponse = await processMessage({
      message: customerMessage,
      businessContext: context,
      conversationHistory: [],
    });

    steps.push({ name: 'Generate Response', status: 'completed', message: `Intent: ${aiResponse.intent}, Confidence: ${(aiResponse.confidence * 100).toFixed(0)}%` });

    if (aiResponse.shouldEscalate) {
      steps.push({ name: 'Human Handover', status: 'completed', message: aiResponse.escalateReason || 'Escalation triggered' });

      await supabase
        .from('conversations')
        .update({ is_handover: true, status: 'handover', detected_intent: aiResponse.intent, confidence: aiResponse.confidence })
        .eq('id', conversationId);

      await notifyBusinessOwner(businessId, {
        title: 'Conversation Escalated',
        message: `A customer conversation requires human attention: ${aiResponse.escalateReason || 'Customer requested human support'}`,
        type: 'warning',
        link: `/dashboard/conversations/${conversationId}`,
      });

      await emit('handover.requested', businessId, {
        conversationId,
        reason: aiResponse.escalateReason || 'AI escalation',
      });
    }

    if (aiResponse.actionType === 'order' && aiResponse.intent === 'ORDER') {
      const product = context.products.find((p) =>
        customerMessage.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
      );
      if (product) {
        const order = await createOrderRecord({
          businessId,
          conversationId,
          productName: product.name,
          price: product.price,
          currency: context.currency,
        });

        steps.push({ name: 'Create Order Record', status: 'completed', message: `Order request created for ${product.name}` });

        await notifyBusinessOwner(businessId, {
          title: 'New Order Request',
          message: `${product.name} — ${context.currency} ${product.price}`,
          type: 'info',
          link: '/dashboard/orders',
        });

        await emit('order.created', businessId, {
          orderId: order?.id,
          conversationId,
          notes: `Order request from chat: ${product.name}`,
          total: product.price,
        });
      }
    }

    if ((aiResponse.actionType === 'booking' || aiResponse.actionType === 'request') &&
        (aiResponse.intent === 'BOOKING' || aiResponse.intent === 'APPOINTMENT')) {
      const booking = await createBookingRecord({
        businessId,
        conversationId,
        customerMessage,
      });

      steps.push({ name: 'Create Booking Record', status: 'completed', message: 'Booking request created' });

      await notifyBusinessOwner(businessId, {
        title: 'New Booking Request',
        message: `A customer requested a booking: ${customerMessage.substring(0, 120)}`,
        type: 'info',
        link: '/dashboard/bookings',
      });

      await emit('booking.created', businessId, {
        bookingId: booking?.id,
        conversationId,
        requestedDate: null,
      });
    }

    let executionId = '';

    if (matchedWorkflow) {
      const { data: exec } = await supabase.from('workflow_executions').insert({
        business_id: businessId,
        workflow_id: matchedWorkflow.id,
        conversation_id: conversationId,
        status: 'completed',
        trigger_data: { message: customerMessage, intent: aiResponse.intent },
        result: { response: aiResponse.reply, confidence: aiResponse.confidence },
        completed_at: new Date().toISOString(),
      }).select('id').single();

      executionId = exec?.id || '';

      for (let i = 0; i < steps.length; i++) {
        await supabase.from('workflow_execution_logs').insert({
          execution_id: executionId,
          business_id: businessId,
          step_name: steps[i].name,
          step_index: i,
          status: steps[i].status,
          message: steps[i].message,
        });
      }

      await emit(aiResponse.shouldEscalate ? 'workflow.failed' : 'workflow.completed', businessId, {
        workflowId: matchedWorkflow.id,
        executionId,
        conversationId,
        intent: aiResponse.intent,
      });
    }

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      business_id: businessId,
      sender_type: 'assistant',
      content: aiResponse.reply,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
    });

    return {
      executionId,
      status: 'completed',
      steps,
      response: {
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        reply: aiResponse.reply,
        shouldEscalate: aiResponse.shouldEscalate,
        actionType: aiResponse.actionType,
      },
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    steps.push({ name: 'Workflow Execution', status: 'failed', message: errMsg });

    await emit('workflow.failed', businessId, { conversationId, reason: errMsg });

    return { executionId: '', status: 'failed', steps, response: { intent: 'GENERAL_INQUIRY', confidence: 0, reply: 'I apologize, I encountered an error. Let me connect you with our team.', shouldEscalate: true, actionType: 'handover' } };
  }
}

export async function loadBusinessContext(businessId: string): Promise<BusinessContextData> {
  const supabase = createServerSupabase();

  const [{ data: business }, { data: products }, { data: services }, { data: faqs }, { data: policies }, { data: hours }, { data: knowledgeDocs }] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).maybeSingle(),
    supabase.from('products').select('name, description, price, attributes, stock, is_active').eq('business_id', businessId).eq('is_active', true),
    supabase.from('services').select('name, description, price, duration_minutes, is_active').eq('business_id', businessId).eq('is_active', true),
    supabase.from('faqs').select('question, answer, is_published').eq('business_id', businessId).eq('is_published', true),
    supabase.from('business_policies').select('title, content, category').eq('business_id', businessId),
    supabase.from('business_hours').select('day_of_week, open_time, close_time, is_closed').eq('business_id', businessId),
    supabase.from('knowledge_documents').select('title, content').eq('business_id', businessId),
  ]);

  return {
    businessId,
    businessName: business?.name || 'Business',
    description: business?.description || null,
    currency: business?.currency || 'USD',
    products: (products || []) as BusinessContextData['products'],
    services: (services || []) as BusinessContextData['services'],
    faqs: (faqs || []) as BusinessContextData['faqs'],
    policies: (policies || []) as BusinessContextData['policies'],
    hours: (hours || []) as BusinessContextData['hours'],
    knowledgeDocuments: (knowledgeDocs || []) as BusinessContextData['knowledgeDocuments'],
  };
}