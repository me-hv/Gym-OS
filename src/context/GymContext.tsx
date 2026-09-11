'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Member,
  MembershipPlan,
  AttendanceRecord,
  PaymentTransaction,
  GymStats,
  MemberStatus,
  RenewalPayload,
  AppMode,
  ActiveNavView,
  MemberRetentionProfile,
  RetentionStats,
  MemberNote,
  NoteCategory,
  FastCheckInResult,
  DailyOperationsSummary,
  UserRole,
} from '../types';
import {
  INITIAL_MEMBERS,
  MEMBERSHIP_PLANS,
  INITIAL_CHECKINS,
  INITIAL_PAYMENTS,
  INITIAL_GYM_STATS,
  INITIAL_MEMBER_NOTES,
} from '../data/mockData';
import {
  gymService,
  OrgProfile,
  UserSession,
  DEFAULT_PILOT_ORG,
  DEFAULT_PILOT_USER,
  GymOperationError,
  getAppMode,
} from '../services/gymService';
import { calculateRetentionOverview } from '../services/retentionService';
import {
  fastCheckInMember,
  calculateDailySummary,
  searchMembersRanked,
} from '../services/frontDeskService';
import { createClient } from '../lib/supabase/client';

export type { ActiveNavView };

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface GymContextType {
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  viewMemberProfile: (id: string) => void;

  // Tenant / Auth Session
  organization: OrgProfile;
  currentUser: UserSession;
  appMode: AppMode;
  signOut: () => Promise<void>;
  switchUserRole: (role: UserRole) => void;

  members: Member[];
  plans: MembershipPlan[];
  checkIns: AttendanceRecord[];
  payments: PaymentTransaction[];
  gymStats: GymStats;
  isLoadingData: boolean;

  // Retention Intelligence Layer
  retentionProfiles: MemberRetentionProfile[];
  retentionStats: RetentionStats;

  // Operations & Front Desk
  memberNotes: MemberNote[];
  dailySummary: DailyOperationsSummary;
  fastCheckIn: (query: string) => Promise<FastCheckInResult>;
  addMemberNote: (memberId: string, note: string, category: NoteCategory) => Promise<void>;

  // Actions
  checkInMember: (memberId: string) => Promise<{ success: boolean; message: string }>;
  checkOutMember: (memberId: string) => Promise<{ success: boolean; message: string }>;
  addMember: (
    member: Omit<
      Member,
      | 'id'
      | 'memberCode'
      | 'daysRemaining'
      | 'attendanceRate'
      | 'weeklyFrequency'
      | 'totalVisits'
      | 'monthlyVisits'
      | 'lastVisit'
      | 'lastVisitDate'
      | 'attendanceHistory'
      | 'timeline'
      | 'membershipHistory'
    >
  ) => Promise<void>;
  renewMembership: (payload: RenewalPayload) => Promise<void>;
  updateMemberStatus: (memberId: string, status: MemberStatus) => void;
  recordPayment: (payment: Omit<PaymentTransaction, 'id' | 'invoiceNumber'>) => Promise<void>;
  createPlan: (plan: Omit<MembershipPlan, 'id' | 'activeMembersCount' | 'totalRevenueINR' | 'expiringThisWeek'>) => void;
  sendWhatsAppRenewal: (memberId: string, customMessage?: string) => Promise<void>;
  freezeMembership: (memberId: string, days: number, reason: string) => Promise<void>;
  logRetentionOutreach: (memberId: string, actionType: string, notes?: string) => Promise<void>;

  // Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;

  // Modals & Drawers state
  isCheckInModalOpen: boolean;
  setCheckInModalOpen: (open: boolean) => void;
  isAddMemberModalOpen: boolean;
  setAddMemberModalOpen: (open: boolean) => void;
  isCreatePlanModalOpen: boolean;
  setCreatePlanModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  renewModalData: { isOpen: boolean; member: Member | null };
  openRenewModal: (member: Member) => void;
  closeRenewModal: () => void;

  whatsAppModalData: { isOpen: boolean; member: Member | null; defaultMessage: string };
  openWhatsAppModal: (member: Member, customMsg?: string) => void;
  closeWhatsAppModal: () => void;

  paymentModalData: { isOpen: boolean; member: Member | null };
  openPaymentModal: (member?: Member | null) => void;
  closePaymentModal: () => void;

  invoiceModalData: { isOpen: boolean; payment: PaymentTransaction | null };
  openInvoiceModal: (payment: PaymentTransaction) => void;
  closeInvoiceModal: () => void;

  isAddNoteModalOpen: boolean;
  setAddNoteModalOpen: (open: boolean) => void;
  addNoteModalData: { isOpen: boolean; member: Member | null };
  openAddNoteModal: (member: Member) => void;
  closeAddNoteModal: () => void;

  isEndOfDayModalOpen: boolean;
  setEndOfDayModalOpen: (open: boolean) => void;
  openEndOfDayModal: () => void;
  closeEndOfDayModal: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveNavView>('overview');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [organization, setOrganization] = useState<OrgProfile>(DEFAULT_PILOT_ORG);
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_PILOT_USER);
  const [appMode] = useState<AppMode>(getAppMode());
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [plans, setPlans] = useState<MembershipPlan[]>(MEMBERSHIP_PLANS);
  const [checkIns, setCheckIns] = useState<AttendanceRecord[]>(INITIAL_CHECKINS);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [gymStats, setGymStats] = useState<GymStats>(INITIAL_GYM_STATS);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setCreatePlanModalOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [renewModalData, setRenewModalData] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });

  const [whatsAppModalData, setWhatsAppModalData] = useState<{ isOpen: boolean; member: Member | null; defaultMessage: string }>({
    isOpen: false,
    member: null,
    defaultMessage: '',
  });

  const [paymentModalData, setPaymentModalData] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });

  const [invoiceModalData, setInvoiceModalData] = useState<{ isOpen: boolean; payment: PaymentTransaction | null }>({
    isOpen: false,
    payment: null,
  });

  const [memberNotes, setMemberNotes] = useState<MemberNote[]>(INITIAL_MEMBER_NOTES);
  const [isAddNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [addNoteModalData, setAddNoteModalData] = useState<{ isOpen: boolean; member: Member | null }>({
    isOpen: false,
    member: null,
  });
  const [isEndOfDayModalOpen, setEndOfDayModalOpen] = useState(false);

  // Re-calculate dashboard metrics whenever members, checkIns, or payments change
  const refreshStats = useCallback(
    (mList: Member[], cList: AttendanceRecord[], pList: PaymentTransaction[], peakCap: number) => {
      const recalculated = gymService.calculateDashboardMetrics(mList, cList, pList, peakCap);
      setGymStats(recalculated);
    },
    []
  );

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize tenant session & data
  useEffect(() => {
    let isMounted = true;

    async function loadTenantData() {
      try {
        const session = await gymService.getCurrentSession();
        if (!isMounted) return;
        setCurrentUser(session);

        const org = await gymService.getOrganization(session.organizationId);
        if (!isMounted) return;
        setOrganization(org);

        const [loadedMembers, loadedPlans, loadedPayments] = await Promise.all([
          gymService.getMembers(session.organizationId),
          gymService.getPlans(session.organizationId),
          gymService.getPayments(session.organizationId),
        ]);

        if (!isMounted) return;
        setMembers(loadedMembers);
        setPlans(loadedPlans);
        setPayments(loadedPayments);
        refreshStats(loadedMembers, INITIAL_CHECKINS, loadedPayments, org.peakCapacity);
      } catch (err: any) {
        console.error('Tenant data load error:', err);
        addToast({
          title: 'Connection Notice',
          message: err?.message || 'Operating in demo evaluation workspace.',
          type: 'info',
        });
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadTenantData();

    return () => {
      isMounted = false;
    };
  }, [refreshStats, addToast]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const viewMemberProfile = (id: string) => {
    setSelectedMemberId(id);
    setActiveView('profile');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const checkInMember = async (memberId: string): Promise<{ success: boolean; message: string }> => {
    const member = members.find((m) => m.id === memberId || m.memberCode === memberId);
    if (!member) {
      addToast({
        title: 'Member Not Found',
        message: `No active athlete located with identifier "${memberId}"`,
        type: 'error',
      });
      return { success: false, message: 'Member not found' };
    }

    if (member.status === 'expired') {
      addToast({
        title: 'Check-in Alert: Expired Membership',
        message: `${member.name}'s membership has expired. Please renew subscription before floor entry.`,
        type: 'warning',
      });
    } else if (member.status === 'frozen') {
      addToast({
        title: 'Check-in Alert: Frozen Plan',
        message: `${member.name}'s membership is currently paused on medical/travel hold.`,
        type: 'warning',
      });
    }

    try {
      const newRecord = await gymService.checkInMember(organization.id, member, checkIns, 'Floor Workout');

      const updatedCheckIns = [newRecord, ...checkIns];
      setCheckIns(updatedCheckIns);

      const timeStr = newRecord.checkInTime;
      const dateStr = newRecord.date;

      const updatedMembers = members.map((m) => {
        if (m.id === member.id) {
          return {
            ...m,
            lastVisit: `Today, ${timeStr}`,
            lastVisitDate: dateStr,
            isCurrentlyOnFloor: true,
            totalVisits: m.totalVisits + 1,
            monthlyVisits: m.monthlyVisits + 1,
            attendanceHistory: [
              {
                id: 'att-' + Date.now(),
                date: dateStr,
                time: timeStr,
                durationMinutes: 60,
                workoutType: 'Floor Workout',
                trainerName: m.assignedTrainer,
              },
              ...m.attendanceHistory,
            ],
            timeline: [
              {
                id: 'tim-' + Date.now(),
                type: 'checkin' as const,
                title: 'Checked in at Reception Desk',
                description: `Floor entry logged at ${timeStr}`,
                timestamp: `Today, ${timeStr}`,
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });

      setMembers(updatedMembers);
      refreshStats(updatedMembers, updatedCheckIns, payments, organization.peakCapacity);

      addToast({
        title: 'Check-In Logged',
        message: `${member.name} (${member.planName}) entered gym floor at ${timeStr}.`,
        type: 'success',
      });

      return { success: true, message: `${member.name} checked in successfully` };
    } catch (err: any) {
      addToast({
        title: 'Check-In Blocked',
        message: err?.message || 'Duplicate check-in or database validation failed.',
        type: 'warning',
      });
      return { success: false, message: err?.message || 'Check-in failed' };
    }
  };

  const checkOutMember = async (memberId: string): Promise<{ success: boolean; message: string }> => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return { success: false, message: 'Member not found' };

    try {
      const { checkOutTime } = await gymService.checkOutMember(organization.id, member.id, member.name);

      const updatedCheckIns = checkIns.map((c) =>
        c.memberId === memberId && c.isToday && !c.checkOutTime
          ? { ...c, checkOutTime, isOnFloor: false }
          : c
      );
      setCheckIns(updatedCheckIns);

      const updatedMembers = members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            isCurrentlyOnFloor: false,
            timeline: [
              {
                id: 'tim-' + Date.now(),
                type: 'checkout' as const,
                title: 'Departed Gym Floor',
                description: `Check-out recorded at ${checkOutTime}`,
                timestamp: `Today, ${checkOutTime}`,
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });

      setMembers(updatedMembers);
      refreshStats(updatedMembers, updatedCheckIns, payments, organization.peakCapacity);

      addToast({
        title: 'Floor Check-Out Logged',
        message: `${member.name} departed at ${checkOutTime}. Floor count updated.`,
        type: 'info',
      });

      return { success: true, message: 'Checked out successfully' };
    } catch (err: any) {
      addToast({
        title: 'Check-Out Error',
        message: err?.message || 'Failed to record check-out.',
        type: 'error',
      });
      return { success: false, message: err?.message || 'Check-out failed' };
    }
  };

  const addMember = async (
    memberData: Omit<
      Member,
      | 'id'
      | 'memberCode'
      | 'daysRemaining'
      | 'attendanceRate'
      | 'weeklyFrequency'
      | 'totalVisits'
      | 'monthlyVisits'
      | 'lastVisit'
      | 'lastVisitDate'
      | 'attendanceHistory'
      | 'timeline'
      | 'membershipHistory'
    >
  ) => {
    try {
      const newMember = await gymService.createMember(organization.id, memberData, members.length);

      const updatedMembers = [newMember, ...members];
      setMembers(updatedMembers);

      const updatedPlans = plans.map((p) =>
        p.id === memberData.planId ? { ...p, activeMembersCount: p.activeMembersCount + 1 } : p
      );
      setPlans(updatedPlans);

      refreshStats(updatedMembers, checkIns, payments, organization.peakCapacity);

      addToast({
        title: 'Member Enrolled',
        message: `${newMember.name} registered under ${newMember.planName} (${newMember.memberCode}).`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Enrollment Error',
        message: err?.message || 'Failed to enroll member.',
        type: 'error',
      });
      throw err;
    }
  };

  const renewMembership = async (payload: RenewalPayload) => {
    const member = members.find((m) => m.id === payload.memberId);
    const plan = plans.find((p) => p.id === payload.planId) || plans[0];
    if (!member || !plan) return;

    try {
      const { newMembership, payment, newExpiryDate, daysRemaining } = await gymService.renewMembership(
        organization.id,
        member,
        plan,
        payload,
        payments.length
      );

      const updatedPayments = [payment, ...payments];
      setPayments(updatedPayments);

      const updatedMembers = members.map((m) => {
        if (m.id === payload.memberId) {
          return {
            ...m,
            planId: plan.id,
            planName: plan.name,
            status: 'active' as const,
            expiryDate: newExpiryDate,
            daysRemaining,
            paymentStatus: 'paid' as const,
            pendingAmountINR: 0,
            membershipHistory: [newMembership, ...(m.membershipHistory || [])],
            timeline: [
              {
                id: 'tim-' + Date.now(),
                type: 'renewal' as const,
                title: `Membership Renewed — ${plan.name}`,
                description: `Extended validity until ${newExpiryDate} (Invoice: ${payment.invoiceNumber})`,
                timestamp: 'Just now',
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });

      setMembers(updatedMembers);
      refreshStats(updatedMembers, checkIns, updatedPayments, organization.peakCapacity);

      addToast({
        title: 'Membership Renewed',
        message: `${member.name} successfully renewed on ${plan.name} until ${newExpiryDate}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Renewal Failed',
        message: err?.message || 'Could not process renewal transaction.',
        type: 'error',
      });
      throw err;
    }
  };

  const updateMemberStatus = (memberId: string, status: MemberStatus) => {
    const updatedMembers = members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          status,
          timeline: [
            {
              id: 'tim-' + Date.now(),
              type: 'status_change' as const,
              title: `Status Changed to ${status.toUpperCase()}`,
              description: `Member status updated in operations portal`,
              timestamp: 'Just now',
            },
            ...m.timeline,
          ],
        };
      }
      return m;
    });

    setMembers(updatedMembers);
    refreshStats(updatedMembers, checkIns, payments, organization.peakCapacity);

    addToast({
      title: 'Status Updated',
      message: `Member status set to ${status}.`,
      type: 'info',
    });
  };

  const recordPayment = async (paymentData: Omit<PaymentTransaction, 'id' | 'invoiceNumber'>) => {
    try {
      const newPayment = await gymService.recordPayment(organization.id, paymentData, payments.length);

      const updatedPayments = [newPayment, ...payments];
      setPayments(updatedPayments);

      const updatedMembers = members.map((m) => {
        if (m.id === paymentData.memberId) {
          return {
            ...m,
            paymentStatus: 'paid' as const,
            pendingAmountINR: 0,
            status: m.status === 'expired' ? ('active' as const) : m.status,
            timeline: [
              {
                id: 'tim-' + Date.now(),
                type: 'payment' as const,
                title: `Payment Received — ₹${paymentData.totalINR.toLocaleString('en-IN')}`,
                description: `Invoice ${newPayment.invoiceNumber} paid via ${paymentData.paymentMethod || 'Direct'}`,
                timestamp: 'Just now',
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });

      setMembers(updatedMembers);
      refreshStats(updatedMembers, checkIns, updatedPayments, organization.peakCapacity);

      addToast({
        title: 'Payment Recorded',
        message: `₹${paymentData.totalINR.toLocaleString('en-IN')} recorded for ${paymentData.memberName} (${newPayment.invoiceNumber}).`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Payment Error',
        message: err?.message || 'Failed to record payment.',
        type: 'error',
      });
      throw err;
    }
  };

  const createPlan = (
    planData: Omit<MembershipPlan, 'id' | 'activeMembersCount' | 'totalRevenueINR' | 'expiringThisWeek'>
  ) => {
    const newPlan: MembershipPlan = {
      ...planData,
      id: 'plan-' + (plans.length + 1),
      activeMembersCount: 0,
      totalRevenueINR: 0,
      expiringThisWeek: 0,
    };

    setPlans((prev) => [...prev, newPlan]);

    addToast({
      title: 'Plan Published',
      message: `New plan "${newPlan.name}" configured at ₹${newPlan.priceINR.toLocaleString('en-IN')}.`,
      type: 'success',
    });
  };

  const openWhatsAppModal = (member: Member, customMsg?: string) => {
    const defaultMsg =
      customMsg ||
      `Hi ${member.name.split(' ')[0]}, this is Coach Vikram from ${organization.name}. We noticed your ${member.planName} membership expires in ${member.daysRemaining > 0 ? member.daysRemaining + ' days' : 'recently'}. Renew today to lock in your preferential rate and uninterrupted gym access! Click here to renew: https://pulsefit.in/renew/${member.memberCode}`;

    setWhatsAppModalData({
      isOpen: true,
      member,
      defaultMessage: defaultMsg,
    });
  };

  const closeWhatsAppModal = () => {
    setWhatsAppModalData({ isOpen: false, member: null, defaultMessage: '' });
  };

  const sendWhatsAppRenewal = async (memberId: string, customMessage?: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    await gymService.sendWhatsAppRenewal(organization.id, memberId, customMessage);

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            timeline: [
              {
                id: 'tim-' + Date.now(),
                type: 'reminder_sent',
                title: 'WhatsApp Renewal Link Sent',
                description: customMessage || 'Direct WhatsApp renewal prompt dispatched with 1-click checkout link.',
                timestamp: 'Just now',
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      })
    );

    closeWhatsAppModal();

    addToast({
      title: 'WhatsApp Dispatched',
      message: `Renewal communication successfully dispatched to ${member.name} (${member.phone}).`,
      type: 'success',
    });
  };

  const freezeMembership = async (memberId: string, days: number, reason: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    try {
      const { newExpiryDate, daysRemaining } = await gymService.freezeMembership(
        organization.id,
        member,
        days,
        reason
      );

      const updatedMembers = members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status: 'frozen' as const,
            expiryDate: newExpiryDate,
            daysRemaining,
            timeline: [
              {
                id: 'tim-' + Date.now(),
                type: 'status_change' as const,
                title: `Membership Frozen (${days} Days)`,
                description: `Paused until expiry adjusted to ${newExpiryDate}. Reason: ${reason}`,
                timestamp: 'Just now',
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });

      setMembers(updatedMembers);
      refreshStats(updatedMembers, checkIns, payments, organization.peakCapacity);

      addToast({
        title: 'Membership Frozen',
        message: `${member.name}'s plan paused for ${days} days. Expiry adjusted to ${newExpiryDate}.`,
        type: 'info',
      });
    } catch (err: any) {
      addToast({
        title: 'Freeze Failed',
        message: err?.message || 'Could not freeze membership.',
        type: 'error',
      });
      throw err;
    }
  };

  const openRenewModal = (member: Member) => {
    setRenewModalData({ isOpen: true, member });
  };

  const closeRenewModal = () => {
    setRenewModalData({ isOpen: false, member: null });
  };

  const openPaymentModal = (member?: Member | null) => {
    setPaymentModalData({ isOpen: true, member: member || null });
  };

  const closePaymentModal = () => {
    setPaymentModalData({ isOpen: false, member: null });
  };

  const openInvoiceModal = (payment: PaymentTransaction) => {
    setInvoiceModalData({ isOpen: true, payment });
  };

  const closeInvoiceModal = () => {
    setInvoiceModalData({ isOpen: false, payment: null });
  };

  const openAddNoteModal = (member: Member) => {
    setAddNoteModalData({ isOpen: true, member });
    setAddNoteModalOpen(true);
  };

  const closeAddNoteModal = () => {
    setAddNoteModalData({ isOpen: false, member: null });
    setAddNoteModalOpen(false);
  };

  const openEndOfDayModal = () => {
    setEndOfDayModalOpen(true);
  };

  const closeEndOfDayModal = () => {
    setEndOfDayModalOpen(false);
  };

  const switchUserRole = (role: UserRole) => {
    setCurrentUser((prev) => {
      let fullName = prev.fullName;
      if (role === 'front_desk') fullName = 'Rakesh Desk Lead';
      else if (role === 'trainer') fullName = 'Coach Vikram';
      else fullName = 'Alok Sharma';
      return { ...prev, role, fullName };
    });
    addToast({
      title: 'Workspace Role Changed',
      message: `Switched active role to ${role.toUpperCase().replace('_', ' ')}.`,
      type: 'info',
    });
  };

  const fastCheckIn = async (query: string): Promise<FastCheckInResult> => {
    const result = fastCheckInMember(
      members,
      checkIns,
      query,
      'Floor Workout',
      new Date(),
      organization.peakCapacity
    );

    if (result.status === 'confirmed' && result.member) {
      const member = result.member;
      try {
        const newRecord = await gymService.checkInMember(organization.id, member, checkIns, 'Floor Workout');
        const updatedCheckIns = [newRecord, ...checkIns];
        setCheckIns(updatedCheckIns);

        const timeStr = newRecord.checkInTime;
        const dateStr = newRecord.date;

        const updatedMembers = members.map((m) => {
          if (m.id === member.id) {
            return {
              ...m,
              lastVisit: `Today, ${timeStr}`,
              lastVisitDate: dateStr,
              isCurrentlyOnFloor: true,
              totalVisits: m.totalVisits + 1,
              monthlyVisits: m.monthlyVisits + 1,
              attendanceHistory: [
                {
                  id: 'att-' + Date.now(),
                  date: dateStr,
                  time: timeStr,
                  durationMinutes: 60,
                  workoutType: 'Floor Workout',
                  trainerName: m.assignedTrainer,
                },
                ...m.attendanceHistory,
              ],
              timeline: [
                {
                  id: 'tim-' + Date.now(),
                  type: 'checkin' as const,
                  title: 'Checked in at Reception Desk',
                  description: `Floor entry logged at ${timeStr}`,
                  timestamp: `Today, ${timeStr}`,
                },
                ...m.timeline,
              ],
            };
          }
          return m;
        });

        setMembers(updatedMembers);
        refreshStats(updatedMembers, updatedCheckIns, payments, organization.peakCapacity);

        addToast({
          title: 'Check-In Confirmed',
          message: `${member.name} (${member.planName}) checked in at ${timeStr}.`,
          type: 'success',
        });

        return { ...result, checkInTime: timeStr };
      } catch (err: any) {
        addToast({
          title: 'Check-In Blocked',
          message: err?.message || 'Check-in failed.',
          type: 'warning',
        });
        return { success: false, status: 'error', message: err?.message || 'Check-in failed' };
      }
    } else if (result.status === 'duplicate') {
      addToast({
        title: 'Already On Floor',
        message: result.message,
        type: 'warning',
      });
    } else if (result.status === 'expired') {
      addToast({
        title: 'Membership Expired',
        message: result.message,
        type: 'warning',
      });
    } else if (result.status === 'frozen') {
      addToast({
        title: 'Membership Frozen',
        message: result.message,
        type: 'warning',
      });
    } else if (result.status === 'not_found') {
      addToast({
        title: 'Athlete Not Found',
        message: result.message,
        type: 'error',
      });
    }

    return result;
  };

  const addMemberNote = async (memberId: string, noteText: string, category: NoteCategory) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const newNote: MemberNote = {
      id: 'note-' + Date.now(),
      memberId,
      organizationId: organization.id,
      note: noteText,
      category,
      authorId: currentUser.userId,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    setMemberNotes((prev) => [newNote, ...prev]);

    const timelineEntry = {
      id: 'tim-' + Date.now(),
      type: 'note' as const,
      title: `Staff Note Added (${category.toUpperCase().replace('_', ' ')})`,
      description: noteText,
      timestamp: 'Just now',
      author: currentUser.fullName,
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            timeline: [timelineEntry, ...m.timeline],
          };
        }
        return m;
      })
    );

    closeAddNoteModal();

    addToast({
      title: 'Note Recorded',
      message: `Operational note attached to ${member.name}'s profile.`,
      type: 'success',
    });
  };

  // Retention Intelligence Layer calculations
  const { profiles: retentionProfiles, stats: retentionStats } = useMemo(() => {
    return calculateRetentionOverview(members, plans, payments, checkIns);
  }, [members, plans, payments, checkIns]);

  const dailySummary = useMemo(() => {
    return calculateDailySummary(members, checkIns, payments, retentionProfiles, organization.peakCapacity);
  }, [members, checkIns, payments, retentionProfiles, organization.peakCapacity]);

  const logRetentionOutreach = async (memberId: string, actionType: string, notes?: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const profile = retentionProfiles.find((p) => p.memberId === memberId);

    const logTitle =
      actionType === 'whatsapp_reengage'
        ? 'Retention Outreach Logged — WhatsApp Re-engagement'
        : actionType === 'whatsapp_renewal'
        ? 'Retention Outreach Logged — Expiry Renewal Notice'
        : actionType === 'call_winback'
        ? 'Retention Outreach Logged — Win-Back Call'
        : actionType === 'trainer_checkin'
        ? 'Retention Outreach Logged — Trainer Check-In'
        : actionType === 'payment_link'
        ? 'Retention Outreach Logged — Overdue Payment Link'
        : `Retention Outreach Logged (${actionType})`;

    const logDescription =
      notes ||
      `Outreach recorded by ${currentUser.fullName} (${currentUser.role}). Risk Level: ${profile?.riskLevel?.toUpperCase() || 'HIGH'} (Score: ${profile?.riskScore || 'N/A'}/100). Status: OUTREACH LOGGED`;

    const newTimelineItem = {
      id: 'tim-' + Date.now(),
      type: 'retention_outreach_logged' as const,
      title: logTitle,
      description: logDescription,
      timestamp: 'Just now',
      author: currentUser.fullName,
      metadata: {
        riskScore: profile?.riskScore,
        riskLevel: profile?.riskLevel,
        reasons: profile?.reasons,
        action: actionType,
        status: 'OUTREACH LOGGED',
      },
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            timeline: [newTimelineItem, ...m.timeline],
          };
        }
        return m;
      })
    );

    addToast({
      title: 'Outreach Logged',
      message: `Retention action recorded for ${member.name}. State: OUTREACH LOGGED.`,
      type: 'success',
    });
  };

  return (
    <GymContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedMemberId,
        setSelectedMemberId,
        viewMemberProfile,
        organization,
        currentUser,
        appMode,
        signOut,
        switchUserRole,
        members,
        plans,
        checkIns,
        payments,
        gymStats,
        isLoadingData,
        retentionProfiles,
        retentionStats,
        memberNotes,
        dailySummary,
        fastCheckIn,
        addMemberNote,
        checkInMember,
        checkOutMember,
        addMember,
        renewMembership,
        updateMemberStatus,
        recordPayment,
        createPlan,
        sendWhatsAppRenewal,
        freezeMembership,
        logRetentionOutreach,
        toasts,
        addToast,
        removeToast,
        isCheckInModalOpen,
        setCheckInModalOpen,
        isAddMemberModalOpen,
        setAddMemberModalOpen,
        isCreatePlanModalOpen,
        setCreatePlanModalOpen,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        renewModalData,
        openRenewModal,
        closeRenewModal,
        whatsAppModalData,
        openWhatsAppModal,
        closeWhatsAppModal,
        paymentModalData,
        openPaymentModal,
        closePaymentModal,
        invoiceModalData,
        openInvoiceModal,
        closeInvoiceModal,
        isAddNoteModalOpen,
        setAddNoteModalOpen,
        addNoteModalData,
        openAddNoteModal,
        closeAddNoteModal,
        isEndOfDayModalOpen,
        setEndOfDayModalOpen,
        openEndOfDayModal,
        closeEndOfDayModal,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
