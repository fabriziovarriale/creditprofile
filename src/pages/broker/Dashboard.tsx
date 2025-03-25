
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  ArrowRight, 
  TrendingUp,
  CalendarDays
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import AnimatedCard from '@/components/ui/AnimatedCard';

// Mock data
const mockClients = [
  { id: '1', name: 'Marco Rossi', email: 'marco.rossi@example.com', status: 'active', progress: 75 },
  { id: '2', name: 'Laura Bianchi', email: 'laura.bianchi@example.com', status: 'pending', progress: 40 },
  { id: '3', name: 'Giuseppe Verdi', email: 'giuseppe.verdi@example.com', status: 'completed', progress: 100 },
];

const mockStats = {
  totalClients: 12,
  activeClients: 8,
  completedApplications: 3,
  pendingDocuments: 15,
};

const mockRecentActivities = [
  { 
    id: 'act1', 
    clientName: 'Marco Rossi', 
    action: 'Documento caricato', 
    documentName: 'Busta paga',
    date: new Date(2023, 11, 19, 14, 30) 
  },
  { 
    id: 'act2', 
    clientName: 'Laura Bianchi', 
    action: 'Documento convalidato', 
    documentName: 'Carta di identità',
    date: new Date(2023, 11, 19, 10, 15) 
  },
  { 
    id: 'act3', 
    clientName: 'Giuseppe Verdi', 
    action: 'Profilo credito aggiornato', 
    date: new Date(2023, 11, 18, 16, 45) 
  },
];

const formatDate = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} min fa`;
  } else if (diffHours < 24) {
    return `${diffHours} ore fa`;
  } else if (diffDays < 7) {
    return `${diffDays} giorni fa`;
  } else {
    return date.toLocaleDateString('it-IT');
  }
};

const BrokerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Broker</h1>
          <p className="text-muted-foreground mt-1">Benvenuto, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link
            to="/broker/clients"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Users className="mr-2 h-4 w-4" />
            Gestisci Clienti
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnimatedCard className="animate-fade-in animate-delay-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clienti Totali</p>
              <h3 className="text-2xl font-bold">{mockStats.totalClients}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="animate-fade-in animate-delay-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pratiche Completate</p>
              <h3 className="text-2xl font-bold">{mockStats.completedApplications}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="animate-fade-in animate-delay-300">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-yellow-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clienti Attivi</p>
              <h3 className="text-2xl font-bold">{mockStats.activeClients}</h3>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="animate-fade-in animate-delay-400">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documenti in Attesa</p>
              <h3 className="text-2xl font-bold">{mockStats.pendingDocuments}</h3>
            </div>
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Clients */}
        <div className="lg:col-span-2 animate-fade-in animate-delay-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Clienti Recenti</h2>
            <Link 
              to="/broker/clients" 
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
            >
              Vedi Tutti
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {mockClients.map(client => (
              <AnimatedCard key={client.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-credit-100 flex items-center justify-center text-credit-700 font-medium">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <Link 
                        to={`/broker/client/${client.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {client.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {client.status === 'active' && (
                        <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Attivo
                        </span>
                      )}
                      {client.status === 'pending' && (
                        <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                          In Corso
                        </span>
                      )}
                      {client.status === 'completed' && (
                        <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          Completato
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${client.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{client.progress}% completato</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="animate-fade-in animate-delay-600">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Attività Recenti</h2>
          </div>
          
          <AnimatedCard className="h-[calc(100%-32px)]">
            <div className="flex flex-col h-full">
              <div className="space-y-6">
                {mockRecentActivities.map(activity => (
                  <div key={activity.id} className="relative pl-6 pb-6 border-l border-gray-200 last:border-l-0 last:pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-primary border-2 border-white"></div>
                    <div>
                      <p className="font-medium">{activity.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} 
                        {activity.documentName && <span> - {activity.documentName}</span>}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-4 border-t">
                <Link
                  to="/broker/activities"
                  className="text-sm text-primary hover:text-primary/80 flex items-center justify-center"
                >
                  Visualizza tutte le attività
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="animate-fade-in animate-delay-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Riepilogo Performance</h2>
        </div>
        
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Placeholder per il grafico delle performance</p>
              <p className="text-sm">Qui verranno mostrate le statistiche dettagliate sulle pratiche</p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default BrokerDashboard;
