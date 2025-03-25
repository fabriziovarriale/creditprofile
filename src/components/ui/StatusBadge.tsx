
import React from 'react';
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, HelpCircle } from "lucide-react";

export type StatusType = 'validated' | 'pending' | 'rejected' | 'unknown';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

const StatusBadge = ({ 
  status, 
  className, 
  showIcon = true,
  children 
}: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'validated':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: <Check size={14} className="text-green-600" />,
          label: 'Validato'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <Clock size={14} className="text-yellow-600" />,
          label: 'In Attesa'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <AlertCircle size={14} className="text-red-600" />,
          label: 'Rifiutato'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: <HelpCircle size={14} className="text-gray-600" />,
          label: 'Sconosciuto'
        };
    }
  };

  const { bg, text, border, icon, label } = getStatusConfig();

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
      bg, text, border, className
    )}>
      {showIcon && icon}
      {children || label}
    </span>
  );
};

export default StatusBadge;
