import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AIChatDrawer } from '@/components/broker/AIChatDrawer';
import { AIChatButton } from '@/components/broker/AIChatButton';


const BrokerLayout: React.FC = () => {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const handleToggleSlideOver = () => {
    setIsSlideOverOpen(prev => !prev);
  };

  const handleToggleAIChat = () => {
    setIsAIChatOpen(prev => !prev);
  };

  return (
    <>
      <DashboardLayout 
        role="broker"
        isSlideOverOpen={isSlideOverOpen}
        onToggleSlideOver={handleToggleSlideOver}
      />
      
      {/* AI Chat Button */}
      <AIChatButton
        onClick={handleToggleAIChat}
        isOpen={isAIChatOpen}
        hasNotifications={false}
      />

      {/* AI Chat Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </>
  );
};

export default BrokerLayout; 