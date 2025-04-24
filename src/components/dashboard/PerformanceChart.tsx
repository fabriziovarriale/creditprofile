import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface PerformanceData {
  mese: string;
  pratiche: number;
  completate: number;
  valore: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  selectedDay: number;
}

export const PerformanceChart = ({ data, selectedDay }: PerformanceChartProps) => (
  <div className="bg-black rounded-xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-2">
        {Array.from({ length: 13 }).map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              i === selectedDay ? 'bg-[#3b82f6] text-white' : 'text-gray-400 hover:bg-[#1e1e1e]'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPratiche" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
          <XAxis dataKey="mese" stroke="#666666" />
          <YAxis stroke="#666666" />
          <Tooltip
            contentStyle={{
              background: '#1e1e1e',
              border: '1px solid #222222',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="pratiche"
            stroke="#3b82f6"
            fill="url(#colorPratiche)"
            name="Pratiche Totali"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
); 