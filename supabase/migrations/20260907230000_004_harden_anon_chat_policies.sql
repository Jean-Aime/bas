-- ============================================================================
-- 004 — Harden anon policies for the public customer web chat
-- ============================================================================
-- The public chat runs unauthenticated, so its tables previously accepted
-- anon INSERTs with WITH CHECK (true) — anyone with the publishable key could
-- create rows claiming any business_id (or none at all). This migration
-- replaces the blanket checks with exists()-style validation:
--
--   * conversations / customers / orders / bookings / requests /
--     workflow_executions / workflow_execution_logs:
--       the referenced business must actually exist
--   * messages / workflow_execution_logs:
--       additionally, the referenced conversation / execution must exist AND
--       belong to the same business (parent-row validation)
--
-- Reads stay scoped exactly as before (web_chat channel for conversations,
-- active status for catalog). DELETE remains member-only. Update remains
-- web_chat-scoped for conversations (status changes from the chat flow).
--
-- Idempotent: every policy is DROPped then CREATEd.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- conversations — anon may create threads only for real businesses
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    channel = 'web_chat'
    AND EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );

-- ---------------------------------------------------------------------------
-- customers — chat-created customer records must target a real business
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );

-- ---------------------------------------------------------------------------
-- messages — the parent conversation must exist and match the business
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- orders — real business required (conversation linkage validated by NOT NULL
-- FK integrity when provided; the chat always supplies both)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );

-- ---------------------------------------------------------------------------
-- bookings — real business required
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );

-- ---------------------------------------------------------------------------
-- requests — real business required
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_requests" ON requests;
CREATE POLICY "anon_insert_requests" ON requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );

-- ---------------------------------------------------------------------------
-- workflow_executions — real business required
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_insert_workflow_executions" ON workflow_executions;
CREATE POLICY "anon_insert_workflow_executions" ON workflow_executions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id)
  );

-- ---------------------------------------------------------------------------
-- workflow_execution_logs — the parent execution must exist and match the
-- business (logs are always children of an execution)
-- ---------------------------------------------------------------------------
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
