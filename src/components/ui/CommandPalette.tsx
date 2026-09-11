import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '../../context/GymContext';
import {
  Search,
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Layers,
  UserPlus,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from './Badge';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    members,
    viewMemberProfile,
    setCheckInModalOpen,
    setAddMemberModalOpen,
    setCreatePlanModalOpen,
    openPaymentModal,
  } = useGym();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter members based on query
  const filteredMembers = query.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.phone.includes(query) ||
          m.memberCode.toLowerCase().includes(query.toLowerCase()) ||
          m.planName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const navigationActions = [
    {
      id: 'nav-overview',
      label: 'Go to Overview Dashboard',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4 text-brand-400" />,
      action: () => setActiveView('overview'),
    },
    {
      id: 'nav-members',
      label: 'Go to Members Directory',
      category: 'Navigation',
      icon: <Users className="w-4 h-4 text-sky-400" />,
      action: () => setActiveView('members'),
    },
    {
      id: 'nav-attendance',
      label: 'Go to Attendance & Check-in Desk',
      category: 'Navigation',
      icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
      action: () => setActiveView('attendance'),
    },
    {
      id: 'nav-memberships',
      label: 'Go to Membership Plans',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      action: () => setActiveView('memberships'),
    },
    {
      id: 'nav-payments',
      label: 'Go to Payments & Invoicing',
      category: 'Navigation',
      icon: <CreditCard className="w-4 h-4 text-amber-400" />,
      action: () => setActiveView('payments'),
    },
  ];

  const quickActions = [
    {
      id: 'act-checkin',
      label: 'Instant Check-in Desk',
      category: 'Actions',
      icon: <CalendarCheck className="w-4 h-4 text-brand-400" />,
      action: () => setCheckInModalOpen(true),
    },
    {
      id: 'act-add-member',
      label: 'Enroll New Member',
      category: 'Actions',
      icon: <UserPlus className="w-4 h-4 text-sky-400" />,
      action: () => setAddMemberModalOpen(true),
    },
    {
      id: 'act-record-payment',
      label: 'Record Offline Payment (UPI / Cash)',
      category: 'Actions',
      icon: <CreditCard className="w-4 h-4 text-amber-400" />,
      action: () => openPaymentModal(null),
    },
    {
      id: 'act-new-plan',
      label: 'Create New Membership Plan',
      category: 'Actions',
      icon: <PlusCircle className="w-4 h-4 text-purple-400" />,
      action: () => setCreatePlanModalOpen(true),
    },
  ];

  const filteredNavActions = navigationActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredQuickActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const executeAction = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Box */}
      <div className="relative w-full max-w-xl bg-surface-300 rounded-2xl shadow-modal z-10 overflow-hidden flex flex-col animate-slide-down">
        {/* Search input */}
        <div className="flex items-center px-4 py-3.5 bg-surface-200/90">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search athletes, or jump to view..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-zinc-400 bg-surface-100 px-2 py-0.5 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {/* Member Search Results */}
          {filteredMembers.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Athletes ({filteredMembers.length})
              </div>
              <div className="space-y-0.5">
                {filteredMembers.slice(0, 6).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      viewMemberProfile(member.id);
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm hover:bg-surface-100 text-zinc-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-surface-100 overflow-hidden shrink-0 flex items-center justify-center text-xs font-semibold text-zinc-300">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">{member.name}</span>
                          <span className="text-xs text-zinc-400 font-mono">{member.memberCode}</span>
                        </div>
                        <div className="text-xs text-zinc-400 truncate flex items-center gap-2">
                          <span>{member.planName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {member.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={member.status} size="xs">
                        {member.status}
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {filteredQuickActions.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {filteredQuickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeAction(action.action)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm hover:bg-surface-100 text-zinc-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-surface-200">
                        {action.icon}
                      </div>
                      <span className="font-medium text-zinc-200 group-hover:text-white">
                        {action.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">Execute</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          {filteredNavActions.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-0.5">
                {filteredNavActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeAction(action.action)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm hover:bg-surface-100 text-zinc-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-surface-200">
                        {action.icon}
                      </div>
                      <span className="font-medium text-zinc-200 group-hover:text-white">
                        {action.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">Jump</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {query.trim() &&
            filteredMembers.length === 0 &&
            filteredQuickActions.length === 0 &&
            filteredNavActions.length === 0 && (
              <div className="p-8 text-center text-zinc-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
                <p className="text-sm font-medium text-zinc-300">No matching commands or athletes</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Try searching by athlete name, phone number, or action.
                </p>
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-surface-200/50 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-[10px]">↑</kbd> <kbd className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-[10px]">↓</kbd></span>
            <span>Select: <kbd className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-[10px]">↵</kbd></span>
          </div>
          <span className="text-brand-400 font-medium">GYM OS</span>
        </div>
      </div>
    </div>
  );
};
