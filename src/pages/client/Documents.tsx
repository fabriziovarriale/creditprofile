import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown,
  Loader2,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from '@/components/providers/SupabaseProvider';
import AnimatedCard from '@/components/ui/AnimatedCard';
import FileUploader from '@/components/ui/FileUploader';
import { toast } from 'sonner';
import { Document as SupabaseDbDocument, DocumentStatus } from '@/types/index';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Interfaccia per i documenti visualizzati nella tabella
interface DisplayDocument extends SupabaseDbDocument {
  displayName: string;
  displayType: string;
  displaySize: string;
  displayUploadDate: string;
}

type StatusFilterType = DocumentStatus | 'all';

const ClientDocuments = () => {
  const { profile: user, loading: authLoading, supabase } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState<SupabaseDbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [sortBy, setSortBy] = useState<keyof Pick<DisplayDocument, 'displayName' | 'uploaded_at' | 'status'>>('uploaded_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [docToDelete, setDocToDelete] = useState<SupabaseDbDocument | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (authLoading || !user || !supabase) {
        if (!authLoading) setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch the credit_profile for the current user
        const { data: profileData, error: profileError } = await supabase
          .from('credit_profiles')
          .select('id') // Seleziona solo l'ID del profilo
          .eq('client_id', user.id)
          .maybeSingle(); // Un utente potrebbe non avere ancora un profilo

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 è "queried record not found" che è ok
          throw profileError;
        }

        if (!profileData || !profileData.id) {
          // Nessun profilo di credito trovato per questo utente
          setDocuments([]);
          setLoading(false);
          console.log("Nessun profilo di credito trovato per l'utente, nessun documento da caricare.");
          return;
        }

        const creditProfileId = profileData.id;

        // 2. Fetch documents related to the found credit_profile_id
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('credit_profile_id', creditProfileId);

        if (documentsError) throw documentsError;
        setDocuments(documentsData || []);
        console.log("Documenti caricati per credit_profile_id:", creditProfileId, documentsData);

      } catch (err: any) {
        console.error("Errore nel recupero dei documenti:", err);
        setError(err.message || "Si è verificato un errore nel recupero dei documenti.");
        toast.error("Impossibile caricare i documenti.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [user, authLoading, supabase]);

  const formatBytes = (bytes: number | null | undefined, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const processedDocuments = useMemo((): DisplayDocument[] => {
    return documents
      .map((doc): DisplayDocument => ({
        ...doc,
        displayName: doc.file_name || (doc.file_path ? doc.file_path.split('/').pop() : 'Documento senza nome'),
        displayType: doc.document_type ? doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : (doc.file_name?.split('.').pop()?.toUpperCase() || 'FILE'),
        displaySize: formatBytes(doc.file_size_kb ? doc.file_size_kb * 1024 : undefined),
        displayUploadDate: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('it-IT') : 'N/D',
      }))
      .filter(doc => 
        doc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (statusFilter === 'all' || doc.status === statusFilter)
      )
      .sort((a, b) => {
        let comparison = 0;
        const valA = sortBy === 'displayName' ? a.displayName.toLowerCase() : new Date(a.uploaded_at).getTime();
        const valB = sortBy === 'displayName' ? b.displayName.toLowerCase() : new Date(b.uploaded_at).getTime();
        
        if (valA < valB) comparison = -1;
        if (valA > valB) comparison = 1;
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [documents, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!supabase || !user) {
      toast.error("Servizio non disponibile o utente non autenticato.");
      return;
    }

    // Prima, recupera il credit_profile_id dell'utente
    let creditProfileId: number | null = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('credit_profiles')
        .select('id')
        .eq('client_id', user.id)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      if (!profileData || !profileData.id) {
        toast.error("Profilo di credito non trovato. Impossibile caricare il documento.");
        return;
      }
      creditProfileId = profileData.id;
    } catch (error: any) {
      toast.error(`Errore nel recuperare il profilo di credito: ${error.message}`);
      console.error("Errore recupero profilo per upload:", error);
      return;
    }

    setLoading(true);
    toast.info(`Caricamento di ${file.name}...`);

    const filePath = `${user.id}/${creditProfileId}/${documentType}/${file.name}`;

    try {
      // 1. Carica il file su Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents') // Assicurati che il bucket esista e si chiami 'documents'
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Sovrascrivi se esiste già
        });

      if (uploadError) {
        console.error("Errore Supabase Storage upload:", uploadError);
        throw new Error(`Errore storage: ${uploadError.message}`);
      }
      
      console.log("File caricato su Supabase Storage:", filePath);

      // 2. Crea la riga nella tabella 'documents' del database
      const newDocumentEntry: Omit<SupabaseDbDocument, 'id' | 'created_at' | 'uploaded_at'> & { credit_profile_id: number } = {
        credit_profile_id: creditProfileId, // ID del profilo di credito
        uploaded_by_user_id: user.id,
        document_type: documentType, // Tipo di documento fornito dall'utente
        file_path: filePath, 
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        status: 'pending', // Stato iniziale dopo il caricamento
      };

      const { data: dbData, error: dbError } = await supabase
        .from('documents')
        .insert(newDocumentEntry)
        .select()
        .single();

      if (dbError) {
        console.error("Errore inserimento DB documento:", dbError);
        // Potrebbe essere utile tentare di eliminare il file dallo storage se l'insert fallisce
        // await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Errore DB: ${dbError.message}`);
      }

      setDocuments(prev => [dbData as SupabaseDbDocument, ...prev]);
      toast.success(`${file.name} caricato con successo.`);
      setIsUploadModalOpen(false);
    } catch (error: any) { 
      toast.error(`Errore durante il caricamento: ${error.message}`);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDocument = async (doc: SupabaseDbDocument) => {
    if (!doc.id) return toast.error("ID documento mancante.");
    setDocToDelete(doc);
  };

  const handleDeleteConfirmed = () => {
    if (!docToDelete) return;
    try {
      let docs = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
      docs = docs.filter((d: any) => d.id !== docToDelete.id);
      localStorage.setItem('mockDocuments', JSON.stringify(docs));
      setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
      toast.success(`Documento "${docToDelete.file_name || docToDelete.document_type}" eliminato (mock).`);
    } catch (error: any) {
      toast.error(`Errore durante l'eliminazione: ${error.message}`);
      console.error("Errore eliminazione documento:", error);
    }
    setDocToDelete(null);
  };

  const handleDownloadDocument = async (doc: DisplayDocument) => {
    if(!supabase || !doc.file_path) {
      toast.error("Servizio non disponibile o percorso file mancante.");
      return;
    }
    
    try {
      toast.info(`Download di ${doc.displayName}...`);
      const { data, error } = await supabase.storage
        .from('documents') // Nome del bucket
        .download(doc.file_path);

      if (error) throw error;
      if (data) {
        const blob = new Blob([data], { type: doc.file_type || 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = doc.file_name || doc.displayName || 'downloaded_file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success(`${doc.displayName} scaricato.`);
      }
    } catch (error: any) {
      console.error("Errore download documento:", error);
      toast.error(`Impossibile scaricare ${doc.displayName}: ${error.message}`);
    }
  };

  const getStatusBadge = (status: DocumentStatus | null | undefined) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approvato</Badge>;
      case 'pending':
      case 'uploaded': // Consideriamo 'uploaded' come pending review
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">In Revisione</Badge>;
      case 'rejected': return <Badge variant="destructive">Respinto</Badge>;
      case 'missing': return null; // Rimosso badge Mancante
      case 'requires_changes': return <Badge variant="outline" className="border-yellow-600 text-yellow-600">Richiede Modifiche</Badge>; 
      default: return <Badge variant="outline">Sconosciuto</Badge>;
    }
  };

  const toggleSort = (field: keyof Pick<DisplayDocument, 'displayName' | 'uploaded_at' | 'status'>) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Caricamento sessione utente...</p>
      </div>
    );
  }

  if (loading && documents.length === 0) { // Mostra loading solo se non ci sono ancora documenti
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Caricamento documenti...</p>
      </div>
    );
  }

  if (error && documents.length === 0) { // Mostra errore solo se non ci sono documenti da visualizzare
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">I Miei Documenti</h1>
          <p className="text-muted-foreground mt-1">Gestisci i documenti per la tua richiesta.</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Carica Documento
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Cerca per nome documento..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterType)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="approved">Approvati</SelectItem>
            <SelectItem value="pending">In Attesa</SelectItem>
            <SelectItem value="rejected">Rifiutati</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <TableHeader className="sr-only"> {/* Header per screen reader, le colonne hanno già i bottoni di sort */}
            <TableRow>
                <TableHead>Nome File</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dimensione</TableHead>
                <TableHead>Data Caricamento</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
            </TableRow>
        </TableHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('displayName')}>
                Nome <ArrowUpDown className={`ml-1 h-3.5 w-3.5 inline ${sortBy === 'displayName' ? 'text-primary' : 'text-muted-foreground/50'}`} />
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Dim.</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('uploaded_at')}>
                Caricato il <ArrowUpDown className={`ml-1 h-3.5 w-3.5 inline ${sortBy === 'uploaded_at' ? 'text-primary' : 'text-muted-foreground/50'}`} />
              </TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && documents.length > 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary inline-block mr-2" /> Aggiornamento...
                </TableCell>
              </TableRow>
            )}
            {!loading && processedDocuments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Nessun documento trovato per i filtri selezionati.
                  {documents.length === 0 && " Non hai ancora caricato nessun documento."}
                </TableCell>
              </TableRow>
            )}
            {processedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.displayName}</TableCell>
                <TableCell><Badge variant="outline">{doc.displayType}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{doc.displaySize}</TableCell>
                <TableCell>{doc.displayUploadDate}</TableCell>
                <TableCell className="flex items-center">
                  {getStatusBadge(doc.status as DocumentStatus)} 
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc)} title="Scarica">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc)} title="Elimina">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <AnimatedCard className="w-full max-w-lg relative animate-fade-in">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-2xl leading-none p-1 rounded-full hover:bg-muted"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Carica Nuovo Documento</h2>
            <FileUploader 
              onFileSelect={handleFileUpload} 
              uploading={loading}
            />
            <p className="text-xs text-muted-foreground mt-4">
              Tipi di file supportati: PDF, JPG, PNG, DOCX. Dimensione massima: 5MB.
            </p>
          </AnimatedCard>
        </div>
      )}
      <AlertDialog open={!!docToDelete} onOpenChange={open => { if (!open) setDocToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo documento? L'azione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientDocuments;
