import React from 'react';
import { X, Download, FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Logo from '@/components/ui/Logo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Utilizziamo gli stessi dati di mock della dashboard
const performanceData = [
  { mese: 'Gen', pratiche: 12, completate: 8, valore: 120000 },
  { mese: 'Feb', pratiche: 15, completate: 11, valore: 180000 },
  { mese: 'Mar', pratiche: 18, completate: 14, valore: 220000 },
  { mese: 'Apr', pratiche: 14, completate: 12, valore: 190000 },
  { mese: 'Mag', pratiche: 20, completate: 16, valore: 250000 },
  { mese: 'Giu', pratiche: 22, completate: 18, valore: 280000 },
];

const bankOptions = [
  {
    bank: "Intesa Sanpaolo",
    product: "Mutuo Domus Fisso",
    rate: "3.45%",
    maxAmount: "€300.000",
    duration: "25 anni",
    monthlyPayment: "€1.485",
    requirements: [
      "Reddito minimo €30.000",
      "Anzianità lavorativa 2 anni",
      "LTV massimo 80%"
    ]
  },
  {
    bank: "UniCredit",
    product: "Mutuo Prima Casa",
    rate: "3.55%",
    maxAmount: "€350.000",
    duration: "30 anni",
    monthlyPayment: "€1.580",
    requirements: [
      "Reddito minimo €28.000",
      "Anzianità lavorativa 1 anno",
      "LTV massimo 80%"
    ]
  },
  {
    bank: "BNL",
    product: "Mutuo BNL Giovani",
    rate: "3.65%",
    maxAmount: "€250.000",
    duration: "30 anni",
    monthlyPayment: "€1.145",
    requirements: [
      "Età massima 35 anni",
      "Reddito minimo €25.000",
      "LTV massimo 85%"
    ]
  },
  {
    bank: "Crédit Agricole",
    product: "Mutuo Crédit Agricole",
    rate: "3.50%",
    maxAmount: "€280.000",
    duration: "25 anni",
    monthlyPayment: "€1.395",
    requirements: [
      "Reddito minimo €27.000",
      "Anzianità lavorativa 18 mesi",
      "LTV massimo 80%"
    ]
  }
];

// Struttura mock arricchita per la demo
const mockCreditProfile = {
  firstName: "Mario",
  lastName: "Rossi",
  codiceFiscale: "RSSMRA80A01H501U",
  birthDate: "1980-01-01",
  birthPlace: "Milano",
  address: "Via Roma 10, 20100 Milano (MI)",
  ssn: "123-45-6789",
  employment: {
    employer: "Azienda S.p.A.",
    position: "Impiegato",
    startDate: "2015-06-01"
  },
  accounts: [
    {
      type: "Carta di Credito",
      institution: "Banca X",
      accountNumber: "1234 5678 9012 3456",
      openDate: "2018-03-15",
      creditLimit: 5000,
      balance: 1200,
      paymentHistory: [
        { date: "2024-05-01", status: "on_time" },
        { date: "2024-04-01", status: "on_time" },
        { date: "2024-03-01", status: "late" }
      ],
      creditType: "revolving"
    },
    {
      type: "Mutuo",
      institution: "Banca Y",
      accountNumber: "IT60X0542811101000000123456",
      openDate: "2020-09-01",
      loanAmount: 150000,
      balance: 120000,
      paymentHistory: [
        { date: "2024-05-01", status: "on_time" },
        { date: "2024-04-01", status: "on_time" }
      ],
      creditType: "rateale"
    }
  ],
  creditInquiries: [
    { date: "2024-02-10", type: "Richiesta carta di credito", impact: "soft" },
    { date: "2023-11-05", type: "Richiesta prestito auto", impact: "hard" }
  ],
  paymentRegularity: {
    onTimePayments: 36,
    latePayments: 2,
    collectionActions: 0,
    reminders: 1,
    bankruptcies: 0
  },
  negativeInfo: {
    protestedChecks: 0,
    protestedBills: 1,
    legalIssues: [
      { type: "Ipoteca", date: "2022-07-01", description: "Ipoteca su immobile" }
    ],
    bankruptcies: 0,
    insolvencies: 0
  },
  creditHistoryLengthYears: 8,
  totalCreditInquiries: 4,
  creditRating: 805
};

interface DemoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

// Utility per caricare i documenti persistenti del cliente
function getDocumentsForClient(clientName: string, clientEmail: string) {
  try {
    const docsRaw = localStorage.getItem('mockDocuments');
    if (docsRaw) {
      const docs = JSON.parse(docsRaw);
      return docs.filter((d: any) => d.clientName === clientName && d.clientEmail === clientEmail);
    }
  } catch {}
  return [];
}

const DemoReportModal = ({ isOpen, onClose, profile }: DemoReportModalProps) => {
  if (!isOpen) return null;

  // Usa i dati del profilo passato, altrimenti fallback demo SOLO se profile non esiste
  const data = profile || mockCreditProfile;
  const clientName = data.firstName + ' ' + data.lastName;
  const email = data.email || 'mario.rossi@email.com';
  const phone = data.phone || '+39 333 1234567';
  const codiceFiscale = data.codiceFiscale;
  const birthDate = data.birthDate;
  const birthPlace = data.birthPlace;
  const address = data.address;
  const ssn = data.ssn;
  const employment = data.employment;
  const accounts = data.accounts;
  const creditInquiries = data.creditInquiries;
  const paymentRegularity = data.paymentRegularity || { onTimePayments: 0, latePayments: 0, collectionActions: 0, reminders: 0, bankruptcies: 0 };
  const negativeInfo = data.negativeInfo || { protestedChecks: 0, protestedBills: 0, legalIssues: [], bankruptcies: 0, insolvencies: 0 };
  const creditHistoryLengthYears = data.creditHistoryLengthYears;
  const totalCreditInquiries = data.totalCreditInquiries;
  const creditRating = typeof profile?.rating === 'string' ? profile.rating : (profile?.rating ? String(profile.rating) : undefined);
  const riskScore = typeof profile?.riskScore === 'string' ? profile.riskScore : (profile?.riskScore ? String(profile.riskScore) : undefined);
  const riskScoreDescription = profile?.riskScoreDescription;
  const operationalCreditLimit = profile && profile.operationalCreditLimit !== undefined && profile.operationalCreditLimit !== null && !isNaN(Number(profile.operationalCreditLimit)) ? Number(profile.operationalCreditLimit) : undefined;
  const history = profile?.history;

  // Recupera il credit score completato da localStorage se presente
  let completedCreditScore = undefined;
  try {
    const reportsRaw = localStorage.getItem('creditScoreReports');
    if (reportsRaw) {
      const reports = JSON.parse(reportsRaw);
      const completed = reports.find((r: any) => r.status === 'completed' && typeof r.creditScore === 'number');
      if (completed) completedCreditScore = completed.creditScore;
    }
  } catch (e) {}
  // Precedenza: completato > mockCreditScore > mock
  let localCreditScore = undefined;
  try {
    const stored = localStorage.getItem('mockCreditScore');
    if (stored) {
      localCreditScore = Number(stored);
    }
  } catch (e) {}
  const creditRatingDisplay = typeof completedCreditScore === 'number' && !isNaN(completedCreditScore)
    ? completedCreditScore
    : (typeof localCreditScore === 'number' && !isNaN(localCreditScore)
      ? localCreditScore
      : (data.creditRating ?? undefined));

  // Fallback sicuri per campi testuali
  const details = typeof data.details === 'string' ? data.details : '';
  const factors = typeof data.factors === 'string' ? data.factors : '';
  const segnalazioni = typeof data.segnalazioni === 'string' ? data.segnalazioni : '';
  const documents = typeof data.documents === 'string' ? data.documents : '';
  const brokerNotes = typeof data.brokerNotes === 'string' ? data.brokerNotes : '';

  // Ricostruisco il clientName come nello slideover: 'Nome Cognome'
  const clientNameForDocs = (data.firstName && data.lastName) ? `${data.firstName} ${data.lastName}` : clientName;
  const clientDocs = getDocumentsForClient(clientNameForDocs, email);

  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e) => {
      // Blocca la propagazione se il click parte da una tab (Radix UI TabsTrigger o simili)
      if (
        e.target.closest('.radix-tabs-trigger') ||
        e.target.closest('[role="tab"]')
      ) {
        e.stopPropagation();
      }
    };
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('click', handler, true);
    return () => {
      document.removeEventListener('mousedown', handler, true);
      document.removeEventListener('click', handler, true);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === overlayRef.current && e.currentTarget === overlayRef.current) {
          onClose();
        }
      }}
      onMouseDown={e => {
        if (e.target === overlayRef.current && e.currentTarget === overlayRef.current) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo iconSize={6} textSize="text-2xl" />
            <span className="text-2xl font-bold text-gray-800">Credit Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Tutto il contenuto in una sola pagina scrollabile */}
        <div className="p-6 space-y-8">
          {/* Dati anagrafici */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-2">Dati anagrafici</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground font-semibold">
                  {data.clientName ? data.clientName : (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : '')}
                </div>
                <div className="text-sm text-muted-foreground">{email}</div>
                <div className="text-sm text-muted-foreground">{phone}</div>
                <div className="text-sm text-muted-foreground">Codice fiscale: {codiceFiscale}</div>
                <div className="text-sm text-muted-foreground">Nato il {birthDate} a {birthPlace}</div>
                <div className="text-sm text-muted-foreground">Indirizzo: {address}</div>
                <div className="text-sm text-muted-foreground">SSN: {ssn}</div>
                {employment && (
                  <div className="text-sm text-muted-foreground">Impiegato presso: {employment.employer} ({employment.position})</div>
                )}
              </div>
            </div>
          </section>

          {/* Credit Score */}
          <section>
            <h2 className="text-2xl font-bold mb-2">Credit Score</h2>
            <div className="max-w-xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-2 text-blue-900 font-medium text-sm">
                <FileText className="h-4 w-4 text-blue-600" />
                Questo è lo score ottenuto da <span className="font-semibold ml-1">visura CRIF persona</span>
              </div>
              <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center">
                <div className="relative w-[260px] h-[140px] flex items-center justify-center">
                  <svg width="260" height="140" viewBox="0 0 260 140">
                    <defs>
                      <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="25%" stopColor="#f59e42" />
                        <stop offset="50%" stopColor="#fde047" />
                        <stop offset="75%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                    <path d="M30,120 A100,100 0 0,1 230,120" fill="none" stroke="url(#gauge)" strokeWidth="18" />
                    <text x="30" y="135" fontSize="12" fill="#ef4444">300</text>
                    <text x="65" y="120" fontSize="12" fill="#f59e42">650</text>
                    <text x="110" y="110" fontSize="12" fill="#fde047" />
                    <text x="170" y="120" fontSize="12" fill="#4ade80">750</text>
                    <text x="215" y="135" fontSize="12" fill="#22d3ee">900</text>
                  </svg>
                  <div className="absolute left-0 right-0 top-12 flex flex-col items-center">
                    <div className="text-5xl font-extrabold text-gray-900">{creditRatingDisplay ?? '--'}</div>
                    <div className="text-base text-gray-400">Credit Score</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  {creditRatingDisplay && creditRatingDisplay >= 800 && (
                    <span className="text-green-700 font-semibold text-lg">Eccellente affidabilità creditizia</span>
                  )}
                  {creditRatingDisplay && creditRatingDisplay >= 700 && creditRatingDisplay < 800 && (
                    <span className="text-yellow-700 font-semibold text-lg">Buona affidabilità creditizia</span>
                  )}
                  {creditRatingDisplay && creditRatingDisplay < 700 && (
                    <span className="text-red-700 font-semibold text-lg">Affidabilità da migliorare</span>
                  )}
                  {!creditRatingDisplay && (
                    <span className="text-muted-foreground">Nessun dato disponibile</span>
                  )}
                </div>
              </div>
            </div>
            {/* Dettagli score, fattori, segnalazioni */}
            <div className="mb-2">
              <div className="font-semibold mb-1">Dettagli Credit Score</div>
              <div className="text-sm whitespace-pre-line mb-1">{details && details.trim() ? details : <span className="text-muted-foreground">Non compilato</span>}</div>
              <div className="mt-1 text-xs text-muted-foreground"><span className="font-medium">Fattori:</span> {factors && factors.trim() ? factors : <span className='text-muted-foreground'>Non compilato</span>}</div>
              <div className="mt-1 text-xs text-red-500"><span className="font-medium">Segnalazioni:</span> {segnalazioni && segnalazioni.trim() ? segnalazioni : <span className='text-muted-foreground'>Non compilato</span>}</div>
            </div>
          </section>

          {/* Andamento Score (grafico demo) */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Andamento Credit Score (demo)</h2>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mese" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completate" name="Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Distribuzione status documenti (grafico demo) */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Distribuzione Status Documenti</h2>
            <div className="h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const statusCount = clientDocs.reduce((acc, doc) => {
                        acc[doc.status] = (acc[doc.status] || 0) + 1;
                        return acc;
                      }, {});
                      return Object.entries(statusCount).map(([status, value]) => ({ name: status, value }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    label
                  >
                    {['approved', 'rejected', 'pending', 'requires_changes', 'uploaded'].map((status, idx) => (
                      <Cell key={status} fill={['#10b981', '#ef4444', '#f59e0b', '#f97316', '#3b82f6'][idx]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Credit Summary */}
          <section>
            <h2 className="text-xl font-bold mb-2">Credit Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-xs text-muted-foreground mb-1">Durata storia creditizia: <span className="font-bold">{creditHistoryLengthYears} anni</span></div>
              <div className="text-xs text-muted-foreground mb-1">Numero richieste di credito: <span className="font-bold">{totalCreditInquiries}</span></div>
            </div>
          </section>

          {/* Puntualità pagamenti */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">Puntualità Pagamenti</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-xs text-muted-foreground">Pagamenti puntuali: <span className="text-green-700 font-bold">{paymentRegularity.onTimePayments ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Pagamenti in ritardo: <span className="text-red-700 font-bold">{paymentRegularity.latePayments ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Solleciti ricevuti: <span className="text-yellow-700 font-bold">{paymentRegularity.reminders ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Azioni di recupero crediti: <span className="text-red-700 font-bold">{paymentRegularity.collectionActions ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Fallimenti: <span className="text-red-700 font-bold">{paymentRegularity.bankruptcies ?? 0}</span></div>
            </div>
          </section>

          {/* Richieste di credito */}
          <section>
            <h2 className="text-xl font-bold mb-2">Richieste di Credito</h2>
            <ul className="space-y-2">
              {creditInquiries && creditInquiries.map((inq, idx) => (
                <li key={idx} className="text-xs text-muted-foreground border rounded p-2 bg-white flex justify-between items-center">
                  <span>{inq.date} - {inq.type}</span>
                  <span className={inq.impact === 'hard' ? 'text-red-600' : 'text-green-600'}>{inq.impact === 'hard' ? 'Impatto alto' : 'Impatto basso'}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Informazioni negative */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">Informazioni Negative</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-xs text-muted-foreground">Protesti assegni: <span className="font-bold text-red-700">{negativeInfo.protestedChecks ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Protesti cambiali: <span className="font-bold text-red-700">{negativeInfo.protestedBills ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Fallimenti: <span className="font-bold text-red-700">{negativeInfo.bankruptcies ?? 0}</span></div>
              <div className="text-xs text-muted-foreground">Insolvenze: <span className="font-bold text-red-700">{negativeInfo.insolvencies ?? 0}</span></div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground font-medium mb-1">Pregiudizievoli/Legali:</div>
              <ul className="space-y-1">
                {negativeInfo.legalIssues && negativeInfo.legalIssues.length > 0 ? negativeInfo.legalIssues.map((issue, idx) => (
                  <li key={idx} className="text-xs text-red-700">{issue.date} - {issue.type}: {issue.description}</li>
                )) : <li className="text-xs text-muted-foreground">Nessuna segnalazione</li>}
              </ul>
            </div>
          </section>

          {/* Documenti caricati */}
          <section>
            <h2 className="text-xl font-bold mb-2">Documenti caricati</h2>
            {clientDocs.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nessun documento caricato per questo cliente.</div>
            ) : (
              <ul className="space-y-2">
                {clientDocs.map((doc, idx) => (
                  <li key={doc.id} className="border rounded p-3 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium">{doc.documentType}</div>
                      <div className="text-xs text-muted-foreground">{doc.fileName}</div>
                      <div className="text-xs text-muted-foreground">Caricato il {new Date(doc.uploadedAt).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={
                        doc.status === 'approved' ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs' :
                        'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs'
                      }>
                        {doc.status === 'approved' ? 'Approvato' :
                         doc.status === 'rejected' ? 'Rifiutato' :
                         doc.status === 'pending' ? 'In attesa' :
                         doc.status === 'requires_changes' ? 'Da correggere' :
                         'Caricato'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Documenti forniti (wizard) */}
          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">Documenti forniti (wizard)</h2>
            <div className="text-sm whitespace-pre-line">{documents && documents.trim() ? documents : <span className="text-muted-foreground">Non compilato</span>}</div>
          </section>

          {/* Note broker */}
          <section>
            <h2 className="text-xl font-bold mb-2">Valutazione e Note Broker</h2>
            <div className="text-sm whitespace-pre-line">{brokerNotes && brokerNotes.trim() ? brokerNotes : <span className="text-muted-foreground">Non compilato</span>}</div>
          </section>

          {/* Banche partner consigliate */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">Banche partner consigliate</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.partnerBanks && data.partnerBanks.length > 0 ? data.partnerBanks.map((bank, index) => (
                <span key={index} className="bg-gray-100 px-3 py-1 rounded text-sm">{bank}</span>
              )) : <span className="text-muted-foreground">Nessuna selezionata</span>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DemoReportModal; 