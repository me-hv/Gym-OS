import React from 'react';
import { useGym, ActiveNavView } from '../../context/GymContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Layers,
  CreditCard,
  Dumbbell,
  UserCheck,
  MessageSquare,
  BarChart3,
  Building2,
  ChevronDown,
  Zap,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    gymStats,
    organization,
    currentUser,
    signOut,
    setCheckInModalOpen,
  } = useGym();

  const primaryNavItems: { id: ActiveNavView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'members',
      label: 'Members',
      icon: <Users className="w-4 h-4" />,
      badge: gymStats.activeMembers,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <CalendarCheck className="w-4 h-4" />,
      badge: `${gymStats.todayAttendance}`,
    },
    {
      id: 'memberships',
      label: 'Memberships',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-4 h-4" />,
      badge: gymStats.overdueMembersCount > 0 ? `${gymStats.overdueMembersCount} due` : undefined,
    },
  ];

  const secondaryNavItems = [
    {
      id: 'trainers',
      label: 'Trainers',
      icon: <Dumbbell className="w-4 h-4" />,
      tag: 'Coming Soon',
    },
    {
      id: 'leads',
      label: 'Leads & Enquiries',
      icon: <UserCheck className="w-4 h-4" />,
      tag: 'Coming Soon',
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: <MessageSquare className="w-4 h-4" />,
      tag: 'Coming Soon',
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-4 h-4" />,
      tag: 'Coming Soon',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-surface-300 h-screen flex flex-col justify-between select-none sticky top-0 left-0 z-20">
      {/* Top Brand & Workspace Switcher */}
      <div className="flex flex-col">
        {/* Brand Wordmark */}
        <div className="h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-zinc-950 shadow-xs">
              <Zap className="w-4 h-4 fill-current stroke-zinc-950 stroke-[1.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">GYM</span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                OS
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            SaaS v1.0
          </span>
        </div>

        {/* Integrated Workspace Switcher */}
        <div className="px-3 pb-4">
          <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-surface-200/60 hover:bg-surface-200 transition-colors text-left group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                  {organization.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {organization.city} • {organization.currency}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300 shrink-0" />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 space-y-1">
          <div className="px-2.5 pb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
            Core Operations
          </div>
          {primaryNavItems.map((item) => {
            const isActive = activeView === item.id || (activeView === 'profile' && item.id === 'members');
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group select-none relative',
                  isActive
                    ? 'bg-surface-200/90 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-200/40'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-500 rounded-r-full" />
                )}
                <div className="flex items-center gap-2.5 pl-0.5">
                  <span
                    className={clsx(
                      'transition-colors',
                      isActive ? 'text-brand-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded-md font-medium tabular-nums',
                      isActive
                        ? 'bg-brand-500/20 text-brand-300'
                        : String(item.badge).includes('due')
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-surface-100 text-zinc-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="px-3 pt-4 space-y-1 mt-2">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
            Extensions
          </div>
          {secondaryNavItems.map((item) => (
            <div
              key={item.id}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-zinc-400 opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed select-none"
              title="Coming in Next GYM OS Release"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-zinc-500">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-200 text-zinc-400">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile / Quick Desk Check-In */}
      <div className="p-3 bg-surface-300">
        {/* Quick check in bar inside sidebar */}
        <button
          onClick={() => setCheckInModalOpen(true)}
          className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-semibold text-xs shadow-xs transition-all active:scale-[0.98]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Quick Desk Check-in</span>
        </button>

        {/* User profile tile */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold text-zinc-200 shrink-0">
              {currentUser.fullName ? currentUser.fullName.split(' ').map((n) => n[0]).join('') : 'VM'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-200 truncate">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-zinc-400 truncate font-mono capitalize">
                {currentUser.role}
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-zinc-400 hover:text-rose-400 p-1 rounded-md hover:bg-surface-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
