// Gestione upload documenti
interface Document {
  type: 'identity' | 'income' | 'property' | 'other';
  status: 'pending' | 'validated' | 'rejected';
  file: File;
  notes?: string;
} 