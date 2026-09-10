import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { UserPlus, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { MemberStatus, WorkoutGoal, PaymentMethod } from '../../types';

export const AddMemberModal: React.FC = () => {
  const { isAddMemberModalOpen, setAddMemberModalOpen, addMember, plans } = useGym();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: 26,
    planId: plans[0]?.id || 'plan-1',
    status: 'active' as MemberStatus,
    goal: 'Hypertrophy & Strength' as WorkoutGoal,
    assignedTrainer: 'Coach Vikram Rao',
    lockerNumber: '',
    paymentMethod: 'UPI' as PaymentMethod,
    emergencyName: '',
    emergencyRelationship: 'Family',
    emergencyPhone: '',
    notes: '',
  });

  if (!isAddMemberModalOpen) return null;

  const selectedPlan = plans.find((p) => p.id === formData.planId) || plans[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (selectedPlan?.durationMonths || 12));
    const expiryStr = expiry.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    addMember({
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
      gender: formData.gender,
      age: Number(formData.age) || 25,
      joinDate: todayStr,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      status: 'active',
      expiryDate: expiryStr,
      paymentStatus: 'paid',
      lastPaymentDate: todayStr,
      pendingAmountINR: 0,
      assignedTrainer: formData.assignedTrainer,
      lockerNumber: formData.lockerNumber ? `L-${formData.lockerNumber}` : undefined,
      goal: formData.goal,
      emergencyContact: {
        name: formData.emergencyName || 'Primary Contact',
        relationship: formData.emergencyRelationship || 'Family',
        phone: formData.emergencyPhone || formData.phone,
      },
      notes: formData.notes,
    });

    setAddMemberModalOpen(false);
  };

  return (
    <Drawer
      isOpen={isAddMemberModalOpen}
      onClose={() => setAddMemberModalOpen(false)}
      title="Enroll New Gym Member"
      subtitle="Register athlete, configure membership tier, and assign coach"
      width="xl"
      footer={
        <>
          <Button variant="ghost" onClick={() => setAddMemberModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={handleSubmit}
          >
            Complete Enrollment & Activate Plan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Member Identity */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> Personal Information
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Full Name *"
                placeholder="e.g. Vikramaditya Singhania"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <Input
              label="Phone Number *"
              placeholder="+91 98450 XXXXX"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="member@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Input
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Section 2: Membership Plan */}
        <div className="pt-2 border-t border-border-subtle">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> Plan & Duration
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Membership Tier
              </label>
              <div className="space-y-2">
                {plans.map((p) => {
                  const isSelected = formData.planId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setFormData({ ...formData, planId: p.id })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500/50 text-white'
                          : 'bg-surface-200 border-border-subtle hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{p.name}</span>
                          {p.tag && (
                            <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono">
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

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Assigned Coach"
                value={formData.assignedTrainer}
                onChange={(e) => setFormData({ ...formData, assignedTrainer: e.target.value })}
                options={[
                  { value: 'Coach Vikram Rao', label: 'Coach Vikram Rao (Strength & Power)' },
                  { value: 'Coach Priya Sharma', label: 'Coach Priya Sharma (HIIT & Mobility)' },
                  { value: 'Coach Amit Patel', label: 'Coach Amit Patel (Body Recomp)' },
                ]}
              />
              <Select
                label="Primary Fitness Goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                options={[
                  { value: 'Hypertrophy & Strength', label: 'Hypertrophy & Strength' },
                  { value: 'Fat Loss & HIIT', label: 'Fat Loss & HIIT' },
                  { value: 'Mobility & Rehab', label: 'Mobility & Rehab' },
                  { value: 'Powerlifting', label: 'Powerlifting' },
                  { value: 'General Fitness', label: 'General Fitness' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment & Locker */}
        <div className="pt-2 border-t border-border-subtle">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> Initial Payment & Amenities
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Payment Method"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              options={[
                { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                { value: 'Credit Card', label: 'Credit / Debit Card (POS Machine)' },
                { value: 'Cash', label: 'Cash (Recorded at Desk)' },
                { value: 'Net Banking', label: 'Net Banking / NEFT' },
              ]}
            />
            <Input
              label="Locker # (Optional)"
              placeholder="e.g. 48"
              value={formData.lockerNumber}
              onChange={(e) => setFormData({ ...formData, lockerNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Section 4: Emergency Contact & Notes */}
        <div className="pt-2 border-t border-border-subtle">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span> Emergency Contact
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              placeholder="Name of relative / spouse"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
            />
            <Input
              label="Emergency Phone"
              placeholder="+91 98450 XXXXX"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Staff / Health Notes
              </label>
              <textarea
                rows={2}
                placeholder="Prior injuries, medical conditions, workout preferences..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-surface-200 text-zinc-100 text-sm rounded-lg border border-border placeholder:text-zinc-500 p-2.5 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40"
              />
            </div>
          </div>
        </div>
      </form>
    </Drawer>
  );
};
