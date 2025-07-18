import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from '@/mocks/documents-data';
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
} from 'lucide-react';
import { mockDocuments } from '@/mocks/documents-data';
import { mockClients } from '@/mocks/broker-data';
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

const getFileTypeFromName = (fileName: string) => {
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
  const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
  let updated = false;
  for (const client of clients) {
    if (Array.isArray(client.documents)) {
      const idx = client.documents.findIndex((d: any) => d.id === docId);
      if (idx !== -1) {
        client.documents[idx].status = newStatus;
        updated = true;
      }
    }
  }
  if (updated) localStorage.setItem('mockClients', JSON.stringify(clients));
};

const DocumentDetailsSlideOver: React.FC<DocumentDetailsSlideOverProps> = (props) => {
  const { isOpen, onClose, document, selectedClientData, mode: propMode = 'view', onUploadSuccess } = props;
  const { supabase } = useAuth();
  // Hook sempre in cima, mai dentro if/return
  const [mode, setMode] = useState<'view' | 'upload'>(propMode);
  const [docs, setDocs] = useState<Document[]>(selectedClientData?.documents || (document ? [document] : []));
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [showFakePreview, setShowFakePreview] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  useEffect(() => {
    setMode(propMode);
    setDocs(selectedClientData?.documents || (document ? [document] : []));
  }, [isOpen, selectedClientData, document, propMode]);

  const displayData = selectedClientData || (document ? {
    clientName: document.clientName,
    clientEmail: document.clientEmail,
    creditProfileStatus: document.creditProfileStatus,
    documents: docs
  } : null);

  const clientId = React.useMemo(() => {
    if (displayData?.clientEmail && displayData?.clientName) {
      const found = mockClients.find(
        c => `${c.firstName} ${c.lastName}` === displayData.clientName && c.email === displayData.clientEmail
      );
      return found?.id || '';
    }
    return '';
  }, [displayData]);

  const handleApprove = async (doc: Document) => {
    setLoadingApprove(true);
    try {
      const isNumericId = !isNaN(Number(doc.id));
      if (typeof supabase !== 'undefined' && supabase && isNumericId) {
        const { error } = await supabase.from('documents').update({ status: 'approved' }).eq('id', Number(doc.id));
        if (error) throw error;
      }
      setDocumentStatus(doc, 'approved');
      if (onUploadSuccess) onUploadSuccess();
      toast.success('Documento approvato.');
    } catch (err: any) {
      toast.error('Errore durante l\'approvazione: ' + (err.message || err));
    } finally {
      setLoadingApprove(false);
    }
  };
  const handleReject = async (doc: Document) => {
    setLoadingReject(true);
    try {
      const isNumericId = !isNaN(Number(doc.id));
      if (typeof supabase !== 'undefined' && supabase && isNumericId) {
        const { error } = await supabase.from('documents').update({ status: 'rejected' }).eq('id', Number(doc.id));
        if (error) throw error;
      }
      setDocumentStatus(doc, 'rejected');
      if (onUploadSuccess) onUploadSuccess();
      toast.success('Documento rifiutato.');
    } catch (err: any) {
      toast.error('Errore durante il rifiuto: ' + (err.message || err));
    } finally {
      setLoadingReject(false);
    }
  };

  const handleDeleteConfirmed = () => {
    if (!docToDelete) return;
    setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
    const allDocs = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
    const updatedDocs = allDocs.filter((d: any) => d.id !== docToDelete.id);
    localStorage.setItem('mockDocuments', JSON.stringify(updatedDocs));
    if (onUploadSuccess) onUploadSuccess();
    toast.success('Documento eliminato (mock).');
    setDocToDelete(null);
  };

  type DocumentStatus = Document['status'];
  const setDocumentStatus = (doc: Document, status: DocumentStatus) => {
    // Aggiorna mockDocuments
    const idx = mockDocuments.findIndex(d => d.id === doc.id);
    if (idx !== -1) mockDocuments[idx].status = status;
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status } : d));
    // Aggiorna localStorage dei documenti
    const allDocs = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
    const updatedDocs = allDocs.map((d: any) => d.id === doc.id ? { ...d, status } : d);
    localStorage.setItem('mockDocuments', JSON.stringify(updatedDocs));
    // Aggiorna anche client.documents
    updateClientDocumentStatus(doc.id, status);
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
                  onClose={() => setMode('view')}
                  onUploadSuccess={() => {
                    // Aggiorna lista documenti da localStorage
                    const allDocs = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
                    const filtered = allDocs.filter((d: any) => d.clientName === displayData?.clientName && d.clientEmail === displayData?.clientEmail);
                    setDocs(filtered);
                    setMode('view');
                    if (onUploadSuccess) onUploadSuccess();
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
                {/* Lista di tutti i documenti del cliente */}
                {docs && docs.length > 0 ? (
                  docs.map((doc) => {
                    console.log('DEBUG DOC STATUS:', doc.id, doc.status);
                    // Mostra i pulsanti solo se status === 'pending'
                    return (
                      <Card key={doc.id}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            <span className="truncate">{doc.documentType}</span>
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
                              <div className="font-medium mt-1">{formatFileSize(doc.fileSizeKb)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Nome File</span>
                              <div className="font-medium">{doc.fileName || 'N/A'}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tipo File</span>
                              <div className="font-medium">{getFileTypeFromName(doc.fileName)}</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Caricato il</span>
                            <div className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(doc.uploadedAt).toLocaleDateString('it-IT', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          {doc.filePath && (
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
                          {doc.status === 'pending' && (
                            <div className="flex gap-4 mt-6">
                              <Button variant="default" onClick={async () => { await handleApprove(doc); }} disabled={loadingApprove}>
                                <CheckCircle className="h-4 w-4 mr-1" /> {loadingApprove ? 'Approvazione...' : 'Approva'}
                              </Button>
                              <Button variant="destructive" onClick={async () => { await handleReject(doc); }} disabled={loadingReject}>
                                <XCircle className="h-4 w-4 mr-1" /> {loadingReject ? 'Rifiuto...' : 'Rifiuta'}
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" className="flex-1" asChild>
                              <a href={doc.filePath} download={doc.fileName} target="_blank" rel="noopener noreferrer">
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
                    <p className="text-muted-foreground">Nessun documento disponibile</p>
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
              <p className="font-mono text-sm bg-muted px-4 py-2 rounded">{docs.find(d => d.id === previewFile)?.fileName || 'Nessun file selezionato'}</p>
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