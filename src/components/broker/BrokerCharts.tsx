import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { mockClients } from '@/mocks/broker-data';
import { creditScoreReports } from '@/store/clientsStore';
// Utility per caricare i documenti persistenti
function getPersistedDocuments() {
  const saved = localStorage.getItem('mockDocuments');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

interface BrokerChartsProps {
  stats: {
    totalClients: number;
    totalProfiles: number;
    totalReports: number;
    profilesByStatus: Record<string, number>;
    clientsByStatus: Record<string, number>;
    averageScore: number;
  };
}

// Colori per i grafici
const STATUS_COLORS = {
  approved: '#10b981', // verde
  pending: '#f59e0b', // giallo
  requires_documents: '#f97316', // arancione
  rejected: '#ef4444', // rosso
  active: '#10b981', // verde
  suspended: '#ef4444', // rosso
};

// Aggiungo uno stile custom per la legenda
const legendStyle = {
  fontSize: '0.85rem',
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '0.5rem 1.5rem',
  marginTop: '1rem',
  marginLeft: '0.5rem',
  alignItems: 'flex-start',
  lineHeight: 1.2,
  maxWidth: '100%',
};

const getMonthlyAggregatedData = () => {
  // Helper per ottenere il mese in formato 'YYYY-MM'
  const getMonth = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
  // Aggrega credit profiles
  const profilesByMonth: Record<string, number> = {};
  mockClients.flatMap(c => c.creditProfiles).forEach(profile => {
    const m = getMonth(profile.createdAt);
    profilesByMonth[m] = (profilesByMonth[m] || 0) + 1;
  });
  // Aggrega credit score completati e pending
  const scoresCompletedByMonth: Record<string, number> = {};
  const scoresPendingByMonth: Record<string, number> = {};
  creditScoreReports.forEach(r => {
    const m = getMonth(r.requestedAt);
    if (r.status === 'completed') {
      scoresCompletedByMonth[m] = (scoresCompletedByMonth[m] || 0) + 1;
    } else if (r.status === 'pending') {
      scoresPendingByMonth[m] = (scoresPendingByMonth[m] || 0) + 1;
    }
  });
  // Unione mesi
  const allMonths = Array.from(new Set([
    ...Object.keys(profilesByMonth),
    ...Object.keys(scoresCompletedByMonth),
    ...Object.keys(scoresPendingByMonth)
  ])).sort();
  // Crea array dati
  return allMonths.map(mese => ({
    mese,
    profili: profilesByMonth[mese] || 0,
    scoreCompletati: scoresCompletedByMonth[mese] || 0,
    scoreInAttesa: scoresPendingByMonth[mese] || 0
  }));
};

const BrokerCharts: React.FC<BrokerChartsProps> = ({ stats }) => {
  // Aggregazione status documenti per grafico a torta
  const documentStatusData = React.useMemo(() => {
    const docs = getPersistedDocuments();
    const statusCount = docs.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'Approvati', value: statusCount['approved'] || 0, color: '#10b981' },
      { name: 'Rifiutati', value: statusCount['rejected'] || 0, color: '#ef4444' },
      { name: 'In attesa', value: statusCount['pending'] || 0, color: '#f59e0b' },
      { name: 'Da correggere', value: statusCount['requires_changes'] || 0, color: '#f97316' },
      { name: 'Caricati', value: statusCount['uploaded'] || 0, color: '#3b82f6' },
    ].filter(d => d.value > 0);
  }, []);

  // Dati per il grafico a torta degli status dei clienti
  const clientStatusData = Object.entries(stats.clientsByStatus).map(([status, count]) => ({
    name: status === 'active' ? 'Attivi' :
          status === 'pending' ? 'In Attesa' :
          status === 'suspended' ? 'Sospesi' : status,
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
  }));

  // Dati aggregati per il grafico unico
  const monthlyAggregated = getMonthlyAggregatedData();

  // Custom tooltip per i grafici a torta
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            {data.value} ({Math.round((data.value / data.payload.total) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Aggiungi il totale ai dati per la percentuale
  const profileDataWithTotal = documentStatusData.map(item => ({
    ...item,
    total: stats.totalProfiles
  }));

  const clientDataWithTotal = clientStatusData.map(item => ({
    ...item,
    total: stats.totalClients
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
      {/* Grafico a torta per status documenti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuzione Status Documenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={documentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {documentStatusData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* Grafico a barre raggruppate: Credit Profile e Credit Score per mese */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Andamento mensile: Profili generati e Credit Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAggregated} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mese" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profili" name="Credit Profile generati" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="scoreCompletati" name="Credit Score completati" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="scoreInAttesa" name="Credit Score in attesa" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerCharts; 