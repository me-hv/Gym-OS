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
  type: 'checkin' | 'checkout' | 'payment' | 'renewal' | 'reminder_sent' | 'note' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  author?: string;
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
