import type { WorkflowStep } from '@/lib/types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_intent: string;
  steps: WorkflowStep[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl_faq',
    name: 'Customer FAQ',
    description: 'Answer customer questions using business knowledge base',
    trigger_type: 'message',
    trigger_intent: 'FAQ',
    steps: [
      { name: 'Detect Intent', type: 'intent_detection', config: {} },
      { name: 'Search Knowledge Base', type: 'knowledge_search', config: {} },
      { name: 'Generate Response', type: 'response_generation', config: {} },
      { name: 'Send Reply', type: 'send_message', config: {} },
    ],
  },
  {
    id: 'tpl_product_inquiry',
    name: 'Product Inquiry',
    description: 'Handle customer questions about products',
    trigger_type: 'message',
    trigger_intent: 'PRODUCT_INQUIRY',
    steps: [
      { name: 'Detect Intent', type: 'intent_detection', config: {} },
      { name: 'Extract Entities', type: 'entity_extraction', config: {} },
      { name: 'Search Products', type: 'product_search', config: {} },
      { name: 'Generate Response', type: 'response_generation', config: {} },
      { name: 'Send Reply', type: 'send_message', config: {} },
    ],
  },
  {
    id: 'tpl_service_inquiry',
    name: 'Service Inquiry',
    description: 'Handle customer questions about services',
    trigger_type: 'message',
    trigger_intent: 'SERVICE_INQUIRY',
    steps: [
      { name: 'Detect Intent', type: 'intent_detection', config: {} },
      { name: 'Search Services', type: 'service_search', config: {} },
      { name: 'Generate Response', type: 'response_generation', config: {} },
      { name: 'Send Reply', type: 'send_message', config: {} },
    ],
  },
  {
    id: 'tpl_lead_capture',
    name: 'Lead Capture',
    description: 'Capture customer information for follow-up',
    trigger_type: 'message',
    trigger_intent: 'GENERAL_INQUIRY',
    steps: [
      { name: 'Detect Intent', type: 'intent_detection', config: {} },
      { name: 'Collect Customer Info', type: 'collect_info', config: {} },
      { name: 'Create Customer Record', type: 'create_customer', config: {} },
      { name: 'Notify Business', type: 'notify_business', config: {} },
      { name: 'Send Confirmation', type: 'send_message', config: {} },
    ],
  },
  {
    id: 'tpl_order_request',
    name: 'Order Request',
    description: 'Process customer order requests',
    trigger_type: 'message',
    trigger_intent: 'ORDER',
    steps: [
      { name: 'Detect Intent', type: 'intent_detection', config: {} },
      { name: 'Extract Product Info', type: 'entity_extraction', config: {} },
      { name: 'Check Product Availability', type: 'product_search', config: {} },
      { name: 'Return Price', type: 'response_generation', config: {} },
      { name: 'Ask for Confirmation', type: 'send_message', config: {} },
      { name: 'Collect Customer Information', type: 'collect_info', config: {} },
      { name: 'Create Order Record', type: 'create_order', config: {} },
      { name: 'Notify Business', type: 'notify_business', config: {} },
      { name: 'Confirm Customer', type: 'send_message', config: {} },
    ],
  },
  {
    id: 'tpl_booking_request',
    name: 'Booking Request',
    description: 'Process customer booking and appointment requests',
    trigger_type: 'message',
    trigger_intent: 'BOOKING',
    steps: [
      { name: 'Detect Intent', type: 'intent_detection', config: {} },
      { name: 'Identify Service', type: 'service_search', config: {} },
      { name: 'Check Schedule', type: 'check_availability', config: {} },
      { name: 'Show Available Times', type: 'response_generation', config: {} },
      { name: 'Customer Chooses Time', type: 'collect_info', config: {} },
      { name: 'Create Booking Record', type: 'create_booking', config: {} },
      { name: 'Notify Business', type: 'notify_business', config: {} },
      { name: 'Confirm Customer', type: 'send_message', config: {} },
    ],
  },
  {
    id: 'tpl_human_handover',
    name: 'Human Handover',
    description: 'Escalate conversation to human staff',
    trigger_type: 'message',
    trigger_intent: 'HUMAN_SUPPORT',
    steps: [
      { name: 'Detect Escalation Trigger', type: 'intent_detection', config: {} },
      { name: 'Check Staff Availability', type: 'check_staff', config: {} },
      { name: 'Transfer Conversation', type: 'handover', config: {} },
      { name: 'Notify Staff', type: 'notify_business', config: {} },
      { name: 'Inform Customer', type: 'send_message', config: {} },
    ],
  },
];

export function getTemplates(): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES;
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}
