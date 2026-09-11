import React, { useState, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CreditCard, CheckCircle2, IndianRupee } from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '../../types';

export const RecordPaymentModal: React.FC = () => {
  const { paymentModalData, closePaymentModal, recordPayment, members, plans } = useGym();
  const { isOpen, member } = paymentModalData;

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceId, setReferenceId] = useState<string>('');
  const [collectedBy, setCollectedBy] = useState<string>('Front Desk - Rakesh');

  useEffect(() => {
    if (member) {
      setSelectedMemberId(member.id);
      setPlanId(member.planId);
      const plan = plans.find((p) => p.id === member.planId);
      setAmount(member.pendingAmountINR > 0 ? member.pendingAmountINR : plan?.priceINR || 14500);
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].id);
      setPlanId(members[0].planId);
      const plan = plans.find((p) => p.id === members[0].planId);
      setAmount(plan?.priceINR || 14500);
    }
    setReferenceId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  }, [member, members, plans, isOpen]);

  if (!isOpen) return null;

  const currentMember = members.find((m) => m.id === selectedMemberId);
  const currentPlan = plans.find((p) => p.id === planId);

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    const m = members.find((item) => item.id === id);
    if (m) {
      setPlanId(m.planId);
      const p = plans.find((item) => item.id === m.planId);
      setAmount(m.pendingAmountINR > 0 ? m.pendingAmountINR : p?.priceINR || 14500);
    }
  };

  const handlePlanChange = (pId: string) => {
    setPlanId(pId);
    const p = plans.find((item) => item.id === pId);
    if (p) {
      setAmount(p.priceINR);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember || !currentPlan) return;

    const baseAmount = Math.round((amount / 1.18) * 100) / 100;
    const taxAmount = Math.round((amount - baseAmount) * 100) / 100;
    const todayStr = new Date().toISOString().split('T')[0];

    recordPayment({
      memberId: currentMember.id,
      memberName: currentMember.name,
      memberPhone: currentMember.phone,
      planId: currentPlan.id,
      planName: currentPlan.name,
      amountINR: baseAmount,
      taxINR: taxAmount,
      totalINR: amount,
      date: todayStr,
      dueDate: todayStr,
      status: 'paid' as PaymentStatus,
      paymentMethod,
      referenceId,
      collectedBy,
    });

    closePaymentModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closePaymentModal}
      title="Record Member Payment"
      subtitle="Issue GST tax invoice and log financial transaction"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={closePaymentModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<IndianRupee className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Confirm & Settle ₹{amount.toLocaleString('en-IN')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Member"
          value={selectedMemberId}
          onChange={(e) => handleMemberChange(e.target.value)}
          options={members.map((m) => ({
            value: m.id,
            label: `${m.name} (${m.memberCode}) — ${m.planName}`,
          }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Membership Plan"
            value={planId}
            onChange={(e) => handlePlanChange(e.target.value)}
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.name} (₹${p.priceINR.toLocaleString('en-IN')})`,
            }))}
          />
          <Input
            label="Amount Collected (₹ INR) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Payment Mode"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
              { value: 'Credit Card', label: 'Credit Card (POS)' },
              { value: 'Debit Card', label: 'Debit Card' },
              { value: 'Cash', label: 'Cash (Drawer)' },
              { value: 'Net Banking', label: 'Net Banking / IMPS' },
            ]}
          />
          <Input
            label="UTR / Transaction Ref #"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. UPI-928374182903"
          />
        </div>

        <Select
          label="Collected By / Front Desk Staff"
          value={collectedBy}
          onChange={(e) => setCollectedBy(e.target.value)}
          options={[
            { value: 'Front Desk - Rakesh', label: 'Front Desk - Rakesh' },
            { value: 'Manager - Alok', label: 'Manager - Alok' },
            { value: 'Online Portal Auto-Capture', label: 'Online Portal Auto-Capture' },
          ]}
        />

        {/* Breakdown box */}
        <div className="p-3.5 bg-surface-200 rounded-xl text-xs space-y-2">
          <div className="flex justify-between text-zinc-400">
            <span>Base Subscription (excl. GST)</span>
            <span className="font-mono text-zinc-200">
              ₹{Math.round((amount / 1.18) * 100) / 100}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>GST (18% Integrated Tax)</span>
            <span className="font-mono text-zinc-200">
              ₹{Math.round((amount - amount / 1.18) * 100) / 100}
            </span>
          </div>
          <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/[0.04]">
            <span>Total Settlement</span>
            <span className="font-mono text-brand-400">₹{amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
