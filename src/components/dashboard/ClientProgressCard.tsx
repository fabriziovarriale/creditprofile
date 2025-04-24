import { Clock } from 'lucide-react';

interface ClientProgressCardProps {
  name: string;
  email: string;
  progress: number;
  status: 'active' | 'pending' | 'completed';
}

export const ClientProgressCard = ({ name, email, progress, status }: ClientProgressCardProps) => (
  <div className="bg-black rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1e40af] flex items-center justify-center text-white">
          {name[0]}
        </div>
        <div>
          <h3 className="text-white font-medium">{name}</h3>
          <p className="text-sm text-gray-400">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#3b82f6]">{progress}%</span>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>
    </div>
    <div className="flex gap-1">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i < (progress / 5) ? 'bg-[#3b82f6]' : 'bg-[#1e1e1e]'
          }`}
        />
      ))}
    </div>
  </div>
); 