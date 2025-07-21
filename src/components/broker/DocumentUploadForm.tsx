import React, { useState } from 'react';
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
import { mockClients } from '@/mocks/broker-data';
import { mockDocuments } from '@/mocks/documents-data';

interface DocumentUploadFormProps {
  onClose: () => void;
  onUploadSuccess?: () => void;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
}

// Utility per leggere i clienti persistiti
function getPersistedClients() {
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
  // Stato clienti persistenti
  const [clients, setClients] = useState(getPersistedClients());
  // Aggiorna i clienti se cambia localStorage (es: nuovo cliente aggiunto)
  React.useEffect(() => {
    const onStorage = () => setClients(getPersistedClients());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

  const handleFileSelect = (file: File) => {
    // Verifica dimensione file (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Il file è troppo grande. Dimensione massima: 10MB');
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
      toast.error('Tipo di file non supportato. Usa: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX');
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    toast.success('File selezionato correttamente');
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
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (formData.documentType === 'Altro (specifica)' && !formData.customDocumentType) {
      toast.error('Specifica il tipo di documento');
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
      if (client) {
        const fileUrl = URL.createObjectURL(formData.file);
        const docId = 'd' + Math.floor(Math.random() * 1000000);
        const docType = formData.documentType === 'Altro (specifica)' ? formData.customDocumentType : formData.documentType;
        const newDoc = {
          id: docId,
          documentType: docType,
          fileName: formData.file.name,
          fileSizeKb: Math.round(formData.file.size / 1024),
          status: 'pending' as const,
          uploadedAt: new Date().toISOString(),
          filePath: fileUrl,
          creditProfileId: client.creditProfiles[0]?.id || '',
          uploadedByUserId: '1', // mock
          clientName: client.firstName + ' ' + client.lastName,
          clientEmail: client.email,
          creditProfileStatus: client.creditProfiles[0]?.status || 'pending',
        };
        
        // Aggiorna localStorage per persistenza (rimuove duplicazione)
        try {
          let docs = [];
          const saved = localStorage.getItem('mockDocuments');
          if (saved) {
            try {
              docs = JSON.parse(saved);
              if (!Array.isArray(docs)) docs = [];
            } catch {
              docs = [];
            }
          }
          // Aggiungi il nuovo documento ai documenti esistenti
          docs.push(newDoc);
          localStorage.setItem('mockDocuments', JSON.stringify(docs));
          
          // Aggiorna anche mockDocuments per consistenza in sessione
          mockDocuments.push(newDoc);
        } catch {
          // In caso di errore, cerca di recuperare documenti esistenti prima di sovrascrivere
          try {
            const existing = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
            localStorage.setItem('mockDocuments', JSON.stringify([...existing, newDoc]));
          } catch {
            localStorage.setItem('mockDocuments', JSON.stringify([newDoc]));
          }
          mockDocuments.push(newDoc);
        }
        if (Array.isArray(client.documents)) {
          client.documents.push({
            id: docId,
            documentType: docType,
            fileName: formData.file.name,
            fileSizeKb: Math.round(formData.file.size / 1024),
            status: 'pending' as const,
            uploadedAt: new Date().toISOString(),
          });
        }
        console.log('Documento aggiunto:', newDoc);
      }
      toast.success('Documento caricato con successo!');
      
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
      toast.error('Errore durante il caricamento del documento');
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
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </SelectItem>
                  ))}
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
                  {documentTypes.map((type) => (
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