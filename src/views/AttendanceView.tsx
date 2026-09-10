import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatCard } from '../components/ui/StatCard';
import {
  CalendarCheck,
  Search,
  UserCheck,
  Zap,
  Clock,
  Activity,
  AlertTriangle,
  Send,
  Download,
  Filter,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    checkIns,
    members,
    gymStats,
    setCheckInModalOpen,
    viewMemberProfile,
    openWhatsAppModal,
  } = useGym();

  const [activeTab, setActiveTab] = useState<'today' | 'absentees'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('all');

  // Filter today's checkins
  const filteredCheckIns = checkIns.filter((record) => {
    const matchesSearch =
      record.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.planName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrainer =
      selectedTrainer === 'all' ? true : record.trainerName.includes(selectedTrainer);

    return matchesSearch && matchesTrainer;
  });

  // At-Risk Absentees (Members with 0 visits in 10+ days or low attendance rate)
  const absenteeMembers = members.filter(
    (m) =>
      m.attendanceRate < 70 ||
      m.lastVisit.includes('days ago') ||
      m.lastVisit.includes('Never')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Reception Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Attendance & Floor Management
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time biometric/RFID access logs & member retention monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Exporting attendance CSV logs...')}
          >
            Export Logs
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Zap className="w-3.5 h-3.5" />}
            onClick={() => setCheckInModalOpen(true)}
          >
            Instant Check-In Desk
          </Button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Today's Total Check-Ins"
          value={gymStats.todayAttendance}
          subValue="Athletes today"
          trend={{ value: 12.8, isPositive: true, periodText: 'vs last week' }}
          icon={<CalendarCheck className="w-4 h-4 text-emerald-400" />}
          variant="brand"
        />

        <StatCard
          label="Current Floor Occupancy"
          value={`${gymStats.currentFloorCount} / ${gymStats.peakCapacity}`}
          subValue="35% load"
          icon={<Activity className="w-4 h-4 text-cyan-400" />}
          variant="cyan"
        />

        <StatCard
          label="Peak Workout Window"
          value="6:30 - 8:30 PM"
          subValue="Evening rush"
          icon={<Clock className="w-4 h-4 text-purple-400" />}
        />

        <StatCard
          label="At-Risk Absentees"
          value={absenteeMembers.length}
          subValue="Inactive >7 days"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          variant="warning"
          actionLabel="View churn prevention list"
          onActionClick={() => setActiveTab('absentees')}
        />
      </div>

      {/* Tab Switcher & Filter Bar */}
      <div className="p-3 bg-surface-300 border border-border rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-subtle">
        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-surface-50 text-white border border-border shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-200'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Live Check-Ins</span>
            <span className="text-[10px] font-mono opacity-80">({checkIns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('absentees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'absentees'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Absentee Retention Watch</span>
            <span className="text-[10px] font-mono opacity-80">({absenteeMembers.length})</span>
          </button>
        </div>

        {/* Search & Trainer Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search check-ins..."
              className="w-full bg-surface-200 text-xs text-zinc-100 placeholder:text-zinc-500 rounded-lg border border-border-subtle pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={selectedTrainer}
            onChange={(e) => setSelectedTrainer(e.target.value)}
            className="bg-surface-200 text-xs text-zinc-300 rounded-lg border border-border-subtle py-1.5 px-2.5 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Coaches</option>
            <option value="Vikram">Coach Vikram</option>
            <option value="Priya">Coach Priya</option>
            <option value="Amit">Coach Amit</option>
          </select>
        </div>
      </div>

      {/* Content for Tab 1: Today's Check-ins */}
      {activeTab === 'today' && (
        <div className="rounded-xl border border-border bg-surface-300 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-200/90 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Time Log</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Membership Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Workout Goal</th>
                  <th className="py-3 px-4">Assigned Coach</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredCheckIns.length > 0 ? (
                  filteredCheckIns.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-200/60 transition-colors group cursor-pointer"
                      onClick={() => viewMemberProfile(item.memberId)}
                    >
                      {/* Check-in Time */}
                      <td className="py-3 px-4 font-mono font-bold text-brand-400">
                        {item.checkInTime}
                      </td>

                      {/* Member */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface-100 border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                            {item.memberAvatar ? (
                              <img src={item.memberAvatar} alt={item.memberName} className="w-full h-full object-cover" />
                            ) : (
                              item.memberName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                              {item.memberName}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">{item.memberCode}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-4 text-zinc-300 font-medium">
                        {item.planName}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge variant={item.status} size="xs">
                          {item.status}
                        </Badge>
                      </td>

                      {/* Goal */}
                      <td className="py-3 px-4 text-zinc-400">
                        {item.workoutGoal}
                      </td>

                      {/* Trainer */}
                      <td className="py-3 px-4 text-zinc-300 font-medium">
                        {item.trainerName}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewMemberProfile(item.memberId);
                          }}
                          className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      No check-in logs found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for Tab 2: Absentee Watch List (Churn Prevention) */}
      {activeTab === 'absentees' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Absentee Churn Prevention Engine
                </h4>
                <p className="text-xs text-zinc-400">
                  Members who haven't visited in 7+ days are 4x more likely to cancel at renewal. Send encouragement WhatsApp messages.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {absenteeMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-surface-300 border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-surface-100 border border-border-subtle overflow-hidden flex items-center justify-center font-bold text-zinc-300">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                        <div className="text-[11px] text-zinc-400">{m.planName}</div>
                      </div>
                    </div>
                    <Badge variant={m.status} size="xs">
                      {m.status}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Last Visit:</span>
                      <span className="font-semibold text-rose-400">{m.lastVisit}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Attendance Consistency:</span>
                      <span className="font-mono text-zinc-300">{m.attendanceRate}%</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Coach:</span>
                      <span className="text-zinc-300">{m.assignedTrainer}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => viewMemberProfile(m.id)}
                  >
                    View Dossier
                  </Button>
                  <Button
                    size="xs"
                    variant="warning"
                    leftIcon={<Send className="w-3 h-3" />}
                    onClick={() => openWhatsAppModal(m, `Hi ${m.name.split(' ')[0]}, we missed you at Pulse Fitness this week! How is your training schedule going? Let us know if you want to book a catchup session with ${m.assignedTrainer}.`)}
                  >
                    Nudge on WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
