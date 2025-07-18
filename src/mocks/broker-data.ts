export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'active' | 'pending' | 'suspended';
  creditProfiles: CreditProfile[];
  documents: Document[];
}

export interface CreditProfile {
  id: string;
  clientId: string;
  score: number | null;
  createdAt: string;
  updatedAt: string;
  reports: CreditReport[];
  // --- Campi oggettivi API ---
  companyName?: string;
  companyLegalForm?: string;
  companyTaxCode?: string;
  companyVatNumber?: string;
  companyCertifiedEmail?: string;
  companyAddress?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  fiscalCode?: string;
  documentType?: string;
  documentNumber?: string;
  releaseDate?: string;
  expirationDate?: string;
  riskScore?: string;
  riskScoreDescription?: string;
  rating?: string;
  riskSeverity?: number;
  operationalCreditLimit?: number;
  history?: {
    riskScore: string[];
    publicRating: string[];
    operationalCreditLimit: number[];
  };
  positions?: Array<{ type: string; trend: string }>;
  profiles?: Array<{ indice: string; valore: number }>;
  // --- Campi broker/manuali ---
  details?: string;
  factors?: string;
  segnalazioni?: string;
  documents?: string;
  brokerNotes?: string;
  partnerBanks?: string[];
}

export interface CreditReport {
  id: string;
  profileId: string;
  type: 'initial' | 'updated' | 'final';
  generatedAt: string;
  status: 'ready' | 'processing' | 'error';
  summary: string;
}

export interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileSizeKb: number;
  status: 'pending' | 'uploaded' | 'requires_changes';
  uploadedAt: string;
}

// Utility per caricare i clienti solo da localStorage
function loadPersistedClients() {
  const saved = localStorage.getItem('mockClients');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export const mockClients: Client[] = loadPersistedClients();

// Aggregated statistics
export const getAggregatedStats = () => {
  const totalClients = mockClients.length;
  const totalProfiles = mockClients.reduce((acc, client) => acc + client.creditProfiles.length, 0);
  const totalReports = mockClients.reduce((acc, client) => 
    acc + client.creditProfiles.reduce((profileAcc, profile) => profileAcc + profile.reports.length, 0), 0
  );
  // Calcolo profilesByStatus
  const profilesByStatus = mockClients.flatMap(c => c.creditProfiles).reduce((acc, profile) => {
    const status = (profile as any).status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  // Calcolo clientsByStatus
  const clientsByStatus = mockClients.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return {
    totalClients,
    totalProfiles,
    totalReports,
    profilesByStatus,
    clientsByStatus,
    averageScore: mockClients
      .flatMap(c => c.creditProfiles)
      .filter(p => p.score !== null)
      .reduce((acc, p, _, arr) => acc + (p.score || 0) / arr.length, 0)
  };
}; 

// Utility per persistenza dei creditProfiles arricchiti
const LS_CREDIT_PROFILES_KEY = 'creditProfilesEnriched';

export function loadEnrichedCreditProfiles() {
  try {
    const data = localStorage.getItem(LS_CREDIT_PROFILES_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

export function saveEnrichedCreditProfiles(profiles: any[]) {
  try {
    localStorage.setItem(LS_CREDIT_PROFILES_KEY, JSON.stringify(profiles));
  } catch {}
}

// All'avvio, unisco i creditProfiles arricchiti salvati a quelli dei mock
const enrichedProfiles = loadEnrichedCreditProfiles();
if (enrichedProfiles.length > 0) {
  for (const p of enrichedProfiles) {
    const client = mockClients.find(c => c.id === p.clientId);
    if (client && !client.creditProfiles.some(cp => cp.id === p.id)) {
      client.creditProfiles.push(p);
    }
  }
} 