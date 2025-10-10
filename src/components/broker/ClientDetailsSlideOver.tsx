import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Definizione locale
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
import { Separator } from "@/components/ui/separator";
import ClientForm from './ClientForm';
import DocumentUploadForm from './DocumentUploadForm';
import { 
  User, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  FileText,
  CreditCard,
  Edit
} from 'lucide-react';
import { useCreditProfiles } from '@/pages/broker/CreditProfiles';
import DemoReportSlideOver from "../demo/DemoReportSlideOver";

interface ClientDetailsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  mode?: 'view' | 'create' | 'edit';
  onSubmitSuccess?: (client: Client) => void;
  onEditClient?: (client: Client) => void;
  renderExtraActions?: React.ReactNode;
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

const ClientDetailsSlideOver: React.FC<ClientDetailsSlideOverProps> = ({
  isOpen,
  onClose,
  client,
  mode = 'view',
  onSubmitSuccess,
  onEditClient,
  renderExtraActions
}) => {
  const getHeaderTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nuovo Cliente';
      case 'edit':
        return 'Modifica Cliente';
      default:
        return 'Dettagli Cliente';
    }
  };

  const getHeaderDescription = () => {
    switch (mode) {
      case 'create':
        return 'Aggiungi un nuovo cliente al sistema';
      case 'edit':
        return `Modifica le informazioni di ${client?.firstName} ${client?.lastName}`;
      default:
        return client ? `${client.firstName} ${client.lastName}` : '';
    }
  };

  const { profiles } = useCreditProfiles();
  const clientProfiles = client ? profiles.filter(p => p.clientId === client.id) : [];

  const [showDemoModal, setShowDemoModal] = React.useState(false);
  const [selectedProfile, setSelectedProfile] = React.useState<any>(null);
  const [showUploadForm, setShowUploadForm] = React.useState(false);
  const [clientDocs, setClientDocs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (client) {
      const docs = JSON.parse(localStorage.getItem('mockDocuments') || '[]');
      setClientDocs(docs.filter((d: any) => d.clientName === `${client.firstName} ${client.lastName}` && d.clientEmail === client.email));
    }
  }, [client, showUploadForm, isOpen]);

  return (
    <>
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
                <User className="h-5 w-5 flex-shrink-0" />
                {getHeaderTitle()}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {getHeaderDescription()}
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
            {mode === 'create' || mode === 'edit' ? (
              <ClientForm 
                onClose={onClose}
                onSubmitSuccess={onSubmitSuccess}
                client={client}
                mode={mode}
              />
            ) : client ? (
              <div className="p-4 space-y-6">
                {/* Informazioni Cliente */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Informazioni Cliente</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClient?.(client)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Modifica
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-muted-foreground">ID: {client.id}</p>
                        {/* Badge status rimosso */}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{client.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Telefono</p>
                          <p className="font-medium">{client.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Data Registrazione</p>
                          <p className="font-medium">
                            {new Date(client.registrationDate).toLocaleDateString('it-IT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profili Credito */}
                {client.creditProfiles && client.creditProfiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Profili Credito ({client.creditProfiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {client.creditProfiles.map((profile) => (
                        <div key={profile.id} className="p-4 border rounded-lg mb-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">Profilo #{profile.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                Creato il {new Date(profile.createdAt).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {profile.score !== null && (
                                <span className="font-bold text-green-700">Score: {profile.score}</span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedProfile(profile); setShowDemoModal(true); }}
                                className="mt-2"
                              >
                                Preview Demo Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {renderExtraActions && (
                  <div className="pt-2">{renderExtraActions}</div>
                )}
                {clientDocs.length > 0 && (
                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Documenti del Cliente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {clientDocs.map(doc => (
                            <li key={doc.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <span className="font-medium">{doc.documentType}</span> <span className="text-xs text-muted-foreground">({doc.status})</span>
                                <div className="text-xs text-muted-foreground">{doc.fileName}</div>
                              </div>
                              <div className="flex gap-2 mt-2 md:mt-0">
                                <Button size="sm" variant="outline" asChild><a href={doc.filePath} download>Scarica</a></Button>
                                {/* Altre azioni se vuoi */}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 flex items-center justify-center">
                <p className="text-muted-foreground">Nessun cliente selezionato</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <DemoReportSlideOver
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        profile={selectedProfile}
      />
    </>
  );
};

export default ClientDetailsSlideOver; 