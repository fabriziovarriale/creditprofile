export const mockLeads = [
  {
    id: '1',
    name: 'Alessandro Rossi',
    email: 'alessandro.rossi@example.com',
    phone: '+39 333 1234567',
    source: 'Facebook Ads',
    status: 'new',
    createdAt: '2024-03-10T10:30:00',
    notes: 'Interessato a mutuo prima casa'
  },
  {
    id: '2',
    name: 'Sofia Bianchi',
    email: 'sofia.bianchi@example.com',
    phone: '+39 333 7654321',
    source: 'Google Ads',
    status: 'contacted',
    createdAt: '2024-03-09T15:20:00',
    notes: 'Richiesta informazioni prestito personale'
  },
  {
    id: '3',
    name: 'Luca Ferrari',
    email: 'luca.ferrari@example.com',
    phone: '+39 333 9876543',
    source: 'Referral',
    status: 'qualified',
    createdAt: '2024-03-08T09:15:00',
    notes: 'Consolidamento debiti'
  }
];

export const mockClients = [
  {
    id: '1',
    name: 'Marco Rossi',
    email: 'marco.rossi@example.com',
    phone: '+39 333 1234567',
    status: 'active',
    progress: 75,
    lastContact: '2024-03-15T14:30:00',
    documents: [
      { id: '1', name: 'Busta paga', status: 'verified' },
      { id: '2', name: 'Documento identità', status: 'pending' }
    ],
  },
  {
    id: '2',
    name: 'Laura Bianchi',
    email: 'laura.bianchi@example.com',
    phone: '+39 333 2345678',
    status: 'pending',
    progress: 40,
    lastContact: '2024-03-14T10:15:00',
    documents: [
      { id: '3', name: 'CUD 2023', status: 'pending' }
    ],
  },
  {
    id: '3',
    name: 'Giuseppe Verdi',
    email: 'giuseppe.verdi@example.com',
    phone: '+39 333 3456789',
    status: 'completed',
    progress: 100,
    lastContact: '2024-03-13T16:45:00',
    documents: [
      { id: '4', name: 'Busta paga', status: 'verified' },
      { id: '5', name: 'Documento identità', status: 'verified' },
      { id: '6', name: 'Estratto conto', status: 'verified' }
    ],
  }
];

export const mockActivities = [
  {
    id: '1',
    type: 'document_upload',
    clientName: 'Marco Rossi',
    description: 'Ha caricato Busta paga',
    timestamp: '2024-03-15T14:30:00',
    status: 'pending_review'
  },
  // ... altre attività
];

export const mockPerformance = {
  daily: [/* ... dati giornalieri */],
  weekly: [/* ... dati settimanali */],
  monthly: [/* ... dati mensili */],
  yearly: [/* ... dati annuali */]
};

export const mockStats = [
  {
    title: "Clienti Totali",
    value: "12",
    trend: "+12%",
    trendDirection: "up" as const,
    icon: "Users"
  },
  {
    title: "Leads Attivi",
    value: "8",
    trend: "+5%",
    trendDirection: "up" as const,
    icon: "UserPlus"
  },
  {
    title: "Prestiti Erogati",
    value: "€450K",
    trend: "+18%",
    trendDirection: "up" as const,
    icon: "Briefcase"
  }
];

export const mockPerformanceData = [
  { mese: 'Gen', completate: 8, valore: 120000 },
  { mese: 'Feb', completate: 11, valore: 180000 },
  { mese: 'Mar', completate: 14, valore: 220000 },
  { mese: 'Apr', completate: 12, valore: 190000 },
  { mese: 'Mag', completate: 16, valore: 250000 },
  { mese: 'Giu', completate: 18, valore: 280000 },
]; 