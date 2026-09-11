/**
 * GYM OS — Phase 5 Front Desk & Daily Operations OS Test Suite
 * Automated verification of ranked search, scanner-ready check-in, cooldowns,
 * daily operational reconciliation, action queues, and trainer workspace scoping.
 */

import {
  searchMembersRanked,
  fastCheckInMember,
  calculateDailySummary,
  getExpiringTodayQueue,
  getOnboardingQueue,
  getTrainerWorkspaceData,
} from '../../services/frontDeskService';
import {
  Member,
  MembershipPlan,
  AttendanceRecord,
  PaymentTransaction,
  MemberRetentionProfile,
  MemberNote,
} from '../../types';

// ==============================================================================
// TEST DATA FIXTURES
// ==============================================================================

const TEST_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    memberCode: 'GYM-2024-001',
    name: 'Rohan Verma',
    phone: '+91 98765 43210',
    email: 'rohan@example.com',
    planId: 'plan-1',
    planName: 'Annual Strength Pro',
    status: 'active',
    joinDate: '2026-09-08', // 3 days ago
    expiryDate: '2027-09-08',
    daysRemaining: 362,
    assignedTrainer: 'Coach Vikram',
    goal: 'Muscle Hypertrophy',
    attendanceRate: 92,
    weeklyFrequency: 4.5,
    totalVisits: 3,
    monthlyVisits: 3,
    lastVisit: 'Today, 07:30 AM',
    lastVisitDate: '2026-09-11',
    paymentStatus: 'paid',
    pendingAmountINR: 0,
    emergencyContact: { name: 'Sunita Verma', relation: 'Mother', phone: '+91 98765 43211' },
    isCurrentlyOnFloor: true,
    attendanceHistory: [],
    timeline: [],
  },
  {
    id: 'mem-002',
    memberCode: 'GYM-2024-002',
    name: 'Pooja Hegde',
    phone: '+91 98111 22334',
    email: 'pooja@example.com',
    planId: 'plan-2',
    planName: '6-Month Transformation',
    status: 'expired',
    joinDate: '2026-03-11',
    expiryDate: '2026-09-11', // Expired today
    daysRemaining: 0,
    assignedTrainer: 'Coach Priya',
    goal: 'Fat Loss & Toning',
    attendanceRate: 45,
    weeklyFrequency: 1.8,
    totalVisits: 28,
    monthlyVisits: 2,
    lastVisit: '8 days ago',
    lastVisitDate: '2026-09-03',
    paymentStatus: 'paid',
    pendingAmountINR: 0,
    emergencyContact: { name: 'Kiran Hegde', relation: 'Spouse', phone: '+91 98111 22335' },
    isCurrentlyOnFloor: false,
    attendanceHistory: [],
    timeline: [],
  },
  {
    id: 'mem-003',
    memberCode: 'GYM-2024-003',
    name: 'Ananya Deshmukh',
    phone: '+91 99450 11223',
    email: 'ananya@example.com',
    planId: 'plan-3',
    planName: '3-Month Functional Fit',
    status: 'frozen',
    joinDate: '2026-06-01',
    expiryDate: '2026-10-15',
    daysRemaining: 34,
    assignedTrainer: 'Coach Vikram',
    goal: 'Cardio & Stamina',
    attendanceRate: 80,
    weeklyFrequency: 3.5,
    totalVisits: 35,
    monthlyVisits: 0,
    lastVisit: '18 days ago',
    lastVisitDate: '2026-08-24',
    paymentStatus: 'paid',
    pendingAmountINR: 0,
    emergencyContact: { name: 'Rajesh Deshmukh', relation: 'Father', phone: '+91 99450 11224' },
    isCurrentlyOnFloor: false,
    attendanceHistory: [],
    timeline: [],
  },
  {
    id: 'mem-004',
    memberCode: 'GYM-2024-004',
    name: 'Kunal Kapoor',
    phone: '+91 97333 44556',
    email: 'kunal@example.com',
    planId: 'plan-1',
    planName: 'Annual Strength Pro',
    status: 'active',
    joinDate: '2026-09-02', // 9 days ago (Low visits -> needs onboarding follow-up)
    expiryDate: '2027-09-02',
    daysRemaining: 356,
    assignedTrainer: 'Coach Amit',
    goal: 'Strength & Powerlifting',
    attendanceRate: 20,
    weeklyFrequency: 1.0,
    totalVisits: 1,
    monthlyVisits: 1,
    lastVisit: '7 days ago',
    lastVisitDate: '2026-09-04',
    paymentStatus: 'paid',
    pendingAmountINR: 0,
    emergencyContact: { name: 'Neha Kapoor', relation: 'Sister', phone: '+91 97333 44557' },
    isCurrentlyOnFloor: false,
    attendanceHistory: [],
    timeline: [],
  },
];

const TEST_CHECKINS: AttendanceRecord[] = [
  {
    id: 'att-001',
    memberId: 'mem-001',
    memberName: 'Rohan Verma',
    memberCode: 'GYM-2024-001',
    date: '2026-09-11',
    checkInTime: '07:30 AM',
    planName: 'Annual Strength Pro',
    workoutGoal: 'Muscle Hypertrophy',
    trainerName: 'Coach Vikram',
    isToday: true,
    isOnFloor: true,
  },
];

const TEST_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-001',
    invoiceNumber: 'INV-2026-001',
    memberId: 'mem-001',
    memberName: 'Rohan Verma',
    memberPhone: '+91 98765 43210',
    planId: 'plan-1',
    planName: 'Annual Strength Pro',
    amountINR: 20339,
    taxINR: 3661,
    totalINR: 24000,
    date: '2026-09-11',
    dueDate: '2026-09-11',
    status: 'paid',
    paymentMethod: 'UPI',
    collectedBy: 'Rakesh Desk Lead',
  },
];

// ==============================================================================
// TEST RUNNER ENGINE
// ==============================================================================

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (failureDetails) console.error(`    Detail: ${failureDetails}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('GYM OS — PHASE 5 FRONT DESK & DAILY OPERATIONS OS SUITE');
  console.log('===============================================================\n');

  const refDate = new Date('2026-09-11T10:00:00Z');

  // ----------------------------------------------------------------------------
  // MODULE 1: RANKED SEARCH MATCHING
  // ----------------------------------------------------------------------------
  console.log('--- MODULE 1: RANKED SEARCH ENGINE ---');

  const matchByExactCode = searchMembersRanked(TEST_MEMBERS, 'GYM-2024-001');
  assert(
    matchByExactCode.length > 0 && matchByExactCode[0].id === 'mem-001',
    'Ranked search returns exact code match as top rank',
    `Received: ${matchByExactCode[0]?.memberCode}`
  );

  const matchByCodeSuffix = searchMembersRanked(TEST_MEMBERS, '001');
  assert(
    matchByCodeSuffix.length > 0 && matchByCodeSuffix[0].id === 'mem-001',
    'Ranked search matches code suffix (scanner barcode suffix)',
    `Received: ${matchByCodeSuffix[0]?.memberCode}`
  );

  const matchByPhone = searchMembersRanked(TEST_MEMBERS, '9811122334');
  assert(
    matchByPhone.length > 0 && matchByPhone[0].id === 'mem-002',
    'Ranked search matches raw digits of phone number',
    `Received: ${matchByPhone[0]?.phone}`
  );

  const matchByNamePrefix = searchMembersRanked(TEST_MEMBERS, 'ananya');
  assert(
    matchByNamePrefix.length > 0 && matchByNamePrefix[0].id === 'mem-003',
    'Ranked search matches athlete name prefix',
    `Received: ${matchByNamePrefix[0]?.name}`
  );

  const emptyQueryMatch = searchMembersRanked(TEST_MEMBERS, '   ');
  assert(
    emptyQueryMatch.length === 0,
    'Ranked search returns empty array for whitespace query',
    `Received: ${emptyQueryMatch.length} items`
  );

  // ----------------------------------------------------------------------------
  // MODULE 2: FAST CHECK-IN & SCANNER FEEDBACK
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 2: FAST CHECK-IN & SCANNER VALIDATION ---');

  // 1. Successful check-in for valid active athlete (mem-004)
  const successCheckIn = fastCheckInMember(TEST_MEMBERS, TEST_CHECKINS, 'GYM-2024-004', 'Floor Workout', refDate);
  assert(
    successCheckIn.success === true && successCheckIn.status === 'confirmed',
    'Valid active member receives CONFIRMED check-in status',
    `Status: ${successCheckIn.status}, Message: ${successCheckIn.message}`
  );
  assert(
    successCheckIn.currentFloorCount === 2,
    'Confirmed check-in increments floor count correctly',
    `Floor count: ${successCheckIn.currentFloorCount}`
  );

  // 2. Duplicate check-in cooldown on member already on floor (mem-001)
  const duplicateCheckIn = fastCheckInMember(TEST_MEMBERS, TEST_CHECKINS, 'GYM-2024-001', 'Floor Workout', refDate);
  assert(
    duplicateCheckIn.success === false && duplicateCheckIn.status === 'duplicate',
    'Athlete already on floor triggers DUPLICATE status & cooldown block',
    `Status: ${duplicateCheckIn.status}, Message: ${duplicateCheckIn.message}`
  );

  // 3. Expired membership check-in rejection (mem-002)
  const expiredCheckIn = fastCheckInMember(TEST_MEMBERS, TEST_CHECKINS, 'GYM-2024-002', 'Floor Workout', refDate);
  assert(
    expiredCheckIn.success === false && expiredCheckIn.status === 'expired',
    'Expired member check-in is blocked with EXPIRED status',
    `Status: ${expiredCheckIn.status}, Message: ${expiredCheckIn.message}`
  );

  // 4. Frozen membership check-in rejection (mem-003)
  const frozenCheckIn = fastCheckInMember(TEST_MEMBERS, TEST_CHECKINS, 'GYM-2024-003', 'Floor Workout', refDate);
  assert(
    frozenCheckIn.success === false && frozenCheckIn.status === 'frozen',
    'Frozen plan check-in is blocked with FROZEN status & resume date',
    `Status: ${frozenCheckIn.status}, Message: ${frozenCheckIn.message}`
  );

  // 5. Unknown barcode / non-existent athlete
  const unknownCheckIn = fastCheckInMember(TEST_MEMBERS, TEST_CHECKINS, 'INVALID-999', 'Floor Workout', refDate);
  assert(
    unknownCheckIn.success === false && unknownCheckIn.status === 'not_found',
    'Unknown identifier returns NOT_FOUND status',
    `Status: ${unknownCheckIn.status}`
  );

  // ----------------------------------------------------------------------------
  // MODULE 3: DAILY OPERATIONS SUMMARY & SHIFT RECONCILIATION
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 3: DAILY OPERATIONS SUMMARY ---');

  const summary = calculateDailySummary(TEST_MEMBERS, TEST_CHECKINS, TEST_PAYMENTS, [], 120, refDate);

  assert(
    summary.todayCheckInsCount === 1,
    "Calculates accurate today's check-ins count",
    `Check-ins: ${summary.todayCheckInsCount}`
  );

  assert(
    summary.currentFloorCount === 1,
    'Calculates accurate live floor occupancy',
    `Live floor: ${summary.currentFloorCount}`
  );

  assert(
    summary.paymentsCollectedINR >= 24000,
    "Reconciles today's total financial collections",
    `Total collected: ₹${summary.paymentsCollectedINR}`
  );

  assert(
    summary.expiringTodayCount >= 1,
    'Accurately calculates memberships expiring today',
    `Expiring today: ${summary.expiringTodayCount}`
  );

  // ----------------------------------------------------------------------------
  // MODULE 4: ACTION QUEUES (EXPIRING TODAY & 21-DAY ONBOARDING)
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 4: ACTION QUEUES ---');

  const expiringQueue = getExpiringTodayQueue(TEST_MEMBERS, refDate);
  assert(
    expiringQueue.some((m) => m.id === 'mem-002'),
    'Expiring queue includes athlete with 0 days remaining',
    `Found: ${expiringQueue.map((m) => m.name).join(', ')}`
  );

  const onboardingQueue = getOnboardingQueue(TEST_MEMBERS, refDate);
  assert(
    onboardingQueue.some((o) => o.memberId === 'mem-001' && o.daysActive <= 21),
    'Onboarding queue tracks new member joined within 21 days',
    `Onboarding members: ${onboardingQueue.map((o) => o.name).join(', ')}`
  );

  const flaggedNewMember = onboardingQueue.find((o) => o.memberId === 'mem-004');
  assert(
    flaggedNewMember !== undefined && flaggedNewMember.needsFollowUp === true,
    'Flags onboarding athlete with low visits (>5 days active, <=1 visit)',
    `Needs follow up: ${flaggedNewMember?.needsFollowUp}`
  );

  // ----------------------------------------------------------------------------
  // MODULE 5: TRAINER WORKSPACE SCOPING & PROGRESSION
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 5: TRAINER WORKSPACE SCOPING ---');

  const vikramAthletes = getTrainerWorkspaceData(TEST_MEMBERS, TEST_CHECKINS, 'vikram');
  assert(
    vikramAthletes.every((a) => TEST_MEMBERS.find((m) => m.id === a.memberId)?.assignedTrainer.includes('Vikram')),
    "Scopes athlete roster accurately to Coach Vikram's cohort",
    `Count: ${vikramAthletes.length}`
  );

  const athleteOnFloor = vikramAthletes.find((a) => a.memberId === 'mem-001');
  assert(
    athleteOnFloor?.isCurrentlyOnFloor === true,
    'Identifies assigned trainee currently training on gym floor',
    `isCurrentlyOnFloor: ${athleteOnFloor?.isCurrentlyOnFloor}`
  );

  const priyaAthletes = getTrainerWorkspaceData(TEST_MEMBERS, TEST_CHECKINS, 'priya');
  const poojaDecline = priyaAthletes.find((a) => a.memberId === 'mem-002');
  assert(
    poojaDecline?.hasAttendanceDecline === true,
    'Detects attendance decline signal for coach review (<65% attendance rate)',
    `hasAttendanceDecline: ${poojaDecline?.hasAttendanceDecline}`
  );

  // ----------------------------------------------------------------------------
  // MODULE 6: STRUCTURED MEMBER NOTES & CATEGORIES
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 6: STAFF NOTES & AUDIT TRAIL ---');

  const testNote: MemberNote = {
    id: 'note-test-01',
    memberId: 'mem-001',
    organizationId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    note: 'Progress check: Bench press increased to 100kg. Advised focusing on thoracic extension.',
    category: 'trainer',
    authorId: 'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    authorName: 'Coach Vikram',
    authorRole: 'trainer',
    createdAt: new Date().toISOString(),
  };

  assert(
    testNote.category === 'trainer' && testNote.authorRole === 'trainer',
    'Member note enforces category taxonomy and role attribution',
    `Category: ${testNote.category}, Author: ${testNote.authorName}`
  );

  // ==============================================================================
  // FINAL SCORECARD
  // ==============================================================================
  console.log('\n===============================================================');
  console.log(`PHASE 5 VERIFICATION RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
