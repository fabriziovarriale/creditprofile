import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Utilizziamo l'interfaccia DocumentWithClient dal servizio
import { DocumentWithClient } from '@/services/documentsService';

// Interfaccia Document compatibile con DocumentWithClient
interface Document {
  id: number;
  document_type: string;
  file_name: string;
  file_size_kb: number;
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  uploaded_at: string;
  file_path?: string;
  credit_profile_id?: number;
  uploaded_by_user_id?: string;
  clientName?: string;
  clientEmail?: string;
  creditProfileStatus?: string;
}
import { Separator } from "@/components/ui/separator";
import DocumentUploadForm from './DocumentUploadForm';
import { 
  FileText, 
  User, 
  X, 
  Download, 
  Calendar, 
  HardDrive, 
  CheckCircle, 
  XCircle, 
  Upload, 
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { getBrokerDocuments, deleteDocument } from '@/services/documentsService';
import { getBrokerClients } from '@/services/clientsService';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/SupabaseProvider';
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

interface DocumentDetailsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  clientDocuments?: Array<{
    clientName: string;
    clientEmail: string;
    creditProfileStatus: string;
    documents: Document[];
  }> | null;
  selectedClientData?: {
    clientName: string;
    clientEmail: string;
    creditProfileStatus: string;
    documents: Document[];
  } | null;
  mode?: 'view' | 'upload'; // Aggiungo modalità per upload
  onUploadSuccess?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'uploaded':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'requires_changes':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'uploaded':
      return <Upload className="h-5 w-5 text-blue-600" />;
    case 'requires_changes':
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-600" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'Approvato';
    case 'pending': return 'In attesa';
    case 'rejected': return 'Rifiutato';
    default: return status;
  }
};

const formatFileSize = (sizeKb: number) => {
  if (sizeKb === 0) return 'N/A';
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
};

const getFileTypeFromName = (fileName: string | null | undefined) => {
  if (!fileName) return 'File sconosciuto';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return 'PDF Document';
    case 'doc':
    case 'docx': return 'Word Document';
    case 'jpg':
    case 'jpeg':
    case 'png': return 'Image';
    case 'xls':
    case 'xlsx': return 'Excel Spreadsheet';
    default: return 'File';
  }
};

const updateClientDocumentStatus = (docId: string, newStatus: string) => {
  // Questa funzione non è più necessaria con i dati reali
  // I documenti vengono aggiornati direttamente nel database
  console.log('Aggiornamento status documento:', docId, newStatus);
};

const DocumentDetailsSlideOver: React.FC<DocumentDetailsSlideOverProps> = (props) => {
  const { isOpen, onClose, document, selectedClientData, mode: propMode = 'view', onUploadSuccess } = props;
  const { supabase, profile: brokerUser } = useAuth();
  // Hook sempre in cima, mai dentro if/return
  const [mode, setMode] = useState<'view' | 'upload'>(propMode);
  const [docs, setDocs] = useState<Document[]>(selectedClientData?.documents || (document ? [document] : []));
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [showFakePreview, setShowFakePreview] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [forceRemount, setForceRemount] = useState(false);

  // Helpers robusti per aggiornare/rimuovere documenti nello stato locale
  const updateDocInState = (docId: number | string, partial: Partial<Document>) => {
    const targetId = Number(docId);
    setDocs(prev => {
      const next = prev.map(d => Number(d.id) === targetId ? { ...d, ...partial } : { ...d });
      const foundAfter = next.find(d => Number(d.id) === targetId);
      console.log('🧩 updateDocInState', { targetId, partial, foundAfter });
      return next;
    });
    setRenderKey(prev => prev + 1);
    setLastUpdate(Date.now());
  };

  const removeDocInState = (docId: number | string) => {
    const targetId = Number(docId);
    setDocs(prev => {
      const beforeIds = prev.map(d => d.id);
      const next = prev.filter(d => Number(d.id) !== targetId).map(d => ({ ...d }));
      console.log('🧹 removeDocInState', { targetId, beforeIds, afterIds: next.map(d => d.id) });
      return next;
    });
    setRenderKey(prev => prev + 1);
    setLastUpdate(Date.now());
  };

  // Inizializza i docs solo quando lo slide-over si apre o cambia contesto
  const initializedFromPropsRef = useRef(false);
  useEffect(() => {
    if (isOpen && !initializedFromPropsRef.current) {
    setMode(propMode);
    setDocs(selectedClientData?.documents || (document ? [document] : []));
      initializedFromPropsRef.current = true;
    }
    if (!isOpen) {
      initializedFromPropsRef.current = false;
    }
  }, [isOpen, propMode, selectedClientData?.clientEmail, document?.id]);

  // Se cambia il cliente o il documento visualizzato, re-inizializza alla prossima apertura
  useEffect(() => {
    initializedFromPropsRef.current = false;
  }, [selectedClientData?.clientEmail, document?.id]);

  // Realtime: ascolta UPDATE/DELETE sulla tabella e filtra in client sugli ID visibili
  useEffect(() => {
    if (!isOpen || !supabase) return;
    const currentIds = docs.map(d => Number(d.id));
    if (currentIds.length === 0) return;

    console.log('📡 Sottoscrizione realtime (client-side filter) IDs:', currentIds.join(','));
    const channel = supabase
      .channel(`documents-slideover-${currentIds.join('-')}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'documents' }, (payload: any) => {
        const updated = payload.new;
        const idNum = Number(updated?.id);
        if (currentIds.includes(idNum)) {
          console.log('🔔 UPDATE realtime (match) documento:', idNum, 'status:', updated?.status);
          updateDocInState(idNum, { status: updated?.status, file_name: updated?.file_name, file_path: updated?.file_path });
        } else {
          console.log('ℹ️ UPDATE realtime ignorato per id:', idNum);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'documents' }, (payload: any) => {
        const deletedId = Number(payload.old?.id);
        if (currentIds.includes(deletedId)) {
          console.log('🔔 DELETE realtime (match) documento:', deletedId);
          removeDocInState(deletedId);
        } else {
          console.log('ℹ️ DELETE realtime ignorato per id:', deletedId);
        }
      })
      .subscribe((status) => {
        console.log('📡 Stato canale realtime:', status);
      });

    return () => {
      console.log('📴 Disiscrizione realtime document IDs:', currentIds.join(','));
      supabase.removeChannel(channel);
    };
  // dipendenza sugli ID per aggiornare la sottoscrizione quando cambia l'elenco
  }, [isOpen, supabase, docs.map(d => d.id).join(',')]);

  // Debug: monitora i cambiamenti di docs
  useEffect(() => {
    console.log('📊 Docs cambiati:', docs.map(d => ({ id: d.id, status: d.status })));
  }, [docs]);

  // Funzione per ricaricare i dati freschi dal database
  const refreshClientDocuments = async () => {
    if (!brokerUser?.id || !selectedClientData) {
      console.log('⚠️ Impossibile ricaricare: mancano broker o client data');
      return;
    }

    setRefreshing(true);
    console.log('🔄 Ricaricamento dati freschi dal database...');
    
    try {
      // Ricarica tutti i documenti del broker
      const freshDocuments = await getBrokerDocuments(brokerUser.id);
      console.log('📄 Documenti freschi caricati:', freshDocuments.length);
      
      // Filtra i documenti del cliente corrente
      const clientFreshDocs = freshDocuments.filter(d => 
        d.clientName === selectedClientData.clientName && 
        d.clientEmail === selectedClientData.clientEmail
      );
      
      console.log('👤 Documenti cliente aggiornati:', clientFreshDocs.length);
      console.log('📋 Dettagli documenti:', clientFreshDocs.map(d => ({ id: d.id, status: d.status, type: d.document_type })));
      
      // FORZA il re-render creando un array completamente nuovo
      const newDocsArray = clientFreshDocs.length > 0 
        ? clientFreshDocs.map(doc => ({ ...doc }))
        : []; // Array vuoto esplicito
      console.log('🔄 Creato nuovo array documenti:', newDocsArray);
      console.log('🔄 Array vuoto?', newDocsArray.length === 0);
      
      // FORZA l'aggiornamento dell'array docs
      console.log('🔄 Docs prima dell\'aggiornamento:', docs.length);
      setDocs(() => {
        console.log('🔄 Settando nuovo array docs:', newDocsArray.length);
        return newDocsArray;
      });
      setDocuments(freshDocuments);
      
      // Se non ci sono più documenti, chiudi lo slide over dopo un breve delay
      if (newDocsArray.length === 0) {
        console.log('🚪 Nessun documento rimasto, chiudo lo slide over in 2 secondi...');
        setTimeout(() => {
          console.log('🚪 Chiusura automatica slide over');
          toast.success('Tutti i documenti sono stati processati. Slide over chiuso automaticamente.');
          onClose();
        }, 2000);
      }
      
      // STRATEGIA DRASTICA: Smonta e rimonta completamente il componente
      console.log('🔄 Inizio smontaggio componente...');
      setForceRemount(true);
      
      // Aspetta un tick per smontare
      setTimeout(() => {
        console.log('🔄 Rimontaggio componente con nuovi dati...');
        const timestamp = Date.now();
        setRenderKey(prev => prev + 1);
        setLastUpdate(timestamp);
        setForceRemount(false);
        console.log('✅ Componente rimontato con timestamp:', timestamp);
        
        // ULTIMA RISORSA: Se anche questo non funziona, chiudi e riapri lo slide over
        // Decommentare se necessario:
        /*
        setTimeout(() => {
          console.log('🔄 ULTIMA RISORSA: Chiudo e riapro lo slide over...');
          onClose();
          setTimeout(() => {
            // Qui dovremmo riaprire lo slide over, ma dipende dalla logica della pagina padre
            console.log('🔄 Dovrei riaprire lo slide over ora...');
          }, 100);
        }, 100);
        */
      }, 50);
      
      // Notifica anche la pagina padre
      if (onUploadSuccess) {
        console.log('📡 Notifica pagina padre per sincronizzazione');
        onUploadSuccess();
      }
      
      console.log('✅ Ricaricamento completato con successo');
      
    } catch (error) {
      console.error('❌ Errore durante il ricaricamento:', error);
      toast.error('Errore durante l\'aggiornamento dei dati');
    } finally {
      setRefreshing(false);
    }
  };

  // Carica clienti e documenti del broker
  useEffect(() => {
    async function loadData() {
      if (brokerUser?.id) {
        try {
          const [brokerClients, brokerDocuments] = await Promise.all([
            getBrokerClients(brokerUser.id),
            getBrokerDocuments(brokerUser.id)
          ]);
          setClients(brokerClients);
          setDocuments(brokerDocuments);
        } catch (error) {
          console.error('Errore caricamento dati:', error);
        }
      }
    }
    loadData();
  }, [brokerUser?.id]);

  const displayData = selectedClientData || (document ? {
    clientName: document.clientName,
    clientEmail: document.clientEmail,
    creditProfileStatus: document.creditProfileStatus,
    documents: docs
  } : null);

  const clientId = React.useMemo(() => {
    if (displayData?.clientEmail && displayData?.clientName) {
      const found = clients.find(
        (c: any) => `${c.firstName} ${c.lastName}` === displayData.clientName && c.email === displayData.clientEmail
      );
      return found?.id || '';
    }
    return '';
  }, [displayData, clients]);

  const handleApprove = async (doc: Document) => {
    setLoadingApprove(true);
    console.log('🚀 Inizio approvazione documento:', doc.id, 'status attuale:', doc.status);
    
    try {
      // Aggiornamento ottimistico UI
      const previousDocs = docs;
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'approved' } : { ...d }));
      setRenderKey(prev => prev + 1);

      // 1. Aggiorna il database PRIMA
      console.log('1️⃣ Aggiornamento database...');
      const isNumericId = !isNaN(Number(doc.id));
      if (typeof supabase !== 'undefined' && supabase && isNumericId) {
        const { error } = await supabase.from('documents').update({ status: 'approved' }).eq('id', Number(doc.id));
        if (error) throw error;
        console.log('✅ Documento approvato nel database:', doc.id);
      }
      
      // 2. Recupera la riga aggiornata e sincronizza SOLO quel documento (evita race)
      console.log('2️⃣ Recupero riga aggiornata...');
      if (typeof supabase !== 'undefined' && supabase && isNumericId) {
        const { data: updatedRow, error: selErr } = await supabase
          .from('documents')
          .select('id, status, file_name, file_path')
          .eq('id', Number(doc.id))
          .single();
        if (selErr) {
          console.warn('⚠️ Recupero riga fallito, mantengo lo stato ottimistico:', selErr.message);
        } else if (updatedRow) {
          updateDocInState(updatedRow.id, { status: updatedRow.status, file_name: updatedRow.file_name, file_path: updatedRow.file_path });
        }
      }
      
      toast.success('Documento approvato con successo!');
      console.log('🎉 Approvazione completata con successo');
      
    } catch (err: any) {
      console.error('❌ Errore approvazione documento:', err);
      // Ripristina stato precedente in caso di errore
      setDocs(previous => previous.map(d => d));
      toast.error('Errore durante l\'approvazione: ' + (err.message || err));
    } finally {
      setLoadingApprove(false);
    }
  };
  const handleReject = async (doc: Document) => {
    setLoadingReject(true);
    console.log('🚀 Inizio rifiuto documento:', doc.id, 'status attuale:', doc.status);
    
    try {
      // Aggiornamento ottimistico UI
      const previousDocs = docs;
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'rejected' } : { ...d }));
      setRenderKey(prev => prev + 1);

      // 1. Aggiorna il database PRIMA
      console.log('1️⃣ Aggiornamento database...');
      const isNumericId = !isNaN(Number(doc.id));
      if (typeof supabase !== 'undefined' && supabase && isNumericId) {
        const { error } = await supabase.from('documents').update({ status: 'rejected' }).eq('id', Number(doc.id));
        if (error) throw error;
        console.log('✅ Documento rifiutato nel database:', doc.id);
      }
      
      // 2. Recupera la riga aggiornata e sincronizza SOLO quel documento (evita race)
      console.log('2️⃣ Recupero riga aggiornata...');
      if (typeof supabase !== 'undefined' && supabase && isNumericId) {
        const { data: updatedRow, error: selErr } = await supabase
          .from('documents')
          .select('id, status, file_name, file_path')
          .eq('id', Number(doc.id))
          .single();
        if (selErr) {
          console.warn('⚠️ Recupero riga fallito, mantengo lo stato ottimistico:', selErr.message);
        } else if (updatedRow) {
          updateDocInState(updatedRow.id, { status: updatedRow.status, file_name: updatedRow.file_name, file_path: updatedRow.file_path });
        }
      }
      
      toast.success('Documento rifiutato con successo!');
      console.log('🎉 Rifiuto completato con successo');
      
    } catch (err: any) {
      console.error('❌ Errore rifiuto documento:', err);
      // Ripristina stato precedente in caso di errore
      setDocs(previous => previous.map(d => d));
      toast.error('Errore durante il rifiuto: ' + (err.message || err));
    } finally {
      setLoadingReject(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!docToDelete) return;
    
    console.log('🗑️ Inizio eliminazione documento:', docToDelete.id);
    
    try {
      // Rimozione ottimistica dalla UI
      const deletingId = docToDelete.id;
      const previousDocs = docs;
      setDocs(prev => prev.filter(d => d.id !== deletingId));
      setRenderKey(prev => prev + 1);

      // Elimina il documento dal database
      const success = await deleteDocument(Number(docToDelete.id));
      
      if (success) {
        console.log('✅ Documento eliminato dal database:', docToDelete.id);
        
        // Rimuovi localmente, il realtime/parent aggiornerà il resto
        removeDocInState(docToDelete.id);
        
        toast.success('Documento eliminato con successo');
        console.log('🎉 Eliminazione completata con successo');
      } else {
        console.error('❌ Errore eliminazione dal database');
        // Ripristina lista in caso di fallimento
        setDocs(previousDocs => previousDocs);
        toast.error('Errore durante l\'eliminazione del documento');
      }
    } catch (error) {
      console.error('❌ Errore eliminazione documento:', error);
      // Ripristina lista in caso di errore
      setDocs(previousDocs => previousDocs);
      toast.error('Errore durante l\'eliminazione del documento');
    }
    
    setDocToDelete(null);
  };

  type DocumentStatus = Document['status'];
  const setDocumentStatus = (doc: Document, status: DocumentStatus) => {
    console.log('🔄 Aggiornamento status documento:', doc.id, 'da', doc.status, 'a', status);
    
    // Crea un nuovo array completamente nuovo per forzare il re-render
    setDocs(prev => {
      const newDocs = prev.map(d => {
        if (d.id === doc.id) {
          const updatedDoc = { ...d, status };
          console.log('📝 Documento aggiornato:', updatedDoc);
          return updatedDoc;
        }
        return { ...d }; // Clona anche gli altri documenti
      });
      console.log('📋 Nuovo array documenti:', newDocs);
      return newDocs;
    });
    
    // Forza il re-render del componente
    setRenderKey(prev => {
      const newKey = prev + 1;
      console.log('🔄 Nuovo render key:', newKey);
      return newKey;
    });
    
    console.log('✅ Status documento aggiornato localmente, forzato re-render');
  };

  return (
    <div>
      {/* Overlay per mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
      
      {/* Pannello slide over */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full overflow-y-auto">
          {/* Header del pannello */}
          <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold flex items-center gap-2 truncate">
                {mode === 'upload' ? (
                  <>
                    <Upload className="h-5 w-5 flex-shrink-0" />
                    Carica Documento
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    {document ? 'Dettagli Documento' : 'Documenti Cliente'}
                  </>
                )}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {mode === 'upload' 
                  ? 'Carica un nuovo documento per un cliente'
                  : document 
                    ? `${document.documentType} di ${displayData?.clientName}`
                    : `Tutti i documenti di ${displayData?.clientName}`
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 flex-shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenuto del pannello */}
          <div className="h-full overflow-y-auto">
            {/* Informazioni Cliente sempre visibile */}
            {displayData && (
              <div className="p-4 pb-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informazioni Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{displayData.clientName}</span>
                      </div>
                      {/* RIMOSSO: badge status credit profile */}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{displayData.clientEmail}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Sotto: form upload o lista documenti o placeholder */}
            {mode === 'upload' ? (
              <div className="p-4">
                <DocumentUploadForm
                  clientId={clientId}
                  clientName={displayData?.clientName}
                  clientEmail={displayData?.clientEmail}
                  onClose={onClose}
                  onUploadSuccess={() => {
                    // Aggiorna lista documenti da localStorage
                    const allDocs = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
                    const filtered = allDocs.filter((d: any) => d.clientName === displayData?.clientName && d.clientEmail === displayData?.clientEmail);
                    setDocs(filtered);
                    // Chiudi completamente lo slide over dopo l'upload
                    if (onUploadSuccess) onUploadSuccess();
                    onClose();
                  }}
                />
              </div>
            ) : !displayData ? (
              <div className="p-4">Nessun dato disponibile</div>
            ) : (
              <div className="p-4 space-y-6">
                {/* Pulsante per caricare nuovo documento */}
                <div className="flex justify-end mb-4">
                  <Button variant="default" onClick={() => setMode('upload')}>
                    <Upload className="h-4 w-4 mr-2" /> Carica Nuovo Documento
                  </Button>
                </div>
                {/* Loader overlay durante il refresh */}
                {refreshing && (
                  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="text-gray-700 font-medium">Aggiornamento dati in corso...</span>
                    </div>
                  </div>
                )}

                {/* Lista di tutti i documenti del cliente */}
                {forceRemount ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="text-gray-700">Aggiornamento interfaccia...</span>
                    </div>
                  </div>
                ) : (
                <div key={`docs-container-${renderKey}-${lastUpdate}`}>
                {console.log('🔍 Rendering container - docs.length:', docs.length, 'renderKey:', renderKey)}
                {docs && docs.length > 0 ? (
                  docs.map((doc, index) => {
                    console.log('🔍 Rendering documento:', doc.id, 'status:', doc.status, 'renderKey:', renderKey, 'lastUpdate:', lastUpdate);
                    // Mostra i pulsanti solo se status === 'pending'
                    return (
                      <Card key={`doc-${doc.id}-${doc.status}-${renderKey}-${lastUpdate}-${index}`}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            <span className="truncate">{doc.document_type}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Status</span>
                              <div className="mt-1">
                                <Badge className={getStatusColor(doc.status)}>
                                  {getStatusLabel(doc.status)}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Dimensione File</span>
                              <div className="font-medium mt-1">{formatFileSize(doc.file_size_kb)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Nome File</span>
                              <div className="font-medium">{doc.file_name || 'N/A'}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tipo File</span>
                              <div className="font-medium">{getFileTypeFromName(doc.file_name)}</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Caricato il</span>
                            <div className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(doc.uploaded_at).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          {doc.file_path && (
                            <>
                              <Separator />
                              {/* BLOCCO DUPLICATO RIMOSSO: bottoni Scarica Documento e Anteprima */}
                            </>
                          )}
                          {doc.status === 'requires_changes' && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center gap-2 text-orange-800">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">Documento richiede modifiche</span>
                              </div>
                              <p className="text-sm text-orange-700 mt-1">
                                Il documento necessita di correzioni prima dell'approvazione. Contattare il cliente per i dettagli.
                              </p>
                            </div>
                          )}
                          
                          {/* Debug temporaneo */}
                          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <strong>🔍 Debug:</strong> Status: {doc.status} | ID: {doc.id} | Key: {renderKey} | Update: {lastUpdate}
                          </div>
                          
                          {doc.status === 'pending' ? (
                            <div className="flex gap-4 mt-6">
                              <Button 
                                variant="default" 
                                onClick={async () => { 
                                  console.log('🔘 Click Approva per documento:', doc.id, 'status:', doc.status);
                                  await handleApprove(doc); 
                                }} 
                                disabled={loadingApprove || loadingReject}
                                className="min-w-[120px]"
                              >
                                {loadingApprove ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                                    Approvazione...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approva
                                  </>
                                )}
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={async () => { 
                                  console.log('🔘 Click Rifiuta per documento:', doc.id, 'status:', doc.status);
                                  await handleReject(doc); 
                                }} 
                                disabled={loadingApprove || loadingReject}
                                className="min-w-[120px]"
                              >
                                {loadingReject ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                                    Rifiuto...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rifiuta
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-700">
                                ✅ Documento già processato con status: <strong>{doc.status}</strong>
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" className="flex-1" asChild>
                              <a href={doc.file_path} download={doc.file_name} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Scarica Documento
                              </a>
                            </Button>
                            <Button variant="secondary" onClick={() => setShowFakePreview(true)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Anteprima
                            </Button>
                            <Button variant="destructive" onClick={() => setDocToDelete(doc)}>
                              <X className="h-4 w-4 mr-1" /> Elimina
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nessun documento</h3>
                      <p className="text-muted-foreground">
                        {docs.length === 0 && renderKey > 0 
                          ? 'Tutti i documenti sono stati eliminati o processati.'
                          : 'Non ci sono documenti per questo cliente.'
                        }
                      </p>
                      {docs.length === 0 && renderKey > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium">
                            ⏰ Questo pannello si chiuderà automaticamente tra pochi secondi...
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Debug: docs.length = {docs.length}, renderKey = {renderKey}
                      </p>
                    </div>
                  </div>
                )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale anteprima documento */}
      {showFakePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowFakePreview(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setShowFakePreview(false)}>
              <X className="h-5 w-5" />
            </Button>
            <div className="w-full flex flex-col items-center py-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Anteprima Documento</p>
              <p className="text-muted-foreground mb-4">(Questa è una preview finta)</p>
              <p className="font-mono text-sm bg-muted px-4 py-2 rounded">{docs.find(d => d.id === previewFile)?.file_name || 'Nessun file selezionato'}</p>
              <div className="mt-6 text-center text-muted-foreground">Anteprima non disponibile per questo tipo di file</div>
            </div>
          </div>
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

export default DocumentDetailsSlideOver; 