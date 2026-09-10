import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import {
  Layers,
  Plus,
  Users,
  IndianRupee,
  Check,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { MembershipPlan } from '../types';

export const MembershipsView: React.FC = () => {
  const { plans, members, setCreatePlanModalOpen, viewMemberProfile, setActiveView } = useGym();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan-1');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const enrolledMembers = members.filter((m) => m.planId === selectedPlan.id);

  const totalPlanRevenue = plans.reduce((acc, p) => acc + p.totalRevenueINR, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Membership Plans & Pricing Architecture
          </h2>
          <p className="text-xs text-zinc-400">
            Configure subscription tiers, package durations, pricing in INR, and amenity entitlements
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setCreatePlanModalOpen(true)}
        >
          Create New Plan Tier
        </Button>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Active Subscription Plans"
          value={plans.length}
          subValue="Available tiers"
          icon={<Layers className="w-4 h-4 text-brand-400" />}
        />
        <StatCard
          label="Most Popular Plan"
          value="Annual Strength Pro"
          subValue="112 active athletes (45%)"
          icon={<Sparkles className="w-4 h-4 text-amber-400" />}
          variant="brand"
        />
        <StatCard
          label="Total Plan Yield"
          value={`₹${totalPlanRevenue.toLocaleString('en-IN')}`}
          subValue="Cumulative portfolio"
          icon={<IndianRupee className="w-4 h-4 text-emerald-400" />}
          variant="cyan"
        />
      </div>

      {/* Plans Card Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Active Plan Catalogue</h3>
          <span className="text-xs text-zinc-400">Click a plan to inspect enrolled athletes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`rounded-xl p-5 border cursor-pointer transition-all flex flex-col justify-between shadow-subtle ${
                  isSelected
                    ? 'bg-surface-200 border-brand-500/60 ring-1 ring-brand-500/30'
                    : 'bg-surface-300 border-border hover:border-zinc-700 hover:bg-surface-200/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-mono text-zinc-400 font-semibold">{plan.code}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{plan.name}</h4>
                    </div>
                    {plan.tag && (
                      <span className="text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">
                        {plan.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-extrabold text-white tabular-nums">
                      ₹{plan.priceINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-zinc-400">/ {plan.durationMonths} months</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-1.5 pt-3 border-t border-border-subtle">
                    {plan.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <span className="text-[11px] text-zinc-500 pl-5.5 block">
                        +{plan.features.length - 4} more benefits
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan Performance Footer */}
                <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    <strong className="text-white">{plan.activeMembersCount}</strong> athletes
                  </span>
                  <span className="font-mono font-bold text-brand-400">
                    ₹{plan.totalRevenueINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive: Enrolled Athletes for Selected Plan */}
      <div className="rounded-xl border border-border bg-surface-300 p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Athletes Enrolled under</span>
              <span className="text-brand-400">"{selectedPlan.name}"</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {enrolledMembers.length} members actively subscribed to this package tier
            </p>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setActiveView('members')}
          >
            View in Full Directory →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {enrolledMembers.length > 0 ? (
            enrolledMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => viewMemberProfile(m.id)}
                className="p-3 rounded-lg bg-surface-200 border border-border-subtle hover:border-brand-500/40 hover:bg-surface-100 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-50 border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      m.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-brand-300 truncate">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Exp: {m.expiryDate} ({m.daysRemaining}d)
                    </div>
                  </div>
                </div>

                <Badge variant={m.status} size="xs">
                  {m.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-6 text-center text-xs text-zinc-400">
              No members enrolled in this plan yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
