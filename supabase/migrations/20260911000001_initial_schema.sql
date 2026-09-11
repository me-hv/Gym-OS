-- =====================================================================================
-- GYM OS — Multi-Tenant PostgreSQL Schema with Row Level Security (RLS)
-- Designed for Independent Gyms & Performance Centers
-- =====================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Definitions
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'trainer', 'front_desk');
CREATE TYPE member_status AS ENUM ('active', 'expiring', 'expired', 'frozen');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue', 'refunded');
CREATE TYPE payment_method AS ENUM ('UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
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

-- =====================================================================================
-- 1. ORGANIZATIONS (Tenant Root)
-- =====================================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Bengaluru',
  state VARCHAR(100) DEFAULT 'Karnataka',
  postal_code VARCHAR(20) DEFAULT '560038',
  gstin VARCHAR(50),
  peak_capacity INT DEFAULT 120 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- =====================================================================================
-- 2. USERS / PROFILES (Links Supabase Auth Users to Organizations)
-- =====================================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'owner' NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_organization ON profiles(organization_id);

-- =====================================================================================
-- 3. TRAINERS (Coaches & Personal Trainers)
-- =====================================================================================
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) DEFAULT 'Strength & Conditioning',
  phone VARCHAR(50),
  email VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_trainers_organization ON trainers(organization_id);

-- =====================================================================================
-- 4. MEMBERSHIP PLANS (Pricing Tiers)
-- =====================================================================================
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  tag VARCHAR(100),
  duration_months INT NOT NULL CHECK (duration_months > 0),
  price_inr NUMERIC(12, 2) NOT NULL CHECK (price_inr >= 0),
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_plan_code_per_org UNIQUE (organization_id, code)
);

CREATE INDEX idx_membership_plans_organization ON membership_plans(organization_id);

-- =====================================================================================
-- 5. MEMBERS (Athletes & Clients)
-- =====================================================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  gender gender_type DEFAULT 'Male' NOT NULL,
  date_of_birth DATE,
  age INT,
  join_date DATE DEFAULT CURRENT_DATE NOT NULL,
  goal VARCHAR(255) DEFAULT 'General Fitness',
  locker_number VARCHAR(50),
  assigned_trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
  status member_status DEFAULT 'active' NOT NULL,
  notes TEXT,
  emergency_contact JSONB DEFAULT '{}'::jsonb NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_member_code_per_org UNIQUE (organization_id, member_code)
);

CREATE INDEX idx_members_organization ON members(organization_id);
CREATE INDEX idx_members_status ON members(organization_id, status);
CREATE INDEX idx_members_phone ON members(organization_id, phone);

-- =====================================================================================
-- 6. MEMBERSHIPS (Active Subscriptions)
-- =====================================================================================
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
  start_date DATE DEFAULT CURRENT_DATE NOT NULL,
  expiry_date DATE NOT NULL,
  amount_inr NUMERIC(12, 2) NOT NULL,
  status member_status DEFAULT 'active' NOT NULL,
  freeze_start_date DATE,
  freeze_end_date DATE,
  freeze_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_memberships_organization ON memberships(organization_id);
CREATE INDEX idx_memberships_member ON memberships(member_id);
CREATE INDEX idx_memberships_expiry ON memberships(organization_id, expiry_date);

-- =====================================================================================
-- 7. ATTENDANCE (Floor Logs & Check-ins)
-- =====================================================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  check_out_time TIMESTAMPTZ,
  workout_type VARCHAR(255) DEFAULT 'General Floor Workout',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_attendance_organization ON attendance(organization_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_time ON attendance(organization_id, check_in_time);

-- =====================================================================================
-- 8. PAYMENTS (Invoices & Financial Ledger)
-- =====================================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  invoice_number VARCHAR(100) NOT NULL,
  amount_inr NUMERIC(12, 2) NOT NULL,
  tax_inr NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  total_inr NUMERIC(12, 2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
  due_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status payment_status DEFAULT 'paid' NOT NULL,
  payment_method payment_method DEFAULT 'UPI',
  reference_id VARCHAR(255),
  collected_by VARCHAR(255) DEFAULT 'Front Desk Staff',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_invoice_per_org UNIQUE (organization_id, invoice_number)
);

CREATE INDEX idx_payments_organization ON payments(organization_id);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(organization_id, status);
CREATE INDEX idx_payments_date ON payments(organization_id, payment_date);

-- =====================================================================================
-- 9. ACTIVITY LOGS (Audit Trail & Operation Telemetry)
-- =====================================================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  action action_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activity_logs_organization ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_member ON activity_logs(member_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(organization_id, created_at DESC);

-- =====================================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- =====================================================================================

-- Helper function to fetch user's active organization ID from JWT / profiles table
CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Organizations Policy: Users can view their own organization
CREATE POLICY org_tenant_isolation_select ON organizations
  FOR SELECT
  USING (id = get_current_user_org_id());

CREATE POLICY org_tenant_isolation_update ON organizations
  FOR UPDATE
  USING (id = get_current_user_org_id());

-- 2. Profiles Policy
CREATE POLICY profiles_tenant_isolation ON profiles
  FOR ALL
  USING (organization_id = get_current_user_org_id());

-- 3. Trainers Policy
CREATE POLICY trainers_tenant_isolation ON trainers
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());

-- 4. Membership Plans Policy
CREATE POLICY membership_plans_tenant_isolation ON membership_plans
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());

-- 5. Members Policy
CREATE POLICY members_tenant_isolation ON members
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());

-- 6. Memberships Policy
CREATE POLICY memberships_tenant_isolation ON memberships
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());

-- 7. Attendance Policy
CREATE POLICY attendance_tenant_isolation ON attendance
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());

-- 8. Payments Policy
CREATE POLICY payments_tenant_isolation ON payments
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());

-- 9. Activity Logs Policy
CREATE POLICY activity_logs_tenant_isolation ON activity_logs
  FOR ALL
  USING (organization_id = get_current_user_org_id())
  WITH CHECK (organization_id = get_current_user_org_id());
