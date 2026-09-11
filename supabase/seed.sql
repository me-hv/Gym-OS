-- ==============================================================================
-- GYM OS: Multi-Tenant Seed Data (2 Distinct Tenant Gyms)
-- ==============================================================================

-- Clean existing data in public tables
TRUNCATE TABLE public.activity_logs CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.memberships CASCADE;
TRUNCATE TABLE public.members CASCADE;
TRUNCATE TABLE public.membership_plans CASCADE;
TRUNCATE TABLE public.trainers CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.organizations CASCADE;

-- ==============================================================================
-- TENANT 1: Pulse Fitness & Performance (Bengaluru)
-- ==============================================================================
INSERT INTO public.organizations (
    id, name, slug, currency, phone, email, address, city, state, postal_code, gstin, peak_capacity
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Pulse Fitness & Performance',
    'pulse-fitness-indiranagar',
    'INR',
    '+91 80 4123 9988',
    'support@pulsefitness.in',
    '#42, 100 Feet Road, Indiranagar',
    'Bengaluru',
    'Karnataka',
    '560038',
    '29AABCU9603R1ZM',
    120
);

-- Profiles for Tenant 1
INSERT INTO public.profiles (
    id, organization_id, full_name, email, role, phone
) VALUES 
(
    'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Vikramaditya Singhania',
    'owner@pulsefitness.in',
    'owner',
    '+91 98450 11223'
),
(
    'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Rajesh Kumar',
    'desk@pulsefitness.in',
    'front_desk',
    '+91 98450 44556'
);

-- Trainers for Tenant 1
INSERT INTO public.trainers (
    id, organization_id, full_name, specialty, phone, email, is_active
) VALUES
(
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Coach Vikram Rao',
    'Strength & Conditioning',
    '+91 98450 22334',
    'vikram.rao@pulsefitness.in',
    TRUE
),
(
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Coach Priya Sharma',
    'HIIT & Mobility',
    '+91 98450 33445',
    'priya.sharma@pulsefitness.in',
    TRUE
),
(
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Coach Amit Patel',
    'Body Recomposition & Powerlifting',
    '+91 98450 55667',
    'amit.patel@pulsefitness.in',
    TRUE
);

-- Membership Plans for Tenant 1
INSERT INTO public.membership_plans (
    id, organization_id, name, code, tag, duration_months, price_inr, description, features, is_popular, is_active
) VALUES
(
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Annual Strength Pro',
    'ANN-PRO',
    'Most Popular',
    12,
    24000.00,
    'Full access to all strength equipment, recovery sauna & monthly body composition scan.',
    '["Full gym floor access", "Unlimited locker & shower access", "Monthly InBody 570 scan", "2 Guest day passes/mo", "Access 6:00 AM - 10:30 PM"]'::jsonb,
    TRUE,
    TRUE
),
(
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '6-Month Elite Recomp',
    '6M-ELITE',
    'High Yield',
    6,
    14500.00,
    'Targeted 24-week transformation plan with bi-weekly trainer check-in.',
    '["Full gym floor access", "Dedicated locker assignment", "Bi-weekly trainer check-in", "1 Guest day pass/mo"]'::jsonb,
    FALSE,
    TRUE
),
(
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Quarterly Performance',
    'QTR-PERF',
    NULL,
    3,
    8500.00,
    'Flexible 90-day seasonal fitness membership with full equipment induction.',
    '["Full gym floor access", "Standard day locker", "1 Initial trainer session"]'::jsonb,
    FALSE,
    TRUE
),
(
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '1-Month Trial Pass',
    '1M-TRIAL',
    NULL,
    1,
    3200.00,
    'Introductory monthly membership for prospective long-term members.',
    '["Full gym floor access", "Day locker access"]'::jsonb,
    FALSE,
    TRUE
);

-- Members for Tenant 1 (Diverse statuses: Active, Expiring in 2d, 5d, 7d, Frozen, Overdue)
INSERT INTO public.members (
    id, organization_id, member_code, full_name, email, phone, gender, age, join_date, goal, locker_number, assigned_trainer_id, status, notes, emergency_contact
) VALUES
(
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GYM-2024-001',
    'Rohan Varma',
    'rohan.varma@gmail.com',
    '+91 98450 12345',
    'Male',
    28,
    '2025-09-15',
    'Hypertrophy & Strength',
    'L-42',
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'expiring',
    'Preparing for amateur powerlifting meet in November.',
    '{"name": "Anita Varma", "relationship": "Spouse", "phone": "+91 98450 99887"}'::jsonb
),
(
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GYM-2024-002',
    'Ananya Iyer',
    'ananya.iyer@outlook.com',
    '+91 98450 23456',
    'Female',
    25,
    '2025-10-01',
    'Fat Loss & HIIT',
    'L-18',
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'expiring',
    'High consistency member (5 sessions/week). Renewal WhatsApp sent.',
    '{"name": "Suresh Iyer", "relationship": "Father", "phone": "+91 98450 88776"}'::jsonb
),
(
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GYM-2024-003',
    'Siddharth Nair',
    'sid.nair@techcorp.io',
    '+91 98450 34567',
    'Male',
    32,
    '2026-01-10',
    'Mobility & Rehab',
    'L-09',
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'frozen',
    'Membership frozen for 14 days due to overseas business trip.',
    '{"name": "Meera Nair", "relationship": "Spouse", "phone": "+91 98450 77665"}'::jsonb
),
(
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GYM-2024-004',
    'Kavita Reddy',
    'kavita.r@biocon.com',
    '+91 98450 45678',
    'Female',
    29,
    '2026-03-01',
    'Hypertrophy & Strength',
    'L-31',
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'active',
    'Consistent evening lifter.',
    '{"name": "Rajesh Reddy", "relationship": "Brother", "phone": "+91 98450 66554"}'::jsonb
),
(
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GYM-2024-005',
    'Aditya Deshmukh',
    'aditya.d@gmail.com',
    '+91 98450 56789',
    'Male',
    35,
    '2025-08-20',
    'General Fitness',
    NULL,
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'expired',
    'Membership lapsed on Sept 5. Followed up via phone.',
    '{"name": "Sunita Deshmukh", "relationship": "Spouse", "phone": "+91 98450 55443"}'::jsonb
),
(
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'GYM-2024-006',
    'Tanvi Mukherjee',
    'tanvi.m@designstudio.in',
    '+91 98450 67890',
    'Female',
    27,
    '2026-02-15',
    'Fat Loss & HIIT',
    'L-12',
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'active',
    'Attends morning 7 AM functional batch.',
    '{"name": "Deb Mukherjee", "relationship": "Father", "phone": "+91 98450 44332"}'::jsonb
);

-- Memberships for Tenant 1
INSERT INTO public.memberships (
    id, organization_id, member_id, plan_id, start_date, expiry_date, amount_inr, status, freeze_start_date, freeze_end_date, freeze_reason
) VALUES
(
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    '2025-09-15',
    '2026-09-15', -- 4 days remaining
    24000.00,
    'expiring',
    NULL, NULL, NULL
),
(
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    '2026-03-15',
    '2026-09-17', -- 6 days remaining
    14500.00,
    'expiring',
    NULL, NULL, NULL
),
(
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    '2026-01-10',
    '2027-01-24', -- extended by 14 days
    24000.00,
    'frozen',
    '2026-09-01', '2026-09-15', 'Overseas client visit'
),
(
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    '2026-03-01',
    '2027-03-01',
    24000.00,
    'active',
    NULL, NULL, NULL
),
(
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    '2025-08-20',
    '2026-08-20',
    24000.00,
    'expired',
    NULL, NULL, NULL
),
(
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    '2026-02-15',
    '2026-08-15',
    14500.00,
    'active',
    NULL, NULL, NULL
);

-- Attendance Check-ins for Tenant 1 (Today & Recent)
INSERT INTO public.attendance (
    id, organization_id, member_id, check_in_time, workout_type
) VALUES
(
    'att0ebc9-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    CURRENT_DATE + TIME '06:45:00',
    'Heavy Upper Body Power'
),
(
    'att0ebc9-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    CURRENT_DATE + TIME '07:15:00',
    'HIIT & Kettlebell Conditioning'
),
(
    'att0ebc9-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    CURRENT_DATE + TIME '08:30:00',
    'Hypertrophy Legs & Core'
),
(
    'att0ebc9-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    CURRENT_DATE + TIME '09:00:00',
    'Functional Mobility'
);

-- Payments & Invoices for Tenant 1
INSERT INTO public.payments (
    id, organization_id, member_id, membership_id, invoice_number, amount_inr, tax_inr, total_inr, payment_date, due_date, status, payment_method, reference_id, collected_by
) VALUES
(
    'pay0ebc9-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'INV-2025-0012',
    20338.98,
    3661.02,
    24000.00,
    '2025-09-15',
    '2025-09-15',
    'paid',
    'UPI',
    'UPI/294810298371',
    'Front Desk'
),
(
    'pay0ebc9-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'INV-2026-0104',
    12288.14,
    2211.86,
    14500.00,
    '2026-03-15',
    '2026-03-15',
    'paid',
    'Credit Card',
    'POS/HDFC-889102',
    'Front Desk'
),
(
    'pay0ebc9-9c0b-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    'INV-2026-0211',
    20338.98,
    3661.02,
    24000.00,
    '2026-03-01',
    '2026-03-01',
    'paid',
    'UPI',
    'UPI/GPAY-77291039',
    'Front Desk'
),
(
    'pay0ebc9-9c0b-4ef8-bb6d-6bb9bd380a04',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    'INV-2026-0340',
    20338.98,
    3661.02,
    24000.00,
    '2026-08-20',
    '2026-08-20',
    'overdue',
    'UPI',
    NULL,
    'Front Desk'
);

-- Activity Logs for Tenant 1
INSERT INTO public.activity_logs (
    id, organization_id, actor_id, member_id, action, title, description, metadata
) VALUES
(
    'act0ebc9-9c0b-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    'whatsapp_reminder_sent',
    'WhatsApp Renewal Link Sent',
    'Dispatched preferential renewal link with 1-click UPI checkout (Expires in 4 days).',
    '{"days_left": 4, "channel": "whatsapp"}'::jsonb
),
(
    'act0ebc9-9c0b-4ef8-bb6d-6bb9bd380a02',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    'membership_frozen',
    'Membership Frozen (14 Days)',
    'Plan paused until 2026-09-15. Expiry pushed forward to 2027-01-24.',
    '{"pause_days": 14, "reason": "Overseas business trip"}'::jsonb
);

-- ==============================================================================
-- TENANT 2: Iron House Fitness (Mumbai - Strictly Isolated)
-- ==============================================================================
INSERT INTO public.organizations (
    id, name, slug, currency, phone, email, address, city, state, postal_code, gstin, peak_capacity
) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Iron House Fitness',
    'iron-house-bandra',
    'INR',
    '+91 22 2640 1199',
    'info@ironhouse.in',
    'Plot 14, Turner Road, Bandra West',
    'Mumbai',
    'Maharashtra',
    '400050',
    '27AABCU1122K1Z9',
    150
);

-- Profile for Tenant 2 Owner
INSERT INTO public.profiles (
    id, organization_id, full_name, email, role, phone
) VALUES (
    'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Aryan Shroff',
    'owner@ironhouse.in',
    'owner',
    '+91 98200 99887'
);

-- Trainer for Tenant 2
INSERT INTO public.trainers (
    id, organization_id, full_name, specialty, phone, email, is_active
) VALUES (
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Coach Kabir Mehra',
    'Olympic Weightlifting & Hypertrophy',
    '+91 98200 44332',
    'kabir.mehra@ironhouse.in',
    TRUE
);

-- Plans for Tenant 2
INSERT INTO public.membership_plans (
    id, organization_id, name, code, tag, duration_months, price_inr, description, features, is_popular, is_active
) VALUES
(
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Iron House Annual Black',
    'IH-BLK-12M',
    'All Inclusive',
    12,
    32000.00,
    'Exclusive black-card tier with 24/7 access and private recovery lounge.',
    '["24/7 Biometric access", "Private recovery suite & ice bath", "Unlimited towel service"]'::jsonb,
    TRUE,
    TRUE
),
(
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Iron House 6-Month Classic',
    'IH-CLS-6M',
    NULL,
    6,
    18000.00,
    'Semi-annual access to main strength training floor.',
    '["Main gym floor access", "Standard lockers"]'::jsonb,
    FALSE,
    TRUE
);

-- Member for Tenant 2
INSERT INTO public.members (
    id, organization_id, member_code, full_name, email, phone, gender, age, join_date, goal, locker_number, assigned_trainer_id, status, notes, emergency_contact
) VALUES (
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'IH-2024-001',
    'Varun Dhawan (Mumbai Client)',
    'varun.d@ironhouse-client.in',
    '+91 98200 11223',
    'Male',
    31,
    '2026-01-05',
    'Hypertrophy & Strength',
    'L-01',
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'active',
    'VIP member in Bandra branch.',
    '{"name": "Natasha Dalal", "relationship": "Spouse", "phone": "+91 98200 55667"}'::jsonb
);

-- Membership for Tenant 2
INSERT INTO public.memberships (
    id, organization_id, member_id, plan_id, start_date, expiry_date, amount_inr, status
) VALUES (
    'ms0ebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    '2026-01-05',
    '2027-01-05',
    32000.00,
    'active'
);
