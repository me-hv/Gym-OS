import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  AlertTriangle,
  Flame,
  Clock,
  TrendingDown,
  Phone,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  PauseCircle,
  CreditCard,
  Zap,
  Activity,
  User,
  ShieldCheck,
  IndianRupee,
  Filter,
} from 'lucide-react';
import { MemberRetentionProfile, RetentionSegment, RetentionRiskLevel } from '../types';
import { filterRetentionSegment } from '../services/retentionService';

export const RetentionView: React.FC = () => {
  const {
    members,
    retentionProfiles,
    retentionStats,
    viewMemberProfile,
    openWhatsAppModal,
    openRenewModal,
    logRetentionOutreach,
  } = useGym();

  const [activeSegment, setActiveSegment] = useState<RetentionSegment>('all_at_risk');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('all');
  const [isLoggingOutreach, setIsLoggingOutreach] = useState<string | null>(null);

  // Extract unique trainers for filter
  const trainers = useMemo(() => {
    const set = new Set<string>();
    retentionProfiles.forEach((p) => {
      if (p.assignedTrainer) set.add(p.assignedTrainer);
    });
    return Array.from(set);
  }, [retentionProfiles]);

  // Filter profiles based on segment, search, and trainer
  const filteredProfiles = useMemo(() => {
    let list = filterRetentionSegment(retentionProfiles, activeSegment);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.memberCode.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.planName.toLowerCase().includes(q)
      );
    }

    if (selectedTrainer !== 'all') {
      list = list.filter((p) => p.assignedTrainer === selectedTrainer);
    }

    return list;
  }, [retentionProfiles, activeSegment, searchQuery, selectedTrainer]);

  const segmentCounts = useMemo(() => {
    return {
      all_at_risk: filterRetentionSegment(retentionProfiles, 'all_at_risk').length,
      expiring_soon: filterRetentionSegment(retentionProfiles, 'expiring_soon').length,
      inactive_7d: filterRetentionSegment(retentionProfiles, 'inactive_7d').length,
      high_value: filterRetentionSegment(retentionProfiles, 'high_value').length,
      declining: filterRetentionSegment(retentionProfiles, 'declining').length,
      payment_overdue: filterRetentionSegment(retentionProfiles, 'payment_overdue').length,
      recovery_pool: filterRetentionSegment(retentionProfiles, 'recovery_pool').length,
      frozen: filterRetentionSegment(retentionProfiles, 'frozen').length,
    };
  }, [retentionProfiles]);

  const handleQuickOutreach = async (profile: MemberRetentionProfile) => {
    const member = members.find((m) => m.id === profile.memberId);
    if (!member) return;

    setIsLoggingOutreach(profile.memberId);
    try {
      await logRetentionOutreach(profile.memberId, profile.recommendedActionType);
      // Also open WhatsApp modal for user to review & send message
      openWhatsAppModal(member);
    } finally {
      setIsLoggingOutreach(null);
    }
  };

  const getRiskBadge = (level: RetentionRiskLevel, score: number) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 font-mono">
            <Flame className="w-3 h-3 text-rose-400" />
            {score}/100 CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 font-mono">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            {score}/100 HIGH
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            {score}/100 MODERATE
          </span>
        );
      case 'frozen':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 font-mono">
            <PauseCircle className="w-3 h-3 text-sky-400" />
            FROZEN
          </span>
        );
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 font-mono">
            <RefreshCw className="w-3 h-3 text-purple-400" />
            WIN-BACK POOL
          </span>
        );
      case 'new_member':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 font-mono">
            <Zap className="w-3 h-3 text-cyan-400" />
            ONBOARDING
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {score}/100 HEALTHY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Retention Health KPI Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue At Risk (7 Days)"
          value={`₹${retentionStats.revenueAtRisk7DaysINR.toLocaleString('en-IN')}`}
          subValue={`14d Exposure: ₹${retentionStats.revenueAtRisk14DaysINR.toLocaleString('en-IN')}`}
          trend={{ value: 12.5, isPositive: false, periodText: 'expiring this week' }}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          variant="warning"
        />

        <StatCard
          label="High & Critical Risk"
          value={`${retentionStats.highRiskCount + retentionStats.criticalRiskCount} Athletes`}
          subValue={`${retentionStats.criticalRiskCount} critical urgency`}
          trend={{ value: 0, isPositive: true, periodText: 'requires immediate contact' }}
          icon={<Flame className="w-4 h-4 text-rose-400" />}
          variant="danger"
        />

        <StatCard
          label="Inactive (7+ Days)"
          value={`${retentionStats.inactive7DaysCount} Members`}
          subValue="Alert threshold: 7 days"
          icon={<Clock className="w-4 h-4 text-orange-400" />}
          variant="warning"
        />

        <StatCard
          label="MTD Renewals & Win-Backs"
          value={`${retentionStats.renewalsThisMonthCount} Renewals`}
          subValue={`₹${retentionStats.recoveredRevenueMTDINR.toLocaleString('en-IN')} retained (${retentionStats.retentionRateDisplay})`}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          variant="brand"
        />
      </div>

      {/* 2. Control & Segment Toolbar */}
      <div className="bg-surface-300 rounded-2xl p-4 shadow-surface space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-400" />
              Retention Priority Command Queue
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ranked by combined churn risk and revenue exposure • Fully explainable operational guidance
            </p>
          </div>

          {/* Search & Trainer Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search athlete, code, plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-surface-200 border-0 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none"
              />
            </div>

            <select
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              className="bg-surface-200 border-0 text-xs text-zinc-200 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <option value="all">All Trainers</option>
              {trainers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segment Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all_at_risk', label: 'All At-Risk', count: segmentCounts.all_at_risk },
            { id: 'expiring_soon', label: 'Expiring Soon (≤7d)', count: segmentCounts.expiring_soon },
            { id: 'inactive_7d', label: 'Inactive 7+ Days', count: segmentCounts.inactive_7d },
            { id: 'high_value', label: 'High-Value at Risk', count: segmentCounts.high_value },
            { id: 'declining', label: 'Attendance Dropping', count: segmentCounts.declining },
            { id: 'payment_overdue', label: 'Overdue Payments', count: segmentCounts.payment_overdue },
            { id: 'recovery_pool', label: 'Win-Back Recovery', count: segmentCounts.recovery_pool },
            { id: 'frozen', label: 'Frozen Hold', count: segmentCounts.frozen },
          ].map((tab) => {
            const isActive = activeSegment === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSegment(tab.id as RetentionSegment)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-500 text-zinc-950 font-semibold shadow-xs'
                    : 'bg-surface-200 text-zinc-400 hover:text-zinc-200 hover:bg-surface-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-surface-300 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Operational Priority Queue List */}
      <div className="space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="bg-surface-300 rounded-2xl p-12 text-center shadow-surface">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">No Athletes in this Segment</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              All member accounts in this segment are in healthy standing or no records matched your search query.
            </p>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const memberObj = members.find((m) => m.id === profile.memberId);
            const isTopRanked = profile.priorityRank <= 3 && profile.priorityRank > 0;

            return (
              <div
                key={profile.memberId}
                className={`bg-surface-300 hover:bg-surface-200/90 transition-all rounded-2xl p-5 shadow-surface relative overflow-hidden ${
                  isTopRanked ? 'border-l-4 border-l-brand-500' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left Column: Rank, Avatar, Identity */}
                  <div className="flex items-start gap-4 min-w-[280px]">
                    <div className="flex flex-col items-center justify-center shrink-0 w-8">
                      {profile.priorityRank > 0 ? (
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                            profile.priorityRank === 1
                              ? 'bg-rose-500/20 text-rose-300'
                              : profile.priorityRank === 2
                              ? 'bg-orange-500/20 text-orange-300'
                              : profile.priorityRank === 3
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-surface-200 text-zinc-400'
                          }`}
                        >
                          #{profile.priorityRank}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">—</span>
                      )}
                    </div>

                    <div className="relative shrink-0">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center text-zinc-400 font-bold">
                          {profile.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white tracking-tight hover:text-brand-400 transition-colors cursor-pointer"
                            onClick={() => viewMemberProfile(profile.memberId)}>
                          {profile.name}
                        </h3>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {profile.memberCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 flex-wrap">
                        <span className="bg-surface-200 px-2 py-0.5 rounded-md font-medium text-zinc-300">
                          {profile.planName}
                        </span>
                        <span>•</span>
                        <span>{profile.assignedTrainer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Operational Signals & Factual Explainability */}
                  <div className="flex-1 w-full bg-surface-200/60 rounded-xl p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        {getRiskBadge(profile.riskLevel, profile.riskScore)}
                        <span className="text-xs font-mono font-semibold text-zinc-200">
                          ₹{profile.planPriceINR.toLocaleString('en-IN')} Value
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                        <span>
                          Last Visit:{' '}
                          <strong className="text-zinc-200">
                            {profile.daysSinceLastVisit === 0
                              ? 'Today'
                              : `${profile.daysSinceLastVisit}d ago`}
                          </strong>
                        </span>
                        <span>
                          Expiry:{' '}
                          <strong className={profile.daysRemaining <= 7 ? 'text-amber-300' : 'text-zinc-200'}>
                            {profile.daysRemaining < 0
                              ? `${Math.abs(profile.daysRemaining)}d ago`
                              : `${profile.daysRemaining}d`}
                          </strong>
                        </span>
                        {profile.attendanceTrendPercent !== 0 && (
                          <span
                            className={`flex items-center gap-0.5 ${
                              profile.attendanceTrendPercent < 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            <TrendingDown className="w-3 h-3" />
                            {profile.attendanceTrendPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Factual Explainability Bullet Points */}
                    <div className="space-y-1 pt-1">
                      {profile.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-300">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recommended Next Step Callout */}
                    <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <span className="font-semibold text-brand-400">Action:</span>
                        <span className="text-zinc-200">{profile.recommendedAction}</span>
                      </span>

                      {profile.outreachStatus === 'logged' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Outreach Logged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 1-Click Operational Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full lg:w-36 justify-center text-xs"
                      onClick={() => handleQuickOutreach(profile)}
                      disabled={isLoggingOutreach === profile.memberId}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Log Outreach
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full lg:w-36 justify-center text-xs"
                      onClick={() => {
                        if (memberObj) openRenewModal(memberObj);
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Renew Plan
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full lg:w-36 justify-center text-xs text-zinc-400 hover:text-white"
                      onClick={() => viewMemberProfile(profile.memberId)}
                    >
                      View Dossier
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
