/*
# BAS Security Hardening — P0 fixes (migration 004)

## Why
Migration 003 granted the public `anon` role read/write access that leaked
data across every tenant, and the memberships insert policy let any signed-up
user join ANY business as owner (privilege escalation). Both must be closed
before real data lives in this database.

## 1. Revoke anonymous access to tenant + commerce data
The public web chat talks to `/api/chat`, which runs server-side with the
service-role key and validates tenant ownership itself. The browser never
needs direct anon access to these tables:

  conversations, messages, customers, orders, bookings, requests,
  workflow_executions, workflow_execution_logs,
  knowledge_documents, knowledge_sources

## 2. Public catalog kept (intentional, scoped)
  businesses (status='active')  — public chat directory for /chat/[slug]
  products  (is_active)  / services (is_active) / faqs (is_published)
    — published catalog only; used by public-facing surfaces.

## 3. Membership self-elevation fix
A user may only self-insert as `business_owner` of a business that has NO
members yet (the onboarding/seed "claim a brand-new business" flow).
All other membership writes go through /api/team, which verifies the
caller's role server-side and then acts with the service-role key.
*/

-- ─────────────────────────────────────────────────────────────
-- 1. Revoke anon access to tenant data
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;

DROP POLICY IF EXISTS "anon_select_requests" ON requests;
DROP POLICY IF EXISTS "anon_insert_requests" ON requests;

DROP POLICY IF EXISTS "anon_select_workflow_executions" ON workflow_executions;
DROP POLICY IF EXISTS "anon_insert_workflow_executions" ON workflow_executions;

DROP POLICY IF EXISTS "anon_select_workflow_execution_logs" ON workflow_execution_logs;
DROP POLICY IF EXISTS "anon_insert_workflow_execution_logs" ON workflow_execution_logs;

DROP POLICY IF EXISTS "anon_select_knowledge_documents" ON knowledge_documents;
DROP POLICY IF EXISTS "anon_select_knowledge_sources" ON knowledge_sources;

-- ─────────────────────────────────────────────────────────────
-- 3. Fix membership self-elevation
-- ─────────────────────────────────────────────────────────────
-- Old policy: any authenticated user could insert themselves into ANY
-- business with ANY role (including business_owner / platform_admin).
-- New rule: self-insert is allowed only when
--   (a) the row is your own, AND
--   (b) you claim business_owner, AND
--   (c) the target business has no members yet (first-owner claim,
--       used by onboarding and the demo-seed flow).
--
-- WHY A PLAIN SUBQUERY IS NOT ENOUGH (proven by scripts/pg-verify):
-- a policy expression runs with the caller's own RLS visibility, and
-- `memberships` has a select policy that only reveals the caller's OWN
-- rows. A user who is not yet a member therefore sees ZERO rows of the
-- target business, so `NOT EXISTS (...)` evaluated true and the claim
-- check passed for a business that already had members — the
-- privilege-escalation hole stayed open. The existence check must run
-- with definer rights (table owner bypasses RLS) so it sees the TRUE
-- membership of the business, exactly like is_business_member() below.

CREATE OR REPLACE FUNCTION business_has_members(target_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = target_business_id
  );
$$;

DROP POLICY IF EXISTS "insert_own_memberships" ON memberships;
CREATE POLICY "insert_own_memberships" ON memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'business_owner'
    AND NOT business_has_members(memberships.business_id)
  );

-- ─────────────────────────────────────────────────────────────
-- 4. Close the "edit my own row" elevation path
-- ─────────────────────────────────────────────────────────────
-- The UPDATE policy on memberships only checks auth.uid() = user_id,
-- so a member could UPDATE their own row's role (e.g. to
-- 'platform_admin') and pass the admin-panel gate. Verified: no client
-- code updates or deletes membership rows — only /api/team does, and it
-- uses the service-role key (not affected by this revoke). The INSERT
-- path (onboarding / demo seed) stays granted.

REVOKE UPDATE, DELETE ON memberships FROM anon, authenticated;
