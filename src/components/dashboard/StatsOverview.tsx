
import React from 'react';
import DashboardCard from '../ui/DashboardCard';
import { BarChart3, FileText, Users } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Sample data for the charts
const chartData = [
  { name: 'Gen', value: 12 },
  { name: 'Feb', value: 19 },
  { name: 'Mar', value: 15 },
  { name: 'Apr', value: 22 },
  { name: 'Mag', value: 18 },
  { name: 'Giu', value: 25 },
  { name: 'Lug', value: 30 },
];

const StatsOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Clienti Totali" 
          value="284" 
          change={{ value: "14% rispetto mese scorso", positive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <DashboardCard 
          title="Documenti Caricati" 
          value="648" 
          change={{ value: "32 questa settimana", positive: true }}
          icon={<FileText className="h-4 w-4" />}
        />
        <DashboardCard 
          title="Tasso Approvazione" 
          value="78%" 
          change={{ value: "5% rispetto mese scorso", positive: true }}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium">Nuovi Clienti</h3>
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#05668D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium">Documenti Mensili</h3>
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#679436" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
