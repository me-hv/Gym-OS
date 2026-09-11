import React from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewView } from './views/OverviewView';
import { MembersView } from './views/MembersView';
import { MemberProfileView } from './views/MemberProfileView';
import { AttendanceView } from './views/AttendanceView';
import { MembershipsView } from './views/MembershipsView';
import { PaymentsView } from './views/PaymentsView';
import { RetentionView } from './views/RetentionView';

const AppContent: React.FC = () => {
  const { activeView } = useGym();

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'retention':
        return <RetentionView />;
      case 'members':
        return <MembersView />;
      case 'profile':
        return <MemberProfileView />;
      case 'attendance':
        return <AttendanceView />;
      case 'memberships':
        return <MembershipsView />;
      case 'payments':
        return <PaymentsView />;
      default:
        return <OverviewView />;
    }
  };

  return <AppLayout>{renderActiveView()}</AppLayout>;
};

export function App() {
  return (
    <GymProvider>
      <AppContent />
    </GymProvider>
  );
}

export default App;
