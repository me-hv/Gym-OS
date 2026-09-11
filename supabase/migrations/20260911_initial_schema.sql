-- ==============================================================================
-- GYM OS: Initial Migration (Schema + Seed Data)
-- Migration: 20260911_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'trainer', 'front_desk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('active', 'expiring', 'expired', 'frozen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM (
        'member_created',
        'membership_created',
        'payment_recorded',
        'attendance_logged',
        'membership_frozen',
        'membership_renewed',
        'whatsapp_reminder_sent',
        'trainer_assigned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Bengaluru' NOT NULL,
    state VARCHAR(100) DEFAULT 'Karnataka' NOT NULL,
    postal_code VARCHAR(20) DEFAULT '560038' NOT NULL,
    gstin VARCHAR(50),
    peak_capacity INTEGER DEFAULT 120 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'front_desk' NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) DEFAULT 'Strength & Conditioning' NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    tag VARCHAR(50),
    duration_months INTEGER DEFAULT 12 NOT NULL,
    price_inr NUMERIC(12, 2) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_plan_code_per_org UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    gender gender_type DEFAULT 'Male' NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    join_date DATE DEFAULT CURRENT_DATE NOT NULL,
    goal VARCHAR(255) DEFAULT 'General Fitness',
    locker_number VARCHAR(50),
    assigned_trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
    status member_status DEFAULT 'active' NOT NULL,
    notes TEXT,
    emergency_contact JSONB DEFAULT '{"name": "", "relationship": "", "phone": ""}'::jsonb NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_member_code_per_org UNIQUE(organization_id, member_code)
);

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
    start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    expiry_date DATE NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    status member_status DEFAULT 'active' NOT NULL,
    freeze_start_date DATE,
    freeze_end_date DATE,
    freeze_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    check_out_time TIMESTAMPTZ,
    workout_type VARCHAR(100) DEFAULT 'Floor Workout' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    tax_inr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_inr NUMERIC(12, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status payment_status DEFAULT 'paid' NOT NULL,
    payment_method payment_method DEFAULT 'UPI' NOT NULL,
    reference_id VARCHAR(100),
    collected_by VARCHAR(255) DEFAULT 'Front Desk' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_invoice_per_org UNIQUE(organization_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    action action_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_trainers_org ON public.trainers(organization_id);
CREATE INDEX IF NOT EXISTS idx_plans_org ON public.membership_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON public.members(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_org_member ON public.memberships(organization_id, member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_expiry ON public.memberships(organization_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_attendance_org_time ON public.attendance(organization_id, check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON public.attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_date ON public.payments(organization_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_member ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON public.activity_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_member ON public.activity_logs(member_id, created_at DESC);

-- 4. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_organizations_updated_at ON public.organizations;
CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_trainers_updated_at ON public.trainers;
CREATE TRIGGER set_trainers_updated_at BEFORE UPDATE ON public.trainers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_plans_updated_at ON public.membership_plans;
CREATE TRIGGER set_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_members_updated_at ON public.members;
CREATE TRIGGER set_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_memberships_updated_at ON public.memberships;
CREATE TRIGGER set_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. RLS & HELPER
CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization" ON public.organizations FOR SELECT USING (id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
CREATE POLICY "Users can update their own organization" ON public.organizations FOR UPDATE USING (id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
CREATE POLICY "Users can view profiles in their organization" ON public.profiles FOR SELECT USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Users can insert/update their profile" ON public.profiles;
CREATE POLICY "Users can insert/update their profile" ON public.profiles FOR ALL USING (id = auth.uid() OR organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for trainers select" ON public.trainers;
CREATE POLICY "Tenant isolation for trainers select" ON public.trainers FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for trainers insert" ON public.trainers;
CREATE POLICY "Tenant isolation for trainers insert" ON public.trainers FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for trainers update" ON public.trainers;
CREATE POLICY "Tenant isolation for trainers update" ON public.trainers FOR UPDATE USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for trainers delete" ON public.trainers;
CREATE POLICY "Tenant isolation for trainers delete" ON public.trainers FOR DELETE USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for plans select" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans select" ON public.membership_plans FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for plans insert" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans insert" ON public.membership_plans FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for plans update" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans update" ON public.membership_plans FOR UPDATE USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for plans delete" ON public.membership_plans;
CREATE POLICY "Tenant isolation for plans delete" ON public.membership_plans FOR DELETE USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for members select" ON public.members;
CREATE POLICY "Tenant isolation for members select" ON public.members FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for members insert" ON public.members;
CREATE POLICY "Tenant isolation for members insert" ON public.members FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for members update" ON public.members;
CREATE POLICY "Tenant isolation for members update" ON public.members FOR UPDATE USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for members delete" ON public.members;
CREATE POLICY "Tenant isolation for members delete" ON public.members FOR DELETE USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for memberships select" ON public.memberships;
CREATE POLICY "Tenant isolation for memberships select" ON public.memberships FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for memberships insert" ON public.memberships;
CREATE POLICY "Tenant isolation for memberships insert" ON public.memberships FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for memberships update" ON public.memberships;
CREATE POLICY "Tenant isolation for memberships update" ON public.memberships FOR UPDATE USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for memberships delete" ON public.memberships;
CREATE POLICY "Tenant isolation for memberships delete" ON public.memberships FOR DELETE USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for attendance select" ON public.attendance;
CREATE POLICY "Tenant isolation for attendance select" ON public.attendance FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for attendance insert" ON public.attendance;
CREATE POLICY "Tenant isolation for attendance insert" ON public.attendance FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for attendance update" ON public.attendance;
CREATE POLICY "Tenant isolation for attendance update" ON public.attendance FOR UPDATE USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for payments select" ON public.payments;
CREATE POLICY "Tenant isolation for payments select" ON public.payments FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for payments insert" ON public.payments;
CREATE POLICY "Tenant isolation for payments insert" ON public.payments FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for payments update" ON public.payments;
CREATE POLICY "Tenant isolation for payments update" ON public.payments FOR UPDATE USING (organization_id = public.get_auth_organization_id());

DROP POLICY IF EXISTS "Tenant isolation for activity logs select" ON public.activity_logs;
CREATE POLICY "Tenant isolation for activity logs select" ON public.activity_logs FOR SELECT USING (organization_id = public.get_auth_organization_id());
DROP POLICY IF EXISTS "Tenant isolation for activity logs insert" ON public.activity_logs;
CREATE POLICY "Tenant isolation for activity logs insert" ON public.activity_logs FOR INSERT WITH CHECK (organization_id = public.get_auth_organization_id());
