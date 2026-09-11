export type MemberStatus = 'active' | 'expiring' | 'expired' | 'frozen' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'refunded';
export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking';
export type WorkoutGoal =
  | 'Hypertrophy & Strength'
  | 'Fat Loss & HIIT'
  | 'Mobility & Rehab'
  | 'Powerlifting'
  | 'General Fitness';

export type UserRole = 'owner' | 'admin' | 'trainer' | 'front_desk';
export type AppMode = 'production' | 'demo';

export type ActiveNavView =
  | 'overview'
  | 'front_desk'
  | 'members'
  | 'profile'
  | 'attendance'
  | 'memberships'
  | 'payments'
  | 'retention'
  | 'trainer_workspace';

export interface TaxBreakdown {
  taxableAmountINR: number;
  cgstINR: number;
  sgstINR: number;
  igstINR?: number;
  taxRatePercent: number;
  totalINR: number;
}

export interface AttendanceHistoryItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "07:15 AM"
  checkOutTime?: string; // e.g. "08:30 AM"
  durationMinutes?: number;
  workoutType?: string;
  trainerName?: string;
}

export interface ActivityTimelineItem {
  id: string;
  type:
    | 'checkin'
    | 'checkout'
    | 'payment'
    | 'renewal'
    | 'reminder_sent'
    | 'note'
    | 'status_change'
    | 'retention_outreach_logged'
    | 'retention_alert_generated'
    | 'member_reengaged';
  title: string;
  description: string;
  timestamp: string;
  author?: string;
  metadata?: Record<string, any>;
}

export interface MembershipHistoryItem {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  amountINR: number;
  status: MemberStatus;
  createdAt: string;
}

export interface Member {
  id: string;
  memberCode: string; // e.g. "GYM-2024-089"
  name: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  joinDate: string; // YYYY-MM-DD
  planId: string;
  planName: string;
  status: MemberStatus;
  expiryDate: string; // YYYY-MM-DD
  daysRemaining: number;
  lastVisit: string; // e.g. "Today, 06:45 AM" or "2 days ago"
  lastVisitDate: string; // YYYY-MM-DD
  attendanceRate: number; // e.g. 88 (percentage)
  weeklyFrequency: number; // avg visits/wk (e.g. 4.2)
  totalVisits: number;
  monthlyVisits: number;
  paymentStatus: PaymentStatus;
  lastPaymentDate: string;
  pendingAmountINR: number;
  assignedTrainer: string;
  lockerNumber?: string;
  goal: WorkoutGoal;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes: string;
  isCurrentlyOnFloor?: boolean;
  attendanceHistory: AttendanceHistoryItem[];
  timeline: ActivityTimelineItem[];
  membershipHistory?: MembershipHistoryItem[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  code: string; // e.g. "ANN-PRO"
  tag?: string; // "Most Popular", "High Yield"
  durationMonths: number;
  priceINR: number;
  activeMembersCount: number;
  totalRevenueINR: number;
  expiringThisWeek: number;
  features: string[];
  description: string;
  isPopular?: boolean;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  memberAvatar?: string;
  planName: string;
  checkInTime: string; // e.g. "07:32 AM"
  checkOutTime?: string; // e.g. "08:45 AM"
  date: string; // YYYY-MM-DD
  status: MemberStatus;
  trainerName: string;
  workoutGoal: WorkoutGoal;
  isToday: boolean;
  isOnFloor?: boolean;
}

export interface PaymentTransaction {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0428"
  memberId: string;
  memberName: string;
  memberPhone: string;
  planId: string;
  planName: string;
  amountINR: number;
  taxINR: number;
  totalINR: number;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  referenceId?: string; // UPI / Card transaction ID
  collectedBy: string;
  notes?: string;
}

export interface RevenueRiskMember {
  memberId: string;
  memberCode: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  renewalValueINR: number;
  attendanceRate: number;
  lastVisit: string;
  status: MemberStatus;
}

export interface GymStats {
  activeMembers: number;
  totalMembers: number;
  todayAttendance: number;
  peakCapacity: number;
  currentFloorCount: number;
  monthlyRevenueINR: number;
  mrrGrowthRate: number;
  revenueAtRiskINR: number;
  expiringIn7DaysCount: number;
  overdueAmountINR: number;
  overdueMembersCount: number;
  newSignupsThisMonth: number;
  retentionRatePercent: number;
}

export interface RenewalPayload {
  memberId: string;
  planId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  customStartDate?: string;
}

// ==============================================================================
// RETENTION & REVENUE INTELLIGENCE DOMAIN TYPES
// ==============================================================================

export type RetentionRiskLevel =
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'frozen'
  | 'recovered'
  | 'new_member';

export type RetentionSegment =
  | 'all_at_risk'
  | 'expiring_soon'
  | 'inactive_7d'
  | 'high_value'
  | 'declining'
  | 'payment_overdue'
  | 'recovery_pool'
  | 'frozen';

export interface RetentionSignalBreakdown {
  expiryRiskScore: number; // 0 - 35
  inactivityRiskScore: number; // 0 - 35
  attendanceDeclineScore: number; // 0 - 20
  paymentRiskScore: number; // 0 - 10
  totalRiskScore: number; // 0 - 100
}

export interface MemberRetentionProfile {
  memberId: string;
  memberCode: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  assignedTrainer: string;
  planId: string;
  planName: string;
  planPriceINR: number;
  status: MemberStatus;
  daysRemaining: number;
  expiryDate: string;
  lastVisit: string;
  lastVisitDate: string;
  daysSinceLastVisit: number;
  totalVisits: number;
  recentVisits30Days: number;
  previousVisits30Days: number;
  attendanceTrendPercent: number; // Negative indicates decline
  attendanceConsistencyRate: number;
  pendingAmountINR: number;
  paymentStatus: PaymentStatus;
  isFrozen: boolean;
  isNewMember: boolean;
  historicalLifetimeValueINR: number;
  revenueAtRiskINR: number;
  riskScore: number; // 0 - 100
  riskLevel: RetentionRiskLevel;
  priorityRank: number; // 1 = highest priority
  priorityScore: number;
  reasons: string[];
  recommendedAction: string;
  recommendedActionType: 'whatsapp_reengage' | 'whatsapp_renewal' | 'call_winback' | 'trainer_checkin' | 'payment_link' | 'none';
  outreachStatus: 'none' | 'logged' | 'in_progress' | 'renewed';
  lastOutreachDate?: string;
}

export interface RetentionStats {
  totalAtRiskCount: number;
  revenueAtRisk7DaysINR: number;
  revenueAtRisk14DaysINR: number;
  revenueAtRisk30DaysINR: number;
  highRiskCount: number;
  criticalRiskCount: number;
  inactive7DaysCount: number;
  renewalsThisMonthCount: number;
  reengagedThisMonthCount: number;
  recoveredRevenueMTDINR: number;
  retentionRateDisplay: string; // e.g. "89.2%" or "Not enough history"
}

// ==============================================================================
// PHASE 5: FRONT DESK & DAILY OPERATIONS OS TYPES
// ==============================================================================

export type NoteCategory = 'general' | 'trainer' | 'front_desk' | 'medical' | 'billing';

export interface MemberNote {
  id: string;
  memberId: string;
  organizationId: string;
  note: string;
  category: NoteCategory;
  authorId?: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
}

export type CheckInStatus = 'confirmed' | 'duplicate' | 'expired' | 'frozen' | 'not_found' | 'error';

export interface FastCheckInResult {
  success: boolean;
  status: CheckInStatus;
  member?: Member;
  message: string;
  checkInTime?: string;
  currentFloorCount?: number;
  peakCapacity?: number;
  daysRemaining?: number;
  cooldownRemainingMinutes?: number;
  resumeDate?: string;
}

export interface DailyOperationsSummary {
  date: string;
  todayCheckInsCount: number;
  currentFloorCount: number;
  peakFloorCount: number;
  capacityPercentage: number;
  paymentsCollectedINR: number;
  paymentsCount: number;
  newMembersCount: number;
  renewalsCount: number;
  expirationsCount: number;
  expiringTodayCount: number;
  retentionContactsCount: number;
  revenueProtectedINR: number;
  onboardingActiveCount: number;
}

export interface OnboardingQueueItem {
  memberId: string;
  memberCode: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  joinDate: string;
  daysActive: number; // e.g. Day 3 of 21
  planName: string;
  assignedTrainer: string;
  totalVisits: number;
  lastVisit: string;
  lastVisitDate: string;
  goal: WorkoutGoal;
  needsFollowUp: boolean;
}

export interface TrainerMemberItem {
  memberId: string;
  memberCode: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  planName: string;
  goal: WorkoutGoal;
  attendanceRate: number;
  weeklyFrequency: number;
  lastVisit: string;
  lastVisitDate: string;
  isCurrentlyOnFloor?: boolean;
  hasAttendanceDecline: boolean;
  notesCount: number;
  status: MemberStatus;
}
