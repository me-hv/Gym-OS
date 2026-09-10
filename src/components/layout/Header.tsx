import React, { useState } from 'react';
import { useGym, ActiveNavView } from '../../context/GymContext';
import {
  Search,
  Zap,
  UserPlus,
  Bell,
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedMemberId,
    members,
    gymStats,
    setCheckInModalOpen,
    setAddMemberModalOpen,
    setCommandPaletteOpen,
    openWhatsAppModal,
  } = useGym();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case 'overview':
        return {
          category: 'Gym OS',
          title: 'Executive Dashboard & Overview',
          subtitle: 'Real-time financial health, floor capacity, and retention telemetry',
        };
      case 'members':
        return {
          category: 'Directory',
          title: 'Active Members Roster',
          subtitle: `${gymStats.activeMembers} registered athletes & membership tracking`,
        };
      case 'profile': {
        const mem = members.find((m) => m.id === selectedMemberId);
        return {
          category: 'Members',
          title: mem ? mem.name : 'Member Profile',
          subtitle: mem ? `${mem.memberCode} • ${mem.planName} • ${mem.phone}` : 'Detailed Dossier',
        };
      }
      case 'attendance':
        return {
          category: 'Operations',
          title: 'Live Attendance & Floor Density',
          subtitle: `${gymStats.todayAttendance} check-ins recorded today • ${gymStats.currentFloorCount} currently on floor`,
        };
      case 'memberships':
        return {
          category: 'Configuration',
          title: 'Membership Plans & Packages',
          subtitle: 'Tier pricing, subscription durations, and amenity entitlements',
        };
      case 'payments':
        return {
          category: 'Finance',
          title: 'Payments & Invoicing Ledger',
          subtitle: `₹${gymStats.monthlyRevenueINR.toLocaleString('en-IN')} collected this month • GST compliant ledger`,
        };
      default:
        return { category: 'Gym OS', title: 'Dashboard', subtitle: '' };
    }
  };

  const currentViewMeta = getBreadcrumbTitle();
  const expiringMembers = members.filter((m) => m.status === 'expiring' || m.daysRemaining <= 7);

  return (
    <header className="h-16 px-6 border-b border-border bg-surface-300/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            <span>{currentViewMeta.category}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-300 font-semibold">{currentViewMeta.title}</span>
          </div>
          <p className="text-xs text-zinc-400 truncate hidden lg:block">{currentViewMeta.subtitle}</p>
        </div>
      </div>

      {/* Center / Right Control Bar */}
      <div className="flex items-center gap-3">
        {/* Global Search Shortcut Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 bg-surface-200 hover:bg-surface-100 border border-border-subtle hover:border-border rounded-lg text-xs text-zinc-400 transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline">Search athletes, plans, actions...</span>
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-zinc-400 bg-surface-100 px-1.5 py-0.5 rounded border border-border-subtle">
            ⌘K
          </kbd>
        </button>

        {/* Live Capacity Indicator Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200/80 border border-border-subtle text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="text-zinc-400">Floor:</span>
          <strong className="text-zinc-200 tabular-nums">
            {gymStats.currentFloorCount} / {gymStats.peakCapacity}
          </strong>
        </div>

        {/* Action Buttons */}
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Zap className="w-3.5 h-3.5 text-brand-400" />}
          onClick={() => setCheckInModalOpen(true)}
        >
          <span className="hidden sm:inline">Quick</span> Check-In
        </Button>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          onClick={() => setAddMemberModalOpen(true)}
        >
          Enroll Member
        </Button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg bg-surface-200 hover:bg-surface-100 border border-border-subtle text-zinc-400 hover:text-white transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {gymStats.expiringIn7DaysCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-zinc-950 font-bold rounded-full text-[9px] flex items-center justify-center border border-surface-300">
                {gymStats.expiringIn7DaysCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-300 border border-border rounded-xl shadow-modal z-50 p-3 animate-slide-down">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
                <span className="text-xs font-semibold text-white">Critical Retention Alerts</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  {expiringMembers.length} Expiring
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {expiringMembers.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg bg-surface-200/90 border border-border-subtle flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{m.name}</div>
                      <div className="text-[10px] text-amber-300/90">
                        {m.planName} • Expiring in {m.daysRemaining} days
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="warning"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        openWhatsAppModal(m);
                      }}
                    >
                      WhatsApp
                    </Button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsNotificationsOpen(false);
                  setActiveView('overview');
                }}
                className="w-full mt-2 pt-2 border-t border-border-subtle text-[11px] text-center text-brand-400 hover:text-brand-300 block font-medium"
              >
                View all Revenue at Risk →
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
