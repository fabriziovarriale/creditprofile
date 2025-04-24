import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BarChart3,
  PieChart,
  Briefcase,
  Clock, 
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  ChevronDown,
  UserPlus,
  CheckCircle,
  TrendingUp,
  CalendarDays,
  ArrowRight
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { Stat, PerformanceData, Client, Lead } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const iconMap: { [key: string]: React.ElementType } = {
  Users: Users,
  FileText: FileText,
  Briefcase: Briefcase,
  UserPlus: UserPlus,
};

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(9);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(9);
  const [activeTab, setActiveTab] = useState<'Days' | 'Weeks' | 'Months'>('Days');

  const navigationItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/broker', active: true },
    { icon: Users, label: 'Clienti', path: '/broker/clients' },
    { icon: FileText, label: 'Leads', path: '/broker/leads' },
  ];

  const bottomNavItems = [
    { icon: HelpCircle, label: 'Supporto', path: '/broker/support' },
    { icon: Settings, label: 'Impostazioni', path: '/broker/settings' },
  ];

  const dateSelectorData = Array.from({ length: 13 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (12 - i));
    return {
      dayNum: date.getDate().toString().padStart(2, '0'),
      dayName: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      fullDate: date
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, performanceRes, clientsRes, leadsRes] = await Promise.all([
          supabase.from('stats').select('*').limit(4),
          supabase.from('performance_data').select('*').eq('period_type', 'monthly').order('year').order('recorded_at'),
          supabase.from('clients').select('*').in('status', ['active', 'pending']).limit(6).order('last_contact', { ascending: false }),
          supabase.from('leads').select('*').eq('status', 'new').limit(5).order('created_at', { ascending: false })
        ]);

        if (statsRes.error) throw statsRes.error;
        if (performanceRes.error) throw performanceRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (leadsRes.error) throw leadsRes.error;

        setStats(statsRes.data || []);
        const formattedPerformanceData = (performanceRes.data || []).map(d => ({
          mese: d.period_value,
          pratiche: d.practices_count,
          valore: d.total_value
        }));
        setPerformanceData(formattedPerformanceData);
        setClients(clientsRes.data || []);
        setLeads(leadsRes.data || []);

      } catch (err: any) {
        console.error("Errore nel fetch dei dati della dashboard:", err);
        setError("Impossibile caricare i dati della dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-white flex-1 flex items-center justify-center">Caricamento dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 flex-1 flex items-center justify-center">{error}</div>;
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 bg-gray-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon_name ? iconMap[stat.icon_name] : BarChart3;
          return <StatCard key={stat.id} title={stat.title} value={stat.value} icon={Icon} trend={stat.trend} />
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-black border border-gray-700 text-gray-100">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className="text-lg font-semibold text-gray-100 mb-2 sm:mb-0">Statistiche</CardTitle>
                <div className="flex items-center space-x-1 bg-gray-800/50 p-1 rounded-lg">
                  <Button variant={activeTab === 'Days' ? 'secondary': 'ghost'} size="sm" onClick={() => setActiveTab('Days')} className={`px-3 py-1 text-xs ${activeTab === 'Days' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}>Giorni</Button>
                  <Button variant={activeTab === 'Weeks' ? 'secondary': 'ghost'} size="sm" onClick={() => setActiveTab('Weeks')} className={`px-3 py-1 text-xs ${activeTab === 'Weeks' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}>Settimane</Button>
                  <Button variant={activeTab === 'Months' ? 'secondary': 'ghost'} size="sm" onClick={() => setActiveTab('Months')} className={`px-3 py-1 text-xs ${activeTab === 'Months' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}>Mesi</Button>
                </div>
              </div>
              <ScrollArea className="w-full whitespace-nowrap pt-4">
                <div className="flex space-x-2 pb-2">
                  {dateSelectorData.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPeriodIndex(index)}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border transition-colors ${
                        selectedPeriodIndex === index
                          ? 'bg-purple-700/50 border-purple-500 text-white'
                          : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:bg-gray-700/80 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-sm font-semibold">{date.dayNum}</span>
                      <span className="text-xs mt-1">{date.dayName}</span>
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-2"/>
              </ScrollArea>
            </CardHeader>
            <CardContent className="h-[300px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8A2BE2" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8A2BE2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#404040" strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="mese" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`}/>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#e5e7eb' }} labelStyle={{ color: '#9ca3af' }}/>
                  <Area type="monotone" dataKey="valore" stroke="#8A2BE2" fill="url(#chartGradient)" strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Pratiche Recenti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clients.length > 0 ? clients.map(client => (
                <ClientActivityCard key={client.id} client={client} />
              )) : (
                <p className="text-gray-500 md:col-span-2 xl:col-span-3 text-center py-4">Nessuna pratica recente trovata.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="bg-black border border-gray-700 text-gray-100 flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-100">Nuovi Leads</CardTitle>
              <Link to="/broker/leads">
                <Button variant="link" size="sm" className="text-blue-400 hover:text-blue-300 px-0 h-auto">
                  Vedi tutti <ArrowRight className="w-3 h-3 ml-1"/>
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-2 px-3">
              {leads.length > 0 ? leads.map(lead => (
                <SimpleListCard
                  key={lead.id}
                  id={lead.id}
                  name={lead.name}
                  detail={lead.source ?? undefined}
                  time={new Date(lead.created_at).toLocaleDateString('it-IT')}
                />
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">Nessun nuovo lead.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black border border-gray-700 text-gray-100 flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-100">Attività Recenti</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-2 px-3">
              <SimpleListCard id="act1" name="Marco Rossi" detail="Documento caricato" time="10 min fa" statusIcon={CheckCircle} />
              <SimpleListCard id="act2" name="Laura Bianchi" detail="Pratica Approvata" time="1 ora fa" statusIcon={CheckCircle}/>
              <SimpleListCard id="act3" name="Sistema" detail="Report generato" time="2 ore fa"/>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-600 text-white">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex -space-x-2 mb-2">
                {clients.slice(0, 3).map((c) => (
                  <div key={c.id} className="w-8 h-8 rounded-full bg-gray-600 border-2 border-black flex items-center justify-center text-xs">
                    {c.name[0]}
                  </div>
                ))}
              </div>
              <div className="text-3xl font-bold">+€1.2M</div>
              <p className="text-sm text-indigo-200">Valore Pratiche Mese</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  icon: React.ElementType;
  trend?: string | null;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
  <Card className="bg-gray-900 border-gray-700 text-gray-100">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-50">{value ?? '-'}</div>
      {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
    </CardContent>
  </Card>
);

interface ClientActivityCardProps {
  client: Client;
}
const ClientActivityCard: React.FC<ClientActivityCardProps> = ({ client }) => (
  <Card className="bg-gray-900 border border-gray-700 text-gray-100 overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {client.name ? client.name[0].toUpperCase() : '?'}
        </div>
        <div className='min-w-0'>
          <p className="text-sm font-semibold truncate text-gray-50">{client.name}</p>
          <p className="text-xs text-gray-400 truncate">{client.email ?? 'N/A'}</p>
        </div>
      </div>
      {client.progress !== null && client.progress !== undefined && (
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden my-2">
          <div className="h-full bg-blue-500" style={{ width: `${client.progress}%` }}></div>
        </div>
      )}
      <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
        <span>{client.status ?? 'N/A'}</span>
        {client.last_contact && <span>{new Date(client.last_contact).toLocaleDateString('it-IT')}</span>}
      </div>
    </CardContent>
  </Card>
);

interface SimpleListCardProps {
  id: string;
  name: string;
  detail?: string;
  time?: string;
  statusIcon?: React.ElementType;
}
const SimpleListCard: React.FC<SimpleListCardProps> = ({ id, name, detail, time, statusIcon: StatusIcon }) => (
  <Card className="bg-gray-900/50 hover:bg-gray-800/50 border border-gray-700/50 mb-2">
    <CardContent className="p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-medium flex-shrink-0">
          {name ? name[0].toUpperCase() : '?'}
        </div>
        <div className='min-w-0'>
          <p className="text-sm font-medium text-gray-200 truncate">{name}</p>
          {detail && <p className="text-xs text-gray-400 truncate">{detail}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        {StatusIcon && <StatusIcon className="w-3 h-3 text-yellow-400"/>}
        {time && <span>{time}</span>}
      </div>
    </CardContent>
  </Card>
);

export default BrokerDashboard;
