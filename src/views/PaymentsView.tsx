import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import {
  CreditCard,
  IndianRupee,
  Search,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Eye,
} from 'lucide-react';
import { PaymentStatus } from '../types';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    gymStats,
    openPaymentModal,
    openInvoiceModal,
    viewMemberProfile,
  } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + p.totalINR, 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.totalINR, 0);

  const totalOverdue = payments
    .filter((p) => p.status === 'overdue')
    .reduce((acc, p) => acc + p.totalINR, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.memberPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Financial Ledger & Invoicing
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            GST compliant member invoices, UPI collections, and cash receipts in INR (₹)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Exporting GST Compliant Financial Ledger (CSV)...')}
          >
            Export Invoices
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<IndianRupee className="w-3.5 h-3.5" />}
            onClick={() => openPaymentModal(null)}
          >
            Record Manual Payment
          </Button>
        </div>
      </div>

      {/* Financial Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue (MTD)"
          value={`₹${gymStats.monthlyRevenueINR.toLocaleString('en-IN')}`}
          subValue="+12.4% vs last month"
          trend={{ value: 12.4, isPositive: true }}
          icon={<IndianRupee className="w-4 h-4 text-brand-400" />}
          variant="brand"
        />

        <StatCard
          label="Collected & Settled"
          value={`₹${totalCollected.toLocaleString('en-IN')}`}
          subValue="Settled via UPI / POS"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          variant="cyan"
        />

        <StatCard
          label="Pending Invoices"
          value={`₹${totalPending.toLocaleString('en-IN')}`}
          subValue="Due in <48 hours"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          variant="warning"
        />

        <StatCard
          label="Overdue Receivables"
          value={`₹${totalOverdue.toLocaleString('en-IN')}`}
          subValue="Action required"
          icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
          variant="danger"
        />
      </div>

      {/* Payment Gateway & Methods Breakdown Box */}
      <div className="rounded-2xl p-5 bg-surface-300 shadow-surface flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Payment Mode Distribution
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Preferred settlement channels across members</p>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
            <span className="text-zinc-300 font-medium">UPI (GPay/PhonePe):</span>
            <span className="font-mono text-white font-bold">62%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-zinc-300 font-medium">Credit/Debit Card:</span>
            <span className="font-mono text-white font-bold">24%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-zinc-300 font-medium">Cash:</span>
            <span className="font-mono text-white font-bold">10%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-zinc-300 font-medium">NetBanking:</span>
            <span className="font-mono text-white font-bold">4%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-surface-300 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-surface">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, member name, or phone..."
            className="w-full bg-surface-200 text-xs text-zinc-100 placeholder:text-zinc-500 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'paid', label: 'Paid & Settled' },
            { id: 'pending', label: 'Pending' },
            { id: 'overdue', label: 'Overdue' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-surface-100 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="rounded-2xl bg-surface-300 overflow-hidden shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-200/60 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Membership Plan</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Total (INR)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-surface-200/60 transition-colors group cursor-pointer"
                    onClick={() => openInvoiceModal(pay)}
                  >
                    {/* Invoice # */}
                    <td className="py-3.5 px-5 font-mono font-semibold text-brand-400">
                      {pay.invoiceNumber}
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {pay.memberName}
                      </div>
                      <div className="text-[10px] text-zinc-400">{pay.memberPhone}</div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4 text-zinc-300 font-medium">{pay.planName}</td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400">{pay.date}</td>

                    {/* Method & Ref */}
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200">{pay.paymentMethod || 'Direct / Bank'}</div>
                      {pay.referenceId && (
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {pay.referenceId}
                        </div>
                      )}
                    </td>

                    {/* Total Amount in INR */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                      ₹{pay.totalINR.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={pay.status} size="xs">
                        {pay.status}
                      </Badge>
                    </td>

                    {/* Receipt CTA */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openInvoiceModal(pay)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-surface-100 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No transactions found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
