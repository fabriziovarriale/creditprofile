import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Search, 
  Users, 
  UserCheck,
  Clock,
  AlertTriangle,
  Loader2
} from "lucide-react";

// Import dei componenti e dati
import { mockClients, Client, getAggregatedStats } from '@/mocks/broker-data';
import ClientsTable from '@/components/broker/ClientsTable';
import ClientDetailsSlideOver from '@/components/broker/ClientDetailsSlideOver';

const ClientsPage = () => {
  const { profile: brokerUser, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Stati per il slide over
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [slideOverMode, setSlideOverMode] = useState<'view' | 'create' | 'edit'>('view');

  // Stati per ricerca e filtraggio
  const [searchQuery, setSearchQuery] = useState('');

  // Dati clienti mock persistenti in localStorage
  function getInitialClients() {
    const saved = localStorage.getItem('mockClients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockClients;
      }
    }
    return mockClients;
  }
  const [clients, setClients] = useState<Client[]>(getInitialClients());

  // Calcola le statistiche
  const stats = getAggregatedStats();

  // Filtra i clienti basato sulla ricerca
  const filteredClients = clients.filter(client => 
    client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  // Gestori per il slide over
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setSlideOverMode('view');
    setIsSlideOverOpen(true);
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setSlideOverMode('create');
    setIsSlideOverOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setSlideOverMode('edit');
    setIsSlideOverOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    // Qui implementeresti la logica di eliminazione
    console.log('Elimina cliente:', client);
    // Potresti mostrare una conferma prima di eliminare
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setSelectedClient(null);
    setSlideOverMode('view');
  };

  const handleSubmitSuccess = (client: Client) => {
    setClients(prev => {
      const updated = [...prev, client];
      localStorage.setItem('mockClients', JSON.stringify(updated));
      return updated;
    });
    // Aggiorna anche i mock per persistenza temporanea in FE
    mockClients.push(client);
    console.log('Cliente salvato:', client);
  };

  // Funzione per ripristinare i dati mock di default
  function restoreMockData() {
    // Dati mock di default (copiare qui i dati originali se necessario)
    const defaultClients = [
      {
        id: '1',
        firstName: 'Marco',
        lastName: 'Rossi',
        email: 'marco.rossi@email.com',
        phone: '+39 333 1234567',
        registrationDate: '2024-01-15',
        status: 'active',
        creditProfiles: [],
        documents: []
      },
      {
        id: '2',
        firstName: 'Anna',
        lastName: 'Verdi',
        email: 'anna.verdi@email.com',
        phone: '+39 333 2345678',
        registrationDate: '2024-02-20',
        status: 'active',
        creditProfiles: [],
        documents: []
      }
      // ... altri clienti se vuoi
    ];
    const defaultDocuments = [];
    const defaultCreditScoreReports = [];
    const defaultCreditProfilesEnriched = [];
    localStorage.setItem('mockClients', JSON.stringify(defaultClients));
    localStorage.setItem('mockDocuments', JSON.stringify(defaultDocuments));
    localStorage.setItem('creditScoreReports', JSON.stringify(defaultCreditScoreReports));
    localStorage.setItem('creditProfilesEnriched', JSON.stringify(defaultCreditProfilesEnriched));
    window.location.reload();
  }

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Caricamento...</p>
      </div>
    );
  }

  if (!brokerUser) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <p>Accesso negato. Effettua il login come broker.</p>
        <Button onClick={() => navigate('/login')} className="ml-4">Login</Button>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl ${isSlideOverOpen ? 'md:mr-[600px]' : ''}`} style={{ transition: 'margin-right 0.3s ease-in-out' }}>
      {/* Header della pagina */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestione Clienti</h1>
            <p className="text-lg text-muted-foreground">
              Visualizza e gestisci i tuoi clienti
            </p>
          </div>
          <Button 
            onClick={handleCreateClient} 
            className="w-fit"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuovo Cliente
          </Button>
        </div>

        {/* Card statistiche rimossa */}

        {/* Barra di ricerca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Cerca per nome, email o telefono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabella clienti */}
      <ClientsTable 
        clients={filteredClients}
        onViewClient={handleViewClient}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
      />

      {/* Slide Over per i dettagli */}
      <ClientDetailsSlideOver
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        client={selectedClient}
        mode={slideOverMode}
        onSubmitSuccess={handleSubmitSuccess}
        onEditClient={handleEditClient}
        renderExtraActions={slideOverMode === 'view' && selectedClient ? (
          <Button asChild className="w-full mt-4" variant="default">
            <Link to="/broker/credit-profiles/nuovo">Crea Credit Profile</Link>
          </Button>
        ) : null}
      />
    </div>
  );
};

export default ClientsPage;