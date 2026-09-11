import React from 'react';
import { useGym } from '../../context/GymContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Printer, Download, CheckCircle, Building2, Phone, Mail, FileText } from 'lucide-react';

export const InvoiceDetailModal: React.FC = () => {
  const { invoiceModalData, closeInvoiceModal } = useGym();
  const { isOpen, payment } = invoiceModalData;

  if (!isOpen || !payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeInvoiceModal}
      title="Tax Invoice & Receipt"
      subtitle={`Document Reference: ${payment.invoiceNumber}`}
      maxWidth="lg"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Print Receipt
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={closeInvoiceModal}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={closeInvoiceModal}
            >
              Download PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="bg-surface-200/90 rounded-2xl p-6 text-zinc-100 space-y-6">
        {/* Invoice Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/[0.04]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>
              <span className="text-base font-bold tracking-tight text-white font-mono">
                PULSE FITNESS & PERFORMANCE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              #42, 100 Feet Road, Indiranagar, Bengaluru, KA 560038
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">GSTIN: 29AABCU9603R1ZM</p>
          </div>
          <div className="text-right">
            <Badge variant={payment.status} size="sm">
              {payment.status.toUpperCase()}
            </Badge>
            <div className="text-xs text-zinc-400 mt-2 font-mono">{payment.invoiceNumber}</div>
            <div className="text-xs text-zinc-400">Date: {payment.date}</div>
          </div>
        </div>

        {/* Billed To */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 font-medium block uppercase tracking-wider text-[10px] mb-1">
              Billed To Member
            </span>
            <div className="font-semibold text-white text-sm">{payment.memberName}</div>
            <div className="text-zinc-400 mt-0.5">{payment.memberPhone}</div>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block uppercase tracking-wider text-[10px] mb-1">
              Payment Metadata
            </span>
            <div className="text-zinc-300">Method: {payment.paymentMethod || 'Direct / Bank'}</div>
            <div className="text-zinc-400 font-mono text-[11px] mt-0.5">
              Ref: {payment.referenceId || 'N/A'}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-xl overflow-hidden bg-surface-100/50">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-100 text-zinc-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-3.5">Description</th>
                <th className="py-3 px-3.5 text-right">Taxable Value</th>
                <th className="py-3 px-3.5 text-right">GST (18%)</th>
                <th className="py-3 px-3.5 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <tr>
                <td className="py-3.5 px-3.5">
                  <div className="font-medium text-white">{payment.planName}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Full facility access & performance coaching
                  </div>
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-zinc-300">
                  ₹{payment.amountINR.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono text-zinc-300">
                  ₹{payment.taxINR.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-3.5 text-right font-mono font-bold text-brand-400">
                  ₹{payment.totalINR.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-200">₹{payment.amountINR.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>CGST (9%):</span>
              <span className="font-mono text-zinc-200">₹{(payment.taxINR / 2).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>SGST (9%):</span>
              <span className="font-mono text-zinc-200">₹{(payment.taxINR / 2).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.04]">
              <span>Grand Total:</span>
              <span className="font-mono text-brand-400">₹{payment.totalINR.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-white/[0.04] text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Processed by {payment.collectedBy}</span>
          <span>Thank you for training with Pulse Fitness!</span>
        </div>
      </div>
    </Modal>
  );
};
