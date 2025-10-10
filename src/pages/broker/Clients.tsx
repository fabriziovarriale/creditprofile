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
// Interfaccia Client definita localmente
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
import { getBrokerClients, deleteClient } from '@/services/clientsService';
import ClientsTable from '@/components/broker/ClientsTable';
import ClientDetailsSlideOver from '@/components/broker/ClientDetailsSlideOver';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ClientsPage = () => {
  const { profile: brokerUser, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Stati per il slide over
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [slideOverMode, setSlideOverMode] = useState<'view' | 'create' | 'edit'>('view');

  // Stati per ricerca e filtraggio
  const [searchQuery, setSearchQuery] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Stati per dialog eliminazione
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calcola le statistiche (placeholder per ora)
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    pendingClients: clients.filter(c => c.status === 'pending').length,
    totalDocuments: 0,
    pendingDocuments: 0,
    completedProfiles: 0,
    pendingProfiles: 0
  };

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
    console.log('🗑️ handleDeleteClient chiamato per:', client);
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    console.log('🔴 confirmDeleteClient chiamato, clientToDelete:', clientToDelete);
    if (!clientToDelete) {
      console.warn('⚠️ Nessun cliente da eliminare');
      return;
    }
    
    if (!brokerUser?.id) {
      console.error('❌ broker_id mancante per deleteClient');
      toast.error('Errore: broker non autenticato');
      return;
    }
    
    setIsDeleting(true);
    console.log('🚀 Inizio eliminazione cliente ID:', clientToDelete.id);
    
    try {
      const success = await deleteClient(clientToDelete.id, supabase, brokerUser.id);
      console.log('✅ Risultato deleteClient:', success);
      
      if (success) {
        // Rimuovi il cliente dalla lista locale
        setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
        toast.success(`Cliente ${clientToDelete.firstName} ${clientToDelete.lastName} eliminato con successo`);
        setDeleteDialogOpen(false);
        setClientToDelete(null);
      } else {
        console.error('❌ deleteClient ha ritornato false');
        toast.error('Errore durante l\'eliminazione del cliente. Riprova.');
      }
    } catch (error) {
      console.error('💥 Errore eliminazione cliente:', error);
      toast.error('Errore durante l\'eliminazione del cliente');
    } finally {
      setIsDeleting(false);
      console.log('🏁 Fine processo eliminazione');
    }
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setSelectedClient(null);
    setSlideOverMode('view');
  };

  const handleSubmitSuccess = (client: Client, mode: 'create' | 'edit' = 'create') => {
    if (mode === 'edit') {
      // Aggiorna il cliente esistente nella lista
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
      console.log('Cliente aggiornato:', client);
    } else {
      // Aggiungi nuovo cliente alla lista
      setClients(prev => [...prev, client]);
      console.log('Cliente creato:', client);
    }
  };

  // Funzione per ricaricare i dati dal database
  function reloadData() {
    window.location.reload();
  }

  // Carica i clienti dal database
  React.useEffect(() => {
    async function loadClients() {
      if (brokerUser?.id) {
        setLoading(true);
        try {
          const brokerClients = await getBrokerClients(brokerUser.id);
          setClients(brokerClients);
        } catch (error) {
          console.error('Errore caricamento clienti:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (brokerUser?.id) {
      loadClients();
    }
  }, [authLoading, isAuthenticated, navigate, brokerUser?.id]);

  if (authLoading || loading) {
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

      {/* Dialog conferma eliminazione */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il cliente{' '}
              <strong>
                {clientToDelete?.firstName} {clientToDelete?.lastName}
              </strong>
              ? Questa azione eliminerà anche tutti i profili credito, documenti e credit score associati.
              <br />
              <br />
              <span className="text-red-600 font-semibold">Questa azione non può essere annullata.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                'Elimina'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientsPage;