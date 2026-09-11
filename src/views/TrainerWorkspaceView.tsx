import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getTrainerWorkspaceData } from '../services/frontDeskService';
import {
  Dumbbell,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  Send,
  UserCheck,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';

const TRAINER_PROFILES = [
  { id: 'all', name: 'All Coaches / Facility Overview' },
  { id: 'vikram', name: 'Coach Vikram (Head Strength & Performance)' },
  { id: 'priya', name: 'Coach Priya (Functional & Hypertrophy)' },
  { id: 'amit', name: 'Coach Amit (CrossFit & Conditioning)' },
];

export const TrainerWorkspaceView: React.FC = () => {
  const {
    members,
    checkIns,
    memberNotes,
    viewMemberProfile,
    openAddNoteModal,
    openWhatsAppModal,
    currentUser,
  } = useGym();

  const [selectedCoach, setSelectedCoach] = useState<string>(
    currentUser.role === 'trainer' ? 'vikram' : 'all'
  );
  const [filterMode, setFilterMode] = useState<'all' | 'on_floor' | 'at_risk'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const trainerAthletes = getTrainerWorkspaceData(members, checkIns, selectedCoach);

  const filteredAthletes = trainerAthletes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterMode === 'on_floor') return item.isCurrentlyOnFloor;
    if (filterMode === 'at_risk') return item.hasAttendanceDecline;
    return true;
  });

  const onFloorCount = trainerAthletes.filter((a) => a.isCurrentlyOnFloor).length;
  const atRiskCount = trainerAthletes.filter((a) => a.hasAttendanceDecline).length;

  return (
    <div className="space-y-6">
      {/* Header & Coach Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-surface-1 via-surface-1 to-surface-2 border border-surface-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Trainer & Coaching Workspace</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Client programming, floor athlete check-ins, progression notes & attendance alerts
            </p>
          </div>
        </div>

        {/* Coach Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-zinc-400 font-medium shrink-0">Active Coach:</label>
          <select
            value={selectedCoach}
            onChange={(e) => setSelectedCoach(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-surface-2 border border-surface-3 text-white text-xs font-semibold focus:outline-none focus:border-brand-500/50"
          >
            {TRAINER_PROFILES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainer Operational Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Assigned Athletes</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{trainerAthletes.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Active rosters under coach</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>On Floor Right Now</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono flex items-center gap-2">
            <span>{onFloorCount}</span>
            {onFloorCount > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Currently training on gym floor</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Attendance Decline</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{atRiskCount}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">&lt;65% attendance or frequency drop</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Staff & Client Notes</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{memberNotes.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Recorded progress notes</div>
        </div>
      </div>

      {/* Main Filter & Athlete List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Athlete Roster (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-surface-1 border border-surface-2 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'all'
                    ? 'bg-surface-3 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Athletes ({trainerAthletes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('on_floor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterMode === 'on_floor'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                On Floor ({onFloorCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('at_risk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterMode === 'at_risk'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Decline Alerts ({atRiskCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search athlete or code..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-1 border border-surface-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500/50"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredAthletes.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-surface-1 border border-surface-2 text-zinc-500 text-xs">
                <Users className="w-10 h-10 mx-auto mb-2 text-zinc-600 opacity-60" />
                No athletes matching the active filter.
              </div>
            ) : (
              filteredAthletes.map((athlete) => {
                const fullMember = members.find((m) => m.id === athlete.memberId);
                return (
                  <div
                    key={athlete.memberId}
                    className="p-4 rounded-xl bg-surface-1 border border-surface-2 hover:border-surface-3 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-sm">
                          {athlete.avatarUrl ? (
                            <img
                              src={athlete.avatarUrl}
                              alt={athlete.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            athlete.name.split(' ').map((n) => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold text-white text-sm hover:text-brand-400 cursor-pointer transition-colors"
                              onClick={() => viewMemberProfile(athlete.memberId)}
                            >
                              {athlete.name}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">{athlete.memberCode}</span>
                            {athlete.isCurrentlyOnFloor && (
                              <Badge variant="info">ON FLOOR NOW</Badge>
                            )}
                            {athlete.hasAttendanceDecline && (
                              <Badge variant="warning">ATTENDANCE DECLINE</Badge>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span>Plan: {athlete.planName}</span>
                            <span>•</span>
                            <span>Goal: <strong className="text-zinc-200">{athlete.goal}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          {athlete.attendanceRate}%
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {athlete.weeklyFrequency}x / week
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-2 text-xs">
                      <div className="text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Last Visit: <strong className="text-zinc-300">{athlete.lastVisit}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {fullMember && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              openWhatsAppModal(
                                fullMember,
                                `Hi ${fullMember.name.split(' ')[0]}, Coach Vikram from ${fullMember.planName} here! Noticed you missed a couple of sessions this week. Let's schedule your next workout — what time works best for you?`
                              )
                            }
                          >
                            <Send className="w-3 h-3 mr-1 text-emerald-400" />
                            WhatsApp
                          </Button>
                        )}
                        {fullMember && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openAddNoteModal(fullMember)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Add Note
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewMemberProfile(athlete.memberId)}
                        >
                          Dossier
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

        {/* Right: Coach Notes Stream (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Recent Coaching Notes</span>
            </h3>
            <span className="text-xs text-zinc-500">{memberNotes.length} total</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {memberNotes.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface-1 border border-surface-2 text-zinc-500 text-xs">
                No coaching notes recorded yet.
              </div>
            ) : (
              memberNotes.map((n) => {
                const targetMember = members.find((m) => m.id === n.memberId);
                return (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-surface-1 border border-surface-2 hover:border-surface-3 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">
                        {targetMember ? (
                          <span
                            className="hover:text-brand-400 cursor-pointer transition-colors"
                            onClick={() => viewMemberProfile(targetMember.id)}
                          >
                            {targetMember.name}
                          </span>
                        ) : (
                          'Athlete'
                        )}
                      </div>
                      <Badge variant="neutral">{n.category.toUpperCase()}</Badge>
                    </div>

                    <p className="text-zinc-300 leading-relaxed bg-surface-2 p-2 rounded-lg border border-surface-3">
                      "{n.note}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>By: <strong className="text-zinc-400">{n.authorName}</strong></span>
                      <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
