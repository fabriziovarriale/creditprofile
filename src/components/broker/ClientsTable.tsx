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
import { Client } from '@/mocks/broker-data';
import { Eye, Phone, Mail, Calendar, User, MoreHorizontal, Trash2, FileText, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requestCreditScore, creditScoreReports, CreditScoreReport } from '../../store/clientsStore';
import { useState } from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ClientsTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Attivo';
    case 'pending':
      return 'In attesa';
    case 'suspended':
      return 'Sospeso';
    default:
      return 'Sconosciuto';
  }
};

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onViewClient,
  onEditClient,
  onDeleteClient
}) => {
  const [reports, setReports] = useState<CreditScoreReport[]>(creditScoreReports);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
  const [showCreditScoreModal, setShowCreditScoreModal] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [isLoadingCreditScore, setIsLoadingCreditScore] = useState(false);

  const handleRequestCreditScore = (clientId: string) => {
    setPendingClientId(clientId);
    setShowCreditScoreModal(true);
  };

  const confirmRequestCreditScore = () => {
    if (!pendingClientId) return;
    setIsLoadingCreditScore(true);
    setShowCreditScoreModal(false);
    setTimeout(() => {
      requestCreditScore(pendingClientId, setReports);
      setIsLoadingCreditScore(false);
      setPendingClientId(null);
    }, 2000); // Simula chiamata API
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lista Clienti</span>
          <Badge variant="outline" className="text-xs">
            {clients.length} clienti totali
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Credit Profile</TableHead>
                <TableHead>Registrazione</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Dettagli</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const totalProfiles = client.creditProfiles.length;
                return (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Icona User rimossa */}
                        <div>
                          <div className="font-medium">
                            {client.firstName} {client.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {client.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.creditProfiles.length > 0 ? (
                        <div className="text-sm font-medium">
                          {client.creditProfiles.length} profilo{client.creditProfiles.length !== 1 ? 'i' : ''}
                          <span className="block text-xs text-muted-foreground mt-1">
                            Creato il {new Date(client.creditProfiles[0].createdAt).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nessuno</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(client.registrationDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {reports.find(r => r.clientId === client.id) ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-0 h-8 w-8 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => handleRequestCreditScore(client.id)}
                                aria-label="Richiedi nuovo Credit Score"
                                disabled={isLoadingCreditScore}
                              >
                                <FileText className="h-5 w-5 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Richiedi un nuovo Credit Score aggiornato per questo cliente
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                        <Button
                                variant="ghost"
                                size="icon"
                                className="p-0 h-8 w-8 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => handleRequestCreditScore(client.id)}
                                aria-label="Richiedi Credit Score"
                                disabled={isLoadingCreditScore}
                              >
                                <FileText className="h-5 w-5 text-blue-600" />
                        </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Richiedi il Credit Score per questo cliente
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onViewClient(client)}
                              className="p-0 h-8 w-8 hover:bg-gray-100 hover:text-gray-900"
                              aria-label="Dettagli"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Visualizza dettagli cliente
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      {(onEditClient || onDeleteClient) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {onEditClient && (
                              <DropdownMenuItem onClick={() => onEditClient(client)}>
                                Modifica
                              </DropdownMenuItem>
                            )}
                            {onDeleteClient && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setClientToDelete(client);
                                  setDeleteModalOpen(true);
                                }}
                                className="text-red-600"
                              >
                                Elimina
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nessun cliente trovato</h3>
              <p>Non ci sono clienti registrati nel sistema.</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Modale di conferma eliminazione */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="mb-4 text-lg font-semibold">Conferma eliminazione</div>
            <div className="mb-6 text-sm text-muted-foreground">Sei sicuro di voler eliminare questo cliente? L'operazione non è reversibile.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setClientToDelete(null)}>Annulla</Button>
              <Button variant="destructive" onClick={() => {
                const newClients = clients.filter((c: any) => c.id !== clientToDelete.id);
                // setClients(newClients); // This line was removed as per the edit hint
                // Se usi localStorage, aggiorna anche lì
                if (localStorage.getItem('clients')) {
                  localStorage.setItem('clients', JSON.stringify(newClients));
                }
                setClientToDelete(null);
                setDeleteModalOpen(false); // Close modal after deletion
              }}>Elimina</Button>
            </div>
          </div>
        </div>
      )}
      {showCreditScoreModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="mb-4 text-lg font-semibold">Conferma richiesta Credit Score</div>
            <div className="mb-6 text-sm text-muted-foreground">Vuoi richiedere o aggiornare il Credit Score per questo cliente?</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowCreditScoreModal(false); setPendingClientId(null); }}>Annulla</Button>
              <Button variant="default" onClick={confirmRequestCreditScore}>Conferma</Button>
            </div>
          </div>
        </div>
      )}
      {isLoadingCreditScore && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <div className="text-base font-medium">Richiesta in corso...</div>
            <div className="text-sm text-muted-foreground mt-2">Stiamo ottenendo il nuovo Credit Score</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ClientsTable; 