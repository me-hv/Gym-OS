-- ==============================================================================
-- GYM OS: Phase 5 Front Desk & Daily Operations OS Migration
-- Migration: 20260911_phase5_operations.sql
-- ==============================================================================

-- 1. Extend action_type enum safely with front-desk & notes actions
DO $$ BEGIN
    ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'member_note_added';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'member_checked_out';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create member_notes table for structured operational notes
CREATE TABLE IF NOT EXISTS public.member_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role user_role NOT NULL,
    category VARCHAR(50) DEFAULT 'general' NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_member_notes_org_member ON public.member_notes(organization_id, member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_notes_author ON public.member_notes(author_id);

-- 4. Row Level Security for Member Notes
ALTER TABLE public.member_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant isolation for member_notes select" ON public.member_notes;
CREATE POLICY "Tenant isolation for member_notes select"
    ON public.member_notes FOR SELECT
    USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for member_notes insert" ON public.member_notes;
CREATE POLICY "Tenant isolation for member_notes insert"
    ON public.member_notes FOR INSERT
    WITH CHECK (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for member_notes delete" ON public.member_notes;
CREATE POLICY "Tenant isolation for member_notes delete"
    ON public.member_notes FOR DELETE
    USING (
        organization_id = public.get_auth_organization_id() AND
        (author_id = auth.uid() OR public.get_auth_user_role() IN ('owner', 'admin'))
    );
