import type {
  Booking,
  Conversation,
  CustomerRequest,
  Message,
  Order,
  Workflow,
  WorkflowExecution,
  WorkflowExecutionLog,
} from '@/lib/types';
import { getTemplates } from '@/lib/workflow/templates';
import {
  BACKGROUND_MESSAGE_BASE,
  buildAuditLogs,
  buildBusinessHours,
  buildBusinessLocations,
  buildBusinessPolicies,
  buildBusinessProfiles,
  buildBusinessRules,
  buildBusinesses,
  buildConversationMessages,
  buildCustomers,
  buildFaqs,
  buildKnowledgeDocuments,
  buildKnowledgeSources,
  buildMemberships,
  buildNotifications,
  buildProductCategories,
  buildProducts,
  buildServiceCategories,
  buildServices,
  CONVERSATION_SPECS,
  EXECUTION_SPECS,
  isoDaysAgo,
  isoMinutesAgo,
  mulberry32,
  BOOKING_SPECS,
  ORDER_SPECS,
  REQUEST_SPECS,
  type TimeHelpers,
} from './demo-specs';

/**
 * Demo dataset builder — assembles the seeded snapshot from the builders in
 * demo-specs.ts plus the generative parts (background message volume,
 * workflow runs and step logs, and the order/booking/request joins).
 *
 * Determinism contract:
 *   - Seeded IDs (biz_*, cust_*, conv_*, ord_*, …) are stable across runs.
 *   - The RNG is seeded (mulberry32), so background volume is identical
 *     between resets.
 *   - Timestamps are relative to "now" so charts always look populated.
 *
 * The dataset lives in a mutable in-memory store inside demo-client.ts; this
 * module only builds the initial snapshot.
 */

export interface DemoDataset {
  businesses: ReturnType<typeof buildBusinesses>;
  memberships: ReturnType<typeof buildMemberships>;
  business_profiles: Array<Record<string, unknown>>;
  business_hours: ReturnType<typeof buildBusinessHours>;
  business_locations: ReturnType<typeof buildBusinessLocations>;
  business_policies: ReturnType<typeof buildBusinessPolicies>;
  business_rules: Array<Record<string, unknown>>;
  product_categories: Array<Record<string, unknown>>;
  products: ReturnType<typeof buildProducts>;
  service_categories: Array<Record<string, unknown>>;
  services: ReturnType<typeof buildServices>;
  faqs: ReturnType<typeof buildFaqs>;
  knowledge_sources: ReturnType<typeof buildKnowledgeSources>;
  knowledge_documents: ReturnType<typeof buildKnowledgeDocuments>;
  customers: ReturnType<typeof buildCustomers>;
  conversations: Conversation[];
  messages: Message[];
  workflows: Workflow[];
  workflow_executions: WorkflowExecution[];
  workflow_execution_logs: WorkflowExecutionLog[];
  orders: Order[];
  bookings: Booking[];
  requests: CustomerRequest[];
  notifications: ReturnType<typeof buildNotifications>;
  audit_logs: ReturnType<typeof buildAuditLogs>;
}

/* ---------------------------------------------------------------------- */
/* Background message volume                                                */
/* ---------------------------------------------------------------------- */

/** Message volume for the last 42 days: weekday-heavy, gentle upward trend. */
function backgroundMessageTimestamps(rand: () => number, businessIndex: number): string[] {
  const stamps: string[] = [];
  for (let d = 41; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86_400_000);
    const weekday = date.getDay(); // 0 = Sunday
    const weekendDamp = weekday === 0 ? 0.45 : weekday === 6 ? 0.75 : 1;
    const trend = 1 + (41 - d) / 42; // grows ~2x over the window
    const base = BACKGROUND_MESSAGE_BASE[businessIndex];
    let n = Math.floor(base * weekendDamp * trend * (0.6 + rand() * 0.9));
    n = Math.max(1, n);
    for (let i = 0; i < n; i++) {
      const hour = 8 + Math.floor(rand() * 11); // 08:00–18:59 local
      date.setHours(hour, Math.floor(rand() * 60), 0, 0);
      stamps.push(new Date(date).toISOString());
    }
  }
  return stamps.sort((a, b) => a.localeCompare(b));
}

/** Synthetic "background" conversations feed the volume/trend charts. */
function buildBackgroundMessages(
  businesses: DemoDataset['businesses'],
  rand: () => number
): Message[] {
  const out: Message[] = [];
  businesses.forEach((b, bi) => {
    const stamps = backgroundMessageTimestamps(rand, bi);
    stamps.forEach((ts, i) => {
      out.push({
        id: `bgmsg_${b.id}_${i}`,
        conversation_id: `bgconv_${b.id}_${Math.floor(i / 4)}`,
        business_id: b.id,
        sender_type: i % 2 === 0 ? 'customer' : 'assistant',
        content: 'Background demo message',
        intent: null,
        confidence: null,
        metadata: {},
        created_at: ts,
      });
    });
  });
  return out;
}

/* ---------------------------------------------------------------------- */
/* Workflow generation                                                      */
/* ---------------------------------------------------------------------- */

/** Builds every workflow for a business: one per template, plus salon's bespoke one. */
function buildWorkflowsForBusiness(
  business: DemoDataset['businesses'][number],
  businessIndex: number,
  templateCount: number,
  h: TimeHelpers
): Workflow[] {
  const workflows: Workflow[] = [];
  getTemplates().forEach((tpl, ti) => {
    workflows.push({
      id: `wf_${businessIndex}_${ti}`,
      business_id: business.id,
      name: tpl.name,
      description: tpl.description,
      trigger_type: tpl.trigger_type,
      trigger_condition: { intent: tpl.trigger_intent },
      steps: tpl.steps,
      status: ti === templateCount - 1 && businessIndex === 0 ? 'inactive' : 'active',
      version: 1 + ((businessIndex + ti) % 3),
      is_template: false,
      template_id: tpl.id,
      created_at: h.isoDaysAgo(42 - businessIndex),
      updated_at: h.isoDaysAgo(2),
    });
  });

  if (business.id === 'biz_salon') {
    workflows.push({
      id: 'wf_salon_appt',
      business_id: business.id,
      name: 'Appointment Availability',
      description: 'Answer availability questions and offer to submit a booking request',
      trigger_type: 'message',
      trigger_condition: { intent: 'APPOINTMENT' },
      steps: [
        { name: 'Detect Intent', type: 'intent_detection', config: {} },
        { name: 'Check Schedule', type: 'check_availability', config: {} },
        { name: 'Show Available Times', type: 'response_generation', config: {} },
        { name: 'Collect Preferred Time', type: 'collect_info', config: {} },
        { name: 'Send Reply', type: 'send_message', config: {} },
      ],
      status: 'active',
      version: 2,
      is_template: false,
      template_id: null,
      created_at: h.isoDaysAgo(20),
      updated_at: h.isoDaysAgo(4),
    });
  }

  return workflows;
}

/** Replays execution specs into executions + per-step logs. */
function buildWorkflowRuns(
  workflows: Workflow[],
  h: TimeHelpers
): { workflow_executions: WorkflowExecution[]; workflow_execution_logs: WorkflowExecutionLog[] } {
  const workflow_executions: WorkflowExecution[] = [];
  const workflow_execution_logs: WorkflowExecutionLog[] = [];

  const workflowsByTemplate = new Map<string, Workflow[]>();
  workflows.forEach((w) => {
    const list = workflowsByTemplate.get(w.template_id || w.id) || [];
    list.push(w);
    workflowsByTemplate.set(w.template_id || w.id, list);
  });

  EXECUTION_SPECS.forEach((spec, i) => {
    const wf = (workflowsByTemplate.get(spec.workflowTplId) || []).find((w) => w.business_id === spec.business_id) || null;
    if (!wf) return;
    const started = spec.daysAgo === 0 ? h.isoMinutesAgo(90 + i * 20) : h.isoDaysAgo(spec.daysAgo, 10 + (i % 7));
    const completed = spec.status === 'running' ? null : new Date(new Date(started).getTime() + 42_000).toISOString();
    workflow_executions.push({
      id: spec.id,
      business_id: spec.business_id,
      workflow_id: wf.id,
      conversation_id: spec.conversation_id,
      status: spec.status,
      trigger_data: { message: spec.triggerMessage },
      result: spec.status === 'completed' ? { reply: 'Handled automatically', intent: wf.trigger_condition?.intent ?? null } : {},
      started_at: started,
      completed_at: completed,
    });

    wf.steps.forEach((step, si) => {
      const stepTime = new Date(new Date(started).getTime() + (si + 1) * 6_000).toISOString();
      if (spec.status === 'failed' && si === wf.steps.length - 1) {
        workflow_execution_logs.push({
          id: `wlog_${spec.id}_${si}`,
          execution_id: spec.id,
          business_id: spec.business_id,
          step_name: step.name,
          step_index: si,
          status: 'failed',
          message: 'Knowledge search returned no results; response generation aborted',
          data: {},
          created_at: stepTime,
        });
      } else if (spec.status === 'running' && si > 1) {
        return; // pending steps have no logs yet
      } else {
        workflow_execution_logs.push({
          id: `wlog_${spec.id}_${si}`,
          execution_id: spec.id,
          business_id: spec.business_id,
          step_name: step.name,
          step_index: si,
          status: 'completed',
          message: 'Step completed',
          data: {},
          created_at: stepTime,
        });
      }
    });
  });

  return { workflow_executions, workflow_execution_logs };
}

/* ---------------------------------------------------------------------- */
/* Snapshot builder                                                         */
/* ---------------------------------------------------------------------- */

export function buildDemoDataset(): DemoDataset {
  const h: TimeHelpers = { isoDaysAgo, isoMinutesAgo };

  const businesses = buildBusinesses(h);
  const products = buildProducts(h);
  const services = buildServices(h);

  const conversations: Conversation[] = [];
  const conversationMessages: Message[] = [];
  CONVERSATION_SPECS.forEach((spec, ci) => {
    const { conversation, messages } = buildConversationMessages(spec, ci, h);
    conversations.push(conversation);
    conversationMessages.push(...messages);
  });
  const messages = [...conversationMessages, ...buildBackgroundMessages(businesses, mulberry32(20260916))];

  const workflows: Workflow[] = [];
  const templateCount = getTemplates().length;
  businesses.forEach((b, bi) => {
    workflows.push(...buildWorkflowsForBusiness(b, bi, templateCount, h));
  });
  const { workflow_executions, workflow_execution_logs } = buildWorkflowRuns(workflows, h);

  const orders: Order[] = ORDER_SPECS.map((o, i) => {
    const product = products.find((p) => p.id === o.product_id)!;
    return {
      id: o.id,
      business_id: o.business_id,
      customer_id: o.customer_id,
      conversation_id: o.conversation_id,
      product_id: o.product_id,
      quantity: o.quantity,
      total_amount: product.price * o.quantity,
      currency: product.currency,
      status: o.status,
      notes: null,
      metadata: {},
      created_at: isoDaysAgo(o.createdDaysAgo, 9 + i),
      updated_at: isoDaysAgo(o.createdDaysAgo, 12 + i),
    };
  });

  const bookings: Booking[] = BOOKING_SPECS.map((b, i) => {
    const service = services.find((s) => s.id === b.service_id)!;
    const date = new Date(Date.now() + b.inDays * 86_400_000);
    return {
      id: b.id,
      business_id: b.business_id,
      customer_id: b.customer_id,
      conversation_id: b.conversation_id,
      service_id: b.service_id,
      requested_date: date.toISOString().slice(0, 10),
      requested_time: b.time,
      status: b.status,
      notes: null,
      metadata: { service_name: service.name },
      created_at: isoDaysAgo(b.createdDaysAgo, 8 + i),
      updated_at: isoDaysAgo(b.createdDaysAgo, 10 + i),
    };
  });

  const requests: CustomerRequest[] = REQUEST_SPECS.map((r, i) => ({
    id: r.id,
    business_id: r.business_id,
    customer_id: r.customer_id,
    conversation_id: r.conversation_id,
    request_type: r.request_type,
    title: r.title,
    description: r.description,
    status: r.status,
    priority: r.priority,
    metadata: {},
    created_at: isoDaysAgo(r.createdDaysAgo, 9 + i),
    updated_at: isoDaysAgo(r.createdDaysAgo, 11 + i),
  }));

  return {
    businesses,
    memberships: buildMemberships(businesses, h),
    business_profiles: buildBusinessProfiles(businesses, h),
    business_hours: buildBusinessHours(businesses),
    business_locations: buildBusinessLocations(h),
    business_policies: buildBusinessPolicies(h),
    business_rules: buildBusinessRules(h),
    product_categories: buildProductCategories(h),
    products,
    service_categories: buildServiceCategories(h),
    services,
    faqs: buildFaqs(h),
    knowledge_sources: buildKnowledgeSources(h),
    knowledge_documents: buildKnowledgeDocuments(h),
    customers: buildCustomers(h),
    conversations,
    messages,
    workflows,
    workflow_executions,
    workflow_execution_logs,
    orders,
    bookings,
    requests,
    notifications: buildNotifications(h),
    audit_logs: buildAuditLogs(h),
  };
}
