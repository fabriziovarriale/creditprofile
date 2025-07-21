import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Importa i dati mock e i componenti
import { mockClients, getAggregatedStats, Client, CreditProfile } from '@/mocks/broker-data';
import BrokerStatsCards from '@/components/broker/BrokerStatsCards';
import ClientsTable from '@/components/broker/ClientsTable';
import BrokerCharts from '@/components/broker/BrokerCharts';
import ClientDetailsSlideOver from '@/components/broker/ClientDetailsSlideOver';
import { creditScoreReports } from '@/store/clientsStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle, AlertTriangle, Users, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Utility per leggere i clienti persistiti
function getPersistedClients() {
  const saved = localStorage.getItem('mockClients');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

// Utility per leggere i documenti persistiti
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

const BrokerDashboard = () => {
  const { profile: brokerProfile, loading: authLoading, isAuthenticated, supabase } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Stati per il slide over
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CreditProfile | null>(null);

  // Calcola le statistiche aggregate
  const stats = getAggregatedStats();

  const creditScoreStats = React.useMemo(() => {
    const total = creditScoreReports.length;
    const completed = creditScoreReports.filter(r => r.status === 'completed').length;
    const pending = creditScoreReports.filter(r => r.status === 'pending').length;
    const avgScore = completed > 0 ? Math.round(creditScoreReports.filter(r => r.status === 'completed' && r.creditScore).reduce((sum, r) => sum + (r.creditScore || 0), 0) / completed) : 0;
    const negative = creditScoreReports.filter(r => r.status === 'completed' && ((r.protesti || r.pregiudizievoli || r.procedureConcorsuali))).length;
    const negativePct = completed > 0 ? Math.round((negative / completed) * 100) : 0;
    return { total, completed, pending, avgScore, negative, negativePct };
  }, [creditScoreReports]);

  // Documenti da validare: solo status 'pending'
  const pendingDocs = React.useMemo(() => {
    return getPersistedDocuments()
      .filter(doc => doc.status === 'pending')
      .map(doc => ({
        ...doc,
        clientName: doc.clientName || '',
      }));
  }, []);

  const pendingCreditScores = React.useMemo(() => {
    return creditScoreReports.filter(r => r.status === 'pending').map(r => {
      const client = getPersistedClients().find(c => c.id === r.clientId);
      return {
        ...r,
        clientName: client ? `${client.firstName} ${client.lastName}` : r.clientId
      };
    });
  }, []);

  // Clienti con pratiche bloccate: almeno un documento 'rejected'
  const blockedClients = React.useMemo(() => {
    const docs = getPersistedDocuments();
    const blocked = new Set<string>();
    docs.forEach(doc => {
      if (doc.status === 'rejected' && doc.clientEmail) {
        blocked.add(doc.clientEmail);
      }
    });
    return getPersistedClients().filter(client => blocked.has(client.email));
  }, []);

  const [clients, setClients] = useState(getPersistedClients());

  useEffect(() => {
    const onStorage = () => setClients(getPersistedClients());
    window.addEventListener('storage', onStorage);
    // Aggiorna anche quando la pagina torna visibile (focus/tab attiva)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        setClients(getPersistedClients());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, brokerProfile, supabase, navigate]);

  // Gestori per il slide over
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setSelectedProfile(null);
    setIsSlideOverOpen(true);
  };

  const handleViewProfile = (client: Client, profile: CreditProfile) => {
    setSelectedClient(client);
    setSelectedProfile(profile);
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setSelectedClient(null);
    setSelectedProfile(null);
  };

  if (authLoading) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Caricamento dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex-1 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!brokerProfile) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <p>Profilo utente non disponibile. Potrebbe essere necessario effettuare nuovamente il login.</p>
        <Button onClick={() => navigate('/login')} className="ml-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      {/* Header della Dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Dashboard Broker - {brokerProfile.first_name} {brokerProfile.last_name}
        </h1>
        <p className="text-lg text-muted-foreground">
          Panoramica completa dei clienti e dei credit profiles
        </p>
      </div>

      {/* Statistiche aggregate + credit score in un'unica griglia */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clienti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score richiesti</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditScoreStats.total}</div>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">{creditScoreStats.completed} completati</Badge>
              {creditScoreStats.pending > 0 && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">{creditScoreStats.pending} in attesa</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% con Segnalazioni</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{creditScoreStats.negativePct}%</div>
            <p className="text-xs text-muted-foreground mt-1">Protesti, pregiudizievoli o concorsuali</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafici */}
      <BrokerCharts stats={stats} only={['creditScore', 'documents']} />

      {/* Slide Over per i dettagli */}
      <ClientDetailsSlideOver
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        client={selectedClient}
        selectedProfile={selectedProfile}
      />

      {/* Documenti da validare */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Documenti da validare</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDocs.length === 0 ? (
            <p className="text-muted-foreground">Nessun documento in attesa di validazione.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Caricato il</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDocs.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.clientName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('it-IT') : '-'}</TableCell>
                    <TableCell>{doc.status === 'pending' ? 'In attesa' : doc.status === 'uploaded' ? 'Caricato' : 'Da modificare'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate('/broker/documents')}>Valida ora</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Credit Score in attesa */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Credit Score in attesa</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCreditScores.length === 0 ? (
            <p className="text-muted-foreground">Nessuna richiesta in attesa.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data richiesta</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCreditScores.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>{report.clientName}</TableCell>
                    <TableCell>{report.requestedAt ? new Date(report.requestedAt).toLocaleDateString('it-IT') : '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate('/broker/credit-score')}>Vai ai credit score</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Clienti con pratiche bloccate */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Clienti con pratiche bloccate</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedClients.length === 0 ? (
            <p className="text-muted-foreground">Nessun cliente con pratiche bloccate.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documenti bloccanti</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>{client.firstName} {client.lastName}</TableCell>
                    <TableCell>{(client.documents || []).filter(doc => ['requires_changes'].includes(doc.status)).length}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate('/broker/documents')}>Vai ai documenti</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerDashboard;
