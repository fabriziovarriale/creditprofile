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
// Interfaccia Client definita localmente
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
  creditProfiles?: any[];
  documents?: any[];
}
import { Eye, Phone, Mail, Calendar, User, MoreHorizontal, Trash2, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { creditScoreReports, CreditScoreReport } from '../../store/clientsStore';
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
  const [reports] = useState<CreditScoreReport[]>(creditScoreReports);

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
                            {client.email}
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
                        <div className="inline-flex items-center justify-center h-8 w-8">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center h-8 w-8">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
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
                                  console.log('🔘 Click Elimina in ClientsTable per:', client);
                                  onDeleteClient(client);
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
    </Card>
  );
};

export default ClientsTable; 