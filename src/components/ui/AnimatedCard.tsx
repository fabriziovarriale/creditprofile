
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const AnimatedCard = ({ 
  children, 
  className, 
  hoverEffect = true,
  ...props 
}: AnimatedCardProps) => {
  const [isTilted, setIsTilted] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = (y - centerY) / 10;
    const tiltY = (centerX - x) / 10;
    
    setIsTilted(true);
    setCoords({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsTilted(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-6 border border-border transition-all duration-300 ease-out",
        hoverEffect && "hover:shadow-card-hover", 
        isTilted ? "shadow-lg" : "shadow-card",
        className
      )}
      style={hoverEffect ? {
        transform: isTilted ? `perspective(1000px) rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale3d(1.02, 1.02, 1.02)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default AnimatedCard;
