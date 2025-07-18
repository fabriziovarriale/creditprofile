import type { Client } from '../mocks/broker-data';
import type { Document, Report } from '../types';
import { mockClients, saveEnrichedCreditProfiles, loadEnrichedCreditProfiles } from '../mocks/broker-data';

interface ClientsStore {
  clients: Client[];
  selectedClient: Client | null;
  documents: Document[];
  reports: Report[];
  actions: {
    addClient: (client: Client) => void;
    uploadDocument: (doc: Document) => void;
    generateReport: (data: any) => void; // ReportData non esiste, uso any o definisco un tipo se serve
  };
}

// --- CREDIT SCORE MOCK ---
export type CreditScoreReport = {
  id: string;
  clientId: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  creditScore?: number;
  protesti?: boolean;
  pregiudizievoli?: boolean;
  procedureConcorsuali?: boolean;
  negativeReports?: Array<{
    type: 'protesti' | 'pregiudizievoli' | 'procedure_concorsuali';
    date: string;
    amount: number;
  }>;
  reportPdfUrl?: string;
};

// Utility per localStorage
const LS_KEY = 'creditScoreReports';

function loadCreditScoreReports(): CreditScoreReport[] {
  try {
    const data = localStorage.getItem(LS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

function saveCreditScoreReports(reports: CreditScoreReport[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(reports));
  } catch {}
}

let creditScoreReports: CreditScoreReport[] = loadCreditScoreReports();

export { creditScoreReports };

// Funzione per simulare la richiesta credit score
export function requestCreditScore(clientId: string, onUpdate: (reports: CreditScoreReport[]) => void) {
  // Rimuovi eventuali report precedenti per questo clientId
  creditScoreReports = creditScoreReports.filter(r => r.clientId !== clientId);
  const id = `${clientId}-${Date.now()}`;
  const now = new Date().toISOString();
  const newReport: CreditScoreReport = {
    id,
    clientId,
    status: 'pending',
    requestedAt: now,
  };
  creditScoreReports = [...creditScoreReports, newReport];
  saveCreditScoreReports(creditScoreReports);
  onUpdate(creditScoreReports);

  // --- AGGIUNTA: rimuovi anche il vecchio credit profile mock arricchito per questo clientId ---
  const client = mockClients.find(c => c.id === clientId);
  if (client) {
    // Rimuovi tutti i credit profile associati a questo clientId
    client.creditProfiles = client.creditProfiles.filter(p => p.clientId !== clientId);
    // Genera un nuovo credit profile mock
    const profileId = `cp-${id}`;
    const fakeScore = Math.floor(Math.random() * 400) + 400;
    const fakeRating = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][Math.floor(Math.random() * 6)];
    const fakeRiskScore = ['VERDE', 'GIALLO', 'ROSSO'][Math.floor(Math.random() * 3)];
    const fakeRiskDesc = fakeRiskScore === 'VERDE' ? 'Rischio basso' : fakeRiskScore === 'GIALLO' ? 'Rischio medio' : 'Rischio alto';
    const fakeLimit = Math.floor(Math.random() * 20000) + 5000;
    const nowDate = new Date();
    const newProfile = {
      id: profileId,
      clientId: clientId,
      status: 'approved' as const,
      score: fakeScore,
      createdAt: nowDate.toISOString(),
      updatedAt: nowDate.toISOString(),
      rating: fakeRating,
      riskScore: fakeRiskScore,
      riskScoreDescription: fakeRiskDesc,
      operationalCreditLimit: fakeLimit,
      history: {
        riskScore: [fakeRiskScore],
        publicRating: [fakeRating],
        operationalCreditLimit: [fakeLimit]
      },
      positions: [
        { type: 'economico', trend: 'positivo' },
        { type: 'finanziario', trend: 'stabile' }
      ],
      profiles: [
        { indice: 'liquidità', valore: 1.2 },
        { indice: 'indebitamento', valore: 0.8 }
      ],
      details: '',
      factors: '',
      segnalazioni: '',
      documents: '',
      brokerNotes: '',
      partnerBanks: ['Banca Intesa', 'Unicredit'],
      reports: []
    };
    client.creditProfiles.push(newProfile);
    // Aggiorna anche su localStorage
    let allEnriched = loadEnrichedCreditProfiles().filter(p => p.clientId !== clientId);
    allEnriched.push(newProfile);
    saveEnrichedCreditProfiles(allEnriched);
    (newReport as any)._fakeScore = fakeScore;
  }
  // --- FINE AGGIUNTA ---

  // Simula delay API
  setTimeout(() => {
    // Simula che circa il 30% restino in pending
    if (Math.random() < 0.3) {
      // Non aggiorno lo status, resta 'pending'
      return;
    }
    const completedReport: CreditScoreReport = {
      ...newReport,
      status: 'completed',
      completedAt: new Date().toISOString(),
      creditScore: (newReport as any)._fakeScore !== undefined ? (newReport as any)._fakeScore : Math.floor(Math.random() * 400) + 400, // 400-800
      protesti: Math.random() < 0.2,
      pregiudizievoli: Math.random() < 0.15,
      procedureConcorsuali: Math.random() < 0.1,
      negativeReports: [],
      reportPdfUrl: undefined,
    };
    if (completedReport.protesti) {
      completedReport.negativeReports?.push({
        type: 'protesti',
        date: '2023-01-15',
        amount: 1200,
      });
    }
    if (completedReport.pregiudizievoli) {
      completedReport.negativeReports?.push({
        type: 'pregiudizievoli',
        date: '2023-02-10',
        amount: 2500,
      });
    }
    if (completedReport.procedureConcorsuali) {
      completedReport.negativeReports?.push({
        type: 'procedure_concorsuali',
        date: '2022-11-05',
        amount: 5000,
      });
    }
    creditScoreReports = creditScoreReports.map((r) => (r.id === id ? completedReport : r));
    saveCreditScoreReports(creditScoreReports);
    onUpdate(creditScoreReports);
  }, 2000); // 2 secondi di delay
}

// Utility per cancellare tutti i credit score dal localStorage
export function clearAllCreditScoreReports() {
  try {
    localStorage.setItem('creditScoreReports', '[]');
  } catch {}
} 