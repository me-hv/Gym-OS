'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member, MembershipPlan, AttendanceRecord, PaymentTransaction, GymStats, MemberStatus } from '../types';
import { INITIAL_MEMBERS, MEMBERSHIP_PLANS, INITIAL_CHECKINS, INITIAL_PAYMENTS, INITIAL_GYM_STATS } from '../data/mockData';
import { gymService, OrgProfile, UserSession, DEFAULT_PILOT_ORG, DEFAULT_PILOT_USER } from '../services/gymService';
import { createClient } from '../lib/supabase/client';

export type ActiveNavView = 'overview' | 'members' | 'profile' | 'attendance' | 'memberships' | 'payments';

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
  signOut: () => Promise<void>;

  members: Member[];
  plans: MembershipPlan[];
  checkIns: AttendanceRecord[];
  payments: PaymentTransaction[];
  gymStats: GymStats;
  isLoadingData: boolean;

  // Actions
  checkInMember: (memberId: string) => { success: boolean; message: string };
  addMember: (member: Omit<Member, 'id' | 'memberCode' | 'daysRemaining' | 'attendanceRate' | 'weeklyFrequency' | 'totalVisits' | 'monthlyVisits' | 'lastVisit' | 'lastVisitDate' | 'attendanceHistory' | 'timeline'>) => void;
  updateMemberStatus: (memberId: string, status: MemberStatus) => void;
  recordPayment: (payment: Omit<PaymentTransaction, 'id' | 'invoiceNumber'>) => void;
  createPlan: (plan: Omit<MembershipPlan, 'id' | 'activeMembersCount' | 'totalRevenueINR' | 'expiringThisWeek'>) => void;
  sendWhatsAppRenewal: (memberId: string, customMessage?: string) => void;
  freezeMembership: (memberId: string, days: number, reason: string) => void;

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

  whatsAppModalData: { isOpen: boolean; member: Member | null; defaultMessage: string };
  openWhatsAppModal: (member: Member, customMsg?: string) => void;
  closeWhatsAppModal: () => void;

  paymentModalData: { isOpen: boolean; member: Member | null };
  openPaymentModal: (member?: Member | null) => void;
  closePaymentModal: () => void;

  invoiceModalData: { isOpen: boolean; payment: PaymentTransaction | null };
  openInvoiceModal: (payment: PaymentTransaction) => void;
  closeInvoiceModal: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveNavView>('overview');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [organization, setOrganization] = useState<OrgProfile>(DEFAULT_PILOT_ORG);
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_PILOT_USER);
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

  // Re-calculate dashboard metrics whenever members, checkIns, or payments change
  const refreshStats = useCallback((mList: Member[], cList: AttendanceRecord[], pList: PaymentTransaction[], peakCap: number) => {
    const recalculated = gymService.calculateDashboardMetrics(mList, cList, pList, peakCap);
    setGymStats(recalculated);
  }, []);

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

        const [loadedMembers, loadedPlans] = await Promise.all([
          gymService.getMembers(session.organizationId),
          gymService.getPlans(session.organizationId),
        ]);

        if (!isMounted) return;
        setMembers(loadedMembers);
        setPlans(loadedPlans);
        refreshStats(loadedMembers, INITIAL_CHECKINS, INITIAL_PAYMENTS, org.peakCapacity);
      } catch (err) {
        console.error('Failed loading tenant data from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadTenantData();

    return () => {
      isMounted = false;
    };
  }, [refreshStats]);

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

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  const checkInMember = (memberId: string): { success: boolean; message: string } => {
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
        title: 'Check-in Warning: Expired Membership',
        message: `${member.name}'s membership expired. Please renew plan before floor entry.`,
        type: 'warning',
      });
    } else if (member.status === 'frozen') {
      addToast({
        title: 'Check-in Warning: Frozen Plan',
        message: `${member.name}'s membership is currently paused.`,
        type: 'warning',
      });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: 'rec-' + Date.now(),
      memberId: member.id,
      memberCode: member.memberCode,
      memberName: member.name,
      memberAvatar: member.avatarUrl,
      planName: member.planName,
      checkInTime: timeStr,
      date: dateStr,
      status: member.status,
      trainerName: member.assignedTrainer,
      workoutGoal: member.goal,
      isToday: true,
    };

    const updatedCheckIns = [newRecord, ...checkIns];
    setCheckIns(updatedCheckIns);

    const updatedMembers = members.map((m) => {
      if (m.id === member.id) {
        return {
          ...m,
          lastVisit: `Today, ${timeStr}`,
          lastVisitDate: dateStr,
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
      title: 'Check-in Recorded',
      message: `${member.name} (${member.planName}) checked in successfully at ${timeStr}.`,
      type: 'success',
    });

    return { success: true, message: `${member.name} checked in successfully` };
  };

  const addMember = (
    memberData: Omit<
      Member,
      'id' | 'memberCode' | 'daysRemaining' | 'attendanceRate' | 'weeklyFrequency' | 'totalVisits' | 'monthlyVisits' | 'lastVisit' | 'lastVisitDate' | 'attendanceHistory' | 'timeline'
    >
  ) => {
    const newId = 'mem-' + (100 + members.length + 1);
    const code = `GYM-2024-${String(members.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const expiry = new Date(memberData.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const newMember: Member = {
      ...memberData,
      id: newId,
      memberCode: code,
      daysRemaining: diffDays,
      lastVisit: 'Never (New Member)',
      lastVisitDate: now.toISOString().split('T')[0],
      attendanceRate: 100,
      weeklyFrequency: 0,
      totalVisits: 0,
      monthlyVisits: 0,
      attendanceHistory: [],
      timeline: [
        {
          id: 'tim-' + Date.now(),
          type: 'status_change',
          title: 'Enrolled in Gym',
          description: `Joined on ${memberData.planName} plan`,
          timestamp: 'Just now',
        },
      ],
    };

    const updatedMembers = [newMember, ...members];
    setMembers(updatedMembers);

    const updatedPlans = plans.map((p) =>
      p.id === memberData.planId ? { ...p, activeMembersCount: p.activeMembersCount + 1 } : p
    );
    setPlans(updatedPlans);

    refreshStats(updatedMembers, checkIns, payments, organization.peakCapacity);

    addToast({
      title: 'Member Enrolled',
      message: `${newMember.name} enrolled under ${newMember.planName} (${code}).`,
      type: 'success',
    });
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
              description: `Member status updated in dashboard`,
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
      message: `Member status updated to ${status}.`,
      type: 'info',
    });
  };

  const recordPayment = (paymentData: Omit<PaymentTransaction, 'id' | 'invoiceNumber'>) => {
    const invNum = `INV-2026-${String(payments.length + 101).padStart(4, '0')}`;
    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      invoiceNumber: invNum,
    };

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
              description: `Invoice ${invNum} paid via ${paymentData.paymentMethod || 'Direct'}`,
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
      message: `Payment of ₹${paymentData.totalINR.toLocaleString('en-IN')} recorded for ${paymentData.memberName} (${invNum}).`,
      type: 'success',
    });
  };

  const createPlan = (planData: Omit<MembershipPlan, 'id' | 'activeMembersCount' | 'totalRevenueINR' | 'expiringThisWeek'>) => {
    const newPlan: MembershipPlan = {
      ...planData,
      id: 'plan-' + (plans.length + 1),
      activeMembersCount: 0,
      totalRevenueINR: 0,
      expiringThisWeek: 0,
    };

    setPlans((prev) => [...prev, newPlan]);

    addToast({
      title: 'Plan Created',
      message: `New plan "${newPlan.name}" published at ₹${newPlan.priceINR.toLocaleString('en-IN')}.`,
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

  const sendWhatsAppRenewal = (memberId: string, customMessage?: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

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
                description: customMessage || 'Direct WhatsApp renewal prompt dispatched with 1-click payment link.',
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
      message: `Renewal communication successfully sent to ${member.name} (${member.phone}).`,
      type: 'success',
    });
  };

  const freezeMembership = (memberId: string, days: number, reason: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const updatedMembers = members.map((m) => {
      if (m.id === memberId) {
        const currentExp = new Date(m.expiryDate);
        currentExp.setDate(currentExp.getDate() + days);
        const newExpStr = currentExp.toISOString().split('T')[0];

        return {
          ...m,
          status: 'frozen' as const,
          expiryDate: newExpStr,
          daysRemaining: m.daysRemaining + days,
          timeline: [
            {
              id: 'tim-' + Date.now(),
              type: 'status_change' as const,
              title: `Membership Frozen (${days} Days)`,
              description: `Paused until expiry adjusted to ${newExpStr}. Reason: ${reason}`,
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
      message: `${member.name}'s plan paused for ${days} days. Expiry adjusted.`,
      type: 'info',
    });
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
        signOut,
        members,
        plans,
        checkIns,
        payments,
        gymStats,
        isLoadingData,
        checkInMember,
        addMember,
        updateMemberStatus,
        recordPayment,
        createPlan,
        sendWhatsAppRenewal,
        freezeMembership,
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
        whatsAppModalData,
        openWhatsAppModal,
        closeWhatsAppModal,
        paymentModalData,
        openPaymentModal,
        closePaymentModal,
        invoiceModalData,
        openInvoiceModal,
        closeInvoiceModal,
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
