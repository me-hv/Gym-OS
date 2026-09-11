-- ==============================================================================
-- GYM OS: Phase 4 Retention & Revenue Intelligence Migration
-- Migration: 20260911_phase4_retention.sql
-- ==============================================================================

-- 1. Extend action_type enum safely with retention outreach & re-engagement events
DO $$ BEGIN
    ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'retention_outreach_logged';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'retention_alert_generated';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE action_type ADD VALUE IF NOT EXISTS 'member_reengaged';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Performance Indexes for Retention Queries & Intelligence
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON public.attendance(member_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_expiry_status ON public.memberships(organization_id, expiry_date, status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_org ON public.activity_logs(organization_id, action, created_at DESC);
