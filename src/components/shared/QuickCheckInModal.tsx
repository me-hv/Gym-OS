import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Search, CheckCircle2, UserCheck, Zap, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const QuickCheckInModal: React.FC = () => {
  const {
    isCheckInModalOpen,
    setCheckInModalOpen,
    members,
    checkInMember,
    gymStats,
  } = useGym();

  const [query, setQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCheckInModalOpen) {
      setQuery('');
      setSelectedMember(null);
      setLastCheckIn(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isCheckInModalOpen]);

  if (!isCheckInModalOpen) return null;

  const filteredMembers = query.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.phone.includes(query) ||
          m.memberCode.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handlePerformCheckIn = async (memberToLog: any) => {
    const res = await checkInMember(memberToLog.id);
    if (res.success) {
      setLastCheckIn(memberToLog);
      setSelectedMember(null);
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <Modal
      isOpen={isCheckInModalOpen}
      onClose={() => setCheckInModalOpen(false)}
      title="Front Desk Instant Check-In"
      subtitle="Fast-lane RFID barcode scanner & member check-in console"
      maxWidth="lg"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-brand-400" />
            <span>
              Current Floor: <strong className="text-white">{gymStats.currentFloorCount}</strong> / {gymStats.peakCapacity}
            </span>
          </div>
          <Button variant="ghost" onClick={() => setCheckInModalOpen(false)}>
            Close Desk
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search / Scan input */}
        <div className="relative">
          <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>Scan Barcode or Search Member</span>
            <span className="text-[11px] text-brand-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3" /> Scanner Ready
            </span>
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Member Code (e.g. GYM-2024-001) or Name..."
              className="w-full bg-surface-200 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Success Confirmation Banner if just checked in */}
        {lastCheckIn && (
          <div className="p-4 rounded-xl bg-emerald-500/10 flex items-center justify-between animate-slide-down">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">
                  {lastCheckIn.name} Checked In!
                </h4>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  {lastCheckIn.planName} • Trainer: {lastCheckIn.assignedTrainer}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
              Entry Granted
            </span>
          </div>
        )}

        {/* Search Suggestions */}
        {filteredMembers.length > 0 && (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Found {filteredMembers.length} Members
            </span>
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-surface-200 hover:bg-surface-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-50 overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      m.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{m.name}</span>
                      <span className="text-xs text-zinc-400 font-mono">{m.memberCode}</span>
                    </div>
                    <div className="text-xs text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                      <span>{m.planName}</span>
                      <span>•</span>
                      <span>Locker: {m.lockerNumber || 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={m.status} size="xs">
                    {m.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    onClick={() => handlePerformCheckIn(m)}
                  >
                    Check In
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Quick Pick from Recent Active Members */}
        {query.trim() === '' && (
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Frequent Morning Athletes
            </span>
            <div className="grid grid-cols-2 gap-2">
              {members.slice(0, 4).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handlePerformCheckIn(m)}
                  className="p-3 rounded-xl bg-surface-200 hover:bg-surface-100 transition-all text-left flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">{m.planName}</div>
                  </div>
                  <Badge variant={m.status} size="xs">
                    {m.status}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
