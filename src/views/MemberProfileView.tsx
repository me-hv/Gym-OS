import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Shield,
  CreditCard,
  Send,
  UserCheck,
  PauseCircle,
  FileText,
  Activity,
  Award,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Layers,
} from 'lucide-react';
import { Member, PaymentTransaction } from '../types';

export const MemberProfileView: React.FC = () => {
  const {
    selectedMemberId,
    members,
    setActiveView,
    checkInMember,
    checkOutMember,
    openWhatsAppModal,
    openPaymentModal,
    openInvoiceModal,
    openRenewModal,
    payments,
    freezeMembership,
  } = useGym();

  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeDays, setFreezeDays] = useState(14);
  const [freezeReason, setFreezeReason] = useState('Medical hold / travel');
  const [isFreezing, setIsFreezing] = useState(false);

  const member = members.find((m) => m.id === selectedMemberId) || members[0];

  if (!member) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>No member selected</p>
        <Button className="mt-4" onClick={() => setActiveView('members')}>
          Return to Members Directory
        </Button>
      </div>
    );
  }

  // Payments for this member
  const memberPayments = payments.filter((p) => p.memberId === member.id);

  const handleFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreezing) return;
    setIsFreezing(true);
    try {
      await freezeMembership(member.id, freezeDays, freezeReason);
      setIsFreezeModalOpen(false);
    } catch (err) {
      console.error('Freeze error:', err);
    } finally {
      setIsFreezing(false);
    }
  };

  // 30-day heatmap simulator for attendance
  const generateAttendanceGrid = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isVisited =
        i % 7 !== 0 && (i % 3 === 0 || i % 5 === 0 || i === 0 || member.attendanceRate > 85);
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visited: isVisited,
      });
    }
    return days;
  };

  const attendanceGrid = generateAttendanceGrid();

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setActiveView('members')}
          >
            Back to Directory
          </Button>
          <div className="h-4 w-px bg-white/[0.08]" />
          <span className="text-xs font-mono text-zinc-400">{member.memberCode}</span>
        </div>

        {/* Profile Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick check-in / check-out */}
          {member.isCurrentlyOnFloor ? (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<LogOut className="w-3.5 h-3.5 text-sky-400" />}
              onClick={() => checkOutMember(member.id)}
            >
              Log Check-Out
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-brand-400" />}
              onClick={() => checkInMember(member.id)}
            >
              Log Check-In
            </Button>
          )}

          {/* Renew Plan Action (Core Phase 3 Feature) */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => openRenewModal(member)}
          >
            Renew Membership
          </Button>

          {/* WhatsApp Reminder */}
          <Button
            size="sm"
            variant="warning"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={() => openWhatsAppModal(member)}
          >
            WhatsApp
          </Button>

          {/* Settle Balance */}
          {member.paymentStatus !== 'paid' && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              onClick={() => openPaymentModal(member)}
            >
              Collect Payment
            </Button>
          )}

          {/* Freeze */}
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<PauseCircle className="w-3.5 h-3.5" />}
            onClick={() => setIsFreezeModalOpen(true)}
            disabled={member.status === 'expired' || member.status === 'cancelled'}
          >
            Freeze Plan
          </Button>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="rounded-2xl p-6 bg-surface-300 shadow-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-surface-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-2xl text-zinc-300 shadow-md">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              member.name.charAt(0)
            )}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{member.name}</h1>
              <Badge variant={member.status} size="md">
                {member.status.toUpperCase()}
              </Badge>
              {member.isCurrentlyOnFloor && (
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                  Currently On Floor
                </span>
              )}
              {member.lockerNumber && (
                <span className="text-xs font-mono text-zinc-400 bg-surface-200 px-2 py-0.5 rounded-md">
                  Locker {member.lockerNumber}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {member.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> {member.email}
              </span>
              <span>•</span>
              <span>
                {member.gender}, {member.age} yrs
              </span>
              <span>•</span>
              <span>Joined {member.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats on right */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/[0.04] pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Attendance Rate
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {member.attendanceRate}%
            </div>
            <div className="text-[11px] text-zinc-400">{member.weeklyFrequency} visits/wk avg</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Days Left
            </div>
            <div
              className={`text-xl font-bold font-mono mt-0.5 ${
                member.daysRemaining <= 3 ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {member.daysRemaining > 0 ? `${member.daysRemaining}d` : 'Expired'}
            </div>
            <div className="text-[11px] text-zinc-400">Exp: {member.expiryDate}</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Total Visits
            </div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {member.totalVisits}
            </div>
            <div className="text-[11px] text-zinc-400">{member.monthlyVisits} this month</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Deep Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Membership Specs & Emergency Info (1 col) */}
        <div className="space-y-6">
          {/* Membership Plan Specs */}
          <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Active Subscription Tier</span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => openRenewModal(member)}
                className="text-brand-400 hover:text-brand-300"
              >
                Renew / Change Tier →
              </Button>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Enrolled Plan</span>
                <span className="font-semibold text-white">{member.planName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Assigned Coach</span>
                <span className="font-medium text-brand-300">{member.assignedTrainer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Primary Goal</span>
                <span className="font-medium text-zinc-200">{member.goal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Expiry Date</span>
                <span className="font-mono text-zinc-200">{member.expiryDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Payment Standing</span>
                <Badge variant={member.paymentStatus} size="xs">
                  {member.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Historical Membership Subscriptions (Preserved History) */}
          <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              <span>Membership History Ledger</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {member.membershipHistory && member.membershipHistory.length > 0 ? (
                member.membershipHistory.map((hist, idx) => (
                  <div
                    key={hist.id || idx}
                    className="p-3 rounded-xl bg-surface-200/80 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">{hist.planName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {hist.startDate} → {hist.expiryDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-zinc-300">
                        ₹{hist.amountINR.toLocaleString('en-IN')}
                      </div>
                      <Badge variant={hist.status} size="xs" className="mt-0.5">
                        {hist.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-surface-200/60 text-xs text-zinc-400 text-center">
                  Initial enrollment: {member.planName}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact & Medical Notes */}
          <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              Emergency & Health Notes
            </h3>

            <div className="p-3.5 rounded-xl bg-surface-200 mb-3 text-xs space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-semibold">
                Primary Emergency Contact
              </div>
              <div className="font-semibold text-white">{member.emergencyContact.name}</div>
              <div className="text-zinc-400">
                {member.emergencyContact.relationship} • {member.emergencyContact.phone}
              </div>
            </div>

            <div>
              <div className="text-zinc-400 text-[10px] uppercase font-semibold mb-1.5">
                Trainer / Health Observations
              </div>
              <p className="text-xs text-zinc-300 bg-surface-200/50 p-3.5 rounded-xl leading-relaxed">
                {member.notes || 'No health notes recorded. Standard fitness induction completed.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Attendance Matrix, Invoices & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Heatmap Matrix */}
          <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">30-Day Attendance Consistency</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Last visit recorded: <strong className="text-zinc-200">{member.lastVisit}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Visited
                <span className="w-2.5 h-2.5 rounded-xs bg-surface-100 ml-2"></span> Rest Day
              </div>
            </div>

            {/* 30 day grid */}
            <div className="grid grid-cols-10 gap-2">
              {attendanceGrid.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.visited ? 'Attended workout' : 'Rest day'}`}
                  className={`p-2 rounded-lg text-center transition-all ${
                    day.visited
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'bg-surface-200 text-zinc-500'
                  }`}
                >
                  <div className="text-[9px] truncate">{day.date}</div>
                  <div className="text-xs mt-0.5">{day.visited ? '✓' : '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Transactions & Invoices for this Member */}
          <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Invoices & Receipts Ledger</h3>
                <p className="text-xs text-zinc-400 mt-0.5">All billing and renewal receipts in INR</p>
              </div>
              {member.paymentStatus !== 'paid' && (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => openPaymentModal(member)}
                >
                  Record Payment
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {memberPayments.length > 0 ? (
                memberPayments.map((pay) => (
                  <div
                    key={pay.id}
                    onClick={() => openInvoiceModal(pay)}
                    className="p-3.5 rounded-xl bg-surface-200 hover:bg-surface-100 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface-100 text-brand-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-brand-300 transition-colors flex items-center gap-2">
                          <span>{pay.invoiceNumber}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">({pay.date})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {pay.planName} • {pay.paymentMethod || 'Direct Payment'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white font-mono">
                        ₹{pay.totalINR.toLocaleString('en-IN')}
                      </div>
                      <Badge variant={pay.status} size="xs" className="mt-0.5">
                        {pay.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-surface-200/50 text-xs text-zinc-400 text-center">
                  Prior annual invoice settled offline during registration.
                </div>
              )}
            </div>
          </div>

          {/* Activity & Communications Timeline */}
          <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
            <h3 className="text-sm font-bold text-white mb-4 tracking-tight">Activity & Audit Timeline</h3>

            <div className="relative pl-6 space-y-4 border-l border-white/[0.06]">
              {member.timeline.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-surface-200 ring-2 ring-brand-500"></div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xs font-semibold text-zinc-200">{item.title}</h4>
                      <span className="text-[10px] font-mono text-zinc-400">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Freeze Membership Modal */}
      <Modal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        title="Freeze / Pause Membership"
        subtitle={`Hold athlete plan for ${member.name}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFreezeModalOpen(false)} disabled={isFreezing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFreeze} disabled={isFreezing}>
              {isFreezing ? 'Processing Freeze...' : 'Confirm Freeze & Adjust Expiry'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFreeze} className="space-y-4">
          <Input
            label="Duration to Pause (Days) *"
            type="number"
            value={freezeDays}
            onChange={(e) => setFreezeDays(Number(e.target.value))}
            min={1}
            max={60}
            required
          />
          <Input
            label="Reason for Freeze *"
            value={freezeReason}
            onChange={(e) => setFreezeReason(e.target.value)}
            placeholder="e.g. Ankle sprain recovery, business travel"
            required
          />
          <p className="text-xs text-zinc-400 bg-surface-200 p-3 rounded-xl">
            Freezing by {freezeDays} days will automatically shift this athlete's expiry date forward by {freezeDays} days and record an immutable audit entry.
          </p>
        </form>
      </Modal>
    </div>
  );
};
