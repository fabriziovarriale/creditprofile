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
  Area,
  AreaChart,
  LinearGradient,
  defs,
  stop
} from 'recharts';
// Definizione locale
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
}
import { CreditScoreWithClient } from '@/services/creditScoresService';
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
  documents?: Array<{ status: string }>; // Aggiungiamo i documenti reali
  creditScores?: CreditScoreWithClient[]; // Aggiungiamo i credit scores reali
}

// Colori moderni per i grafici con gradiente
const MODERN_COLORS = {
  // Palette principale moderna
  primary: '#6366f1', // indigo moderno
  success: '#10b981', // verde smeraldo
  warning: '#f59e0b', // ambra
  danger: '#ef4444', // rosso corallo
  info: '#3b82f6', // blu cielo
  secondary: '#8b5cf6', // viola
  accent: '#06b6d4', // cyan
  
  // Gradients
  gradients: {
    primary: ['#6366f1', '#8b5cf6'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
    info: ['#3b82f6', '#2563eb'],
    secondary: ['#8b5cf6', '#7c3aed'],
    accent: ['#06b6d4', '#0891b2']
  }
};

const STATUS_COLORS = {
  approved: MODERN_COLORS.success,
  pending: MODERN_COLORS.warning,
  requires_documents: '#f97316',
  rejected: MODERN_COLORS.danger,
  active: MODERN_COLORS.success,
  suspended: MODERN_COLORS.danger,
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

const getMonthlyAggregatedData = (creditScores: CreditScoreWithClient[]) => {
  console.log('📊 getMonthlyAggregatedData chiamata con:', creditScores.length, 'credit scores');
  console.log('📊 Primo credit score:', creditScores[0]);
  
  // Se non ci sono dati, restituisci dati di esempio per gli ultimi 3 mesi
  if (!creditScores || creditScores.length === 0) {
    console.log('📊 Nessun credit score trovato, usando dati di esempio');
    const currentDate = new Date();
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        mese: monthStr,
        richiesti: Math.floor(Math.random() * 10) + 1,
        completati: Math.floor(Math.random() * 8) + 1,
        completatiConProtesti: Math.floor(Math.random() * 3),
        inAttesa: Math.floor(Math.random() * 5) + 1
      });
    }
    return months;
  }

  // Helper per ottenere il mese in formato 'YYYY-MM'
  const getMonth = (dateStr: string | null | undefined) => {
    if (!dateStr) {
      console.log('⚠️ Data mancante, usando mese corrente');
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        console.log('⚠️ Data invalida:', dateStr, 'usando mese corrente');
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } catch (error) {
      console.log('⚠️ Errore parsing data:', dateStr, error);
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
  };

  // Aggrega credit score per status e mese
  const scoresRequestedByMonth: Record<string, number> = {};
  const scoresCompletedByMonth: Record<string, number> = {};
  const scoresCompletedWithProtestiByMonth: Record<string, number> = {};
  const scoresPendingByMonth: Record<string, number> = {};

  creditScores.forEach((score, index) => {
    console.log(`📊 Processando credit score ${index + 1}:`, {
      id: score.id,
      status: score.status,
      requested_at: score.requested_at,
      protesti: score.protesti,
      pregiudizievoli: score.pregiudizievoli,
      procedure_concorsuali: score.procedure_concorsuali
    });
    
    const m = getMonth(score.requested_at);
    console.log(`📊 Mese calcolato: ${m}`);
    
    // Conta tutti i credit score richiesti per mese
    scoresRequestedByMonth[m] = (scoresRequestedByMonth[m] || 0) + 1;
    
    // Conta per status attuale
    switch (score.status) {
      case 'completed':
        scoresCompletedByMonth[m] = (scoresCompletedByMonth[m] || 0) + 1;
        // Sottocategoria: completati con protesti/pregiudizievoli
        if (score.protesti || score.pregiudizievoli || score.procedure_concorsuali) {
          scoresCompletedWithProtestiByMonth[m] = (scoresCompletedWithProtestiByMonth[m] || 0) + 1;
        }
        break;
      case 'pending':
        scoresPendingByMonth[m] = (scoresPendingByMonth[m] || 0) + 1;
        break;
      case 'failed':
        // Considera i failed come pending per il grafico
        scoresPendingByMonth[m] = (scoresPendingByMonth[m] || 0) + 1;
        break;
      default:
        console.log('⚠️ Status sconosciuto:', score.status);
        scoresPendingByMonth[m] = (scoresPendingByMonth[m] || 0) + 1;
        break;
    }
  });

  console.log('📊 Aggregazione per mese:', {
    richiesti: scoresRequestedByMonth,
    completati: scoresCompletedByMonth,
    completatiConProtesti: scoresCompletedWithProtestiByMonth,
    pending: scoresPendingByMonth
  });

  // Unione mesi
  const allMonths = Array.from(new Set([
    ...Object.keys(scoresRequestedByMonth),
    ...Object.keys(scoresCompletedByMonth),
    ...Object.keys(scoresPendingByMonth)
  ])).sort();

  console.log('📊 Tutti i mesi trovati:', allMonths);

  // Se non ci sono mesi, aggiungi almeno il mese corrente
  if (allMonths.length === 0) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    allMonths.push(currentMonth);
  }

  // Crea array dati
  const result = allMonths.map(mese => ({
    mese,
    richiesti: scoresRequestedByMonth[mese] || 0,
    completati: scoresCompletedByMonth[mese] || 0,
    completatiConProtesti: scoresCompletedWithProtestiByMonth[mese] || 0,
    inAttesa: scoresPendingByMonth[mese] || 0
  }));

  console.log('📊 Dati finali per il grafico:', result);
  return result;
};

const BrokerCharts: React.FC<BrokerChartsProps> = ({ stats, documents = [], creditScores = [] }) => {
  console.log('📈 BrokerCharts renderizzato con:', {
    creditScoresCount: creditScores.length,
    documentsCount: documents.length,
    statsTotal: stats.totalClients,
    creditScoresData: creditScores.slice(0, 2) // Mostra solo i primi 2 per debug
  });
  // Aggregazione status documenti per grafico a torta (usa dati reali)
  const documentStatusData = React.useMemo(() => {
    const statusCount = documents.reduce((acc, doc) => {
      const status = doc.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'Approvati', value: statusCount['approved'] || 0, color: MODERN_COLORS.success },
      { name: 'Rifiutati', value: statusCount['rejected'] || 0, color: MODERN_COLORS.danger },
      { name: 'In attesa', value: statusCount['pending'] || 0, color: MODERN_COLORS.warning },
      { name: 'Da correggere', value: statusCount['requires_changes'] || 0, color: '#f97316' },
      { name: 'Caricati', value: statusCount['uploaded'] || 0, color: MODERN_COLORS.info },
      { name: 'Sconosciuto', value: statusCount['unknown'] || 0, color: '#6b7280' },
    ].filter(d => d.value > 0);
  }, [documents]);

  // Dati per il grafico a torta degli status dei clienti
  const clientStatusData = Object.entries(stats.clientsByStatus).map(([status, count]) => ({
    name: status === 'active' ? 'Attivi' :
          status === 'pending' ? 'In Attesa' :
          status === 'suspended' ? 'Sospesi' : status,
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
  }));

  // Dati aggregati per il grafico Credit Score
  const monthlyAggregated = getMonthlyAggregatedData(creditScores);
  console.log('📊 Dati aggregati per grafico:', monthlyAggregated);

  // Custom tooltip moderno
  const ModernTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">{data.name || label}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color || data.fill }}
            />
            <p className="text-sm font-medium text-gray-700">
              {data.value} {data.payload?.total && `(${Math.round((data.value / data.payload.total) * 100)}%)`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend moderna con colori di riferimento
  const ModernLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50/50">
            <div 
              className="w-4 h-4 rounded-full shadow-sm border border-white" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Legenda specifica per il grafico Credit Score con colori corretti
  const CreditScoreLegend = () => {
    const legendData = [
      { name: 'Richiesti', color: MODERN_COLORS.primary },
      { name: 'Completati', color: MODERN_COLORS.success },
      { name: 'Con segnalazioni', color: '#f97316' },
      { name: 'In attesa', color: MODERN_COLORS.warning }
    ];

    return (
      <div className="flex gap-3 justify-center mt-4 flex-nowrap">
        {legendData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50/50 whitespace-nowrap">
            <div 
              className="w-4 h-4 rounded-full shadow-sm border border-white flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  };


  // Legenda specifica per il grafico Documenti con colori corretti
  const DocumentsLegend = () => {
    // Filtra solo i documenti che hanno valori > 0 per mostrare solo le voci rilevanti
    const legendData = [
      { name: 'Approvati', color: MODERN_COLORS.success, value: documentStatusData.find(d => d.name === 'Approvati')?.value || 0 },
      { name: 'Rifiutati', color: MODERN_COLORS.danger, value: documentStatusData.find(d => d.name === 'Rifiutati')?.value || 0 },
      { name: 'In attesa', color: MODERN_COLORS.warning, value: documentStatusData.find(d => d.name === 'In attesa')?.value || 0 },
      { name: 'Da correggere', color: '#f97316', value: documentStatusData.find(d => d.name === 'Da correggere')?.value || 0 },
      { name: 'Caricati', color: MODERN_COLORS.info, value: documentStatusData.find(d => d.name === 'Caricati')?.value || 0 },
      { name: 'Sconosciuto', color: '#6b7280', value: documentStatusData.find(d => d.name === 'Sconosciuto')?.value || 0 }
    ].filter(item => item.value > 0);

    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {legendData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50/50">
            <div 
              className="w-4 h-4 rounded-full shadow-sm border border-white" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">{entry.name}</span>
          </div>
        ))}
      </div>
    );
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
      {/* Grafico a torta moderno per status documenti */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Distribuzione Status Documenti
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Panoramica dello stato dei documenti caricati</p>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {documentStatusData.map((entry, idx) => (
                    <linearGradient key={`gradient-${idx}`} id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={documentStatusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={2}
                >
                  {documentStatusData.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={`url(#gradient-${idx})`}
                      className="drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<ModernTooltip />} />
                <Legend content={<DocumentsLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* Grafico moderno Credit Score */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
            Andamento Credit Score
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Richieste di valutazione creditizia e loro esito nel tempo
          </p>
          {creditScores.length === 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">
                ℹ️ Nessun credit score trovato. Vengono mostrati dati di esempio.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyAggregated} 
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="richiestiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MODERN_COLORS.primary} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={MODERN_COLORS.primary} stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="completatiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MODERN_COLORS.success} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={MODERN_COLORS.success} stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="protestiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="attesaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MODERN_COLORS.warning} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={MODERN_COLORS.warning} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  strokeOpacity={0.6}
                />
                <XAxis 
                  dataKey="mese" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  content={<ModernTooltip />}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                />
                <Legend 
                  content={<CreditScoreLegend />}
                />
                <Bar 
                  dataKey="richiesti" 
                  name="Richiesti" 
                  fill="url(#richiestiGradient)" 
                  radius={[4, 4, 0, 0]}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="completati" 
                  name="Completati" 
                  fill="url(#completatiGradient)" 
                  radius={[4, 4, 0, 0]}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="completatiConProtesti" 
                  name="Con segnalazioni" 
                  fill="url(#protestiGradient)" 
                  radius={[4, 4, 0, 0]}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="inAttesa" 
                  name="In attesa" 
                  fill="url(#attesaGradient)" 
                  radius={[4, 4, 0, 0]}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerCharts; 