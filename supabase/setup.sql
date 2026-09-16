-- ============================================================================
-- BAS — CONSOLIDATED SUPABASE SETUP (schema + RLS + realtime)
-- ============================================================================
-- Run this ONCE on a fresh Supabase project. Idempotent: safe to re-run.
--
-- How to run:
--   Option A (dashboard): SQL Editor → New query → paste → Run
--   Option B (CLI):       supabase db execute --file supabase/setup.sql
--                         (after `supabase link --project-ref <ref>`)
--
-- Then follow SUPABASE_SETUP.md for the dashboard clicks (realtime, auth).
-- ============================================================================

-- ============================================================================
-- SECTION 1 — CORE SCHEMA: IDENTITY, TENANCY, BUSINESS CONFIG, CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  country text,
  city text,
  email text,
  phone text,
  description text,
  website_url text,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  logo_url text,
  brand_color text,
  tagline text,
  about text,
  social_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time,
  close_time time,
  is_closed boolean NOT NULL DEFAULT false,
  UNIQUE(business_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS business_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  country text,
  phone text,
  latitude float8,
  longitude float8,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL DEFAULT 'general',
  condition jsonb DEFAULT '{}',
  action jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  sku text,
  attributes jsonb DEFAULT '{}',
  stock int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES service_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  duration_minutes int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- SECTION 2 — KNOWLEDGE, CUSTOMERS, CONVERSATIONS, AUTOMATION, OPERATIONS
-- ============================================================================

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

-- ============================================================================
-- SECTION 3 — HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION is_business_member(target_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = target_business_id
    AND memberships.user_id = auth.uid()
  );
$$;

-- ============================================================================
-- SECTION 4 — ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
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

-- ============================================================================
-- SECTION 5 — ROW LEVEL SECURITY POLICIES
-- ----------------------------------------------------------------------------
-- Tenant tables are scoped by business_id via is_business_member().
-- Public web chat needs anon access: conversations, messages, customers and
-- the catalog read paths get anon SELECT/INSERT policies in SECTION 6.
-- ============================================================================

-- ------------------------- businesses ---------------------------------------
DROP POLICY IF EXISTS "select_member_businesses" ON businesses;
CREATE POLICY "select_member_businesses" ON businesses FOR SELECT
  TO authenticated USING (is_business_member(id));
DROP POLICY IF EXISTS "insert_businesses" ON businesses;
CREATE POLICY "insert_businesses" ON businesses FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_member_businesses" ON businesses;
CREATE POLICY "update_member_businesses" ON businesses FOR UPDATE
  TO authenticated USING (is_business_member(id)) WITH CHECK (is_business_member(id));
DROP POLICY IF EXISTS "delete_member_businesses" ON businesses;
CREATE POLICY "delete_member_businesses" ON businesses FOR DELETE
  TO authenticated USING (is_business_member(id));

-- ------------------------- memberships --------------------------------------
DROP POLICY IF EXISTS "select_own_memberships" ON memberships;
CREATE POLICY "select_own_memberships" ON memberships FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_memberships" ON memberships;
CREATE POLICY "insert_own_memberships" ON memberships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_memberships" ON memberships;
CREATE POLICY "update_own_memberships" ON memberships FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_memberships" ON memberships;
CREATE POLICY "delete_own_memberships" ON memberships FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ------------------------- tenant tables (generated) ------------------------
-- Each of these tables carries business_id and is member-scoped on all
-- operations: business_profiles, business_hours, business_locations,
-- business_policies, business_rules, product_categories, products,
-- service_categories, services, faqs, knowledge_sources, knowledge_documents,
-- workflows, workflow_executions, workflow_execution_logs, orders, bookings,
-- requests, audit_logs.
DROP POLICY IF EXISTS "select_member_profiles" ON business_profiles;
CREATE POLICY "select_member_profiles" ON business_profiles FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_profiles" ON business_profiles;
CREATE POLICY "insert_member_profiles" ON business_profiles FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_profiles" ON business_profiles;
CREATE POLICY "update_member_profiles" ON business_profiles FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_profiles" ON business_profiles;
CREATE POLICY "delete_member_profiles" ON business_profiles FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_hours" ON business_hours;
CREATE POLICY "select_member_hours" ON business_hours FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_hours" ON business_hours;
CREATE POLICY "insert_member_hours" ON business_hours FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_hours" ON business_hours;
CREATE POLICY "update_member_hours" ON business_hours FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_hours" ON business_hours;
CREATE POLICY "delete_member_hours" ON business_hours FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_locations" ON business_locations;
CREATE POLICY "select_member_locations" ON business_locations FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_locations" ON business_locations;
CREATE POLICY "insert_member_locations" ON business_locations FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_locations" ON business_locations;
CREATE POLICY "update_member_locations" ON business_locations FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_locations" ON business_locations;
CREATE POLICY "delete_member_locations" ON business_locations FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_policies" ON business_policies;
CREATE POLICY "select_member_policies" ON business_policies FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_policies" ON business_policies;
CREATE POLICY "insert_member_policies" ON business_policies FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_policies" ON business_policies;
CREATE POLICY "update_member_policies" ON business_policies FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_policies" ON business_policies;
CREATE POLICY "delete_member_policies" ON business_policies FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_rules" ON business_rules;
CREATE POLICY "select_member_rules" ON business_rules FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_rules" ON business_rules;
CREATE POLICY "insert_member_rules" ON business_rules FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_rules" ON business_rules;
CREATE POLICY "update_member_rules" ON business_rules FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_rules" ON business_rules;
CREATE POLICY "delete_member_rules" ON business_rules FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_product_categories" ON product_categories;
CREATE POLICY "select_member_product_categories" ON product_categories FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_product_categories" ON product_categories;
CREATE POLICY "insert_member_product_categories" ON product_categories FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_product_categories" ON product_categories;
CREATE POLICY "update_member_product_categories" ON product_categories FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_product_categories" ON product_categories;
CREATE POLICY "delete_member_product_categories" ON product_categories FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_products" ON products;
CREATE POLICY "select_member_products" ON products FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_products" ON products;
CREATE POLICY "insert_member_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_products" ON products;
CREATE POLICY "update_member_products" ON products FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_products" ON products;
CREATE POLICY "delete_member_products" ON products FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_service_categories" ON service_categories;
CREATE POLICY "select_member_service_categories" ON service_categories FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_service_categories" ON service_categories;
CREATE POLICY "insert_member_service_categories" ON service_categories FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_service_categories" ON service_categories;
CREATE POLICY "update_member_service_categories" ON service_categories FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_service_categories" ON service_categories;
CREATE POLICY "delete_member_service_categories" ON service_categories FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_services" ON services;
CREATE POLICY "select_member_services" ON services FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_services" ON services;
CREATE POLICY "insert_member_services" ON services FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_services" ON services;
CREATE POLICY "update_member_services" ON services FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_services" ON services;
CREATE POLICY "delete_member_services" ON services FOR DELETE
  TO authenticated USING (is_business_member(business_id));

DROP POLICY IF EXISTS "select_member_faqs" ON faqs;
CREATE POLICY "select_member_faqs" ON faqs FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_faqs" ON faqs;
CREATE POLICY "insert_member_faqs" ON faqs FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_faqs" ON faqs;
CREATE POLICY "update_member_faqs" ON faqs FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_faqs" ON faqs;
CREATE POLICY "delete_member_faqs" ON faqs FOR DELETE
  TO authenticated USING (is_business_member(business_id));

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

-- ------------------------- customers (chat + member) ------------------------
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

-- ------------------------- conversations ------------------------------------
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

-- ------------------------- messages -----------------------------------------
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

-- ------------------------- workflows ----------------------------------------
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

-- ------------------------- workflow_executions ------------------------------
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

-- ------------------------- workflow_execution_logs --------------------------
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

-- ------------------------- orders -------------------------------------------
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

-- ------------------------- bookings -----------------------------------------
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

-- ------------------------- requests -----------------------------------------
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

-- ------------------------- notifications ------------------------------------
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

-- ------------------------- audit_logs ---------------------------------------
DROP POLICY IF EXISTS "select_member_audit_logs" ON audit_logs;
CREATE POLICY "select_member_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_audit_logs" ON audit_logs;
CREATE POLICY "insert_member_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));

-- ============================================================================
-- SECTION 6 — ANON POLICIES (public customer web chat)
-- ----------------------------------------------------------------------------
-- The customer chat runs unauthenticated, so the tables it touches get
-- anon SELECT/INSERT access. Read this section before loosening anything
-- further — these are intentionally minimal.
-- ============================================================================

-- conversations: only web_chat rows, and only for real businesses
DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (channel = 'web_chat');
DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    channel = 'web_chat'
    AND EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );
DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (channel = 'web_chat') WITH CHECK (channel = 'web_chat');

-- messages: visitor can read threads and post customer messages; the parent
-- conversation must exist and belong to the same business
DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id AND c.business_id = messages.business_id
    )
  );

-- customers: chat creates anonymous customer records for real businesses
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );
DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

-- orders / bookings / requests created from chat must target a real business
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );
DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_requests" ON requests;
CREATE POLICY "anon_insert_requests" ON requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );
DROP POLICY IF EXISTS "anon_select_requests" ON requests;
CREATE POLICY "anon_select_requests" ON requests FOR SELECT
  TO anon, authenticated USING (true);

-- workflow executions triggered by chat must target a real business; logs must
-- reference an execution of the same business
DROP POLICY IF EXISTS "anon_insert_workflow_executions" ON workflow_executions;
CREATE POLICY "anon_insert_workflow_executions" ON workflow_executions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );
DROP POLICY IF EXISTS "anon_select_workflow_executions" ON workflow_executions;
CREATE POLICY "anon_select_workflow_executions" ON workflow_executions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "anon_insert_workflow_execution_logs" ON workflow_execution_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
    AND EXISTS (
      SELECT 1 FROM workflow_executions e
      WHERE e.id = execution_id AND e.business_id = workflow_execution_logs.business_id
    )
  );
DROP POLICY IF EXISTS "anon_select_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "anon_select_workflow_execution_logs" ON workflow_execution_logs FOR SELECT
  TO anon, authenticated USING (true);

-- public catalog reads for chat queries
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
  TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "anon_select_faqs" ON faqs;
CREATE POLICY "anon_select_faqs" ON faqs FOR SELECT
  TO anon, authenticated USING (is_published = true);
DROP POLICY IF EXISTS "anon_select_business_hours" ON business_hours;
CREATE POLICY "anon_select_business_hours" ON business_hours FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_select_business_policies" ON business_policies;
CREATE POLICY "anon_select_business_policies" ON business_policies FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_select_businesses" ON businesses;
CREATE POLICY "anon_select_businesses" ON businesses FOR SELECT
  TO anon, authenticated USING (status = 'active');
DROP POLICY IF EXISTS "anon_select_knowledge_documents" ON knowledge_documents;
CREATE POLICY "anon_select_knowledge_documents" ON knowledge_documents FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_select_knowledge_sources" ON knowledge_sources;
CREATE POLICY "anon_select_knowledge_sources" ON knowledge_sources FOR SELECT
  TO anon, authenticated USING (status = 'active');

-- ============================================================================
-- SECTION 7 — INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_business_id ON memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_faqs_business_id ON faqs(business_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON business_hours(business_id);
CREATE INDEX IF NOT EXISTS idx_business_policies_business_id ON business_policies(business_id);
CREATE INDEX IF NOT EXISTS idx_business_rules_business_id ON business_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON business_locations(business_id);
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

-- ============================================================================
-- SECTION 8 — REALTIME
-- ----------------------------------------------------------------------------
-- Adds every table the app streams to the supabase_realtime publication so
-- supabase.channel(...).on('postgres_changes', ...) works. RLS still applies
-- to realtime payloads: subscribers only receive rows they can SELECT.
-- Idempotent: skips tables already in the publication.
-- ============================================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'notifications',
    'conversations',
    'messages',
    'orders',
    'bookings',
    'requests',
    'workflow_executions',
    'workflow_execution_logs'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class
      WHERE relname = t AND relnamespace = 'public'::regnamespace
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END
$$;
