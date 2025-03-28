import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className }) => {
  return (
    <div className={`p-6 rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>
      {children}
    </div>
  );
};

export default AnimatedCard;
