import type { Document, Report } from '../types';

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

interface ClientsStore {
  clients: Client[];
  selectedClient: Client | null;
  documents: Document[];
  reports: Report[];
  actions: {
    addClient: (client: Client) => void;
    uploadDocument: (doc: Document) => void;
    generateReport: (data: any) => void;
  };
}

// --- CREDIT SCORE REPORTS ---
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

  // Simula completamento dopo 3 secondi
  setTimeout(() => {
    const fakeScore = Math.floor(Math.random() * 400) + 400;
    const fakeRating = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][Math.floor(Math.random() * 6)];
    const fakeRiskScore = ['VERDE', 'GIALLO', 'ROSSO'][Math.floor(Math.random() * 3)];
    const fakeRiskDesc = fakeRiskScore === 'VERDE' ? 'Rischio basso' : fakeRiskScore === 'GIALLO' ? 'Rischio medio' : 'Rischio alto';
    const fakeLimit = Math.floor(Math.random() * 20000) + 5000;
    
    const updatedReport: CreditScoreReport = {
      ...newReport,
      status: 'completed',
      completedAt: new Date().toISOString(),
      creditScore: fakeScore,
      protesti: Math.random() > 0.8,
      pregiudizievoli: Math.random() > 0.9,
      procedureConcorsuali: Math.random() > 0.95,
      negativeReports: Math.random() > 0.7 ? [
        {
          type: 'protesti',
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          amount: Math.floor(Math.random() * 5000) + 1000
        }
      ] : [],
      reportPdfUrl: `/reports/${id}.pdf`
    };
    
    creditScoreReports = creditScoreReports.map(r => r.id === id ? updatedReport : r);
    saveCreditScoreReports(creditScoreReports);
    onUpdate(creditScoreReports);
  }, 3000);
}

// Utility per cancellare tutti i credit score dal localStorage
export function clearAllCreditScoreReports() {
  try {
    localStorage.setItem('creditScoreReports', '[]');
  } catch {}
} 