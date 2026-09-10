import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';
import { CommandPalette } from '../ui/CommandPalette';
import { WhatsAppRenewalModal } from '../shared/WhatsAppRenewalModal';
import { QuickCheckInModal } from '../shared/QuickCheckInModal';
import { AddMemberModal } from '../shared/AddMemberModal';
import { RecordPaymentModal } from '../shared/RecordPaymentModal';
import { InvoiceDetailModal } from '../shared/InvoiceDetailModal';
import { CreatePlanModal } from '../shared/CreatePlanModal';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Page View Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-background/50">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & System Drawers */}
      <ToastContainer />
      <CommandPalette />
      <WhatsAppRenewalModal />
      <QuickCheckInModal />
      <AddMemberModal />
      <RecordPaymentModal />
      <InvoiceDetailModal />
      <CreatePlanModal />
    </div>
  );
};
