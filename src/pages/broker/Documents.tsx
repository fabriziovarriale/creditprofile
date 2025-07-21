import React, { useState } from 'react';
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

// Import dei componenti e dati
import { mockDocuments, getDocumentStats, getDocumentsByClient, Document } from '@/mocks/documents-data';
import DocumentsTable from '@/components/broker/DocumentsTable';
import DocumentDetailsSlideOver from '@/components/broker/DocumentDetailsSlideOver';

// Utility per leggere i documenti persistiti
function getPersistedDocuments(): Document[] {
  const saved = localStorage.getItem('mockDocuments');
  if (saved) {
    try {
      return JSON.parse(saved) as Document[];
    } catch {
      return mockDocuments;
    }
  }
  return mockDocuments;
}

function getDocumentsByClientFromList(docList: Document[]): { clientName: string; clientEmail: string; creditProfileStatus: string; documents: Document[] }[] {
  const groupedByClient = docList.reduce((acc, doc) => {
    const clientKey = `${doc.clientName}|${doc.clientEmail}`;
    if (!acc[clientKey]) {
      acc[clientKey] = {
        clientName: doc.clientName,
        clientEmail: doc.clientEmail,
        creditProfileStatus: doc.creditProfileStatus,
        documents: [] as Document[]
      };
    }
    acc[clientKey].documents.push(doc);
    return acc;
  }, {} as Record<string, { clientName: string; clientEmail: string; creditProfileStatus: string; documents: Document[] }>);
  return Object.values(groupedByClient);
}

function getDocumentStatsFromList(docList) {
  const totalDocuments = docList.length;
  const documentsByStatus = docList.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {});
  const documentsByType = docList.reduce((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {});
  const clientsWithDocuments = new Set(docList.map(doc => doc.clientEmail)).size;
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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedClientData, setSelectedClientData] = useState<{
    clientName: string;
    clientEmail: string;
    creditProfileStatus: string;
    documents: Document[];
  } | null>(null);
  const [slideOverMode, setSlideOverMode] = useState<'view' | 'upload'>('view');

  // Stati per ricerca e filtraggio
  const [searchQuery, setSearchQuery] = useState('');

  // Stato documenti per aggiornamento live
  const [clientDocuments, setClientDocuments] = useState<{ clientName: string; clientEmail: string; creditProfileStatus: string; documents: Document[] }[]>(getDocumentsByClientFromList(getPersistedDocuments()));
  const [stats, setStats] = useState(getDocumentStatsFromList(getPersistedDocuments()));

  // Calcola le statistiche
  // const stats = getDocumentStats(); // This line is no longer needed as stats is now state

  // Filtra i documenti per cliente basato sulla ricerca
  const filteredClientDocuments = clientDocuments.filter(client => 
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.documents.some(doc => 
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
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
    documents: Document[];
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
    const docs = getPersistedDocuments();
    setClientDocuments(getDocumentsByClientFromList(docs));
    setStats(getDocumentStatsFromList(docs));
  };

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
      <DocumentsTable 
        clientDocuments={filteredClientDocuments}
        onViewClient={handleViewClient}
      />

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