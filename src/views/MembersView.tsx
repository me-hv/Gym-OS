import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { Member, MemberStatus, PaymentStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Sparkline } from '../components/ui/Sparkline';
import {
  Search,
  UserPlus,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Send,
  UserCheck,
  CreditCard,
  Eye,
  Calendar,
  Phone,
  SlidersHorizontal,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const MembersView: React.FC = () => {
  const {
    members,
    plans,
    viewMemberProfile,
    checkInMember,
    openWhatsAppModal,
    openPaymentModal,
    setAddMemberModalOpen,
  } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'attendance' | 'lastVisit'>('expiry');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered and Sorted Members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.memberCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'risk'
            ? m.status === 'expiring' || (m.daysRemaining <= 7 && m.daysRemaining >= 0)
            : m.status === statusFilter;

        const matchesPlan = planFilter === 'all' ? true : m.planId === planFilter;

        return matchesSearch && matchesStatus && matchesPlan;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'expiry') return a.daysRemaining - b.daysRemaining;
        if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
        if (sortBy === 'lastVisit') return a.lastVisitDate.localeCompare(b.lastVisitDate);
        return 0;
      });
  }, [members, searchQuery, statusFilter, planFilter, sortBy]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5">
      {/* Top Header & Metrics Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Members Directory</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {members.length} athletes enrolled • Managing memberships, attendance habits & renewals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Exporting active members CSV ledger...')}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setAddMemberModalOpen(true)}
          >
            Enroll New Member
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-surface-300 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-surface">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, phone (+91), member code..."
            className="w-full bg-surface-200 text-sm text-zinc-100 placeholder:text-zinc-500 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Members', count: members.length },
            {
              id: 'active',
              label: 'Active',
              count: members.filter((m) => m.status === 'active').length,
            },
            {
              id: 'risk',
              label: 'Expiring Soon',
              count: members.filter((m) => m.status === 'expiring' || (m.daysRemaining <= 7 && m.daysRemaining >= 0)).length,
            },
            {
              id: 'expired',
              label: 'Expired',
              count: members.filter((m) => m.status === 'expired').length,
            },
            {
              id: 'frozen',
              label: 'Frozen',
              count: members.filter((m) => m.status === 'frozen').length,
            },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? tab.id === 'risk'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-surface-100 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Plan Filter & Sort Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-surface-200 text-xs text-zinc-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface-200 text-xs text-zinc-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer"
          >
            <option value="expiry">Sort: Expiry (Urgent first)</option>
            <option value="attendance">Sort: Attendance Rate</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="lastVisit">Sort: Last Visit</option>
          </select>
        </div>
      </div>

      {/* Members Data Table */}
      <div className="rounded-2xl bg-surface-300 overflow-hidden shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-surface-200/60 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-4">Membership Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Attendance Rate</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-5 text-right">Quick Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-surface-200/60 transition-colors group cursor-pointer"
                    onClick={() => viewMemberProfile(member.id)}
                  >
                    {/* 1. Member Column */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-100 overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-zinc-300">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white group-hover:text-brand-300 transition-colors text-sm truncate flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {member.lockerNumber && (
                              <span className="text-[10px] font-mono text-zinc-400 bg-surface-100 px-1 rounded">
                                {member.lockerNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-zinc-400">{member.memberCode}</span>
                            <span>•</span>
                            <span>{member.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Membership Plan */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-200">{member.planName}</div>
                      <div className="text-[11px] text-zinc-400">{member.assignedTrainer}</div>
                    </td>

                    {/* 3. Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant={member.status} size="sm">
                        {member.status}
                      </Badge>
                    </td>

                    {/* 4. Attendance Rate + Sparkline */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-zinc-200 tabular-nums">
                            {member.attendanceRate}%
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {member.weeklyFrequency}x / wk
                          </div>
                        </div>
                        <Sparkline
                          data={[
                            member.attendanceRate * 0.7,
                            member.attendanceRate * 0.85,
                            member.attendanceRate * 0.9,
                            member.attendanceRate,
                          ]}
                          color={
                            member.attendanceRate > 80
                              ? '#10B981'
                              : member.attendanceRate > 60
                              ? '#F59E0B'
                              : '#F43F5E'
                          }
                          width={48}
                          height={16}
                        />
                      </div>
                    </td>

                    {/* 5. Last Visit */}
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-300 font-medium">{member.lastVisit}</span>
                    </td>

                    {/* 6. Expiry Date */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-mono text-zinc-200">{member.expiryDate}</div>
                        <span
                          className={`text-[10px] font-semibold ${
                            member.daysRemaining <= 3
                              ? 'text-rose-400'
                              : member.daysRemaining <= 7
                              ? 'text-amber-400'
                              : 'text-zinc-400'
                          }`}
                        >
                          {member.daysRemaining > 0
                            ? `in ${member.daysRemaining} days`
                            : member.daysRemaining === 0
                            ? 'Expires Today'
                            : `${Math.abs(member.daysRemaining)} days ago`}
                        </span>
                      </div>
                    </td>

                    {/* 7. Payment Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant={member.paymentStatus} size="xs">
                        {member.paymentStatus}
                      </Badge>
                      {member.pendingAmountINR > 0 && (
                        <div className="text-[10px] font-mono text-rose-400 mt-0.5">
                          ₹{member.pendingAmountINR.toLocaleString('en-IN')} due
                        </div>
                      )}
                    </td>

                    {/* 8. Row Actions */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Check-in */}
                        <button
                          onClick={() => checkInMember(member.id)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-brand-300 hover:bg-brand-500/10 transition-colors"
                          title="Quick Check-in"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp renewal if expiring */}
                        {(member.status === 'expiring' || member.daysRemaining <= 7) && (
                          <button
                            onClick={() => openWhatsAppModal(member)}
                            className="p-1.5 rounded-md text-amber-400 hover:text-amber-200 hover:bg-amber-500/15 transition-colors"
                            title="Send WhatsApp Renewal"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Record payment if overdue or pending */}
                        {member.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => openPaymentModal(member)}
                            className="p-1.5 rounded-md text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/15 transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Profile */}
                        <button
                          onClick={() => viewMemberProfile(member.id)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors"
                          title="View Profile Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <p className="text-sm font-semibold text-zinc-300">No members matching criteria</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Try clearing search terms or selecting a different status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-white/[0.04] bg-surface-200/40 flex items-center justify-between text-xs text-zinc-400">
          <div>
            Showing{' '}
            <strong className="text-zinc-200">
              {filteredMembers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-zinc-200">
              {Math.min(currentPage * itemsPerPage, filteredMembers.length)}
            </strong>{' '}
            of <strong className="text-zinc-200">{filteredMembers.length}</strong> members
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-mono px-2 text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="xs"
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
