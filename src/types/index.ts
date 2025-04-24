// src/types/index.ts

// Corrisponde alla tabella 'leads'
export interface Lead {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  status?: 'new' | 'contacted' | 'qualified' | 'lost' | string | null; // Aggiunto string per flessibilità
  notes?: string | null;
}

// Corrisponde alla tabella 'clients'
export interface Client {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  name: string;
  email?: string | null;
  phone?: string | null;
  status?: 'active' | 'pending' | 'completed' | 'inactive' | string | null; // Aggiunto string
  progress?: number | null;
  last_contact?: string | null; // timestamp with time zone
  // Relazioni (opzionali, se le carichi con join)
  // documents?: Document[];
  // practices?: Practice[];
}

// Corrisponde alla tabella 'practices'
export interface Practice {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  client_id: string; // uuid
  type?: string | null;
  amount?: number | null;
  status?: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed' | string | null; // Aggiunto string
  updated_at?: string | null; // timestamp with time zone
}

// Corrisponde alla tabella 'stats'
// Nota: L'icona dovrà essere mappata separatamente nel componente
export interface Stat {
  id: string; // uuid
  title: string;
  value?: string | null;
  trend?: string | null;
  icon_name?: string | null; // Nome dell'icona (es. 'Users')
  updated_at?: string | null; // timestamp with time zone
}

// Corrisponde alla tabella 'performance_data'
export interface PerformanceData {
  id: string; // uuid
  period_type: string; // 'monthly', 'yearly'
  period_value: string; // 'Gen', 'Feb', '2024'
  year?: number | null;
  practices_count?: number | null; // rinominato da 'pratiche'
  completed_count?: number | null; // rinominato da 'completate'
  total_value?: number | null; // rinominato da 'valore'
  recorded_at: string; // date
}

// Potresti voler creare un tipo per i Documenti se li reintroduci
// export interface Document {
//   id: string;
//   created_at: string;
//   client_id: string;
//   name: string;
//   status?: 'verified' | 'pending' | 'rejected' | string | null;
// } 