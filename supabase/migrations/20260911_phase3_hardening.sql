-- ==============================================================================
-- GYM OS: Phase 3 Security & Authorization Hardening Migration
-- Migration: 20260911_phase3_hardening.sql
-- ==============================================================================

-- 1. Helper function to extract user's role from public.profiles
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Constraints Hardening
ALTER TABLE public.payments
    DROP CONSTRAINT IF EXISTS chk_positive_payment_amount,
    ADD CONSTRAINT chk_positive_payment_amount CHECK (total_inr > 0 AND amount_inr >= 0);

ALTER TABLE public.membership_plans
    DROP CONSTRAINT IF EXISTS chk_positive_plan_price,
    ADD CONSTRAINT chk_positive_plan_price CHECK (price_inr >= 0 AND duration_months >= 1);

ALTER TABLE public.memberships
    DROP CONSTRAINT IF EXISTS chk_valid_membership_dates,
    ADD CONSTRAINT chk_valid_membership_dates CHECK (expiry_date >= start_date);

ALTER TABLE public.organizations
    DROP CONSTRAINT IF EXISTS chk_positive_capacity,
    ADD CONSTRAINT chk_positive_capacity CHECK (peak_capacity > 0);

-- 3. Hardened Role-Aware RLS Policies

-- Profiles: Only Owner/Admin can change roles or organization_id
DROP POLICY IF EXISTS "Users can insert/update their profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile non-sensitive fields"
    ON public.profiles FOR UPDATE
    USING (
        id = auth.uid() OR
        (organization_id = public.get_auth_organization_id() AND public.get_auth_user_role() IN ('owner', 'admin'))
    );

-- Plans: Only Owner & Admin can create/update/delete plans
DROP POLICY IF EXISTS "Tenant isolation for plans insert" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans insert"
    ON public.membership_plans FOR INSERT
    WITH CHECK (
        organization_id = public.get_auth_organization_id() AND
        public.get_auth_user_role() IN ('owner', 'admin')
    );

DROP POLICY IF EXISTS "Tenant isolation for plans update" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans update"
    ON public.membership_plans FOR UPDATE
    USING (
        organization_id = public.get_auth_organization_id() AND
        public.get_auth_user_role() IN ('owner', 'admin')
    );

DROP POLICY IF EXISTS "Tenant isolation for plans delete" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans delete"
    ON public.membership_plans FOR DELETE
    USING (
        organization_id = public.get_auth_organization_id() AND
        public.get_auth_user_role() IN ('owner', 'admin')
    );

-- Payments: Only Owner & Admin can update payments; DELETE is disabled for financial integrity
DROP POLICY IF EXISTS "Tenant isolation for payments update" ON public.payments;
CREATE POLICY "Tenant isolation for payments update"
    ON public.payments FOR UPDATE
    USING (
        organization_id = public.get_auth_organization_id() AND
        public.get_auth_user_role() IN ('owner', 'admin')
    );

-- Memberships: Hard DELETE is disabled (status changes only)
DROP POLICY IF EXISTS "Tenant isolation for memberships delete" ON public.memberships;
CREATE POLICY "Prevent membership deletion"
    ON public.memberships FOR DELETE
    USING (FALSE);

-- 4. Additional Performance & Cooldown Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_member_time ON public.attendance(member_id, check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_member_status ON public.memberships(member_id, status);
CREATE INDEX IF NOT EXISTS idx_members_search ON public.members(organization_id, member_code, phone);
