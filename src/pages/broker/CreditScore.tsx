import React, { useState, useRef, useEffect } from 'react';
import { getBrokerCreditScores, CreditScoreWithClient, createCreditScoreRequest, deleteCreditScoreReport } from '@/services/creditScoresService';
import { getClientCreditProfile } from '@/services/creditProfilesService';
import { getBrokerClients, Client } from '@/services/clientsService';
import { useAuth } from '@/components/providers/SupabaseProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Eye, Trash2, Loader2, AlertTriangle } from "lucide-react";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Tipo per compatibilità con il componente esistente
type CreditScoreReport = CreditScoreWithClient;

export default function CreditScorePage() {
  const { profile: brokerUser, loading: authLoading, isAuthenticated, session, user, supabase: authenticatedSupabase } = useAuth();
  const { toast } = useToast();
  
  // Debug: Stato di autenticazione dettagliato
  console.log('🔍 CreditScore Page - Auth Debug:', {
    authLoading,
    isAuthenticated,
    hasSession: !!session,
    hasUser: !!user,
    hasBrokerUser: !!brokerUser,
    sessionUserId: session?.user?.id,
    brokerUserId: brokerUser?.id,
    userEmail: user?.email || session?.user?.email
  });
  
  // Stato per i credit scores da Supabase
  const [reports, setReports] = useState<CreditScoreReport[]>([]);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CreditScoreReport | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<CreditScoreReport | null>(null);
  const [showRequestSlideOver, setShowRequestSlideOver] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  // Stato clienti dal database
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  // Stato per modale conferma e loader
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [pendingRequestClientId, setPendingRequestClientId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Carica i dati dal database
  useEffect(() => {
    async function loadData() {
      if (brokerUser?.id) {
        setLoading(true);
        try {
          const [brokerClients, brokerCreditScores] = await Promise.all([
            getBrokerClients(brokerUser.id),
            getBrokerCreditScores(brokerUser.id, authenticatedSupabase)
          ]);
          setClients(brokerClients);
          setReports(brokerCreditScores);
          console.log('📊 Credit Score page caricata - Reports:', brokerCreditScores.length);
        } catch (error) {
          console.error('Errore caricamento dati:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (!authLoading && brokerUser?.id) {
      loadData();
    }
  }, [authLoading, brokerUser?.id]);

  // Realtime: ascolta UPDATE su credit_scores per aggiornamenti auto-simulati
  useEffect(() => {
    if (!authenticatedSupabase || !brokerUser?.id) return;
    const channel = authenticatedSupabase
      .channel('credit-scores-broker')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'credit_scores', filter: `broker_id=eq.${brokerUser.id}` }, async (payload: any) => {
        const updated = payload.new;
        setReports(prev => prev.map(r => (Number(r.id) === Number(updated.id) ? { ...r, ...updated } : r)));
      })
      .subscribe();
    return () => { authenticatedSupabase.removeChannel(channel); };
  }, [authenticatedSupabase, brokerUser?.id]);


  // Helper per trovare il cliente (ora dal report stesso)
  const getClientName = (report: CreditScoreReport) => report.clientName || 'Cliente sconosciuto';

  // Stato per il menu a discesa
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Chiudi il menu se clicchi fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Lista clienti per cui NON esiste già una richiesta
  const clientsWithoutScore = clients.filter(c => !reports.some(r => r.clientId === c.id));

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Credit Score richiesti</h1>
        <div className="flex gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowRequestSlideOver(true)}
          >
            Richiedi Credit Score
          </Button>
        </div>
      </div>
      {/* SlideOver richiesta credit score */}
      {showRequestSlideOver && (
        <>
          {/* <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowRequestSlideOver(false)} /> */}
          <div className="fixed inset-0 z-40" onClick={() => setShowRequestSlideOver(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex items-center justify-end">
            <div 
              className="bg-white w-full md:w-[600px] h-full shadow-2xl p-8 flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="absolute top-4 right-4" onClick={() => setShowRequestSlideOver(false)}>
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold mb-6">Richiedi Credit Score</h2>
              <div className="mb-6">
                <label className="block mb-2 font-medium">Seleziona cliente</label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli un cliente" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {clients.filter(client => client.id && client.id.trim() !== '').map(client => {
                      const numRequests = reports.filter(r => r.clientId === client.id).length;
                      return (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} ({client.email})
                          {numRequests > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">({numRequests} score richiesti)</span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="default"
                disabled={!selectedClientId}
                onClick={() => {
                  setPendingRequestClientId(selectedClientId);
                  setShowConfirmModal(true);
                }}
              >
                Richiedi
              </Button>
            </div>
          </div>
        </>
      )}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => { setShowConfirmModal(false); setPendingRequestClientId(null); }}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Conferma richiesta Credit Score</h3>
            <p className="mb-6">Vuoi richiedere un nuovo credit score per il cliente selezionato?</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => { setShowConfirmModal(false); setPendingRequestClientId(null); }}>Annulla</Button>
              <Button variant="default" onClick={async () => {
                setIsLoadingRequest(true);
                setShowConfirmModal(false);
                
                try {
                  if (pendingRequestClientId && brokerUser?.id) {
                    // Trova il credit profile per questo cliente
                    const client = clients.find(c => c.id === pendingRequestClientId);
                    if (client) {
                      // Trova il credit profile reale per questo cliente
                      const creditProfile = await getClientCreditProfile(pendingRequestClientId, brokerUser.id);
                      
                      if (!creditProfile) {
                        throw new Error('Credit profile non trovato per questo cliente');
                      }
                      
                      await createCreditScoreRequest(
                        pendingRequestClientId,
                        brokerUser.id,
                        creditProfile.id,
                        authenticatedSupabase
                      );
                      
                      // Ricarica i dati
                      console.log('🔄 Ricaricamento dati dopo creazione...');
                      const updatedReports = await getBrokerCreditScores(brokerUser.id, authenticatedSupabase);
                      console.log('📊 Dati aggiornati ricevuti:', updatedReports.length, 'credit scores');
                      setReports(updatedReports);
                      console.log('✅ State aggiornato con', updatedReports.length, 'reports');
                      
                      toast({
                        title: "Richiesta inviata",
                        description: `Credit Score richiesto per ${client.first_name} ${client.last_name}`,
                      });
                    }
                  }
                } catch (error: any) {
                  console.error('Errore richiesta credit score:', error);
                  toast({
                    title: "Errore",
                    description: error.message || "Errore nell'invio della richiesta",
                    variant: "destructive",
                  });
                } finally {
                  setIsLoadingRequest(false);
                  setPendingRequestClientId(null);
                  setShowRequestSlideOver(false);
                  setSelectedClientId('');
                }
              }}>Conferma</Button>
            </div>
          </div>
        </div>
      )}
      {isLoadingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <span>Invio richiesta in corso...</span>
          </div>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Credit Score richiesti</span>
            <Badge variant="outline" className="text-xs">
              {reports.length} richieste totali
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Protesti</TableHead>
                  <TableHead>Pregiudizievoli</TableHead>
                  <TableHead>Procedure Concorsuali</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">Nessuna richiesta effettuata</TableCell>
                  </TableRow>
                )}
                {reports.map((report) => {
                  return (
                    <TableRow key={report.id}>
                      <TableCell>{getClientName(report)}</TableCell>
                      <TableCell>
                        <Badge className={
                          report.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          report.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }>
                          {report.status === 'completed' ? 'Completato' :
                          report.status === 'pending' ? 'In attesa' :
                           report.status === 'failed' ? 'Fallito' : 'Sconosciuto'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{report.credit_score || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={report.protesti ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {report.protesti ? 'Sì' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={report.pregiudizievoli ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {report.pregiudizievoli ? 'Sì' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={report.procedure_concorsuali ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                          {report.procedure_concorsuali ? 'Sì' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedReport(report); setSelectedClientName(getClientName(report)); setSlideOverOpen(true); }} className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Dettagli</span>
                        </Button>
                        {report.status === 'completed' && report.reportPdfUrl && (
                          <a href={report.reportPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Scarica PDF</a>
                        )}
                        <Button variant="outline" size="sm" onClick={() => { setReportToDelete(report); setDeleteModalOpen(true); }} className="flex items-center gap-1"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {/* Modale di conferma eliminazione */}
          {deleteModalOpen && reportToDelete && (
            <div 
              className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
              onClick={() => setDeleteModalOpen(false)}
            >
              <div 
                className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 text-lg font-semibold">Conferma eliminazione</div>
                <div className="mb-6 text-sm text-muted-foreground">Sei sicuro di voler eliminare questa richiesta di credit score? L'operazione non è reversibile.</div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annulla</Button>
                  <Button variant="destructive" onClick={async () => { 
                    const ok = await deleteCreditScoreReport(reportToDelete.id, authenticatedSupabase, brokerUser?.id);
                    if (ok) {
                      setReports(prev => prev.filter(r => String(r.id) !== String(reportToDelete.id)));
                    }
                    setDeleteModalOpen(false); 
                    setReportToDelete(null); 
                  }}>Elimina</Button>
                </div>
              </div>
            </div>
          )}
          
          <CreditScoreDetailsSlideOver
            isOpen={slideOverOpen}
            onClose={() => setSlideOverOpen(false)}
            report={selectedReport}
            clientName={selectedClientName}
            clients={clients}
          />
        </CardContent>
      </Card>
    </div>
  );
}

const CreditScoreDetailsSlideOver: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: CreditScoreReport | null;
  clientName: string;
  clients: any[];
}> = ({ isOpen, onClose, report, clientName, clients }) => {
  if (!report) return null;
  const isCompleted = report.status === 'completed';

  // Dati mock API generati dal report (se completato)
  const apiData = isCompleted ? (() => {
    const score = report.creditScore ?? Math.floor(Math.random() * 400) + 400;
    const rating = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][Math.floor(Math.random() * 6)];
    const riskScore = ['VERDE', 'GIALLO', 'ROSSO'][Math.floor(Math.random() * 3)];
    const riskScoreDescription = riskScore === 'VERDE' ? 'Rischio basso' : riskScore === 'GIALLO' ? 'Rischio medio' : 'Rischio alto';
    const operationalCreditLimit = Math.floor(Math.random() * 20000) + 5000;
    return {
      score,
      rating,
      riskScore,
      riskScoreDescription,
      operationalCreditLimit,
      history: {
        riskScore: [riskScore],
        publicRating: [rating],
        operationalCreditLimit: [operationalCreditLimit]
      }
    };
  })() : null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-screen w-full md:w-[600px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold flex items-center gap-2 truncate">
                Credit Score di {clientName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                Dettaglio visura creditizia simulata
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 flex-shrink-0 ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6 space-y-6">
            {/* Mostra il box API: se completed mostra dati mock, se non completed mostra solo 'Dati non disponibili' */}
            <Card>
              <CardHeader>
                <CardTitle>Dati Credit Score (API)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isCompleted ? (
                  <>
                    <div><b>Score:</b> {apiData.score}</div>
                    <div><b>Rating:</b> {apiData.rating}</div>
                    <div><b>Risk Score:</b> {apiData.riskScore}</div>
                    <div><b>Descrizione rischio:</b> {apiData.riskScoreDescription}</div>
                    <div><b>Limite operativo:</b> €{apiData.operationalCreditLimit}</div>
                  </>
                ) : (
                  <div className="text-muted-foreground">Dati non disponibili</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Esito Visura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><b>Stato:</b> {report.status}</div>
                <div><b>Score:</b> {typeof report.creditScore === 'number' && !isNaN(report.creditScore) ? report.creditScore : (!isNaN(Number(report.creditScore)) ? Number(report.creditScore) : '-')}</div>
                <div><b>Protesti:</b> {report.protesti ? 'Sì' : 'No'}</div>
                <div><b>Pregiudizievoli:</b> {report.pregiudizievoli ? 'Sì' : 'No'}</div>
                <div><b>Procedure Concorsuali:</b> {report.procedureConcorsuali ? 'Sì' : 'No'}</div>
                <div><b>Data richiesta:</b> {report.requestedAt ? new Date(report.requestedAt).toLocaleString('it-IT') : '-'}</div>
                <div><b>Data ricezione:</b> {report.completedAt ? new Date(report.completedAt).toLocaleString('it-IT') : '-'}</div>
                {report.negativeReports && report.negativeReports.length > 0 && (
                  <div>
                    <b>Dettaglio Segnalazioni:</b>
                    <ul className="list-disc ml-6">
                      {report.negativeReports.map((neg, idx) => (
                        <li key={idx}>
                          {neg.type} - {neg.date} - €{neg.amount}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.reportPdfUrl && (
                  <div>
                    <a href={report.reportPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Scarica PDF</a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}; 