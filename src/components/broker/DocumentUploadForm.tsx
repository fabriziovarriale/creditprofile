import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  User, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getBrokerClients } from '@/services/clientsService';
import { createDocument } from '@/services/documentsService';
import { extractPDFContent, updateDocumentWithExtractedContent, markDocumentExtractionFailed } from '@/services/pdfExtractionService';
import { getOrCreateCreditProfile } from '@/services/creditProfilesService';
import { useAuth } from '@/components/providers/SupabaseProvider';

interface DocumentUploadFormProps {
  onClose: () => void;
  onUploadSuccess?: () => void;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
}

// Hook per caricare i clienti del broker
function useBrokerClients() {
  const { profile: brokerUser } = useAuth();
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    
    async function loadClients() {
      if (brokerUser?.id) {
        setLoading(true);
        try {
          const brokerClients = await getBrokerClients(brokerUser.id);
          if (isMounted) {
            setClients(brokerClients);
          }
        } catch (error) {
          console.error('Errore caricamento clienti:', error);
          if (isMounted) {
            setClients([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    }

    loadClients();
    
    return () => {
      isMounted = false;
    };
  }, [brokerUser?.id]);

  return { clients, loading };
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onClose,
  onUploadSuccess,
  clientId: propClientId,
  clientName: propClientName,
  clientEmail: propClientEmail
}) => {
  const [formData, setFormData] = useState({
    clientId: propClientId || '',
    documentType: '',
    customDocumentType: '',
    file: null as File | null,
    notes: ''
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  // Carica i clienti del broker
  const { clients, loading } = useBrokerClients();
  const { profile: brokerUser } = useAuth();

  const documentTypes = [
    'Documento di identità',
    'Passaporto',
    'Patente di guida',
    'Codice fiscale',
    'Busta paga',
    'Contratto di lavoro',
    'Dichiarazione dei redditi',
    'Estratto conto bancario',
    'Bilancio aziendale',
    'Certificato di lavoro',
    'Altro (specifica)'
  ];

  const toastRef = useRef<{ type: 'success' | 'error', message: string } | null>(null);

  // Gestisce i toast in useEffect per evitare problemi durante il rendering
  useEffect(() => {
    if (toastRef.current) {
      const { type, message } = toastRef.current;
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      toastRef.current = null;
    }
  });

  const handleFileSelect = (file: File) => {
    // Verifica dimensione file (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toastRef.current = { type: 'error', message: 'Il file è troppo grande. Dimensione massima: 10MB' };
      return;
    }

    // Verifica tipo file
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toastRef.current = { type: 'error', message: 'Tipo di file non supportato. Usa: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX' };
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    toastRef.current = { type: 'success', message: 'File selezionato correttamente' };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.documentType || !formData.file) {
      toastRef.current = { type: 'error', message: 'Compila tutti i campi obbligatori' };
      return;
    }

    if (formData.documentType === 'Altro (specifica)' && !formData.customDocumentType) {
      toastRef.current = { type: 'error', message: 'Specifica il tipo di documento' };
      return;
    }

    setIsUploading(true);

    try {
      // Simula upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Salva davvero il documento in mockDocuments e nel client
      const client = propClientId && propClientName && propClientEmail
        ? { id: propClientId, firstName: propClientName.split(' ')[0], lastName: propClientName.split(' ').slice(1).join(' '), email: propClientEmail, creditProfiles: [] }
        : clients.find(c => c.id === formData.clientId);
      if (client && brokerUser?.id) {
        const docType = formData.documentType === 'Altro (specifica)' ? formData.customDocumentType : formData.documentType;
        
        // Crea o recupera il profilo credito del cliente
        const creditProfile = await getOrCreateCreditProfile(client.id, brokerUser.id);
        
        if (!creditProfile) {
          toastRef.current = { type: 'error', message: 'Errore: impossibile creare il profilo credito per il cliente' };
          return;
        }
        
        // Crea il documento nel database
        const newDocument = await createDocument({
          credit_profile_id: creditProfile.id,
          uploaded_by_user_id: client.id, // Il cliente che carica il documento
          document_type: docType,
          file_path: `/uploads/${client.id}/${formData.file.name}`, // Percorso simulato
          file_name: formData.file.name,
          file_size_kb: Math.round(formData.file.size / 1024),
          status: 'pending'
        });
        
        if (!newDocument) {
          toastRef.current = { type: 'error', message: 'Errore durante il salvataggio del documento nel database' };
          return;
        }
        
        console.log('Documento salvato nel database:', newDocument);
        
        // Se è un PDF, estrai il contenuto per l'AI
        if (formData.file.type === 'application/pdf') {
          console.log('📄 Estrazione contenuto PDF per l\'AI...');
          
          try {
            const extractionResult = await extractPDFContent(formData.file);
            
            if (extractionResult.success && extractionResult.content) {
              await updateDocumentWithExtractedContent(newDocument.id, extractionResult.content);
              console.log('✅ Contenuto PDF estratto e salvato per l\'AI');
              
              // Mostra informazioni estratte nell'toast
              const metadata = extractionResult.content.metadata;
              if (metadata.containsCF) {
                toastRef.current = { 
                  type: 'success', 
                  message: `Documento caricato! Rilevato codice fiscale: ${metadata.detectedCF}` 
                };
              } else {
                toastRef.current = { 
                  type: 'success', 
                  message: `Documento caricato! Estratte ${metadata.wordCount} parole per l'analisi AI` 
                };
              }
            } else {
              await markDocumentExtractionFailed(newDocument.id, extractionResult.error || 'Errore sconosciuto');
              console.warn('⚠️ Estrazione PDF fallita:', extractionResult.error);
              toastRef.current = { 
                type: 'success', 
                message: 'Documento caricato! (Estrazione contenuto non riuscita)' 
              };
            }
          } catch (extractionError) {
            console.error('❌ Errore durante estrazione PDF:', extractionError);
            await markDocumentExtractionFailed(newDocument.id, 'Errore tecnico durante estrazione');
            toastRef.current = { 
              type: 'success', 
              message: 'Documento caricato! (Estrazione contenuto non riuscita)' 
            };
          }
        } else {
          toastRef.current = { type: 'success', message: 'Documento caricato con successo!' };
        }
      } else {
        toastRef.current = { type: 'success', message: 'Documento caricato con successo!' };
      }
      
      // Reset form (mantieni clientId se passato come prop)
      setFormData({
        clientId: propClientId || '',
        documentType: '',
        customDocumentType: '',
        file: null,
        notes: ''
      });

      // Chiama callback e chiudi slide over
      onUploadSuccess?.();
      onClose();

    } catch (error) {
      toastRef.current = { type: 'error', message: 'Errore durante il caricamento del documento' };
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        {!propClientId || propClientId === '' ? (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="clientId">Seleziona Cliente *</Label>
              <Select
                value={formData.clientId}
                onValueChange={val => setFormData(prev => ({ ...prev, clientId: val }))}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Seleziona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Caricamento clienti...
                    </SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>
                      Nessun cliente disponibile
                    </SelectItem>
                  ) : (
                    clients.filter(client => client.id && client.id.trim() !== '').map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} ({client.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Seleziona il cliente per cui stai caricando il documento</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Tipo Documento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tipo di Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="documentType">Tipo Documento *</Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il tipo di documento" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.filter(type => type && type.trim() !== '').map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.documentType === 'Altro (specifica)' && (
              <div>
                <Label htmlFor="customDocumentType">Specifica Tipo *</Label>
                <Input
                  id="customDocumentType"
                  placeholder="Inserisci il tipo di documento"
                  value={formData.customDocumentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDocumentType: e.target.value }))}
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload File */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">File Upload *</CardTitle>
          </CardHeader>
          <CardContent>
            {!formData.file ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Trascina il file qui o clicca per selezionare
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF, JPG, PNG, DOC, DOCX, XLS, XLSX fino a 10MB
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(formData.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{formData.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(formData.file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note opzionali */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Note (opzionale)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Aggiungi note o commenti sul documento..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Azioni */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isUploading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isUploading || !formData.file || !formData.clientId || !formData.documentType}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Carica Documento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploadForm; 