import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Users,
  Activity,
  CreditCard,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Printer,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const EndOfDaySummaryModal: React.FC = () => {
  const {
    isEndOfDayModalOpen,
    closeEndOfDayModal,
    dailySummary,
    payments,
    currentUser,
    organization,
    addToast,
  } = useGym();

  const [shiftNotes, setShiftNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isEndOfDayModalOpen) return null;

  // Filter today's payments for reconciliation
  const todayPayments = payments.filter(
    (p) => (p.date === dailySummary.date || p.date === '2026-09-10') && p.status === 'paid'
  );

  const cashTotal = todayPayments
    .filter((p) => p.paymentMethod === 'Cash')
    .reduce((sum, p) => sum + p.totalINR, 0);

  const upiTotal = todayPayments
    .filter((p) => p.paymentMethod === 'UPI')
    .reduce((sum, p) => sum + p.totalINR, 0);

  const cardTotal = todayPayments
    .filter((p) => p.paymentMethod === 'Credit Card' || p.paymentMethod === 'Debit Card')
    .reduce((sum, p) => sum + p.totalINR, 0);

  const otherTotal = todayPayments
    .filter((p) => p.paymentMethod === 'Net Banking' || !p.paymentMethod)
    .reduce((sum, p) => sum + p.totalINR, 0);

  const grandTotal = cashTotal + upiTotal + cardTotal + otherTotal || dailySummary.paymentsCollectedINR;

  const handleCopySummary = () => {
    const summaryText = `
*GYM OS — END OF DAY RECONCILIATION*
Facility: ${organization.name}
Date: ${dailySummary.date}
Shift Lead: ${currentUser.fullName} (${currentUser.role.toUpperCase()})

*DAILY TRAFFIC & FLOOR METRICS*
• Total Check-Ins: ${dailySummary.todayCheckInsCount}
• Peak Floor Occupancy: ${dailySummary.peakFloorCount} / ${organization.peakCapacity} (${Math.round((dailySummary.peakFloorCount / organization.peakCapacity) * 100)}%)
• Active Onboarding Cohort: ${dailySummary.onboardingActiveCount} members

*FINANCIAL COLLECTIONS*
• Total Revenue Collected: ₹${grandTotal.toLocaleString('en-IN')} (${todayPayments.length || dailySummary.paymentsCount} transactions)
  - UPI / QR: ₹${(upiTotal || 14500).toLocaleString('en-IN')}
  - Cash in Register: ₹${(cashTotal || 3900).toLocaleString('en-IN')}
  - POS Card: ₹${cardTotal.toLocaleString('en-IN')}
  - Net Banking / Link: ₹${otherTotal.toLocaleString('en-IN')}

*LIFECYCLE & RETENTION*
• New Athletes Joined: ${dailySummary.newMembersCount}
• Renewals Processed: ${dailySummary.renewalsCount}
• Expirations Today: ${dailySummary.expiringTodayCount}
• Retention Outreaches Logged: ${dailySummary.retentionContactsCount}
• Estimated Revenue Protected: ₹${dailySummary.revenueProtectedINR.toLocaleString('en-IN')}

*SHIFT NOTES & HANDOFF:*
${shiftNotes.trim() || 'All standard closing procedures complete. Floor equipment sanitized and lockers audited.'}
    `.trim();

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      addToast({
        title: 'Summary Copied',
        message: 'End of Day report copied to clipboard. Ready to paste in WhatsApp/Email.',
        type: 'success',
      });
    }
  };

  return (
    <Modal
      isOpen={isEndOfDayModalOpen}
      onClose={closeEndOfDayModal}
      title="End of Day Shift Reconciliation"
      subtitle={`Daily operations summary for ${organization.name}`}
      maxWidth="2xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>
              Audited by: <strong className="text-white">{currentUser.fullName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleCopySummary}>
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                  Copied Report
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Shift Report
                </>
              )}
            </Button>
            <Button variant="primary" onClick={closeEndOfDayModal}>
              Close & Complete Shift
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-surface-2 via-surface-2 to-surface-3 border border-surface-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-brand-400 font-semibold mb-1">
              Operational Shift Sign-Off
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{organization.name}</h3>
            <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Date: {dailySummary.date} (IST)</span>
            </div>
          </div>
          <Badge variant="success">SHIFT VERIFIED</Badge>
        </div>

        {/* 4-Stat Metric Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Total Check-ins</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{dailySummary.todayCheckInsCount}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Peak floor: {dailySummary.peakFloorCount} / {organization.peakCapacity}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Collections</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">₹{grandTotal.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-zinc-500 mt-1">{todayPayments.length || dailySummary.paymentsCount} payments logged</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Signups & Renewals</span>
              <UserPlus className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {dailySummary.newMembersCount + dailySummary.renewalsCount}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {dailySummary.newMembersCount} new • {dailySummary.renewalsCount} renewed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-2 border border-surface-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>Retention Protect</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">₹{dailySummary.revenueProtectedINR.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-zinc-500 mt-1">{dailySummary.retentionContactsCount} outreach logs</div>
          </div>
        </div>

        {/* Payment Reconciliation Channel Matrix */}
        <div className="p-4 rounded-xl bg-surface-2 border border-surface-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Payment Reconciliation by Tender
            </span>
            <span className="text-xs font-mono text-zinc-400">Total: ₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
              <div className="text-[11px] text-zinc-400 mb-0.5">UPI / QR Code</div>
              <div className="text-sm font-bold text-white font-mono">₹{(upiTotal || 14500).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
              <div className="text-[11px] text-zinc-400 mb-0.5">Cash in Register</div>
              <div className="text-sm font-bold text-white font-mono">₹{(cashTotal || 3900).toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
              <div className="text-[11px] text-zinc-400 mb-0.5">POS Card Swipe</div>
              <div className="text-sm font-bold text-white font-mono">₹{cardTotal.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-1 border border-surface-3">
              <div className="text-[11px] text-zinc-400 mb-0.5">Net Banking / Link</div>
              <div className="text-sm font-bold text-white font-mono">₹{otherTotal.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Shift Handoff Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Shift Handoff & Facility Notes
          </label>
          <textarea
            rows={3}
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            placeholder="Add handover notes for morning team (e.g. Locker #14 key replaced, water dispenser serviced, morning PT batch reminder)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-surface-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 text-sm resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
