-- =====================================================================================
-- GYM OS — Seed Data for Real Pilot Gym: Pulse Fitness & Performance (Bengaluru)
-- Currency: INR (₹) | Locale: India (+91)
-- =====================================================================================

DO $$
DECLARE
  v_org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_trainer_vikram UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
  v_trainer_priya UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
  v_trainer_amit UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03';

  v_plan_ann_pro UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
  v_plan_6m_trans UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
  v_plan_3m_func UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03';
  v_plan_1m_flex UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04';
  v_plan_pt_16x UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05';

  v_mem_rohan UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
  v_mem_ananya UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
  v_mem_aarav UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03';
  v_mem_vikram UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04';
  v_mem_sneha UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05';
  v_mem_karan UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06';
  v_mem_divya UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07';
  v_mem_siddharth UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08';

BEGIN
  -- 1. Insert Pilot Organization
  INSERT INTO organizations (id, name, slug, currency, phone, email, address, city, state, postal_code, gstin, peak_capacity)
  VALUES (
    v_org_id,
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
  ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- 2. Insert Trainers
  INSERT INTO trainers (id, organization_id, full_name, specialty, phone, email)
  VALUES 
    (v_trainer_vikram, v_org_id, 'Coach Vikram Rao', 'Powerlifting & Hypertrophy', '+91 98450 11982', 'vikram.rao@pulsefitness.in'),
    (v_trainer_priya, v_org_id, 'Coach Priya Sharma', 'HIIT, Mobility & Rehab', '+91 98450 77412', 'priya.sharma@pulsefitness.in'),
    (v_trainer_amit, v_org_id, 'Coach Amit Patel', 'Functional Movement & Recomp', '+91 98450 55190', 'amit.patel@pulsefitness.in')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Insert Membership Plans
  INSERT INTO membership_plans (id, organization_id, name, code, tag, duration_months, price_inr, description, features, is_popular)
  VALUES
    (v_plan_ann_pro, v_org_id, 'Annual Strength Pro', 'ANN-PRO', 'Highest Value', 12, 24000.00, 'Comprehensive 365-day access designed for dedicated athletes.', '["Unlimited gym floor access", "Monthly InBody Scan", "4 complimentary PT sessions", "Steam & Sauna access", "Locker priority", "2 Guest passes/quarter"]'::jsonb, TRUE),
    (v_plan_6m_trans, v_org_id, '6-Month Transformation', '6M-TRANSFORM', 'Most Popular', 6, 14500.00, 'Structured body composition and hypertrophy milestone program.', '["Full facility access", "Bi-monthly nutrition consult", "2 complimentary PT sessions", "Steam bath 2x/week", "Free towel service"]'::jsonb, TRUE),
    (v_plan_3m_func, v_org_id, '3-Month Functional Fit', '3M-FUNC', NULL, 3, 8500.00, 'Quarterly training program focused on functional agility & stamina.', '["Standard gym access 6am-10pm", "CrossFit & HIIT zone access", "Initial workout roadmap"]'::jsonb, FALSE),
    (v_plan_1m_flex, v_org_id, 'Monthly Flex Access', '1M-FLEX', NULL, 1, 3200.00, 'Zero lock-in flexibility for travelling professionals.', '["30 days gym access", "Cardio & Strength equipment", "Basic locker amenity"]'::jsonb, FALSE),
    (v_plan_pt_16x, v_org_id, 'Personal Training Pack (16 Sessions)', 'PT-16X', 'High Yield', 2, 18000.00, '1-on-1 coaching add-on with customized biomechanics & macros.', '["16 1-on-1 sessions with Master Coach", "Custom macro meal plan", "Form analysis & bio-tracking"]'::jsonb, FALSE)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Insert Members
  INSERT INTO members (id, organization_id, member_code, full_name, email, phone, gender, age, join_date, goal, locker_number, assigned_trainer_id, status, notes, emergency_contact, avatar_url)
  VALUES
    (v_mem_rohan, v_org_id, 'GYM-2024-001', 'Rohan Mehta', 'rohan.mehta@gmail.com', '+91 98450 12891', 'Male', 29, '2023-09-14', 'Hypertrophy & Strength', 'L-42', v_trainer_vikram, 'expiring', 'Powerlifting focus. Consistent 6:30 AM arrival.', '{"name": "Pooja Mehta", "relationship": "Spouse", "phone": "+91 98450 99812"}'::jsonb, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    (v_mem_ananya, v_org_id, 'GYM-2024-002', 'Ananya Desai', 'ananya.desai@techcorp.in', '+91 97312 88401', 'Female', 27, '2024-03-12', 'Fat Loss & HIIT', 'L-18', v_trainer_priya, 'expiring', 'Completed 6-month recomp (-6kg fat mass).', '{"name": "Kavita Desai", "relationship": "Mother", "phone": "+91 97312 55432"}'::jsonb, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
    (v_mem_aarav, v_org_id, 'GYM-2024-003', 'Aarav Sharma', 'aarav.sharma@gmail.com', '+91 98801 44520', 'Male', 32, '2023-11-20', 'Hypertrophy & Strength', 'L-07', v_trainer_vikram, 'active', 'Regular morning athlete. Classic physique training.', '{"name": "Sunita Sharma", "relationship": "Spouse", "phone": "+91 98801 11209"}'::jsonb, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
    (v_mem_vikram, v_org_id, 'GYM-2024-004', 'Vikram Malhotra', 'vikram.malhotra@innovate.co', '+91 99002 33119', 'Male', 35, '2024-06-15', 'General Fitness', 'L-29', v_trainer_amit, 'expiring', 'Travels frequently for consulting.', '{"name": "Rajiv Malhotra", "relationship": "Brother", "phone": "+91 99002 77881"}'::jsonb, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
    (v_mem_sneha, v_org_id, 'GYM-2024-005', 'Sneha Reddy', 'sneha.reddy@gmail.com', '+91 98451 77334', 'Female', 26, '2024-01-10', 'Mobility & Rehab', 'L-12', v_trainer_priya, 'active', 'Rehabilitated shoulder impingement.', '{"name": "Venkatesh Reddy", "relationship": "Father", "phone": "+91 98451 22990"}'::jsonb, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
    (v_mem_karan, v_org_id, 'GYM-2024-006', 'Karan Verma', 'karan.verma@fintech.io', '+91 99160 55412', 'Male', 31, '2024-08-01', 'General Fitness', NULL, v_trainer_amit, 'expired', 'Payment overdue by 9 days.', '{"name": "Deepak Verma", "relationship": "Father", "phone": "+91 99160 11223"}'::jsonb, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
    (v_mem_divya, v_org_id, 'GYM-2024-007', 'Divya Iyer', 'divya.iyer@designstudio.in', '+91 98440 99823', 'Female', 28, '2023-10-05', 'Powerlifting', 'L-03', v_trainer_priya, 'active', 'Top tier consistency. Holds female squat PR.', '{"name": "Ramesh Iyer", "relationship": "Spouse", "phone": "+91 98440 11988"}'::jsonb, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
    (v_mem_siddharth, v_org_id, 'GYM-2024-010', 'Siddharth Rao', 'siddharth.rao@cloudsys.io', '+91 98455 66720', 'Male', 25, '2024-06-11', 'Hypertrophy & Strength', 'L-31', v_trainer_amit, 'expiring', 'Expiry in 1 day. Upgrading to Annual Pro.', '{"name": "Geetha Rao", "relationship": "Mother", "phone": "+91 98455 11234"}'::jsonb, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Insert Memberships (Subscriptions)
  INSERT INTO memberships (id, organization_id, member_id, plan_id, start_date, expiry_date, amount_inr, status)
  VALUES
    (gen_random_uuid(), v_org_id, v_mem_rohan, v_plan_ann_pro, '2025-09-14', CURRENT_DATE + INTERVAL '4 days', 24000.00, 'expiring'),
    (gen_random_uuid(), v_org_id, v_mem_ananya, v_plan_6m_trans, '2026-03-12', CURRENT_DATE + INTERVAL '2 days', 14500.00, 'expiring'),
    (gen_random_uuid(), v_org_id, v_mem_aarav, v_plan_ann_pro, '2025-11-20', CURRENT_DATE + INTERVAL '71 days', 24000.00, 'active'),
    (gen_random_uuid(), v_org_id, v_mem_vikram, v_plan_3m_func, '2026-06-15', CURRENT_DATE + INTERVAL '5 days', 8500.00, 'expiring'),
    (gen_random_uuid(), v_org_id, v_mem_sneha, v_plan_ann_pro, '2026-01-10', CURRENT_DATE + INTERVAL '122 days', 24000.00, 'active'),
    (gen_random_uuid(), v_org_id, v_mem_karan, v_plan_1m_flex, '2026-08-01', CURRENT_DATE - INTERVAL '9 days', 3200.00, 'expired'),
    (gen_random_uuid(), v_org_id, v_mem_divya, v_plan_ann_pro, '2025-10-05', CURRENT_DATE + INTERVAL '25 days', 24000.00, 'active'),
    (gen_random_uuid(), v_org_id, v_mem_siddharth, v_plan_3m_func, '2026-06-11', CURRENT_DATE + INTERVAL '1 day', 8500.00, 'expiring')
  ON CONFLICT DO NOTHING;

  -- 6. Insert Today's Attendance Check-ins
  INSERT INTO attendance (id, organization_id, member_id, check_in_time, workout_type)
  VALUES
    (gen_random_uuid(), v_org_id, v_mem_rohan, NOW() - INTERVAL '4 hours', 'Heavy Upper Body & Bench'),
    (gen_random_uuid(), v_org_id, v_mem_divya, NOW() - INTERVAL '4 hours 30 mins', 'Squats & Accessories'),
    (gen_random_uuid(), v_org_id, v_mem_siddharth, NOW() - INTERVAL '3 hours 45 mins', 'Arms & Delts'),
    (gen_random_uuid(), v_org_id, v_mem_aarav, NOW() - INTERVAL '3 hours 20 mins', 'Chest & Back Hypertrophy'),
    (gen_random_uuid(), v_org_id, v_mem_sneha, NOW() - INTERVAL '2 hours 40 mins', 'Mobility & Overhead Stability')
  ON CONFLICT DO NOTHING;

  -- 7. Insert Financial Payments
  INSERT INTO payments (id, organization_id, member_id, invoice_number, amount_inr, tax_inr, total_inr, payment_date, due_date, status, payment_method, reference_id, collected_by)
  VALUES
    (gen_random_uuid(), v_org_id, v_mem_aarav, 'INV-2026-0901', 20339.00, 3661.00, 24000.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days', 'paid', 'UPI', 'UPI-928374182903', 'Front Desk - Rakesh'),
    (gen_random_uuid(), v_org_id, v_mem_ananya, 'INV-2026-0902', 12288.00, 2212.00, 14500.00, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days', 'paid', 'Credit Card', 'HDFC-CC-778129', 'Online Portal'),
    (gen_random_uuid(), v_org_id, v_mem_siddharth, 'INV-2026-0903', 7203.00, 1297.00, 8500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 'pending', 'UPI', NULL, 'System Auto-Invoice'),
    (gen_random_uuid(), v_org_id, v_mem_karan, 'INV-2026-0904', 2712.00, 488.00, 3200.00, CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE - INTERVAL '9 days', 'overdue', 'UPI', NULL, 'System Auto-Invoice'),
    (gen_random_uuid(), v_org_id, v_mem_sneha, 'INV-2026-0906', 20339.00, 3661.00, 24000.00, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', 'paid', 'UPI', 'UPI-881290345100', 'Front Desk - Rakesh')
  ON CONFLICT DO NOTHING;

  -- 8. Insert Activity Audit Logs
  INSERT INTO activity_logs (id, organization_id, member_id, action, title, description)
  VALUES
    (gen_random_uuid(), v_org_id, v_mem_rohan, 'attendance_logged', 'Checked in at Gym Floor', 'Morning strength session logged at 06:45 AM'),
    (gen_random_uuid(), v_org_id, v_mem_rohan, 'whatsapp_reminder_sent', 'WhatsApp Renewal Notice Dispatched', 'Automated 7-day expiry notice with 1-click UPI checkout'),
    (gen_random_uuid(), v_org_id, v_mem_aarav, 'payment_recorded', 'Payment Received — ₹24,000', 'Annual Strength Pro paid via UPI (Ref: UPI-928374182903)'),
    (gen_random_uuid(), v_org_id, v_mem_siddharth, 'whatsapp_reminder_sent', 'Urgent 24-Hour Expiry Alert Sent', 'WhatsApp reminder sent for plan expiring tomorrow')
  ON CONFLICT DO NOTHING;

END $$;
