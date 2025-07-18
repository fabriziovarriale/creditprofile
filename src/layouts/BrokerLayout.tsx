import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';

const BrokerLayout: React.FC = () => {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const handleToggleSlideOver = () => {
    setIsSlideOverOpen(prev => !prev);
  };

  return (
    <DashboardLayout 
      role="broker"
      isSlideOverOpen={isSlideOverOpen}
      onToggleSlideOver={handleToggleSlideOver}
    />
  );
};

export default BrokerLayout; 