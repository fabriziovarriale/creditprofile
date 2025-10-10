import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  XCircle
} from "lucide-react";
import { getBrokerDocuments, getDocumentsByProfile, DocumentWithClient } from '@/services/documentsService';
import { getBrokerClients } from '@/services/clientsService';
import { getOrCreateCreditProfile } from '@/services/creditProfilesService';

// Import dei componenti e dati
import DocumentsTable from '@/components/broker/DocumentsTable';
import DocumentDetailsSlideOver from '@/components/broker/DocumentDetailsSlideOver';

// Utilizziamo il tipo DocumentWithClient dal servizio

// Funzione per raggruppare documenti per cliente
function groupDocumentsByClient(documents: DocumentWithClient[]): { clientName: string; clientEmail: string; creditProfileStatus: string; documents: DocumentWithClient[] }[] {
  const groupedByClient = documents.reduce((acc, doc) => {
    const clientKey = `${doc.clientName}|${doc.clientEmail}`;
    if (!acc[clientKey]) {
      acc[clientKey] = {
        clientName: doc.clientName,
        clientEmail: doc.clientEmail,
        creditProfileStatus: doc.creditProfileStatus,
        documents: [] as DocumentWithClient[]
      };
    }
    acc[clientKey].documents.push(doc);
    return acc;
  }, {} as Record<string, { clientName: string; clientEmail: string; creditProfileStatus: string; documents: DocumentWithClient[] }>);
  return Object.values(groupedByClient);
}

// Funzione per calcolare statistiche
function calculateDocumentStats(documents: DocumentWithClient[]) {
  const totalDocuments = documents.length;
  const documentsByStatus = documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const documentsByType = documents.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const clientsWithDocuments = new Set(documents.map(doc => doc.clientEmail)).size;
  return {
    totalDocuments,
    documentsByStatus,
    documentsByType,
    clientsWithDocuments
  };
}

const DocumentsPage = () => {
  const { profile: brokerUser, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Stati per il slide over
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithClient | null>(null);
  const [selectedClientData, setSelectedClientData] = useState<{
    clientName: string;
    clientEmail: string;
    creditProfileStatus: string;
    documents: DocumentWithClient[];
  } | null>(null);
  const [slideOverMode, setSlideOverMode] = useState<'view' | 'upload'>('view');

  // Stati per ricerca e filtraggio
  const [searchQuery, setSearchQuery] = useState('');

  // Stato documenti per aggiornamento live
  const [clientDocuments, setClientDocuments] = useState<{ clientName: string; clientEmail: string; creditProfileStatus: string; documents: DocumentWithClient[] }[]>([]);
  const [stats, setStats] = useState(calculateDocumentStats([]));
  const [loading, setLoading] = useState(true);

  // Filtra i documenti per cliente basato sulla ricerca
  const filteredClientDocuments = clientDocuments.filter(client => 
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.documents.some(doc => 
      doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Gestori per il slide over
  // 1. Rimuovo selectedDocument e la logica handleViewDocument
  // 2. Modifico DocumentDetailsSlideOver: passo solo selectedClientData, non document
  // 3. Il pulsante "Dettagli" nella tabella chiama onViewClient(client)
  const handleViewClient = (clientData: {
    clientName: string;
    clientEmail: string;
    creditProfileStatus: string;
    documents: DocumentWithClient[];
  }) => {
    setSelectedDocument(null);
    setSelectedClientData(clientData);
    setSlideOverMode('view');
    setIsSlideOverOpen(true);
  };

  const handleUploadDocument = () => {
    setSelectedDocument(null);
    setSelectedClientData(null);
    setSlideOverMode('upload');
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    setSelectedDocument(null);
    setSelectedClientData(null);
    setSlideOverMode('view');
  };

  const handleUploadSuccess = () => {
    // Ricarica i documenti dopo un upload riuscito
    loadDocuments();
  };

  // Funzione per caricare i documenti dal database
  const loadDocuments = async () => {
    if (!brokerUser?.id) {
      console.log('⚠️ Nessun broker user ID disponibile');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 Caricamento documenti per broker:', brokerUser.id);
      console.log('👤 Broker profile completo:', {
        id: brokerUser.id,
        email: brokerUser.email,
        role: brokerUser.role,
        first_name: brokerUser.first_name,
        last_name: brokerUser.last_name
      });
      
      // Carica documenti del broker da Supabase
      const documents = await getBrokerDocuments(brokerUser.id);
      console.log('📄 Documenti caricati:', documents.length);
      console.log('📄 Dettagli documenti:', documents);
      
      // Raggruppa per cliente
      const grouped = groupDocumentsByClient(documents);
      console.log('👥 Documenti raggruppati per cliente:', grouped);
      setClientDocuments(grouped);
      
      // Calcola statistiche
      const newStats = calculateDocumentStats(documents);
      console.log('📊 Statistiche calcolate:', newStats);
      setStats(newStats);
      
    } catch (error) {
      console.error('❌ Errore caricamento documenti:', error);
      setClientDocuments([]);
      setStats(calculateDocumentStats([]));
    } finally {
      setLoading(false);
    }
  };

  // Carica documenti quando il broker è disponibile
  React.useEffect(() => {
    if (!authLoading && brokerUser?.id) {
      loadDocuments();
    }
  }, [authLoading, brokerUser?.id]);

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

  if (loading) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Caricamento documenti...</p>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl ${isSlideOverOpen ? 'md:mr-[600px]' : ''}`} style={{ transition: 'margin-right 0.3s ease-in-out' }}>
      {/* Header della pagina */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestione Documenti</h1>
            <p className="text-lg text-muted-foreground">
              Visualizza e gestisci i documenti dei clienti
            </p>
          </div>
          <Button 
            onClick={handleUploadDocument} 
            className="w-fit"
          >
            <Upload className="w-4 h-4 mr-2" />
            Carica Nuovo Documento
          </Button>
        </div>

        {/* Statistiche rapide */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documenti Totali</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Da {stats.clientsWithDocuments} clienti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approvati</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.documentsByStatus.approved || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDocuments > 0 ? Math.round(((stats.documentsByStatus.approved || 0) / stats.totalDocuments) * 100) : 0}% del totale
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {(stats.documentsByStatus.pending || 0) + (stats.documentsByStatus.uploaded || 0) + (stats.documentsByStatus.requires_changes || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Richiedono attenzione
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifiutati</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.documentsByStatus.rejected || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDocuments > 0 ? Math.round(((stats.documentsByStatus.rejected || 0) / stats.totalDocuments) * 100) : 0}% del totale
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra di ricerca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Cerca per cliente, email o tipo documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabella documenti */}
      {filteredClientDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun documento trovato</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery 
                ? `Nessun documento corrisponde alla ricerca "${searchQuery}"`
                : 'Non ci sono documenti caricati per i tuoi clienti.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleUploadDocument}>
                <Upload className="w-4 h-4 mr-2" />
                Carica Primo Documento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
      <DocumentsTable 
        clientDocuments={filteredClientDocuments}
        onViewClient={handleViewClient}
      />
      )}

      {/* Slide Over per i dettagli */}
      <DocumentDetailsSlideOver
        isOpen={isSlideOverOpen}
        onClose={handleCloseSlideOver}
        document={null}
        selectedClientData={selectedClientData}
        mode={slideOverMode}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default DocumentsPage; 