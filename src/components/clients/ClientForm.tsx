// Form per la gestione dei dati cliente
interface ClientData {
  personalInfo: {
    name: string;
    fiscalCode: string;
    // altri dati personali
  };
  employmentInfo: {
    type: 'employed' | 'self-employed' | 'retired';
    income: number;
    // altri dati lavorativi
  };
  documents: Document[];
} 