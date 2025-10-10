# Migrazione AI da Dati Mock a Dati Reali Supabase

## Panoramica

Questo documento descrive la migrazione del sistema AI da dati mock a dati reali di Supabase per l'applicazione CreditProfile.

## Modifiche Implementate

### 1. Aggiornamento Tipi TypeScript

**File**: `src/integrations/supabase/types.ts`

- Aggiunta definizione completa delle tabelle del database:
  - `users`: utenti con ruoli (client, broker, administrator)
  - `credit_profiles`: profili di credito
  - `documents`: documenti caricati

### 2. Nuovo Servizio Dati Supabase

**File**: `src/services/supabaseDataService.ts`

- `SupabaseDataService`: servizio per gestire tutte le operazioni sui dati reali
- Metodi principali:
  - `getPlatformStats()`: statistiche della piattaforma
  - `getClientsWithDetails()`: clienti con profili e documenti
  - `getDocumentsWithDetails()`: documenti con dettagli cliente
  - `getRecentDocuments()`: documenti recenti
  - `getClientById()`: cliente specifico

### 3. Configurazione Dati

**File**: `src/config/dataConfig.ts`

- `DATA_CONFIG`: configurazione centralizzata per la gestione dati
- `USE_REAL_DATA`: flag per passare tra dati reali e mock
- Funzioni helper per logging e gestione errori

### 4. Aggiornamento Servizio AI

**File**: `src/services/ai.ts`

- Integrazione con `SupabaseDataService`
- Fallback automatico ai dati mock in caso di errore
- Supporto per entrambi i modi di operazione (real/mock)

## Struttura Database Supabase

### Tabella `users`
```sql
- id: UUID (PK)
- email: string
- first_name: string (nullable)
- last_name: string (nullable)
- role: 'client' | 'broker' | 'administrator'
- created_at: timestamp
- updated_at: timestamp
```

### Tabella `credit_profiles`
```sql
- id: SERIAL (PK)
- client_id: UUID (FK -> users.id)
- broker_id: UUID (FK -> users.id, nullable)
- administrator_id: UUID (FK -> users.id, nullable)
- status: string
- document_summary: JSONB
- created_at: timestamp
- updated_at: timestamp
- deleted_at: timestamp (nullable)
```

### Tabella `documents`
```sql
- id: SERIAL (PK)
- credit_profile_id: INTEGER (FK -> credit_profiles.id)
- uploaded_by_user_id: UUID (FK -> users.id)
- document_type: string
- file_path: string (nullable)
- file_name: string (nullable)
- file_size_kb: integer (nullable)
- status: string (nullable)
- uploaded_at: timestamp
```

## Come Utilizzare

### 1. Attivare Dati Reali

Modifica `src/config/dataConfig.ts`:
```typescript
export const DATA_CONFIG = {
  USE_REAL_DATA: true, // Cambia a true per usare dati reali
  // ...
}
```

### 2. Verificare Connessione Supabase

Assicurati che le variabili d'ambiente siano configurate:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Testare l'AI

L'AI ora utilizzerà automaticamente:
- Dati reali se `USE_REAL_DATA: true` e Supabase è disponibile
- Dati mock se `USE_REAL_DATA: false` o in caso di errore

## Vantaggi della Migrazione

1. **Dati Reali**: L'AI ora lavora con dati effettivi del database
2. **Scalabilità**: Supporto per grandi volumi di dati
3. **Consistenza**: Dati sincronizzati con il resto dell'applicazione
4. **Flessibilità**: Possibilità di passare facilmente tra real e mock
5. **Debugging**: Logging dettagliato per troubleshooting

## Prossimi Passi

1. **Credit Score**: Implementare tabella per credit score reali
2. **Performance**: Ottimizzare query per grandi dataset
3. **Cache**: Implementare sistema di cache per migliorare performance
4. **Monitoring**: Aggiungere metriche per monitorare l'uso dell'AI

## Troubleshooting

### Errore di Connessione Supabase
- Verifica variabili d'ambiente
- Controlla RLS (Row Level Security) policies
- Verifica permessi utente

### Dati Non Aggiornati
- Controlla cache del browser
- Verifica timestamp delle query
- Controlla log per errori di query

### Performance Lente
- Considera implementare cache
- Ottimizza query con indici
- Riduci numero di chiamate simultanee
