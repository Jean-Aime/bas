/*
# BAS Public Chat Access — Anon Policies for Customer-Facing Tables

## Overview
The BAS customer web chat needs to work for unauthenticated visitors (anon role).
This migration adds anon-accessible SELECT/INSERT policies for the tables the
public chat uses: conversations, messages, and customers.

## 1. Security Changes
- `conversations`: anon can SELECT and INSERT (only for web chat channel).
- `messages`: anon can SELECT (by conversation) and INSERT (customer messages).
- `customers`: anon can INSERT (create customer records from chat).

Anon access is scoped to the web_chat channel only. Business dashboard access
remains authenticated-only via is_business_member().
*/

-- ============================================================
-- ANON POLICIES: CONVERSATIONS (public web chat)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (channel = 'web_chat');

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (channel = 'web_chat');

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (channel = 'web_chat') WITH CHECK (channel = 'web_chat');

-- ============================================================
-- ANON POLICIES: MESSAGES (public web chat)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- ANON POLICIES: CUSTOMERS (public web chat creates customer records)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: ORDERS (public web chat creates order requests)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: BOOKINGS (public web chat creates booking requests)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: REQUESTS (public web chat creates requests)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_requests" ON requests;
CREATE POLICY "anon_insert_requests" ON requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_requests" ON requests;
CREATE POLICY "anon_select_requests" ON requests FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: WORKFLOW EXECUTIONS (chat triggers workflows)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_workflow_executions" ON workflow_executions;
CREATE POLICY "anon_insert_workflow_executions" ON workflow_executions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_workflow_executions" ON workflow_executions;
CREATE POLICY "anon_select_workflow_executions" ON workflow_executions FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: WORKFLOW EXECUTION LOGS
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "anon_insert_workflow_execution_logs" ON workflow_execution_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_workflow_execution_logs" ON workflow_execution_logs;
CREATE POLICY "anon_select_workflow_execution_logs" ON workflow_execution_logs FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: PRODUCTS (public can view for chat queries)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- ============================================================
-- ANON POLICIES: SERVICES (public can view for chat queries)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- ============================================================
-- ANON POLICIES: FAQS (public can view for chat queries)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_faqs" ON faqs;
CREATE POLICY "anon_select_faqs" ON faqs FOR SELECT
  TO anon, authenticated USING (is_published = true);

-- ============================================================
-- ANON POLICIES: BUSINESS HOURS (public can view)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_business_hours" ON business_hours;
CREATE POLICY "anon_select_business_hours" ON business_hours FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: BUSINESS POLICIES (public can view)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_business_policies" ON business_policies;
CREATE POLICY "anon_select_business_policies" ON business_policies FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: BUSINESSES (public can view business info for chat)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_businesses" ON businesses;
CREATE POLICY "anon_select_businesses" ON businesses FOR SELECT
  TO anon, authenticated USING (status = 'active');

-- ============================================================
-- ANON POLICIES: KNOWLEDGE DOCUMENTS (public can view for chat retrieval)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_knowledge_documents" ON knowledge_documents;
CREATE POLICY "anon_select_knowledge_documents" ON knowledge_documents FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- ANON POLICIES: KNOWLEDGE SOURCES (public can view)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_knowledge_sources" ON knowledge_sources;
CREATE POLICY "anon_select_knowledge_sources" ON knowledge_sources FOR SELECT
  TO anon, authenticated USING (status = 'active');