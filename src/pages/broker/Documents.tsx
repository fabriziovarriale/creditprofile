import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Upload, MoreVertical, Download, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, FileType, Loader2
} from "lucide-react";
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Document as DbDocument, DocumentStatus } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

const DocumentsPage = () => {
  const { profile: brokerUser, loading: authLoading, isAuthenticated, supabase } = useAuth();
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DbDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true });
      return;
    }

    const fetchDocuments = async () => {
      if (!supabase || !brokerUser) return;
      setLoadingData(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (fetchError) throw fetchError;
        setDocuments(data || []);
        setFilteredDocuments(data || []);
      } catch (err: any) {
        console.error("Errore nel recupero dei documenti:", err);
        setError("Impossibile caricare i documenti.");
        toast.error("Errore nel caricamento dei documenti: " + err.message);
      } finally {
        setLoadingData(false);
      }
    };
    if (isAuthenticated && brokerUser) {
      fetchDocuments();
    }
  }, [authLoading, isAuthenticated, brokerUser, supabase, navigate]);

  useEffect(() => {
    const filtered = documents.filter(doc => 
      (doc.file_path?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.file_type?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.status?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  const getStatusIcon = (status: DocumentStatus | undefined | null) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      default: return <AlertCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getStatusText = (status: DocumentStatus | undefined | null) => {
    switch (status) {
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      case 'pending': return 'In attesa';
      default: return 'Sconosciuto';
    }
  };

  const getFileIcon = (fileType: string | undefined | null) => {
    const type = fileType?.toLowerCase();
    if (type?.includes('pdf')) return <FileText className="w-6 h-6 text-red-400" />;
    if (type?.includes('word')) return <FileText className="w-6 h-6 text-blue-400" />;
    if (type?.includes('excel') || type?.includes('spreadsheet')) return <FileText className="w-6 h-6 text-green-400" />;
    return <FileType className="w-6 h-6 text-zinc-400" />;
  };

  const extractFileName = (filePath: string | undefined | null) => {
    return filePath?.split('/').pop() || 'Senza nome';
  };

  if (authLoading) {
    return <div className="p-6 flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Caricamento...</p></div>;
  }
  
  if (loadingData && !error) {
     return <div className="p-6 flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Caricamento documenti...</p></div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 flex-1 flex items-center justify-center"><AlertCircle className="w-6 h-6 mr-2" /> {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Documenti (Broker)</h1>
        <Button onClick={() => navigate('/broker/new-document')} className="bg-primary hover:bg-primary/80">
          <Upload className="w-4 h-4 mr-2" /> Carica Nuovo Documento
        </Button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <Input type="text" placeholder="Cerca per nome file, tipo o stato..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background border-border placeholder:text-muted-foreground" />
      </div>
      {filteredDocuments.length === 0 && !loadingData && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nessun documento trovato</h3>
          <p className="text-muted-foreground">Non ci sono documenti che corrispondono ai criteri di ricerca o non sono ancora stati caricati.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="p-4 bg-card border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/broker/documents/${document.id}`)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">{getFileIcon(document.file_type)}</div>
                <div>
                  <h3 className="text-md font-semibold text-card-foreground line-clamp-1" title={extractFileName(document.file_path)}>{extractFileName(document.file_path)}</h3>
                  <p className="text-xs text-muted-foreground">{document.file_type?.toUpperCase() || 'N/D'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mb-3">
              <div className="flex items-center"><Calendar className="w-3 h-3 mr-1.5" />Caricato il: {new Date(document.uploaded_at).toLocaleDateString('it-IT')}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {getStatusIcon(document.status)}
                <span className={`text-xs font-medium`}>{getStatusText(document.status)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentsPage; 