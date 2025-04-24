import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon: LucideIcon;
}

export const StatCard = ({ title, value, trend, trendDirection, icon: Icon }: StatCardProps) => (
  <div className="bg-black rounded-xl p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-400">{title}</span>
      <Icon className="w-5 h-5 text-[#3b82f6]" />
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {trend && (
      <p className={`text-xs mt-1 ${trendDirection === 'up' ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
        {trend}
      </p>
    )}
  </div>
); 