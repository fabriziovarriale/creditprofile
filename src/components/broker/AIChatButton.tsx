import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  hasNotifications?: boolean;
  className?: string;
}

export const AIChatButton: React.FC<AIChatButtonProps> = ({
  onClick,
  isOpen,
  hasNotifications = false,
  className
}) => {
  return (
    <div className={cn("fixed bottom-6 right-6 z-40", className)}>
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
          isOpen 
            ? "bg-blue-600 hover:bg-blue-700" 
            : "bg-white hover:bg-gray-50 border-2 border-blue-200 hover:border-blue-300"
        )}
      >
        <div className="relative">
          {isOpen ? (
            <MessageSquare className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-6 w-6 text-blue-600" />
          )}
          
          {/* Notification dot */}
          {hasNotifications && !isOpen && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </Button>
      
      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          Assistente AI
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};
