import React from 'react';
import { useGym } from '../context/GymContext';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Users,
  CalendarCheck,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  Send,
  UserCheck,
  Activity,
  Phone,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { REVENUE_CHART_DATA, HOURLY_ATTENDANCE_DATA } from '../data/mockData';

export const OverviewView: React.FC = () => {
  const {
    gymStats,
    retentionStats,
    retentionProfiles,
    members,
    checkIns,
    payments,
    setActiveView,
    viewMemberProfile,
    openWhatsAppModal,
    setCheckInModalOpen,
    setAddMemberModalOpen,
    openEndOfDayModal,
  } = useGym();

  const topAtRiskProfiles = retentionProfiles
    .filter((p) => p.status !== 'cancelled' && (p.riskLevel === 'critical' || p.riskLevel === 'high' || p.riskLevel === 'moderate'))
    .slice(0, 3);

  const customTooltipFormatter = (value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue'];

  return (
    <div className="space-y-6">
      {/* Executive Fast Command Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-300 border border-white/[0.04]">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>
            Live Floor: <strong className="text-white font-mono">{gymStats.currentFloorCount}</strong> athletes • Today's Check-Ins: <strong className="text-white font-mono">{gymStats.todayAttendance}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setActiveView('front_desk')}
          >
            <Zap className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            Front Desk Console
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={openEndOfDayModal}
          >
            <CalendarCheck className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
            End of Day Shift Summary
          </Button>
        </div>
      </div>

      {/* 5-Second Executive Glance KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Members */}
        <StatCard
          label="Active Members"
          value={gymStats.activeMembers}
          subValue={`of ${gymStats.totalMembers} total`}
          trend={{ value: 9.3, isPositive: true, periodText: 'vs last month' }}
          icon={<Users className="w-4 h-4 text-sky-400" />}
          actionLabel="View all members"
          onActionClick={() => setActiveView('members')}
        />

        {/* KPI 2: Today's Attendance */}
        <StatCard
          label="Today's Attendance"
          value={gymStats.todayAttendance}
          subValue={`Floor: ${gymStats.currentFloorCount}/${gymStats.peakCapacity}`}
          trend={{ value: 14.2, isPositive: true, periodText: 'vs yesterday' }}
          icon={<CalendarCheck className="w-4 h-4 text-emerald-400" />}
          variant="cyan"
          actionLabel="Live check-in log"
          onActionClick={() => setActiveView('attendance')}
        />

        {/* KPI 3: Monthly Revenue */}
        <StatCard
          label="Monthly Revenue (MTD)"
          value={`₹${gymStats.monthlyRevenueINR.toLocaleString('en-IN')}`}
          subValue="+23 signups"
          trend={{ value: gymStats.mrrGrowthRate, isPositive: true, periodText: 'vs Aug 2026' }}
          icon={<IndianRupee className="w-4 h-4 text-brand-400" />}
          variant="brand"
          actionLabel="View revenue ledger"
          onActionClick={() => setActiveView('payments')}
        />

        {/* KPI 4: REVENUE AT RISK (Retention Intelligence Gateway) */}
        <StatCard
          label="Revenue At Risk (7d)"
          value={`₹${retentionStats.revenueAtRisk7DaysINR.toLocaleString('en-IN')}`}
          subValue={`${retentionStats.totalAtRiskCount} members need attention`}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          variant="warning"
          actionLabel="Open Retention Desk"
          onActionClick={() => setActiveView('retention')}
        />
      </div>

      {/* Hero Feature Section: Retention Command Gateway */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-500/[0.08] via-surface-300 to-surface-300 shadow-surface relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-radial from-amber-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Retention Intelligence: {retentionStats.totalAtRiskCount} Members Require Action
              </h3>
              <span className="text-xs bg-amber-500/15 text-amber-300 font-mono px-2.5 py-0.5 rounded-full font-semibold">
                ₹{retentionStats.revenueAtRisk7DaysINR.toLocaleString('en-IN')} at Risk (7d)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
              {retentionStats.highRiskCount + retentionStats.criticalRiskCount} high-risk athletes and {retentionStats.inactive7DaysCount} inactive members (7+ days). Open the Retention Command Center to view explainable reasons and prioritized outreach actions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => setActiveView('retention')}
            >
              Open Retention Desk
            </Button>
          </div>
        </div>

        {/* Top Priority At-Risk Members Quick Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {topAtRiskProfiles.map((profile) => {
            const memberObj = members.find((m) => m.id === profile.memberId);
            return (
              <div
                key={profile.memberId}
                className="p-3.5 rounded-xl bg-surface-200/80 hover:bg-surface-200 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-surface-100 overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        profile.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <button
                        onClick={() => viewMemberProfile(profile.memberId)}
                        className="text-xs font-bold text-white hover:text-brand-300 truncate block text-left"
                      >
                        {profile.name}
                      </button>
                      <span className="text-[11px] text-zinc-400 truncate block font-mono">
                        {profile.planName} • ₹{profile.planPriceINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono shrink-0 ${
                      profile.riskLevel === 'critical'
                        ? 'bg-rose-500/20 text-rose-300'
                        : profile.riskLevel === 'high'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    #{profile.priorityRank} {profile.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-zinc-300 line-clamp-1">
                  • {profile.reasons[0] || 'Requires retention follow-up'}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <div className="text-zinc-400 text-[11px] font-mono">
                    Last: <strong className="text-zinc-200">{profile.daysSinceLastVisit === 0 ? 'Today' : `${profile.daysSinceLastVisit}d ago`}</strong>
                  </div>
                  <button
                    onClick={() => {
                      if (memberObj) openWhatsAppModal(memberObj);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Outreach</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts & Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Progression (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-surface-300 shadow-surface flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Monthly Revenue Velocity</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                FY 2026 Collection trajectory vs Target in INR (₹)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>
                <span className="text-zinc-300">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600"></span>
                <span className="text-zinc-400">Target</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={customTooltipFormatter}
                  contentStyle={{
                    backgroundColor: '#151922',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.5)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#71717a"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Membership Health Breakdown */}
        <div className="rounded-2xl p-6 bg-surface-300 shadow-surface flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-0.5">Membership Health</h3>
            <p className="text-xs text-zinc-400 mb-5">Current roster lifecycle distribution</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active & Retained
                  </span>
                  <span className="font-mono text-white font-semibold">247 (87%)</span>
                </div>
                <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Expiring (&lt;7 days)
                  </span>
                  <span className="font-mono text-amber-300 font-semibold">17 (6%)</span>
                </div>
                <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Overdue / Expired
                  </span>
                  <span className="font-mono text-rose-300 font-semibold">12 (4%)</span>
                </div>
                <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Frozen / Medical Hold
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">8 (3%)</span>
                </div>
                <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: '3%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-zinc-400">30-Day Retention Rate:</span>
            <span className="font-bold text-emerald-400 font-mono">89.2%</span>
          </div>
        </div>
      </div>

      {/* Live Floor Density & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor Traffic Peak Hours */}
        <div className="rounded-2xl p-6 bg-surface-300 shadow-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Today's Hourly Peak Load</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Occupancy distribution (6:00 AM - 10:00 PM)</p>
            </div>
            <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md">
              Peak: 86 at 7 PM
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_ATTENDANCE_DATA}>
                <XAxis
                  dataKey="hour"
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151922',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.5)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Check-ins Feed */}
        <div className="rounded-2xl p-6 bg-surface-300 shadow-surface flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Live Check-ins Stream</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Instant floor logs today</p>
            </div>
            <button
              onClick={() => setActiveView('attendance')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              View Full Desk →
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {checkIns.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-surface-200/70 flex items-center justify-between hover:bg-surface-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-100 overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                    {log.memberAvatar ? (
                      <img src={log.memberAvatar} alt={log.memberName} className="w-full h-full object-cover" />
                    ) : (
                      log.memberName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{log.memberName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{log.memberCode}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {log.planName} • {log.workoutGoal}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-brand-400 block">
                    {log.checkInTime}
                  </span>
                  <span className="text-[10px] text-zinc-400">{log.trainerName.split(' ')[1]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
            <span className="text-zinc-400">Reception Scanner Status:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Logging
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
