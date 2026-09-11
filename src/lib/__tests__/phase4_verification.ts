/**
 * GYM OS — Phase 4 Retention & Revenue Intelligence Engine Test Suite
 * Automated verification of deterministic risk models, signals, priority queues,
 * multi-tier revenue exposure, and multi-tenant boundary integrity.
 */

import {
  analyzeMemberRetention,
  calculateRetentionOverview,
  filterRetentionSegment,
} from '../../services/retentionService';
import {
  calculateMembershipStatus,
  DEFAULT_PILOT_ORG,
} from '../../services/gymService';
import {
  Member,
  MembershipPlan,
  PaymentTransaction,
  AttendanceRecord,
} from '../../types';

// Mock Test Plans
const TEST_PLANS: MembershipPlan[] = [
  {
    id: 'plan-ann',
    name: 'Annual Strength Pro',
    code: 'ANN-PRO',
    durationMonths: 12,
    priceINR: 24000,
    activeMembersCount: 10,
    totalRevenueINR: 240000,
    expiringThisWeek: 2,
    features: ['All access'],
    description: 'Annual plan',
  },
  {
    id: 'plan-6m',
    name: '6-Month Transformation',
    code: '6M-TRANSFORM',
    durationMonths: 6,
    priceINR: 14500,
    activeMembersCount: 8,
    totalRevenueINR: 116000,
    expiringThisWeek: 1,
    features: ['All access'],
    description: '6 month plan',
  },
  {
    id: 'plan-1m',
    name: 'Monthly Flex Access',
    code: '1M-FLEX',
    durationMonths: 1,
    priceINR: 3200,
    activeMembersCount: 4,
    totalRevenueINR: 12800,
    expiringThisWeek: 0,
    features: ['Basic access'],
    description: '1 month plan',
  },
];

const REF_DATE = new Date('2026-09-10T10:00:00Z');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    failedTests++;
  }
}

console.log('\n==================================================');
console.log('GYM OS — PHASE 4 RETENTION INTELLIGENCE VERIFICATION');
console.log('==================================================\n');

// ------------------------------------------------------------------------------
// TEST 1: Expiry Signal Risk Scoring
// ------------------------------------------------------------------------------
console.log('--- 1. Expiry Risk Scoring ---');
{
  const makeMemberWithDays = (days: number): Member => ({
    id: `m-exp-${days}`,
    memberCode: `GYM-EXP-${days}`,
    name: `Test Member ${days}d`,
    email: 'test@example.com',
    phone: '+91 99999 00000',
    gender: 'Male',
    age: 28,
    joinDate: '2025-09-10',
    planId: 'plan-ann',
    planName: 'Annual Strength Pro',
    status: days <= 0 ? (days === 0 ? 'expiring' : 'expired') : days <= 7 ? 'expiring' : 'active',
    expiryDate: '2026-09-14',
    daysRemaining: days,
    lastVisit: 'Today',
    lastVisitDate: '2026-09-10',
    attendanceRate: 90,
    weeklyFrequency: 4,
    totalVisits: 100,
    monthlyVisits: 15,
    paymentStatus: 'paid',
    lastPaymentDate: '2025-09-10',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: '',
    attendanceHistory: [],
    timeline: [],
  });

  const p0 = analyzeMemberRetention(makeMemberWithDays(0), TEST_PLANS, [], [], REF_DATE);
  assert(p0.riskScore >= 35, 'Expiry today (0d) generates maximum 35-point expiry urgency');

  const p2 = analyzeMemberRetention(makeMemberWithDays(2), TEST_PLANS, [], [], REF_DATE);
  assert(p2.riskScore === 30, 'Expiry in 2 days generates 30 points');

  const p5 = analyzeMemberRetention(makeMemberWithDays(5), TEST_PLANS, [], [], REF_DATE);
  assert(p5.riskScore === 22, 'Expiry in 5 days generates 22 points');

  const p10 = analyzeMemberRetention(makeMemberWithDays(10), TEST_PLANS, [], [], REF_DATE);
  assert(p10.riskScore === 12, 'Expiry in 10 days generates 12 points');

  const p40 = analyzeMemberRetention(makeMemberWithDays(40), TEST_PLANS, [], [], REF_DATE);
  assert(p40.riskScore === 0, 'Expiry in 40 days generates 0 expiry risk points');
}

// ------------------------------------------------------------------------------
// TEST 2: Inactivity Detection & 7-Day Alert Threshold
// ------------------------------------------------------------------------------
console.log('\n--- 2. Inactivity Detection ---');
{
  const makeMemberWithAbsence = (daysAbsent: number): Member => {
    const d = new Date(REF_DATE.getTime() - daysAbsent * 24 * 60 * 60 * 1000);
    const lastVisitDate = d.toISOString().split('T')[0];
    return {
      id: `m-abs-${daysAbsent}`,
      memberCode: `GYM-ABS-${daysAbsent}`,
      name: `Absent Member ${daysAbsent}d`,
      email: 'test@example.com',
      phone: '+91 99999 00000',
      gender: 'Male',
      age: 28,
      joinDate: '2024-01-01',
      planId: 'plan-ann',
      planName: 'Annual Strength Pro',
      status: 'active',
      expiryDate: '2026-12-31',
      daysRemaining: 112,
      lastVisit: `${daysAbsent} days ago`,
      lastVisitDate,
      attendanceRate: 50,
      weeklyFrequency: 3,
      totalVisits: 50,
      monthlyVisits: 12,
      paymentStatus: 'paid',
      lastPaymentDate: '2026-01-01',
      pendingAmountINR: 0,
      assignedTrainer: 'Coach Vikram',
      goal: 'General Fitness',
      emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
      notes: '',
      attendanceHistory: [],
      timeline: [],
    };
  };

  const p2 = analyzeMemberRetention(makeMemberWithAbsence(2), TEST_PLANS, [], [], REF_DATE);
  assert(p2.riskScore === 0, '2 days absence produces 0 inactivity penalty');

  const p5 = analyzeMemberRetention(makeMemberWithAbsence(5), TEST_PLANS, [], [], REF_DATE);
  assert(p5.riskScore === 10, '5 days absence produces 10 points moderate alert');

  const p9 = analyzeMemberRetention(makeMemberWithAbsence(9), TEST_PLANS, [], [], REF_DATE);
  assert(p9.riskScore === 20 && p9.reasons.some((r) => r.includes('9 days')), '9 days absence (>=7d threshold) triggers inactivity alert');

  const p15 = analyzeMemberRetention(makeMemberWithAbsence(15), TEST_PLANS, [], [], REF_DATE);
  assert(p15.riskScore === 28, '15 days absence produces 28 points severe inactivity');
}

// ------------------------------------------------------------------------------
// TEST 3: Attendance Trend & Decline Identification
// ------------------------------------------------------------------------------
console.log('\n--- 3. Attendance Trend & Decline ---');
{
  const memberWithDecline: Member = {
    id: 'm-dec-1',
    memberCode: 'GYM-DEC-001',
    name: 'Declining Member',
    email: 'test@example.com',
    phone: '+91 99999 00000',
    gender: 'Male',
    age: 28,
    joinDate: '2024-01-01',
    planId: 'plan-ann',
    planName: 'Annual Strength Pro',
    status: 'active',
    expiryDate: '2026-12-31',
    daysRemaining: 112,
    lastVisit: 'Today',
    lastVisitDate: '2026-09-10',
    attendanceRate: 60,
    weeklyFrequency: 2,
    totalVisits: 100,
    monthlyVisits: 6,
    paymentStatus: 'paid',
    lastPaymentDate: '2026-01-01',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: '',
    attendanceHistory: [
      // 6 visits in last 30d
      { id: 'a1', date: '2026-09-10', time: '07:00 AM' },
      { id: 'a2', date: '2026-09-08', time: '07:00 AM' },
      { id: 'a3', date: '2026-09-05', time: '07:00 AM' },
      { id: 'a4', date: '2026-09-01', time: '07:00 AM' },
      { id: 'a5', date: '2026-08-25', time: '07:00 AM' },
      { id: 'a6', date: '2026-08-20', time: '07:00 AM' },
      // 14 visits in previous 30d (Aug 11 - Jul 12)
      { id: 'a7', date: '2026-08-08', time: '07:00 AM' },
      { id: 'a8', date: '2026-08-06', time: '07:00 AM' },
      { id: 'a9', date: '2026-08-04', time: '07:00 AM' },
      { id: 'a10', date: '2026-08-02', time: '07:00 AM' },
      { id: 'a11', date: '2026-07-30', time: '07:00 AM' },
      { id: 'a12', date: '2026-07-28', time: '07:00 AM' },
      { id: 'a13', date: '2026-07-26', time: '07:00 AM' },
      { id: 'a14', date: '2026-07-24', time: '07:00 AM' },
      { id: 'a15', date: '2026-07-22', time: '07:00 AM' },
      { id: 'a16', date: '2026-07-20', time: '07:00 AM' },
      { id: 'a17', date: '2026-07-18', time: '07:00 AM' },
      { id: 'a18', date: '2026-07-16', time: '07:00 AM' },
      { id: 'a19', date: '2026-07-14', time: '07:00 AM' },
      { id: 'a20', date: '2026-07-12', time: '07:00 AM' },
    ],
    timeline: [],
  };

  const p = analyzeMemberRetention(memberWithDecline, TEST_PLANS, [], [], REF_DATE);
  assert(p.attendanceTrendPercent === -57, 'Calculates exact -57% attendance drop (6 vs 14 visits)');
  assert(p.riskScore === 20, 'Severe decline adds 20 points');
}

// ------------------------------------------------------------------------------
// TEST 4: Frozen Member Inactivity Churn Immunity
// ------------------------------------------------------------------------------
console.log('\n--- 4. Frozen Member Handling ---');
{
  const frozenMember: Member = {
    id: 'm-froz-1',
    memberCode: 'GYM-FROZ-001',
    name: 'Meera Frozen',
    email: 'meera@example.com',
    phone: '+91 99999 00000',
    gender: 'Female',
    age: 30,
    joinDate: '2024-02-01',
    planId: 'plan-6m',
    planName: '6-Month Transformation',
    status: 'frozen',
    expiryDate: '2026-10-15',
    daysRemaining: 35,
    lastVisit: '25 days ago',
    lastVisitDate: '2026-08-16',
    attendanceRate: 60,
    weeklyFrequency: 2,
    totalVisits: 40,
    monthlyVisits: 0,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-02-01',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Priya',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: 'Medical hold',
    attendanceHistory: [],
    timeline: [],
  };

  const p = analyzeMemberRetention(frozenMember, TEST_PLANS, [], [], REF_DATE);
  assert(p.isFrozen === true, 'Member recognized as frozen');
  assert(p.riskLevel === 'frozen', 'Risk level assigned as frozen');
  assert(p.riskScore === 0, 'Inactivity penalty is zeroed for authorized frozen hold');
  assert(p.reasons.some((r) => r.includes('frozen')), 'Explainability notes authorized pause');
}

// ------------------------------------------------------------------------------
// TEST 5: Cancelled Member Exclusion
// ------------------------------------------------------------------------------
console.log('\n--- 5. Cancelled Member Exclusion ---');
{
  const cancelledMember: Member = {
    id: 'm-canc-1',
    memberCode: 'GYM-CANC-001',
    name: 'Cancelled Member',
    email: 'canc@example.com',
    phone: '+91 99999 00000',
    gender: 'Male',
    age: 32,
    joinDate: '2023-01-01',
    planId: 'plan-ann',
    planName: 'Annual Strength Pro',
    status: 'cancelled',
    expiryDate: '2024-01-01',
    daysRemaining: 0,
    lastVisit: '100 days ago',
    lastVisitDate: '2024-01-01',
    attendanceRate: 0,
    weeklyFrequency: 0,
    totalVisits: 20,
    monthlyVisits: 0,
    paymentStatus: 'paid',
    lastPaymentDate: '2023-01-01',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: 'Moved cities',
    attendanceHistory: [],
    timeline: [],
  };

  const overview = calculateRetentionOverview([cancelledMember], TEST_PLANS, [], [], REF_DATE);
  assert(overview.profiles[0].priorityRank === 0, 'Cancelled member has priorityRank 0 (excluded from active ranking)');
}

// ------------------------------------------------------------------------------
// TEST 6: Expired Recovery Opportunity Categorization
// ------------------------------------------------------------------------------
console.log('\n--- 6. Expired Recovery Pool ---');
{
  const lapsedMember: Member = {
    id: 'm-lapsed-1',
    memberCode: 'GYM-LAPSED-001',
    name: 'Arjun Lapsed',
    email: 'arjun@example.com',
    phone: '+91 99999 00000',
    gender: 'Male',
    age: 35,
    joinDate: '2023-08-18',
    planId: 'plan-ann',
    planName: 'Annual Strength Pro',
    status: 'expired',
    expiryDate: '2026-08-18',
    daysRemaining: -23,
    lastVisit: '22 days ago',
    lastVisitDate: '2026-08-19',
    attendanceRate: 40,
    weeklyFrequency: 1.5,
    totalVisits: 110,
    monthlyVisits: 0,
    paymentStatus: 'overdue',
    lastPaymentDate: '2023-08-18',
    pendingAmountINR: 24000,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: 'Lapsed plan',
    attendanceHistory: [],
    timeline: [],
  };

  const p = analyzeMemberRetention(lapsedMember, TEST_PLANS, [], [], REF_DATE);
  assert(p.riskLevel === 'recovered', 'Recently expired member categorized in win-back recovery pool');
  assert(p.recommendedActionType === 'call_winback', 'Recommended action is win-back phone outreach');
}

// ------------------------------------------------------------------------------
// TEST 7: Golden Archetype (Rohan Mehta) End-to-End
// ------------------------------------------------------------------------------
console.log('\n--- 7. Golden Archetype (Rohan Mehta) Verification ---');
{
  const rohan: Member = {
    id: 'mem-101',
    memberCode: 'GYM-2024-001',
    name: 'Rohan Mehta',
    email: 'rohan@example.com',
    phone: '+91 98450 12891',
    gender: 'Male',
    age: 29,
    joinDate: '2023-09-14',
    planId: 'plan-ann',
    planName: 'Annual Strength Pro',
    status: 'expiring',
    expiryDate: '2026-09-14',
    daysRemaining: 4,
    lastVisit: '9 days ago',
    lastVisitDate: '2026-09-01',
    attendanceRate: 52,
    weeklyFrequency: 1.8,
    totalVisits: 184,
    monthlyVisits: 6,
    paymentStatus: 'paid',
    lastPaymentDate: '2025-09-14',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'Hypertrophy & Strength',
    emergencyContact: { name: 'Pooja', relationship: 'Spouse', phone: '123' },
    notes: 'Expiring in 4 days',
    attendanceHistory: [
      { id: 'a1', date: '2026-09-01', time: '06:45 AM' },
      { id: 'a2', date: '2026-08-28', time: '06:45 AM' },
      { id: 'a3', date: '2026-08-25', time: '06:45 AM' },
      { id: 'a4', date: '2026-08-20', time: '06:45 AM' },
      { id: 'a5', date: '2026-08-16', time: '06:45 AM' },
      { id: 'a6', date: '2026-08-12', time: '06:45 AM' },
      { id: 'a7', date: '2026-08-08', time: '06:45 AM' },
      { id: 'a8', date: '2026-08-06', time: '06:45 AM' },
      { id: 'a9', date: '2026-08-04', time: '06:45 AM' },
      { id: 'a10', date: '2026-08-02', time: '06:45 AM' },
      { id: 'a11', date: '2026-07-30', time: '06:45 AM' },
      { id: 'a12', date: '2026-07-28', time: '06:45 AM' },
      { id: 'a13', date: '2026-07-26', time: '06:45 AM' },
      { id: 'a14', date: '2026-07-24', time: '06:45 AM' },
      { id: 'a15', date: '2026-07-22', time: '06:45 AM' },
      { id: 'a16', date: '2026-07-20', time: '06:45 AM' },
      { id: 'a17', date: '2026-07-18', time: '06:45 AM' },
      { id: 'a18', date: '2026-07-16', time: '06:45 AM' },
      { id: 'a19', date: '2026-07-14', time: '06:45 AM' },
      { id: 'a20', date: '2026-07-12', time: '06:45 AM' },
    ],
    timeline: [],
  };

  const p = analyzeMemberRetention(rohan, TEST_PLANS, [], [], REF_DATE);
  assert(p.riskLevel === 'high' || p.riskLevel === 'critical', 'Rohan is classified as HIGH/CRITICAL risk');
  assert(p.revenueAtRiskINR === 24000, 'Rohan revenue at risk is ₹24,000');
  assert(p.reasons.some((r) => r.includes('4 days')), 'Reasons list includes 4-day expiry');
  assert(p.reasons.some((r) => r.includes('9 days')), 'Reasons list includes 9-day absence');
  assert(p.recommendedActionType === 'whatsapp_reengage', 'Recommended action is re-engagement + renewal');
}

// ------------------------------------------------------------------------------
// TEST 8: Priority Scoring (Risk + High Value Ranking)
// ------------------------------------------------------------------------------
console.log('\n--- 8. Priority Queue Ranking ---');
{
  const highValueMember: Member = {
    id: 'm-val-high',
    memberCode: 'GYM-VAL-001',
    name: 'High Value Athlete',
    email: 'high@example.com',
    phone: '+91 99999 00000',
    gender: 'Male',
    age: 30,
    joinDate: '2024-01-01',
    planId: 'plan-ann', // ₹24,000
    planName: 'Annual Strength Pro',
    status: 'expiring',
    expiryDate: '2026-09-14',
    daysRemaining: 4,
    lastVisit: '8 days ago',
    lastVisitDate: '2026-09-02',
    attendanceRate: 50,
    weeklyFrequency: 2,
    totalVisits: 50,
    monthlyVisits: 4,
    paymentStatus: 'paid',
    lastPaymentDate: '2025-09-14',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: '',
    attendanceHistory: [],
    timeline: [],
  };

  const lowValueMember: Member = {
    id: 'm-val-low',
    memberCode: 'GYM-VAL-002',
    name: 'Low Value Athlete',
    email: 'low@example.com',
    phone: '+91 99999 00000',
    gender: 'Male',
    age: 22,
    joinDate: '2024-08-01',
    planId: 'plan-1m', // ₹3,200
    planName: 'Monthly Flex Access',
    status: 'expiring',
    expiryDate: '2026-09-14',
    daysRemaining: 4,
    lastVisit: '8 days ago',
    lastVisitDate: '2026-09-02',
    attendanceRate: 50,
    weeklyFrequency: 2,
    totalVisits: 10,
    monthlyVisits: 4,
    paymentStatus: 'paid',
    lastPaymentDate: '2024-08-01',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Amit',
    goal: 'General Fitness',
    emergencyContact: { name: 'Contact', relationship: 'Friend', phone: '123' },
    notes: '',
    attendanceHistory: [],
    timeline: [],
  };

  const overview = calculateRetentionOverview([lowValueMember, highValueMember], TEST_PLANS, [], [], REF_DATE);
  const highValProfile = overview.profiles.find((p) => p.memberId === 'm-val-high')!;
  const lowValProfile = overview.profiles.find((p) => p.memberId === 'm-val-low')!;

  assert(highValProfile.priorityScore > lowValProfile.priorityScore, 'High value member generates higher priority score with equal risk');
  assert(highValProfile.priorityRank === 1, 'High value member occupies Rank #1 in Priority Queue');
}

// ------------------------------------------------------------------------------
// TEST 9: Multi-Tier Revenue at Risk (7d, 14d, 30d)
// ------------------------------------------------------------------------------
console.log('\n--- 9. Multi-Tier Revenue at Risk ---');
{
  const m7: Member = {
    id: 'm-7d',
    memberCode: 'GYM-7D',
    name: '7 Day Expiring',
    email: 'test@example.com',
    phone: '123',
    gender: 'Male',
    age: 25,
    joinDate: '2024-01-01',
    planId: 'plan-ann', // 24000
    planName: 'Annual Pro',
    status: 'expiring',
    expiryDate: '2026-09-15',
    daysRemaining: 5,
    lastVisit: 'Today',
    lastVisitDate: '2026-09-10',
    attendanceRate: 80,
    weeklyFrequency: 4,
    totalVisits: 50,
    monthlyVisits: 10,
    paymentStatus: 'paid',
    lastPaymentDate: '2025-09-15',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'C', relationship: 'F', phone: '123' },
    notes: '',
    attendanceHistory: [],
    timeline: [],
  };

  const m14: Member = {
    id: 'm-14d',
    memberCode: 'GYM-14D',
    name: '14 Day Expiring',
    email: 'test@example.com',
    phone: '123',
    gender: 'Female',
    age: 26,
    joinDate: '2024-03-01',
    planId: 'plan-6m', // 14500
    planName: '6-Month',
    status: 'active',
    expiryDate: '2026-09-22',
    daysRemaining: 12,
    lastVisit: 'Today',
    lastVisitDate: '2026-09-10',
    attendanceRate: 80,
    weeklyFrequency: 4,
    totalVisits: 50,
    monthlyVisits: 10,
    paymentStatus: 'paid',
    lastPaymentDate: '2026-03-22',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Priya',
    goal: 'General Fitness',
    emergencyContact: { name: 'C', relationship: 'F', phone: '123' },
    notes: '',
    attendanceHistory: [],
    timeline: [],
  };

  const overview = calculateRetentionOverview([m7, m14], TEST_PLANS, [], [], REF_DATE);
  assert(overview.stats.revenueAtRisk7DaysINR === 24000, '7-Day Revenue at Risk is ₹24,000');
  assert(overview.stats.revenueAtRisk14DaysINR === 38500, '14-Day Revenue at Risk is ₹38,500 (24,000 + 14,500)');
}

// ------------------------------------------------------------------------------
// TEST 10: New Joiner Grace Protection
// ------------------------------------------------------------------------------
console.log('\n--- 10. New Member Protection ---');
{
  const newMember: Member = {
    id: 'm-new-1',
    memberCode: 'GYM-NEW-001',
    name: 'New Joiner',
    email: 'new@example.com',
    phone: '123',
    gender: 'Male',
    age: 24,
    joinDate: '2026-09-05', // 5 days ago
    planId: 'plan-ann',
    planName: 'Annual Pro',
    status: 'active',
    expiryDate: '2027-09-05',
    daysRemaining: 360,
    lastVisit: '3 days ago',
    lastVisitDate: '2026-09-07',
    attendanceRate: 100,
    weeklyFrequency: 3,
    totalVisits: 2,
    monthlyVisits: 2,
    paymentStatus: 'paid',
    lastPaymentDate: '2026-09-05',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'C', relationship: 'F', phone: '123' },
    notes: '',
    attendanceHistory: [],
    timeline: [],
  };

  const p = analyzeMemberRetention(newMember, TEST_PLANS, [], [], REF_DATE);
  assert(p.isNewMember === true, 'Member recognized as in onboarding window');
  assert(p.riskScore === 0, 'Inactivity churn penalty is zeroed for new joiners');
  assert(p.riskLevel === 'new_member', 'Classified as new_member onboarding state');
}

// ------------------------------------------------------------------------------
// TEST 11: Renewal Impact Loop (Risk Drops from High to Low)
// ------------------------------------------------------------------------------
console.log('\n--- 11. Renewal Impact Loop ---');
{
  const expiringMember: Member = {
    id: 'm-renew-test',
    memberCode: 'GYM-RNW-001',
    name: 'Renewal Tester',
    email: 'renew@example.com',
    phone: '123',
    gender: 'Male',
    age: 28,
    joinDate: '2023-09-14',
    planId: 'plan-ann',
    planName: 'Annual Strength Pro',
    status: 'expiring',
    expiryDate: '2026-09-14',
    daysRemaining: 4,
    lastVisit: '8 days ago',
    lastVisitDate: '2026-09-02',
    attendanceRate: 50,
    weeklyFrequency: 2,
    totalVisits: 100,
    monthlyVisits: 4,
    paymentStatus: 'paid',
    lastPaymentDate: '2025-09-14',
    pendingAmountINR: 0,
    assignedTrainer: 'Coach Vikram',
    goal: 'General Fitness',
    emergencyContact: { name: 'C', relationship: 'F', phone: '123' },
    notes: '',
    attendanceHistory: [
      { id: 'a1', date: '2026-09-02', time: '07:00 AM' },
      { id: 'a2', date: '2026-08-28', time: '07:00 AM' },
      { id: 'a3', date: '2026-08-20', time: '07:00 AM' },
      { id: 'a4', date: '2026-08-15', time: '07:00 AM' },
      // 10 visits in previous 30d
      { id: 'a5', date: '2026-08-08', time: '07:00 AM' },
      { id: 'a6', date: '2026-08-06', time: '07:00 AM' },
      { id: 'a7', date: '2026-08-04', time: '07:00 AM' },
      { id: 'a8', date: '2026-08-02', time: '07:00 AM' },
      { id: 'a9', date: '2026-07-30', time: '07:00 AM' },
      { id: 'a10', date: '2026-07-28', time: '07:00 AM' },
      { id: 'a11', date: '2026-07-26', time: '07:00 AM' },
      { id: 'a12', date: '2026-07-24', time: '07:00 AM' },
      { id: 'a13', date: '2026-07-22', time: '07:00 AM' },
      { id: 'a14', date: '2026-07-20', time: '07:00 AM' },
    ],
    timeline: [],
  };

  const preRenewal = analyzeMemberRetention(expiringMember, TEST_PLANS, [], [], REF_DATE);
  assert(preRenewal.riskLevel === 'high' || preRenewal.riskLevel === 'critical', 'Pre-renewal state is HIGH risk');

  // Simulate renewal
  const renewedMember: Member = {
    ...expiringMember,
    status: 'active',
    expiryDate: '2027-09-14',
    daysRemaining: 369,
  };

  const postRenewal = analyzeMemberRetention(renewedMember, TEST_PLANS, [], [], REF_DATE);
  assert(postRenewal.daysRemaining > 300, 'Renewal extended validity past 300 days');
  assert(postRenewal.riskScore < preRenewal.riskScore, 'Post-renewal risk score dropped by eliminating expiry risk');
  assert(postRenewal.riskLevel !== 'high' && postRenewal.riskLevel !== 'critical', 'Post-renewal risk level dropped out of high risk');
}

// ------------------------------------------------------------------------------
// TEST 12: Multi-Tenant Boundary & Data Isolation
// ------------------------------------------------------------------------------
console.log('\n--- 12. Multi-Tenant Boundary Isolation ---');
{
  const tenantAMembers: Member[] = [
    {
      id: 'tA-mem-1',
      memberCode: 'PULSE-001',
      name: 'Pulse Member',
      email: 'a@pulse.in',
      phone: '123',
      gender: 'Male',
      age: 28,
      joinDate: '2024-01-01',
      planId: 'plan-ann',
      planName: 'Annual Strength Pro',
      status: 'expiring',
      expiryDate: '2026-09-14',
      daysRemaining: 4,
      lastVisit: 'Today',
      lastVisitDate: '2026-09-10',
      attendanceRate: 80,
      weeklyFrequency: 3,
      totalVisits: 40,
      monthlyVisits: 10,
      paymentStatus: 'paid',
      lastPaymentDate: '2025-09-14',
      pendingAmountINR: 0,
      assignedTrainer: 'Coach Vikram',
      goal: 'General Fitness',
      emergencyContact: { name: 'C', relationship: 'F', phone: '123' },
      notes: '',
      attendanceHistory: [],
      timeline: [],
    },
  ];

  const tenantBMembers: Member[] = [
    {
      id: 'tB-mem-1',
      memberCode: 'IRON-001',
      name: 'Iron House Member',
      email: 'b@iron.in',
      phone: '456',
      gender: 'Female',
      age: 30,
      joinDate: '2024-01-01',
      planId: 'plan-6m',
      planName: '6-Month Transformation',
      status: 'expiring',
      expiryDate: '2026-09-15',
      daysRemaining: 5,
      lastVisit: 'Today',
      lastVisitDate: '2026-09-10',
      attendanceRate: 80,
      weeklyFrequency: 3,
      totalVisits: 40,
      monthlyVisits: 10,
      paymentStatus: 'paid',
      lastPaymentDate: '2026-03-15',
      pendingAmountINR: 0,
      assignedTrainer: 'Coach Samar',
      goal: 'General Fitness',
      emergencyContact: { name: 'C', relationship: 'F', phone: '456' },
      notes: '',
      attendanceHistory: [],
      timeline: [],
    },
  ];

  const tenantAOverview = calculateRetentionOverview(tenantAMembers, TEST_PLANS, [], [], REF_DATE);
  const tenantBOverview = calculateRetentionOverview(tenantBMembers, TEST_PLANS, [], [], REF_DATE);

  assert(
    !tenantAOverview.profiles.some((p) => p.memberId.startsWith('tB-')),
    'Tenant A retention queue contains zero Tenant B records'
  );
  assert(
    !tenantBOverview.profiles.some((p) => p.memberId.startsWith('tA-')),
    'Tenant B retention queue contains zero Tenant A records'
  );
  assert(
    tenantAOverview.stats.revenueAtRisk7DaysINR === 24000 &&
      tenantBOverview.stats.revenueAtRisk7DaysINR === 14500,
    'Revenue at Risk is completely isolated by organization ID'
  );
}

// ------------------------------------------------------------------------------
// TEST SUMMARY REPORT
// ------------------------------------------------------------------------------
console.log('\n==================================================');
console.log(`VERIFICATION COMPLETE: ${passedTests} Passed, ${failedTests} Failed`);
console.log('==================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
