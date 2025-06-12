// src/types/index.ts

// Corrisponde alla tabella 'performance_data'
export interface PerformanceData {
  id: string;
  period_type: string;
  period_value: string;
  recorded_at: string;
  total_value: number;
}

// Potresti voler creare un tipo per i Documenti se li reintroduci
// export interface Document {
//   id: string;
//   created_at: string;
//   client_id: string;
//   name: string;
//   status?: 'verified' | 'pending' | 'rejected' | string | null;
// }

export type UserRole = 'broker' | 'client' | 'administrator';

export interface User {
  id: string; // uuid
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  email: string; // text
  first_name: string; // text
  last_name: string; // text
  role: UserRole; // text o enum user_role
  phone?: string | null; // text, nullable
  company?: string | null; // text, nullable (rinominato da company_name)
  position?: string | null; // text, nullable (aggiunto)
  profile_image_url?: string | null; // text, nullable
  is_active: boolean; // boolean, default: true
  last_login_at?: string | null; // timestamptz, nullable
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface Document {
  id: string; // uuid
  uploaded_by_user_id: string; // uuid, FK to users.id
  credit_profile_id?: string | null; // uuid, FK to credit_profiles.id
  file_path: string; // text, path to file in storage
  file_type?: string | null; // text, e.g., 'application/pdf'
  status: DocumentStatus; // enum: 'pending', 'approved', 'rejected'
  uploaded_at: string; // timestamptz
  metadata?: Record<string, any> | null; // jsonb
  // Campi che potrebbero essere utili dal frontend ma non sono diretti della tabella:
  name?: string; // Derivato da file_path
  size?: number; // Potrebbe venire da metadata o storage
}

export interface Report {
  id: string;
  title: string;
  type: string;
  client_id: string;
  broker_id: string;
  created_at: string;
} 