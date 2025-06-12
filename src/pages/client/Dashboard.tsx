import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  UserCheck, 
  FileWarning, 
  ArrowRight, 
  CalendarDays, 
  FileStack, 
  FileCheck, 
  FileClock, 
  XCircle, 
  HelpCircle, 
  Hourglass 
} from 'lucide-react';

// Interfaccia per i dati dei documenti (simile a quella in ClientStatus)
interface DocumentRowData {
  id: number; // o string se UUID dalla tabella 'documents'
  document_type: string;
  file_name: string | null;
  uploaded_at: string | null;
  status: string | null;
}

// Funzione helper per visuals stato documento (simile a ClientStatus)
const getDocumentStatusVisuals = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'uploaded':
    case 'pending_review':
    case 'pending': // Aggiunto pending generico
      return { Icon: Hourglass, color: "text-yellow-500", label: "In Revisione" };
    case 'approved':
      return { Icon: FileCheck, color: "text-green-500", label: "Approvato" };
    case 'rejected':
      return { Icon: XCircle, color: "text-red-500", label: "Respinto" };
    case 'missing':
      return { Icon: FileClock, color: "text-orange-500", label: "Mancante" };
    case 'requires_changes':
      return { Icon: AlertCircle, color: "text-yellow-600", label: "Richiede Modifiche" };
    default:
      return { Icon: HelpCircle, color: "text-muted-foreground", label: "Sconosciuto" };
  }
};

const ClientDashboard = () => {
  const { profile: user, loading: authLoading, supabase } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applicationId, setApplicationId] = useState<number | null>(null); // ID del credit_profile
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationCreatedAt, setApplicationCreatedAt] = useState<string | null>(null);
  const [assignedBroker, setAssignedBroker] = useState<{ name: string; email: string } | null>(null);
  // const [missingDocumentsCount, setMissingDocumentsCount] = useState<number>(0); // Sostituito da elenco documenti
  const [documents, setDocuments] = useState<DocumentRowData[]>([]);

  const userFirstName = user?.first_name || 'Cliente';

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !supabase) {
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      setError(null);
      setDocuments([]); // Resetta i documenti prima del fetch

      try {
        console.log("ClientDashboard: Inizio fetch dati specifici...");

        // 1. Fetch credit profile for the current client
        const { data: profileData, error: profileError } = await supabase
          .from('credit_profiles')
          .select('id, status, broker_id, document_summary, created_at') // Aggiunto created_at
          .eq('client_id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        if (profileData) {
          setApplicationId(profileData.id);
          setApplicationStatus(profileData.status || 'Non Avviata');
          setApplicationCreatedAt(profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/D');

          // 2. Fetch ALL documents for this profile
          const { data: documentsData, error: docsError } = await supabase
            .from('documents')
            .select('id, document_type, file_name, uploaded_at, status')
            .eq('credit_profile_id', profileData.id);

          if (docsError) {
            console.warn('Errore nel caricare i documenti:', docsError);
            setDocuments([]);
          } else {
            setDocuments(documentsData || []);
          }

          if (profileData.broker_id) {
            const { data: brokerData, error: brokerError } = await supabase
              .from('users')
              .select('first_name, last_name, email')
              .eq('id', profileData.broker_id)
              .single();

            if (brokerError) {
              console.warn('Errore nel recuperare i dati del broker:', brokerError);
              setAssignedBroker(null);
            } else if (brokerData) {
              setAssignedBroker({ 
                name: `${brokerData.first_name || ''} ${brokerData.last_name || ''}`.trim() || 'N/D',
                email: brokerData.email || 'N/D'
              });
            }
          } else {
            setAssignedBroker(null);
          }
        } else {
          setApplicationStatus('Non Avviata');
          setApplicationCreatedAt('N/D');
          setDocuments([]);
          setAssignedBroker(null);
        }

        console.log("ClientDashboard: Fetch dati completato.");
      } catch (err: any) {
        console.error("ClientDashboard: Errore nel fetch dei dati specifici:", err);
        setError("Impossibile caricare i dettagli della dashboard. Riprova più tardi.");
      } finally {
        setLoadingData(false);
      }
    };

    if (!authLoading && user && supabase) {
      fetchData();
    } else if (!authLoading) {
      setLoadingData(false);
    }

  }, [user, supabase, authLoading]);

  // Calcolo statistiche documenti (da ClientStatus)
  const totalDocs = documents.length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const pendingDocs = documents.filter(d => d.status === 'uploaded' || d.status === 'pending_review' || d.status === 'pending').length;
  const missingDocs = documents.filter(d => d.status === 'missing').length;
  const rejectedOrChangesDocs = documents.filter(d => d.status === 'rejected' || d.status === 'requires_changes').length;
  const documentsRequiringAttention = documents.filter(d => ['missing', 'requires_changes', 'rejected'].includes(d.status || '')).length;


  if (authLoading || loadingData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Caricamento dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-destructive">
        {error}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-destructive">
        Utente non autenticato. Effettua il login.
      </div>
    );
  }
  
  const praticaNonAvviata = (applicationStatus === 'Non Avviata' || !applicationStatus || applicationStatus === 'draft') && totalDocs === 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Benvenuto, {userFirstName}!</h1>

      {/* Card Dettagli Pratica */} 
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileWarning className="w-6 h-6 mr-3 text-primary" />
            La Tua Richiesta
          </CardTitle>
          {applicationStatus !== 'Non Avviata' && applicationCreatedAt && applicationCreatedAt !=='N/D' &&
            <CardDescription>
              Aperta il: {applicationCreatedAt}
            </CardDescription>
          }
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stato Attuale:</p>
            <Badge 
              variant={
                applicationStatus === "approved" ? "default" 
                : applicationStatus === "rejected" ? "destructive" 
                : applicationStatus === "completed" ? "default"
                : applicationStatus === "requires_documents" ? "destructive"
                : "secondary"
              }
              className="text-base"
            >
              {applicationStatus ? applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1) : 'Non disponibile'}
            </Badge>
          </div>

          {documentsRequiringAttention > 0 && applicationStatus !== 'approved' && applicationStatus !== 'rejected' && applicationStatus !== 'completed' && (
            <div className="flex items-start text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                Hai {documentsRequiringAttention} documenti che richiedono la tua attenzione (mancanti, rifiutati o da modificare).
                <Link to="/client/documents" className="font-semibold underline ml-1 hover:text-yellow-800">Vai ai documenti</Link>.
              </span>
            </div>
          )}
          {applicationStatus === 'approved' && (
             <p className="text-sm text-green-600 mt-2">Congratulazioni! La tua richiesta è stata approvata.</p>
          )}
          {applicationStatus === 'rejected' && (
             <p className="text-sm text-red-600 mt-2">Siamo spiacenti, la tua richiesta è stata respinta.</p>
          )}
          {praticaNonAvviata && (
            <p className="text-sm text-muted-foreground mt-2">
              Sembra che tu non abbia ancora avviato una richiesta o che non ci siano documenti richiesti al momento.
              {/* Potresti aggiungere un pulsante per avviare una nuova richiesta qui */}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card Broker Assegnato - rimane simile ma potrebbe essere spostata o integrata */} 
      {assignedBroker && assignedBroker.name && assignedBroker.name.trim() !== '' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-blue-500" />
              Il Tuo Broker Assegnato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="font-semibold">{assignedBroker.name}</p>
              <p className="text-sm text-muted-foreground">{assignedBroker.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {!assignedBroker && applicationStatus !== 'Non Avviata' && (
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-blue-500" />
              Broker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nessun broker assegnato al momento.</p>
          </CardContent>
        </Card>
      )}

      {/* Nuova Card Riepilogo Documenti Dettagliato */} 
      {!praticaNonAvviata && documents && (
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Documenti</CardTitle>
            <CardDescription>Stato dei documenti relativi alla tua richiesta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalDocs > 0 ? (
              <>
                {/* Riepilogo generale */} 
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Totali</p>
                    <p className="text-2xl font-semibold">{totalDocs}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <p className="text-xs text-green-700">Approvati</p>
                    <p className="text-2xl font-semibold text-green-600">{approvedDocs}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-xs text-yellow-700">In Revisione</p>
                    <p className="text-2xl font-semibold text-yellow-600">{pendingDocs}</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <p className="text-xs text-orange-700">Mancanti</p>
                    <p className="text-2xl font-semibold text-orange-600">{missingDocs}</p>
                  </div>
                  {(rejectedOrChangesDocs > 0) && (
                    <div className="p-3 bg-red-500/10 rounded-lg col-span-2 md:col-span-1 lg:col-span-1">
                      <p className="text-xs text-red-700">Da Rivedere</p>
                      <p className="text-2xl font-semibold text-red-600">{rejectedOrChangesDocs}</p>
                    </div>
                  )}
                </div>
                
                {/* Lista dettagliata documenti */} 
                <h4 className="text-md font-semibold pt-4 border-t">Dettaglio Documenti:</h4>
                <div className="space-y-2">
                  {documents.map(doc => {
                    const { Icon, color, label } = getDocumentStatusVisuals(doc.status);
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 ${color} flex-shrink-0`} />
                          <div>
                              <p className="font-medium">{doc.document_type ? doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/D'}</p>
                              {doc.file_name && <p className="text-xs text-muted-foreground">{doc.file_name}</p>}
                          </div>
                        </div>
                        <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'} className={`${color} bg-opacity-20 hover:bg-opacity-30`}>{label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nessun documento specificato o richiesto per questa pratica al momento.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Link Rapidi */} 
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/client/documents">
            <Button variant="outline" className="w-full justify-between">
              Gestisci i Tuoi Documenti
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/client/profile"> {/* Assumendo esista una pagina profilo */} 
            <Button variant="outline" className="w-full justify-between">
              Visualizza Profilo Personale
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

    </div>
  );
};

export default ClientDashboard;
