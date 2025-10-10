import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  FileText, 
  CreditCard, 
  X, 
  Check,
  Users,
  FolderOpen
} from 'lucide-react';
import { useAIContext } from '@/components/providers/AIContextProvider';
import { cn } from '@/lib/utils';

interface AIContextSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIContextSelector: React.FC<AIContextSelectorProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    context, 
    setContext, 
    clearContext, 
    hasContext
  } = useAIContext();

  // Dati placeholder - in produzione verrebbero dal database
  const mockClients = [
    { id: '1', name: 'Mario Rossi', email: 'mario.rossi@email.com' },
    { id: '2', name: 'Giulia Bianchi', email: 'giulia.bianchi@email.com' },
    { id: '3', name: 'Luca Verdi', email: 'luca.verdi@email.com' },
  ];

  const mockDocuments = [
    { id: '1', name: 'Busta paga - Gennaio 2024', type: 'Busta paga' },
    { id: '2', name: 'CUD 2023', type: 'CUD' },
    { id: '3', name: 'Estratto conto bancario', type: 'Estratto conto' },
  ];

  const mockProfiles = [
    { id: '1', name: 'Profilo Credito - Mario Rossi', status: 'In elaborazione' },
    { id: '2', name: 'Profilo Credito - Giulia Bianchi', status: 'Completato' },
    { id: '3', name: 'Profilo Credito - Luca Verdi', status: 'In attesa' },
  ];

  const handleSelectClient = (clientId: string) => {
    console.log('🎯 Selezionato cliente:', clientId);
    setContext({ clientId });
    onClose();
  };

  const handleSelectDocument = (documentId: string) => {
    console.log('📄 Selezionato documento:', documentId);
    setContext({ documentIds: [documentId] });
    onClose();
  };

  const handleSelectProfile = (profileId: string) => {
    setContext({ profileId });
    onClose();
  };

  const handleClearContext = () => {
    clearContext();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Seleziona Contesto AI</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Contesto Attuale */}
          {hasContext && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Contesto Attuale:</h3>
              <div className="space-y-1">
                {context.clientId && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Cliente: {mockClients.find(c => c.id === context.clientId)?.name}
                    </span>
                  </div>
                )}
                {context.documentIds?.length && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Documento: {mockDocuments.find(d => d.id === context.documentIds?.[0])?.name}
                    </span>
                  </div>
                )}
                {context.profileId && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Profilo: {mockProfiles.find(p => p.id === context.profileId)?.name}
                    </span>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearContext}
                className="mt-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancella Contesto
              </Button>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {/* Clienti */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Clienti
                </h3>
                <div className="space-y-2">
                  {mockClients.map((client) => (
                    <div
                      key={client.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        context.clientId === client.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => handleSelectClient(client.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                        {context.clientId === client.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documenti */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documenti
                </h3>
                <div className="space-y-2">
                  {mockDocuments.map((document) => (
                    <div
                      key={document.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        context.documentIds?.includes(document.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => handleSelectDocument(document.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{document.name}</div>
                          <div className="text-sm text-gray-500">{document.type}</div>
                        </div>
                        {context.documentIds?.includes(document.id) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profili Credito */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Profili Credito
                </h3>
                <div className="space-y-2">
                  {mockProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors",
                        context.profileId === profile.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => handleSelectProfile(profile.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-sm text-gray-500">{profile.status}</div>
                        </div>
                        {context.profileId === profile.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
