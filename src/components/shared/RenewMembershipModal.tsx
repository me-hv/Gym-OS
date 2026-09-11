import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { RefreshCw, CheckCircle2, IndianRupee, Sparkles, Shield, Calendar } from 'lucide-react';
import { PaymentMethod, Member } from '../../types';
import { calculateTaxBreakdown, getISTDateString } from '../../services/gymService';

export const RenewMembershipModal: React.FC = () => {
  const { renewModalData, closeRenewModal, renewMembership, plans } = useGym();
  const { isOpen, member } = renewModalData;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan-1');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setSelectedPlanId(member.planId || plans[0]?.id || 'plan-1');
    }
  }, [member, plans]);

  if (!isOpen || !member) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const taxBreakdown = calculateTaxBreakdown(selectedPlan?.priceINR || 24000, 18);

  const todayStr = getISTDateString();
  const currentExpiry = new Date(member.expiryDate);
  const today = new Date(todayStr);

  // Start date calculation
  let newStartDateStr = todayStr;
  if (currentExpiry >= today && member.status !== 'expired' && member.status !== 'cancelled') {
    const nextDay = new Date(currentExpiry);
    nextDay.setDate(nextDay.getDate() + 1);
    newStartDateStr = nextDay.toISOString().split('T')[0];
  }

  // Expiry date calculation
  const newStartDate = new Date(newStartDateStr);
  const calculatedExpiry = new Date(newStartDate);
  calculatedExpiry.setMonth(calculatedExpiry.getMonth() + (selectedPlan?.durationMonths || 12));
  const newExpiryStr = calculatedExpiry.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await renewMembership({
        memberId: member.id,
        planId: selectedPlan.id,
        paymentMethod,
        notes,
      });
      closeRenewModal();
    } catch (err) {
      console.error('Failed renewal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeRenewModal}
      title="Renew Athlete Membership"
      subtitle={`Extend subscription period and issue renewal invoice for ${member.name}`}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={closeRenewModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing Renewal...' : `Confirm Renewal (₹${(selectedPlan?.priceINR || 0).toLocaleString('en-IN')})`}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Member Glance */}
        <div className="p-4 rounded-2xl bg-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-sm">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{member.name}</div>
              <div className="text-xs text-zinc-400">
                {member.memberCode} • Current Plan: <strong className="text-zinc-200">{member.planName}</strong>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                member.daysRemaining <= 2
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {member.daysRemaining > 0 ? `${member.daysRemaining}d Left` : 'Expired'}
            </span>
            <div className="text-[10px] text-zinc-400 mt-1">Exp: {member.expiryDate}</div>
          </div>
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Select Renewal Subscription Tier
          </label>
          <div className="space-y-2">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-500/15 text-white ring-1 ring-brand-500/50'
                      : 'bg-surface-200 hover:bg-surface-100 text-zinc-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {p.tag && (
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-mono">
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 mt-0.5 block">{p.description}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-brand-400 tabular-nums">
                      ₹{p.priceINR.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-zinc-400">{p.durationMonths} Months</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculated Subscription Window */}
        <div className="p-4 rounded-xl bg-surface-200/70 border border-white/[0.04] space-y-3">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span>Updated Membership Validity Window</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-100">
              <span className="text-zinc-400 block text-[10px] uppercase">Effective Start Date</span>
              <strong className="text-white font-mono text-xs">{newStartDateStr}</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-100">
              <span className="text-zinc-400 block text-[10px] uppercase">New Expiry Date</span>
              <strong className="text-brand-300 font-mono text-xs">{newExpiryStr}</strong>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Previous membership history will be permanently preserved in the athlete's dossier.
          </p>
        </div>

        {/* Payment Method & Tax Breakdown */}
        <div className="pt-2 border-t border-white/[0.04] space-y-3">
          <Select
            label="Payment Collection Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm / Dynamic QR)' },
              { value: 'Credit Card', label: 'Credit / Debit Card (Front Desk POS)' },
              { value: 'Cash', label: 'Cash (Recorded at Desk)' },
              { value: 'Net Banking', label: 'Net Banking / NEFT Transfer' },
            ]}
          />

          <div className="p-4 rounded-xl bg-surface-200 text-xs space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Taxable Value:</span>
              <span className="font-mono text-zinc-200">
                ₹{taxBreakdown.taxableAmountINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>CGST (9%):</span>
              <span className="font-mono text-zinc-200">
                ₹{taxBreakdown.cgstINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>SGST (9%):</span>
              <span className="font-mono text-zinc-200">
                ₹{taxBreakdown.sgstINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.04]">
              <span>Grand Total:</span>
              <span className="font-mono text-brand-400">
                ₹{taxBreakdown.totalINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Renewal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Loyalty rate applied, annual upgrade promotion"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-200 text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </form>
    </Drawer>
  );
};
