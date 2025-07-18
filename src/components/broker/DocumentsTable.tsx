import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from '@/mocks/documents-data';
import { Eye, FileText, Download, User, AlertCircle, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface DocumentsTableProps {
  clientDocuments: Array<{
    clientName: string;
    clientEmail: string;
    creditProfileStatus: string;
    documents: Document[];
  }>;
  onViewDocument?: (document: Document) => void;
  onViewClient: (clientData: { clientName: string; clientEmail: string; creditProfileStatus: string; documents: Document[] }) => void;
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
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'uploaded':
      return <Upload className="h-4 w-4 text-blue-600" />;
    case 'requires_changes':
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved': return 'Approvato';
    case 'uploaded': return 'Caricato';
    case 'requires_changes': return 'Richiede modifiche';
    case 'rejected': return 'Rifiutato';
    case 'pending': return 'In attesa';
    default: return 'Sconosciuto';
  }
};

const formatFileSize = (sizeKb: number) => {
  if (sizeKb === 0) return 'N/A';
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
};

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  clientDocuments,
  onViewDocument,
  onViewClient
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clienti e Documenti</span>
          <Badge variant="outline" className="text-xs">
            {clientDocuments.length} clienti con documenti
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documenti</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientDocuments.map((client, index) => {
                const approvedDocs = client.documents.filter(d => d.status === 'approved').length;
                const totalDocs = client.documents.length;
                const rejectedDocs = client.documents.filter(d => d.status === 'rejected').length;
                const requiresChangesDocs = client.documents.filter(d => d.status === 'requires_changes').length;
                
                return (
                  <TableRow key={`${client.clientEmail}-${index}`} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {client.clientName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.clientEmail}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2 max-w-[300px]">
                        {client.documents.slice(0, 3).map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 text-sm">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>{getStatusIcon(doc.status)}</span>
                                </TooltipTrigger>
                                <TooltipContent>{getStatusLabel(doc.status)}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="truncate flex-1">{doc.documentType}</span>
                          </div>
                        ))}
                        {client.documents.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{client.documents.length - 3} altri documenti
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewClient(client)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Dettagli</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {clientDocuments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nessun documento trovato</h3>
              <p>Non ci sono documenti caricati dai clienti.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsTable; 