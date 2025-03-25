
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  className,
  children 
}: DashboardCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs",
            change.positive ? "text-accent" : "text-destructive"
          )}>
            {change.positive ? "+" : ""}{change.value}
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
