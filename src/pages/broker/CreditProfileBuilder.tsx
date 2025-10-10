import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Eye, Download, User, FileText, Banknote, ClipboardList, MessageCircle, Loader2 } from 'lucide-react';
import { useCreditProfiles } from './CreditProfiles';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { getBrokerClients } from '@/services/clientsService';
import { supabase } from '@/lib/supabaseClient';
// Definizione locale
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  registrationDate?: string; // Opzionale per backward compatibility
  creditProfiles?: any[];
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DemoReportSlideOver from '@/components/demo/DemoReportSlideOver';

const partnerBanksList = [
  'Banca Intesa',
  'Unicredit',
  'BPER',
  'Banca Sella',
  'Banco BPM',
];

const steps = [
  { label: 'Cliente', icon: User },
  { label: 'Credit Score', icon: FileText },
  { label: 'Documenti', icon: ClipboardList },
  { label: 'Valutazione', icon: MessageCircle },
  { label: 'Banche', icon: Banknote },
  { label: 'Report', icon: Eye },
];

const initialState = {
  client: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  creditScore: {
    value: '',
    details: '',
    factors: '',
    segnalazioni: '',
  },
  documents: '',
  brokerNotes: '',
  partnerBanks: [] as string[],
};

interface CreditProfileBuilderProps {
  clientId?: string;
}

const CreditProfileBuilder: React.FC<CreditProfileBuilderProps> = ({ clientId }) => {
  const [step, setStep] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [form, setForm] = useState(initialState);
  const [completed, setCompleted] = useState<number[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [creditScoreData, setCreditScoreData] = useState<any>(null);
  const [loadingCreditScore, setLoadingCreditScore] = useState(false);

  const { addProfile } = useCreditProfiles();
  const navigate = useNavigate();
  const { profile: brokerUser } = useAuth();

  // Carica i clienti del broker al mount
  useEffect(() => {
    async function loadClients() {
      if (!brokerUser?.id) return;
      
      console.log('🔍 Caricamento clienti per select...');
      setLoadingClients(true);
      
      try {
        const clientsData = await getBrokerClients(brokerUser.id);
        console.log('✅ Clienti caricati:', clientsData.length);
        setClients(clientsData);
      } catch (error) {
        console.error('❌ Errore caricamento clienti:', error);
      } finally {
        setLoadingClients(false);
      }
    }
    
    loadClients();
  }, [brokerUser?.id]);

  // Carica il credit score quando viene selezionato un cliente
  useEffect(() => {
    async function loadCreditScore() {
      if (!selectedClientId || !brokerUser?.id) {
        setCreditScoreData(null);
        return;
      }

      console.log('🔍 Caricamento credit score per cliente via RPC:', selectedClientId);
      setLoadingCreditScore(true);

      try {
        // USA RPC per recuperare credit score (bypassa RLS)
        const { data: rpcData, error: scoreError } = await supabase.rpc('get_client_credit_score', {
          p_client_id: selectedClientId,
          p_broker_id: brokerUser.id
        });

        if (scoreError) {
          console.error('❌ Errore RPC get_client_credit_score:', scoreError);
          setCreditScoreData(null);
        } else if (rpcData && rpcData.length > 0) {
          console.log('✅ Credit score caricato via RPC:', rpcData[0]);
          setCreditScoreData(rpcData[0]);
        } else {
          console.log('⚠️ Nessun credit score completato trovato');
          setCreditScoreData(null);
        }
      } catch (error) {
        console.error('❌ Errore caricamento credit score:', error);
        setCreditScoreData(null);
      } finally {
        setLoadingCreditScore(false);
      }
    }

    loadCreditScore();
  }, [selectedClientId, brokerUser?.id]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Precompilamento dinamico: usa il credit score dal DB
  let scoreApi: string | undefined = undefined;
  if (creditScoreData && creditScoreData.credit_score !== null && creditScoreData.credit_score !== undefined) {
    scoreApi = String(creditScoreData.credit_score);
  }

  const handleChange = (section: keyof typeof initialState, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...((prev[section] as object) ?? {}),
        [field]: value,
      },
    }));
  };

  const handleBankToggle = (bank: string) => {
    setForm(prev => ({
      ...prev,
      partnerBanks: prev.partnerBanks.includes(bank)
        ? prev.partnerBanks.filter(b => b !== bank)
        : [...prev.partnerBanks, bank],
    }));
  };

  const goToStep = (idx: number) => {
    if (idx <= step || completed.includes(idx - 1)) setStep(idx);
  };

  const handleNext = () => {
    if (!completed.includes(step)) setCompleted([...completed, step]);
    setStep(s => Math.min(steps.length - 1, s + 1));
  };

  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  const handleSave = () => {
    const scoreValue = scoreApi !== undefined ? Number(scoreApi) : Number(form.creditScore.value);
    const newProfile = {
      id: `CP-${Math.floor(Math.random()*10000)}`,
      clientId: selectedClientId,
      clientName: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : '',
      createdAt: new Date().toISOString().slice(0,10),
      score: !isNaN(scoreValue) && scoreValue > 0 ? scoreValue : undefined,
      partnerBanks: form.partnerBanks,
      details: form.creditScore.details,
      factors: form.creditScore.factors,
      segnalazioni: form.creditScore.segnalazioni,
      documents: form.documents,
      brokerNotes: form.brokerNotes
    };
    addProfile(newProfile);
    navigate('/broker/credit-profiles');
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-3xl flex flex-col items-center">
      {/* Stepper orizzontale */}
      <div className="flex items-center justify-center gap-0 w-full mb-10">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === step;
          const isCompleted = completed.includes(idx);
          return (
            <React.Fragment key={s.label}>
              <button
                className={`flex flex-col items-center px-3 py-1 focus:outline-none transition ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'} group`}
                onClick={() => goToStep(idx)}
                disabled={idx > step && !completed.includes(idx - 1)}
                style={{ cursor: idx > step && !completed.includes(idx - 1) ? 'not-allowed' : 'pointer', background: 'none', border: 'none' }}
              >
                <span className={`rounded-full border-2 w-8 h-8 flex items-center justify-center mb-1 ${isActive ? 'border-primary' : isCompleted ? 'border-green-600' : 'border-muted'}`}
                  style={{ background: isCompleted ? '#d1fae5' : isActive ? '#e0e7ff' : '#f3f4f6' }}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-muted-foreground'}`}>{s.label}</span>
              </button>
              {idx < steps.length - 1 && <div className="h-1 w-8 bg-muted rounded-full mx-1" />}
            </React.Fragment>
          );
        })}
      </div>
      {/* Card centrale step */}
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle>{steps[step].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Selezione Cliente */}
          {step === 0 && (
            <div className="space-y-4">
              {loadingClients ? (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Caricamento clienti...</span>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nessun cliente trovato.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/broker/clients">Vai alla pagina clienti per crearne uno</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.filter(client => client.id && client.id.trim() !== '').map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} ({client.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClient && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div><span className="font-medium">Nome:</span> {selectedClient.firstName} {selectedClient.lastName}</div>
                      <div><span className="font-medium">Email:</span> {selectedClient.email}</div>
                      <div><span className="font-medium">Telefono:</span> {selectedClient.phone}</div>
                      <div><span className="font-medium">Registrato il:</span> {selectedClient.registrationDate || new Date(selectedClient.createdAt).toLocaleDateString('it-IT')}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* Step 2: Credit Score */}
          {step === 1 && (
            <div className="space-y-4">
              {loadingCreditScore ? (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Caricamento credit score...</span>
                </div>
              ) : (
                <>
                  {scoreApi !== undefined && (
                    <div className="flex items-center gap-2 mb-1 px-3 py-2 rounded bg-blue-50 border border-blue-200 text-blue-900 font-medium text-sm">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Questo è lo score ottenuto da <span className="font-semibold ml-1">visura CRIF persona</span>
                    </div>
                  )}
                  <Input 
                    placeholder="Valore Credit Score" 
                    value={scoreApi !== undefined ? String(scoreApi) : form.creditScore.value} 
                    onChange={e => handleChange('creditScore', 'value', e.target.value)}
                    disabled={scoreApi !== undefined}
                  />
                  {scoreApi === undefined && (
                    <div className="text-xs text-muted-foreground">Richiedi lo score <Link to="/broker/credit-score" className="text-blue-700 underline font-medium">QUI</Link> prima di compilare il profilo</div>
                  )}
                  
                  {/* Mostra segnalazioni dal DB se disponibili */}
                  {creditScoreData && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                      <div className="font-semibold text-sm text-amber-900">Segnalazioni rilevate:</div>
                      {creditScoreData.protesti && <div className="text-sm text-red-600">⚠️ Protesti rilevati</div>}
                      {creditScoreData.pregiudizievoli && <div className="text-sm text-red-600">⚠️ Pregiudizievoli rilevati</div>}
                      {creditScoreData.procedure_concorsuali && <div className="text-sm text-red-600">⚠️ Procedure concorsuali rilevate</div>}
                      {!creditScoreData.protesti && !creditScoreData.pregiudizievoli && !creditScoreData.procedure_concorsuali && (
                        <div className="text-sm text-green-600">✓ Nessuna segnalazione negativa</div>
                      )}
                    </div>
                  )}

                  <Textarea placeholder="Dettagli e spiegazione" value={form.creditScore.details} onChange={e => handleChange('creditScore', 'details', e.target.value)} />
                  <Textarea placeholder="Fattori principali" value={form.creditScore.factors} onChange={e => handleChange('creditScore', 'factors', e.target.value)} />
                  <Textarea placeholder="Segnalazioni (protesti, pregiudizievoli, ecc.)" value={form.creditScore.segnalazioni} onChange={e => handleChange('creditScore', 'segnalazioni', e.target.value)} />
                </>
              )}
            </div>
          )}
          {/* Step 3: Documenti */}
          {step === 2 && (
            <div className="space-y-4">
              <Textarea placeholder="Elenco e stato dei documenti forniti dal cliente" value={form.documents} onChange={e => setForm(prev => ({ ...prev, documents: e.target.value }))} />
            </div>
          )}
          {/* Step 4: Note broker */}
          {step === 3 && (
            <div className="space-y-4">
              <Textarea placeholder="Note, valutazione e raccomandazioni del broker" value={form.brokerNotes} onChange={e => setForm(prev => ({ ...prev, brokerNotes: e.target.value }))} />
            </div>
          )}
          {/* Step 5: Banche partner */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="font-medium mb-2">Seleziona le banche partner da proporre:</div>
              <div className="flex flex-wrap gap-2">
                {partnerBanksList.map(bank => (
                  <Button key={bank} variant={form.partnerBanks.includes(bank) ? 'default' : 'outline'} size="sm" onClick={() => handleBankToggle(bank)}>{bank}</Button>
                ))}
              </div>
            </div>
          )}
          {/* Step 6: Report finale */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl">
                <div className="mb-4">
                  <div className="text-lg font-semibold mb-1">Report Credit Profile</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-base">{selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ''}</div>
                      <div className="text-xs text-muted-foreground">{selectedClient ? `${selectedClient.email} • ${selectedClient.phone}` : ''}</div>
                    </div>
                    <Badge variant="outline" className="text-base">
                      Credit Score: {scoreApi !== undefined ? scoreApi : (form.creditScore.value || 'N/D')}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold mb-1 text-sm">Dettagli Credit Score</div>
                    {creditScoreData ? (
                      <>
                        <div className="text-sm mb-2">
                          <span className="font-medium">Score:</span> {creditScoreData.credit_score || 'N/D'}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Segnalazioni rilevate:</div>
                          {creditScoreData.protesti && <div className="text-red-600">• Protesti</div>}
                          {creditScoreData.pregiudizievoli && <div className="text-red-600">• Pregiudizievoli</div>}
                          {creditScoreData.procedure_concorsuali && <div className="text-red-600">• Procedure concorsuali</div>}
                          {!creditScoreData.protesti && !creditScoreData.pregiudizievoli && !creditScoreData.procedure_concorsuali && (
                            <div className="text-green-600">• Nessuna segnalazione negativa</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm whitespace-pre-line">{form.creditScore.details || 'Nessun dato disponibile'}</div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">Fattori: {form.creditScore.factors}</div>
                    <div className="mt-1 text-xs text-red-500">Note aggiuntive: {form.creditScore.segnalazioni}</div>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div>
                    <div className="font-semibold mb-1 text-sm">Documenti forniti</div>
                    <div className="text-sm whitespace-pre-line">{form.documents}</div>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div>
                    <div className="font-semibold mb-1 text-sm">Valutazione Broker</div>
                    <div className="text-sm whitespace-pre-line">{form.brokerNotes}</div>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div>
                    <div className="font-semibold mb-1 text-sm">Banche partner consigliate</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.partnerBanks.length === 0 ? <span className="text-muted-foreground">Nessuna selezionata</span> : form.partnerBanks.map(bank => (
                        <Badge key={bank} variant="outline">{bank}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6 gap-4">
                <Button variant="default" size="lg" onClick={handleSave}>Salva</Button>
                <Button variant="outline" size="lg"><Download className="h-5 w-5 mr-2" />Esporta PDF</Button>
                <Button variant="outline" size="lg" onClick={() => setIsPreviewOpen(true)}><Eye className="h-5 w-5 mr-2" />Preview</Button>
              </div>
              {isPreviewOpen && (
                (() => { console.log('DEBUG PREVIEW', {form, selectedClient}); return null; })()
              )}
              {isPreviewOpen && (
                <DemoReportSlideOver
                  isOpen={isPreviewOpen}
                  onClose={() => setIsPreviewOpen(false)}
                  profile={{
                    clientName: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : '',
                    email: selectedClient?.email || '',
                    phone: selectedClient?.phone || '',
                    score: !isNaN(scoreApi !== undefined ? Number(scoreApi) : Number(form.creditScore.value)) && (scoreApi !== undefined ? Number(scoreApi) : Number(form.creditScore.value)) > 0 ? (scoreApi !== undefined ? Number(scoreApi) : Number(form.creditScore.value)) : undefined,
                    createdAt: new Date().toLocaleDateString('it-IT'),
                    partnerBanks: form.partnerBanks,
                    details: form.creditScore.details,
                    factors: form.creditScore.factors,
                    segnalazioni: form.creditScore.segnalazioni,
                    documents: form.documents,
                    brokerNotes: form.brokerNotes
                  }}
                />
              )}
            </div>
          )}
          {/* Navigazione step */}
          {/* Disabilito il tasto Avanti se non è selezionato un cliente */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" disabled={step === 0} onClick={handlePrev}>Indietro</Button>
            {step < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={step === 0 && !selectedClientId}>Avanti</Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditProfileBuilder; 