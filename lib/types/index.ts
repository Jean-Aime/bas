export type BusinessType = 'clothing_store' | 'salon' | 'hotel' | 'restaurant' | 'ngo' | 'professional' | 'general';

export type UserRole = 'platform_admin' | 'business_owner' | 'business_admin' | 'staff' | 'automation_manager';

export type ConversationStatus = 'active' | 'resolved' | 'pending' | 'handover';

export type MessageSenderType = 'customer' | 'assistant' | 'staff' | 'system';

export type WorkflowStatus = 'active' | 'inactive' | 'draft';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export type RequestStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export type IntentType =
  | 'PRODUCT_INQUIRY'
  | 'SERVICE_INQUIRY'
  | 'PRICE_INQUIRY'
  | 'ORDER'
  | 'BOOKING'
  | 'APPOINTMENT'
  | 'AVAILABILITY'
  | 'DELIVERY'
  | 'PAYMENT'
  | 'CANCELLATION'
  | 'RETURN'
  | 'COMPLAINT'
  | 'FAQ'
  | 'HUMAN_SUPPORT'
  | 'GENERAL_INQUIRY';

export interface Business {
  id: string;
  name: string;
  type: string;
  country: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  website_url: string | null;
  currency: string;
  timezone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  business_id: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  sku: string | null;
  attributes: Record<string, string>;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessPolicy {
  id: string;
  business_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHour {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface BusinessLocation {
  id: string;
  business_id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface KnowledgeSource {
  id: string;
  business_id: string;
  source_type: string;
  title: string;
  url: string | null;
  content: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  business_id: string;
  source_id: string | null;
  title: string;
  content: string;
  doc_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string | null;
  channel: string;
  status: string;
  assigned_to: string | null;
  is_handover: boolean;
  detected_intent: string | null;
  confidence: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  business_id: string;
  sender_type: string;
  content: string;
  intent: string | null;
  confidence: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Workflow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_condition: Record<string, unknown>;
  steps: WorkflowStep[];
  status: string;
  version: number;
  is_template: boolean;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  business_id: string;
  workflow_id: string;
  conversation_id: string | null;
  status: string;
  trigger_data: Record<string, unknown>;
  result: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
}

export interface WorkflowExecutionLog {
  id: string;
  execution_id: string;
  business_id: string;
  step_name: string;
  step_index: number;
  status: string;
  message: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string | null;
  conversation_id: string | null;
  product_id: string | null;
  quantity: number;
  total_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string | null;
  conversation_id: string | null;
  service_id: string | null;
  requested_date: string | null;
  requested_time: string | null;
  status: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CustomerRequest {
  id: string;
  business_id: string;
  customer_id: string | null;
  conversation_id: string | null;
  request_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  business_id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  business_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
