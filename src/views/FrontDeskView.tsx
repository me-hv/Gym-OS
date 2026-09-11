import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FastCheckInResult, Member, OnboardingQueueItem } from '../types';
import {
  getExpiringTodayQueue,
  getOnboardingQueue,
  searchMembersRanked,
} from '../services/frontDeskService';
import {
  Scan,
  Search,
  UserCheck,
  LogOut,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  CreditCard,
  FileText,
  UserPlus,
  ShieldCheck,
  Activity,
  Phone,
  Flame,
  User,
  Zap,
  ArrowUpRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const FrontDeskView: React.FC = () => {
  const {
    members,
    checkIns,
    payments,
    gymStats,
    dailySummary,
    fastCheckIn,
    checkOutMember,
    viewMemberProfile,
    openRenewModal,
    openWhatsAppModal,
    openPaymentModal,
    openAddNoteModal,
    openEndOfDayModal,
    setAddMemberModalOpen,
    organization,
  } = useGym();

  const [scanQuery, setScanQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<FastCheckInResult | null>(null);
  const [floorSearch, setFloorSearch] = useState('');
  const [activeQueueTab, setActiveQueueTab] = useState<'expiring' | 'onboarding' | 'overdue'>('expiring');

  const scanInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the scanner input on mount
  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  // Filter members currently on floor
  const floorMembers = members.filter((m) => {
    const isCurrentlyCheckedIn = checkIns.some(
      (c) => c.memberId === m.id && c.isToday && !c.checkOutTime && c.isOnFloor !== false
    );
    const matchesSearch =
      m.name.toLowerCase().includes(floorSearch.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(floorSearch.toLowerCase()) ||
      m.phone.includes(floorSearch);
    return isCurrentlyCheckedIn && matchesSearch;
  });

  // Action Queues data
  const expiringQueue = getExpiringTodayQueue(members);
  const onboardingQueue = getOnboardingQueue(members);
  const overdueMembers = members.filter((m) => m.paymentStatus === 'overdue');

  // Ranked search suggestions when typing
  const searchSuggestions = scanQuery.trim().length >= 2 ? searchMembersRanked(members, scanQuery).slice(0, 5) : [];

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanQuery.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fastCheckIn(scanQuery.trim());
      setFeedbackResult(res);
      if (res.status === 'confirmed') {
        setScanQuery('');
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => scanInputRef.current?.focus(), 100);
    }
  };

  const handlePerformCheckOut = async (memberId: string) => {
    await checkOutMember(memberId);
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Live Floor Occupancy Gauge */}
        <div className="col-span-2 p-4 rounded-xl bg-surface-1 border border-surface-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400">
                Live Gym Floor Occupancy
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400">Cap: {organization.peakCapacity}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{dailySummary.currentFloorCount}</span>
              <span className="text-xs text-zinc-400">athletes active</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {Math.round((dailySummary.currentFloorCount / organization.peakCapacity) * 100)}%
              </span>
              <div className="text-[11px] text-zinc-500">of max floor capacity</div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-surface-3 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailySummary.currentFloorCount / organization.peakCapacity > 0.85
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{
                width: `${Math.min(100, Math.round((dailySummary.currentFloorCount / organization.peakCapacity) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Today's Check-Ins</span>
            <UserCheck className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono mt-1">{dailySummary.todayCheckInsCount}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Peak hour: {dailySummary.peakFloorCount} active</div>
          </div>
        </div>

        {/* Collections Today */}
        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Today's Collections</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{dailySummary.paymentsCollectedINR.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{dailySummary.paymentsCount} transactions logged</div>
          </div>
        </div>

        {/* Expiring / Onboarding Alert */}
        <div className="p-4 rounded-xl bg-surface-1 border border-surface-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Action Required</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {dailySummary.expiringTodayCount + overdueMembers.length}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {dailySummary.expiringTodayCount} expiring today • {overdueMembers.length} overdue
            </div>
          </div>
        </div>
      </div>

      {/* Fast Check-In Scanner & Input Console */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-1 via-surface-1 to-surface-2 border border-surface-2 shadow-2xl relative">
        <form onSubmit={handleScanSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-300 flex items-center gap-2">
              <Scan className="w-4 h-4 text-brand-400" />
              <span>Fast Check-In & Barcode Scanner Console</span>
            </label>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="hidden sm:inline">Scanner ready</span>
              <kbd className="px-2 py-0.5 text-[10px] font-mono bg-surface-3 text-zinc-300 rounded border border-surface-4">
                Enter ↵
              </kbd>
            </div>
          </div>

          <div className="relative">
            <input
              ref={scanInputRef}
              type="text"
              value={scanQuery}
              onChange={(e) => {
                setScanQuery(e.target.value);
                if (feedbackResult) setFeedbackResult(null);
              }}
              placeholder="Scan barcode or type Member Code (e.g. GYM-2024-001), Mobile (+91), or Athlete Name..."
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-surface-2 border border-surface-3 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 font-mono transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Scan className="w-5 h-5 text-brand-400 animate-pulse" />
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!scanQuery.trim() || isProcessing}
              >
                {isProcessing ? 'Verifying...' : 'Check In'}
              </Button>
            </div>
          </div>
        </form>

        {/* Live Search Suggestions Dropdown */}
        {searchSuggestions.length > 0 && !feedbackResult && (
          <div className="mt-3 p-2 rounded-xl bg-surface-2 border border-surface-3 space-y-1">
            <div className="text-[11px] font-semibold uppercase text-zinc-400 px-2 py-1">
              Matching Athletes ({searchSuggestions.length})
            </div>
            {searchSuggestions.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-3 transition-colors text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-400 font-bold flex items-center justify-center text-xs">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{m.name}</span>
                    <span className="ml-2 font-mono text-xs text-zinc-400">({m.memberCode})</span>
                    <span className="ml-2 text-xs text-zinc-500">• {m.planName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status}>
                    {m.status.toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setScanQuery(m.memberCode);
                      fastCheckIn(m.memberCode).then(setFeedbackResult);
                    }}
                  >
                    Check In
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instant Feedback Banner */}
        {feedbackResult && (
          <div
            className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
              feedbackResult.status === 'confirmed'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : feedbackResult.status === 'duplicate'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : feedbackResult.status === 'expired'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : feedbackResult.status === 'frozen'
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedbackResult.status === 'confirmed' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
              {feedbackResult.status === 'duplicate' && <Clock className="w-6 h-6 text-amber-400 shrink-0" />}
              {feedbackResult.status === 'expired' && <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />}
              {feedbackResult.status === 'frozen' && <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />}
              {feedbackResult.status === 'not_found' && <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />}

              <div>
                <div className="font-bold text-sm text-white">{feedbackResult.message}</div>
                {feedbackResult.member && (
                  <div className="text-xs text-zinc-300 mt-0.5 flex items-center gap-2">
                    <span>Plan: {feedbackResult.member.planName}</span>
                    <span>•</span>
                    <span>Code: {feedbackResult.member.memberCode}</span>
                    <span>•</span>
                    <span>Trainer: {feedbackResult.member.assignedTrainer || 'Unassigned'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contextual Quick Actions based on check-in state */}
            <div className="flex items-center gap-2 shrink-0">
              {feedbackResult.member && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => viewMemberProfile(feedbackResult.member!.id)}
                >
                  View Profile
                </Button>
              )}

              {feedbackResult.status === 'expired' && feedbackResult.member && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openRenewModal(feedbackResult.member!)}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Renew Now
                </Button>
              )}

              {feedbackResult.status === 'confirmed' && feedbackResult.member && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openAddNoteModal(feedbackResult.member!)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Add Note
                </Button>
              )}

              <Button size="sm" variant="ghost" onClick={() => setFeedbackResult(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3-Column Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Live Floor Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Gym Floor ({floorMembers.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Occupancy: {Math.round((floorMembers.length / organization.peakCapacity) * 100)}%
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={floorSearch}
              onChange={(e) => setFloorSearch(e.target.value)}
              placeholder="Search active athletes on floor..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-1 border border-surface-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500/50"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {floorMembers.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-surface-1 border border-surface-2 text-zinc-500 text-xs">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
                No athletes currently recorded on floor.
              </div>
            ) : (
              floorMembers.map((m) => {
                const todayRecord = checkIns.find(
                  (c) => c.memberId === m.id && c.isToday && !c.checkOutTime && c.isOnFloor !== false
                );
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-surface-1 border border-surface-2 hover:border-surface-3 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {m.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div
                          className="font-semibold text-white text-sm hover:text-brand-400 cursor-pointer transition-colors"
                          onClick={() => viewMemberProfile(m.id)}
                        >
                          {m.name}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-zinc-500">{m.memberCode}</span>
                          <span>•</span>
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {todayRecord?.checkInTime || 'In Floor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openAddNoteModal(m)}
                        title="Add Note"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handlePerformCheckOut(m.id)}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Check Out
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Action Queues (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Queue Tab Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-surface-1 border border-surface-2 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveQueueTab('expiring')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeQueueTab === 'expiring'
                    ? 'bg-surface-3 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Expiring ({expiringQueue.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueTab('onboarding')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeQueueTab === 'onboarding'
                    ? 'bg-surface-3 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Onboarding ({onboardingQueue.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueTab('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeQueueTab === 'overdue'
                    ? 'bg-surface-3 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Overdue ({overdueMembers.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {activeQueueTab === 'expiring' && (
              <>
                {expiringQueue.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-1 border border-surface-2 text-zinc-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                    No memberships expiring today.
                  </div>
                ) : (
                  expiringQueue.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-surface-1 border border-surface-2 hover:border-surface-3 transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className="font-semibold text-white text-sm cursor-pointer hover:text-brand-400 transition-colors"
                            onClick={() => viewMemberProfile(m.id)}
                          >
                            {m.name}
                          </div>
                          <div className="text-xs text-zinc-400">{m.planName}</div>
                        </div>
                        <Badge variant="danger">
                          {m.daysRemaining === 0 ? 'EXPIRES TODAY' : `${m.daysRemaining}D LEFT`}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-surface-2 text-xs">
                        <span className="font-mono text-zinc-400">{m.phone}</span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openWhatsAppModal(m)}
                            title="Send WhatsApp Renewal"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-400" />
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openRenewModal(m)}
                          >
                            Renew
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeQueueTab === 'onboarding' && (
              <>
                {onboardingQueue.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-1 border border-surface-2 text-zinc-500 text-xs">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-brand-400 opacity-60" />
                    No athletes in the 21-day onboarding window.
                  </div>
                ) : (
                  onboardingQueue.map((item) => (
                    <div
                      key={item.memberId}
                      className="p-3.5 rounded-xl bg-surface-1 border border-surface-2 hover:border-surface-3 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className="font-semibold text-white text-sm cursor-pointer hover:text-brand-400 transition-colors"
                            onClick={() => viewMemberProfile(item.memberId)}
                          >
                            {item.name}
                          </div>
                          <div className="text-xs text-zinc-400">
                            Coach: {item.assignedTrainer} • Goal: {item.goal}
                          </div>
                        </div>
                        <Badge variant="info">Day {item.daysActive} of 21</Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-2">
                        <div className="text-zinc-400">
                          Visits: <strong className="text-white font-mono">{item.totalVisits}</strong>
                          {item.needsFollowUp && (
                            <span className="text-amber-400 ml-2 font-medium">⚠️ Low attendance</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const mem = members.find((m) => m.id === item.memberId);
                            if (mem) openAddNoteModal(mem);
                          }}
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeQueueTab === 'overdue' && (
              <>
                {overdueMembers.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-1 border border-surface-2 text-zinc-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                    No overdue accounts. All collections settled.
                  </div>
                ) : (
                  overdueMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-surface-1 border border-surface-2 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className="font-semibold text-white text-sm cursor-pointer hover:text-brand-400 transition-colors"
                            onClick={() => viewMemberProfile(m.id)}
                          >
                            {m.name}
                          </div>
                          <div className="text-xs text-zinc-400">{m.planName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-rose-400 font-mono text-sm">
                            ₹{m.pendingAmountINR.toLocaleString('en-IN')}
                          </div>
                          <Badge variant="danger">OVERDUE</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-surface-2 text-xs">
                        <span className="font-mono text-zinc-400">{m.phone}</span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openPaymentModal(m)}
                        >
                          Collect Payment
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Column 3: Daily Activity & Quick Actions (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Action Station */}
          <div className="p-4 rounded-xl bg-surface-1 border border-surface-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Front Desk Quick Actions
            </div>
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full justify-start text-xs"
                onClick={() => setAddMemberModalOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Enroll New Athlete
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-xs"
                onClick={() => openPaymentModal()}
              >
                <CreditCard className="w-4 h-4 mr-2 text-emerald-400" />
                Record Direct Payment
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-xs"
                onClick={openEndOfDayModal}
              >
                <Calendar className="w-4 h-4 mr-2 text-brand-400" />
                End of Day Shift Summary
              </Button>
            </div>
          </div>

          {/* Today's Live Operational Feed */}
          <div className="p-4 rounded-xl bg-surface-1 border border-surface-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Live Daily Stream
              </span>
              <span className="text-[11px] font-mono text-zinc-500">IST</span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {checkIns.slice(0, 8).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-surface-2 border border-surface-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[130px]">{c.memberName}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{c.checkInTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="truncate max-w-[120px]">{c.planName}</span>
                    <span className={c.checkOutTime ? 'text-zinc-500' : 'text-emerald-400 font-medium'}>
                      {c.checkOutTime ? `Left ${c.checkOutTime}` : 'On Floor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
