import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useDocuments } from '@/context/DocumentsContext';

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDocumentById, updateDocumentStatus } = useDocuments();

  const document = getDocumentById(id as string);

  const handleStatusChange = (newStatus: 'validated' | 'pending' | 'rejected') => {
    updateDocumentStatus(id as string, newStatus);
    toast.success(`Stato del documento aggiornato a: ${newStatus}`);
  };

  if (!document) {
    return (
      <div className="container px-4 py-8">
        <h1>Documento non trovato</h1>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna indietro
      </Button>

      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold">Dettagli Documento</h1>
          <p className="text-muted-foreground mt-1">
            Visualizza e modifica i dettagli del documento
          </p>
        </div>

        <div className="grid gap-4 p-6 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome File</p>
              <p className="font-medium">{document.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{document.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{document.client}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Upload</p>
              <p className="font-medium">
                {new Date(document.uploadDate).toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-2">Stato</p>
            <Select
              defaultValue={document.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleziona stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="validated">Validato</SelectItem>
                <SelectItem value="pending">In Revisione</SelectItem>
                <SelectItem value="rejected">Rifiutato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Qui potresti aggiungere il visualizzatore PDF */}
        </div>
      </div>
    </div>
  );
};

export default DocumentEdit; 