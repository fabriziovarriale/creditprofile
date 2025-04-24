import React from 'react';
import { UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const Logo = ({ className = '', iconSize = 6, textSize = 'text-xl' }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <UserCheck className={`h-${iconSize} w-${iconSize} text-primary`} />
      <span className={`${textSize} font-semibold`}>
        <span className="font-bold">Credit</span>Profile
      </span>
    </Link>
  );
};

export default Logo; 