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
    members,
    checkIns,
    payments,
    setActiveView,
    viewMemberProfile,
    openWhatsAppModal,
    setCheckInModalOpen,
    setAddMemberModalOpen,
  } = useGym();

  const expiringMembers = members
    .filter((m) => m.status === 'expiring' || (m.daysRemaining <= 7 && m.daysRemaining >= 0))
    .slice(0, 5);

  const customTooltipFormatter = (value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue'];

  return (
    <div className="space-y-6">
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

        {/* KPI 4: REVENUE AT RISK (High Priority Concept) */}
        <StatCard
          label="Revenue At Risk"
          value={`₹${gymStats.revenueAtRiskINR.toLocaleString('en-IN')}`}
          subValue={`${gymStats.expiringIn7DaysCount} expiring in 7 days`}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          variant="warning"
          actionLabel="Engage expiring athletes"
          onActionClick={() => {
            const firstExp = expiringMembers[0];
            if (firstExp) openWhatsAppModal(firstExp);
          }}
        />
      </div>

      {/* Hero Feature Section: Revenue At Risk Retention Hub */}
      <div className="rounded-xl p-5 bg-gradient-to-r from-amber-500/10 via-surface-300 to-surface-300 border border-amber-500/30 shadow-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-radial from-amber-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Revenue Retention Command: ₹{gymStats.revenueAtRiskINR.toLocaleString('en-IN')} Expiring
              </h3>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full font-semibold">
                {gymStats.expiringIn7DaysCount} Members at Risk
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              These members expire within the next 7 days. Trigger pre-composed, personalized WhatsApp renewal offers with 1-click UPI checkout links to protect your monthly recurring cashflow.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="warning"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => {
                if (expiringMembers[0]) openWhatsAppModal(expiringMembers[0]);
              }}
            >
              Batch WhatsApp Outreach
            </Button>
          </div>
        </div>

        {/* Expiring Members At-A-Glance List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {expiringMembers.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-lg bg-surface-200/90 border border-border-subtle hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-100 border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={() => viewMemberProfile(member.id)}
                      className="text-xs font-bold text-white hover:text-brand-300 truncate block text-left"
                    >
                      {member.name}
                    </button>
                    <span className="text-[11px] text-zinc-400 truncate block">
                      {member.planName}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    member.daysRemaining <= 2
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {member.daysRemaining === 0
                    ? 'Expires Today'
                    : member.daysRemaining < 0
                    ? 'Lapsed'
                    : `${member.daysRemaining}d left`}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs">
                <div className="text-zinc-400">
                  Attendance: <strong className="text-zinc-200">{member.attendanceRate}%</strong>
                </div>
                <button
                  onClick={() => openWhatsAppModal(member)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts & Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Progression (2 cols) */}
        <div className="lg:col-span-2 rounded-xl p-5 bg-surface-300 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Revenue Velocity</h3>
              <p className="text-xs text-zinc-400">
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
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={customTooltipFormatter}
                  contentStyle={{
                    backgroundColor: '#13161D',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '8px',
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
        <div className="rounded-xl p-5 bg-surface-300 border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Membership Health</h3>
            <p className="text-xs text-zinc-400 mb-4">Current roster lifecycle distribution</p>

            <div className="space-y-3.5">
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

          <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-zinc-400">30-Day Retention Rate:</span>
            <span className="font-bold text-emerald-400 font-mono">89.2%</span>
          </div>
        </div>
      </div>

      {/* Live Floor Density & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor Traffic Peak Hours */}
        <div className="rounded-xl p-5 bg-surface-300 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Today's Hourly Peak Load</h3>
              <p className="text-xs text-zinc-400">Occupancy distribution (6:00 AM - 10:00 PM)</p>
            </div>
            <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
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
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#13161D',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '8px',
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
        <div className="rounded-xl p-5 bg-surface-300 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Live Check-ins Stream</h3>
              <p className="text-xs text-zinc-400">Instant floor logs today</p>
            </div>
            <button
              onClick={() => setActiveView('attendance')}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium"
            >
              View Full Desk →
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {checkIns.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-surface-200/70 border border-border-subtle flex items-center justify-between hover:bg-surface-200 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface-100 border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
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

          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-zinc-400">Reception Scanner Status:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Logging
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
