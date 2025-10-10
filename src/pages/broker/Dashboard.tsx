import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Definizioni locali
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
  creditProfiles?: any[];
  documents?: any[];
}

interface CreditProfile {
  id: number;
  client_id: string;
  broker_id: string;
  status: 'pending' | 'completed' | 'draft' | 'in_review' | 'requires_documents';
  created_at: string;
  updated_at: string;
}
import BrokerStatsCards from '@/components/broker/BrokerStatsCards';
import ClientsTable from '@/components/broker/ClientsTable';
import BrokerCharts from '@/components/broker/BrokerCharts';
import ClientDetailsSlideOver from '@/components/broker/ClientDetailsSlideOver';
import { getBrokerCreditScores, CreditScoreWithClient } from '@/services/creditScoresService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle, AlertTriangle, Users, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBrokerClients } from '@/services/clientsService';
import { getBrokerDocuments, DocumentWithClient } from '@/services/documentsService';
import { getBrokerCreditProfiles, CreditProfile as RealCreditProfile } from '@/services/creditProfilesService';

const BrokerDashboard = () => {
  const { profile: brokerProfile, loading: authLoading, isAuthenticated, supabase } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Stati per i dati reali
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<DocumentWithClient[]>([]);
  const [creditProfiles, setCreditProfiles] = useState<RealCreditProfile[]>([]);
  const [creditScores, setCreditScores] = useState<CreditScoreWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stati per il slide over
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CreditProfile | null>(null);

  // Calcola le statistiche aggregate dai dati reali
  const stats = React.useMemo(() => {
    const totalClients = clients.length;
    const totalDocuments = documents.length;
    const totalProfiles = creditProfiles.length;
    const totalReports = creditScores.length;
    
    // Conta documenti per status
    const documentsByStatus = documents.reduce((acc, doc) => {
      acc[doc.status || 'unknown'] = (acc[doc.status || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Conta clienti per status
    const clientsByStatus = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Conta profili credito per status
    const profilesByStatus = creditProfiles.reduce((acc, profile) => {
      acc[profile.status] = (acc[profile.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Media credit score
    const completedScores = creditScores.filter(r => r.status === 'completed' && r.credit_score);
    const averageScore = completedScores.length > 0 
      ? Math.round(completedScores.reduce((sum, r) => sum + (r.credit_score || 0), 0) / completedScores.length)
      : 0;
    
    return {
      totalClients,
      totalDocuments,
      totalProfiles,
      totalReports,
      documentsByStatus,
      clientsByStatus,
      profilesByStatus,
      averageScore,
      // Metriche aggiuntive
      pendingDocuments: documentsByStatus.pending || 0,
      approvedDocuments: documentsByStatus.approved || 0,
      rejectedDocuments: documentsByStatus.rejected || 0,
      activeClients: clientsByStatus.active || 0,
      pendingClients: clientsByStatus.pending || 0,
      pendingProfiles: profilesByStatus.pending || 0,
      completedProfiles: profilesByStatus.completed || 0,
      draftProfiles: profilesByStatus.draft || 0
    };
  }, [clients, documents, creditProfiles, creditScores]);

  const creditScoreStats = React.useMemo(() => {
    const total = creditScores.length;
    const completed = creditScores.filter(r => r.status === 'completed').length;
    const pending = creditScores.filter(r => r.status === 'pending').length;
    const avgScore = completed > 0 ? Math.round(creditScores.filter(r => r.status === 'completed' && r.credit_score).reduce((sum, r) => sum + (r.credit_score || 0), 0) / completed) : 0;
    const negative = creditScores.filter(r => r.status === 'completed' && ((r.protesti || r.pregiudizievoli || r.procedure_concorsuali))).length;
    const negativePct = completed > 0 ? Math.round((negative / completed) * 100) : 0;
    return { total, completed, pending, avgScore, negative, negativePct };
  }, [creditScores]);

  // Documenti da validare: solo status 'pending'
  const pendingDocs = React.useMemo(() => {
    return documents.filter(doc => doc.status === 'pending');
  }, [documents]);

  const pendingCreditScores = React.useMemo(() => {
    const list = creditScores
      .filter(r => r.status === 'pending')
      .map(r => ({
        ...r,
        clientName: r.clientName || r.client_id
      }))
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
    console.log('📝 Pending credit scores visibili in dashboard:', list.length, list.map(r => ({ id: r.id, client: r.clientName, requested_at: r.requested_at })));
    return list;
  }, [creditScores]);

  // Clienti con pratiche bloccate: almeno un documento 'rejected'
  const blockedClients = React.useMemo(() => {
    const blocked = new Set<string>();
    documents.forEach(doc => {
      if (doc.status === 'rejected') {
        blocked.add(doc.clientEmail);
      }
    });
    return clients.filter(client => blocked.has(client.email));
  }, [clients, documents]);

  // Carica i dati reali dal database
  useEffect(() => {
    async function loadData() {
      if (brokerProfile?.id) {
        setLoading(true);
        try {
          const [brokerClients, brokerDocuments, brokerProfiles, brokerCreditScores] = await Promise.all([
            getBrokerClients(brokerProfile.id),
            getBrokerDocuments(brokerProfile.id),
            getBrokerCreditProfiles(brokerProfile.id),
            getBrokerCreditScores(brokerProfile.id, supabase)
          ]);
          setClients(brokerClients);
          setDocuments(brokerDocuments);
          setCreditProfiles(brokerProfiles);
          setCreditScores(brokerCreditScores);
          console.log('📊 Dashboard caricata - Credit Scores:', brokerCreditScores.length);
        } catch (error) {
          console.error('Errore caricamento dati dashboard:', error);
          setError('Errore nel caricamento dei dati');
        } finally {
          setLoading(false);
        }
      }
    }

    if (!authLoading && brokerProfile?.id) {
      loadData();
    }
  }, [authLoading, brokerProfile?.id]);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
            <CardTitle className="text-sm font-medium">Profili Credito</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfiles}</div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {stats.completedProfiles > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">{stats.completedProfiles} completati</Badge>
              )}
              {stats.pendingProfiles > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">{stats.pendingProfiles} in attesa</Badge>
              )}
              {stats.draftProfiles > 0 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">{stats.draftProfiles} bozza</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documenti</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {stats.approvedDocuments > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">{stats.approvedDocuments} approvati</Badge>
              )}
              {stats.pendingDocuments > 0 && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">{stats.pendingDocuments} in attesa</Badge>
              )}
              {stats.rejectedDocuments > 0 && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">{stats.rejectedDocuments} respinti</Badge>
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
        <BrokerCharts stats={stats} documents={documents} creditScores={creditScores} />

      {/* Slide Over per i dettagli */}
      <ClientDetailsSlideOver
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        client={selectedClient}
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
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('it-IT') : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'pending' ? 'secondary' : doc.status === 'approved' ? 'default' : 'destructive'}>
                        {doc.status === 'pending' ? 'In attesa' : doc.status === 'approved' ? 'Approvato' : doc.status === 'rejected' ? 'Rifiutato' : 'Richiede modifiche'}
                      </Badge>
                    </TableCell>
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
                    <TableCell>{report.requested_at ? new Date(report.requested_at).toLocaleDateString('it-IT') : '-'}</TableCell>
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
                {blockedClients.map(client => {
                  const rejectedDocs = documents.filter(doc => 
                    doc.clientEmail === client.email && doc.status === 'rejected'
                  );
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.firstName} {client.lastName}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {rejectedDocs.map((doc, index) => (
                            <div key={index} className="text-sm">
                              <Badge variant="destructive" className="mr-1">Rifiutato</Badge>
                              {doc.file_name || 'Documento senza nome'}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => navigate('/broker/documents')}>
                          Vai ai documenti
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default BrokerDashboard;
