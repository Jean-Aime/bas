import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { loadBusinessContext } from '@/lib/workflow/engine';
import { processMessage } from '@/lib/ai';
import { LocalAIProvider } from '@/lib/ai/local-provider';
import { emit } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const { workflowId, businessId, message } = await req.json();

    if (!workflowId || !businessId || !message) {
      return NextResponse.json({ error: 'workflowId, businessId, and message are required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: workflow } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('business_id', businessId)
      .maybeSingle();

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const context = await loadBusinessContext(businessId);
    const steps: Array<{ name: string; status: string; message: string }> = [];

    const provider = new LocalAIProvider();
    const { intent, confidence } = await provider.detectIntent(message, context);
    steps.push({
      name: 'Detect Intent',
      status: 'completed',
      message: `Detected intent: ${intent} (${(confidence * 100).toFixed(0)}% confidence)`,
    });

    const triggerIntent = (workflow.trigger_condition as Record<string, string>)?.intent;
    if (triggerIntent && triggerIntent !== intent) {
      steps.push({
        name: 'Trigger Match',
        status: 'skipped',
        message: `Workflow triggers on "${triggerIntent}" but message was classified as "${intent}". No match.`,
      });

      const { data: exec } = await supabase.from('workflow_executions').insert({
        business_id: businessId,
        workflow_id: workflowId,
        conversation_id: null,
        status: 'completed',
        trigger_data: { message, intent, test: true },
        result: { matched: false, triggerIntent },
        completed_at: new Date().toISOString(),
      }).select('id').single();

      if (exec?.id) {
        for (let i = 0; i < steps.length; i++) {
          await supabase.from('workflow_execution_logs').insert({
            execution_id: exec.id,
            business_id: businessId,
            step_name: steps[i].name,
            step_index: i,
            status: steps[i].status,
            message: steps[i].message,
          });
        }
      }

      return NextResponse.json({
        executionId: exec?.id,
        matched: false,
        steps,
        reply: null,
        intent,
        confidence,
      });
    }

    steps.push({
      name: 'Trigger Match',
      status: 'completed',
      message: triggerIntent ? `Message classified as "${intent}", matching workflow trigger` : 'Workflow has no trigger condition — runs on all messages',
    });

    const aiResponse = await processMessage({
      message,
      businessContext: context,
      conversationHistory: [],
    });

    steps.push({
      name: 'Generate Response',
      status: 'completed',
      message: `Intent: ${aiResponse.intent}, Confidence: ${(aiResponse.confidence * 100).toFixed(0)}%, Action: ${aiResponse.actionType}`,
    });

    if (aiResponse.shouldEscalate) {
      steps.push({
        name: 'Human Handover',
        status: 'completed',
        message: aiResponse.escalateReason || 'Escalation triggered',
      });
    }

    const { data: exec } = await supabase.from('workflow_executions').insert({
      business_id: businessId,
      workflow_id: workflowId,
      conversation_id: null,
      status: 'completed',
      trigger_data: { message, intent, test: true },
      result: { response: aiResponse.reply, confidence: aiResponse.confidence, shouldEscalate: aiResponse.shouldEscalate },
      completed_at: new Date().toISOString(),
    }).select('id').single();

    const executionId = exec?.id || '';

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

    await emit('workflow.completed', businessId, {
      workflowId,
      executionId,
      intent: aiResponse.intent,
      test: true,
    });

    return NextResponse.json({
      executionId,
      matched: true,
      steps,
      reply: aiResponse.reply,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      shouldEscalate: aiResponse.shouldEscalate,
      actionType: aiResponse.actionType,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Workflow test failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}