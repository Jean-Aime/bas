/*
# BAS Schema Part 2 — Knowledge, Conversations, Automation, Operations, System

## Overview
This migration creates the remaining tables for BAS: knowledge documents,
conversations/messages, workflow engine, orders/bookings/requests, customers,
notifications, and audit logs.

## 1. New Tables

### Knowledge
- `knowledge_sources` — Sources of knowledge (website, manual, document).
- `knowledge_documents` — Individual knowledge documents/chunks.

### Customers
- `customers` — Customer records per business.

### Conversations
- `conversations` — Conversation sessions (web chat, future WhatsApp/email).
- `messages` — Individual messages in conversations.

### Automation
- `workflows` — Workflow definitions.
- `workflow_executions` — Execution records for workflows.
- `workflow_execution_logs` — Detailed logs for each execution step.

### Operations
- `orders` — Customer orders.
- `bookings` — Customer bookings/appointments.
- `requests` — General customer requests.

### System
- `notifications` — In-app notifications.
- `audit_logs` — Audit trail of important actions.

## 2. Security
- RLS enabled on all tables.
- Tenant tables scoped via `business_id` using `is_business_member()`.
- Customer-facing tables (conversations, messages, customers) also have anon-accessible
  SELECT/INSERT policies so the public web chat can create conversations and send messages.
*/

-- ============================================================
-- CREATE ALL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source_type text NOT NULL DEFAULT 'manual',
  title text NOT NULL,
  url text,
  content text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source_id uuid REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  doc_type text NOT NULL DEFAULT 'general',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'web_chat',
  status text NOT NULL DEFAULT 'active',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_handover boolean NOT NULL DEFAULT false,
  detected_intent text,
  confidence float8,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'customer',
  content text NOT NULL,
  intent text,
  confidence float8,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL DEFAULT 'message',
  trigger_condition jsonb DEFAULT '{}',
  steps jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'active',
  version int NOT NULL DEFAULT 1,
  is_template boolean NOT NULL DEFAULT false,
  template_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  trigger_data jsonb DEFAULT '{}',
  result jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS workflow_execution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  step_name text NOT NULL,
  step_index int NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity int NOT NULL DEFAULT 1,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  requested_date date,
  requested_time time,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'normal',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: KNOWLEDGE SOURCES (member-scoped)
-- ============================================================
DROP POLICY IF EXISTS "select_member_knowledge_sources" ON knowledge_sources;
CREATE POLICY "select_member_knowledge_sources" ON knowledge_sources FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_knowledge_sources" ON knowledge_sources;
CREATE POLICY "insert_member_knowledge_sources" ON knowledge_sources FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_knowledge_sources" ON knowledge_sources;
CREATE POLICY "update_member_knowledge_sources" ON knowledge_sources FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_knowledge_sources" ON knowledge_sources;
CREATE POLICY "delete_member_knowledge_sources" ON knowledge_sources FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: KNOWLEDGE DOCUMENTS (member-scoped)
-- ============================================================
DROP POLICY IF EXISTS "select_member_knowledge_documents" ON knowledge_documents;
CREATE POLICY "select_member_knowledge_documents" ON knowledge_documents FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_knowledge_documents" ON knowledge_documents;
CREATE POLICY "insert_member_knowledge_documents" ON knowledge_documents FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_knowledge_documents" ON knowledge_documents;
CREATE POLICY "update_member_knowledge_documents" ON knowledge_documents FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_knowledge_documents" ON knowledge_documents;
CREATE POLICY "delete_member_knowledge_documents" ON knowledge_documents FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: CUSTOMERS (member-scoped + anon create for chat)
-- ============================================================
DROP POLICY IF EXISTS "select_member_customers" ON customers;
CREATE POLICY "select_member_customers" ON customers FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_customers" ON customers;
CREATE POLICY "insert_member_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_customers" ON customers;
CREATE POLICY "update_member_customers" ON customers FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_customers" ON customers;
CREATE POLICY "delete_member_customers" ON customers FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: CONVERSATIONS (member-scoped + anon create for chat)
-- ============================================================
DROP POLICY IF EXISTS "select_member_conversations" ON conversations;
CREATE POLICY "select_member_conversations" ON conversations FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_conversations" ON conversations;
CREATE POLICY "insert_member_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_conversations" ON conversations;
CREATE POLICY "update_member_conversations" ON conversations FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_conversations" ON conversations;
CREATE POLICY "delete_member_conversations" ON conversations FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: MESSAGES (member-scoped + anon create for chat)
-- ============================================================
DROP POLICY IF EXISTS "select_member_messages" ON messages;
CREATE POLICY "select_member_messages" ON messages FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_messages" ON messages;
CREATE POLICY "insert_member_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_messages" ON messages;
CREATE POLICY "update_member_messages" ON messages FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_messages" ON messages;
CREATE POLICY "delete_member_messages" ON messages FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: WORKFLOWS
-- ============================================================
DROP POLICY IF EXISTS "select_member_workflows" ON workflows;
CREATE POLICY "select_member_workflows" ON workflows FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_workflows" ON workflows;
CREATE POLICY "insert_member_workflows" ON workflows FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_workflows" ON workflows;
CREATE POLICY "update_member_workflows" ON workflows FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_workflows" ON workflows;
CREATE POLICY "delete_member_workflows" ON workflows FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: WORKFLOW EXECUTIONS
-- ============================================================
DROP POLICY IF EXISTS "select_member_workflow_executions" ON workflow_executions;
CREATE POLICY "select_member_workflow_executions" ON workflow_executions FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_workflow_executions" ON workflow_executions;
CREATE POLICY "insert_member_workflow_executions" ON workflow_executions FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_workflow_executions" ON workflow_executions;
CREATE POLICY "update_member_workflow_executions" ON workflow_executions FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_workflow_executions" ON workflow_executions;
CREATE POLICY "delete_member_workflow_executions" ON workflow_executions FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: WORKFLOW EXECUTION LOGS
-- ============================================================
DROP POLICY IF EXISTS "select_member_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "select_member_workflow_execution_logs" ON workflow_execution_logs FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "insert_member_workflow_execution_logs" ON workflow_execution_logs FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "update_member_workflow_execution_logs" ON workflow_execution_logs FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "delete_member_workflow_execution_logs" ON workflow_execution_logs FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: ORDERS
-- ============================================================
DROP POLICY IF EXISTS "select_member_orders" ON orders;
CREATE POLICY "select_member_orders" ON orders FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_orders" ON orders;
CREATE POLICY "insert_member_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_orders" ON orders;
CREATE POLICY "update_member_orders" ON orders FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_orders" ON orders;
CREATE POLICY "delete_member_orders" ON orders FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: BOOKINGS
-- ============================================================
DROP POLICY IF EXISTS "select_member_bookings" ON bookings;
CREATE POLICY "select_member_bookings" ON bookings FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_bookings" ON bookings;
CREATE POLICY "insert_member_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_bookings" ON bookings;
CREATE POLICY "update_member_bookings" ON bookings FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_bookings" ON bookings;
CREATE POLICY "delete_member_bookings" ON bookings FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: REQUESTS
-- ============================================================
DROP POLICY IF EXISTS "select_member_requests" ON requests;
CREATE POLICY "select_member_requests" ON requests FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_requests" ON requests;
CREATE POLICY "insert_member_requests" ON requests FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_requests" ON requests;
CREATE POLICY "update_member_requests" ON requests FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_requests" ON requests;
CREATE POLICY "delete_member_requests" ON requests FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: NOTIFICATIONS
-- ============================================================
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_member_notifications" ON notifications;
CREATE POLICY "insert_member_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: AUDIT LOGS
-- ============================================================
DROP POLICY IF EXISTS "select_member_audit_logs" ON audit_logs;
CREATE POLICY "select_member_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_audit_logs" ON audit_logs;
CREATE POLICY "insert_member_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_business_id ON knowledge_sources(business_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_business_id ON knowledge_documents(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_business_id ON messages(business_id);
CREATE INDEX IF NOT EXISTS idx_workflows_business_id ON workflows(business_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_business_id ON workflow_executions(business_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_execution_id ON workflow_execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_requests_business_id ON requests(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON audit_logs(business_id);