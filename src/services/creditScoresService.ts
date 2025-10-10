import { supabase } from '@/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

// Tipizzazione per Credit Score nel database
export interface CreditScore {
  id: number;
  client_id: string;
  broker_id: string;
  credit_profile_id: number;
  requested_at: string;
  completed_at: string | null;
  status: 'pending' | 'completed' | 'failed';
  credit_score: number | null;
  protesti: boolean;
  pregiudizievoli: boolean;
  procedure_concorsuali: boolean;
  provider: string | null;
  raw_response: any | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Interfaccia con dati del cliente per UI
export interface CreditScoreWithClient extends CreditScore {
  clientName: string;
  clientEmail: string;
  profileStatus: string;
}

/**
 * Ottiene tutti i Credit Score per un broker specifico
 */
export async function getBrokerCreditScores(brokerId: string, supabaseClient?: SupabaseClient): Promise<CreditScoreWithClient[]> {
  console.log('🔍 getBrokerCreditScores via RPC per broker:', brokerId);
  
  try {
    // Usa il client fornito oppure quello globale
    const clientToUse = supabaseClient || supabase;
    
    // USA RPC per bypassare RLS e JOIN complessi
    const { data, error } = await clientToUse.rpc('get_broker_credit_scores', {
      broker_uuid: brokerId
    });

    if (error) {
      console.error('❌ Errore RPC get_broker_credit_scores:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('📭 Nessun credit score trovato per il broker');
      return [];
    }

    console.log('✅ Trovati', data.length, 'credit scores via RPC');
    
    // Trasforma i dati per l'interfaccia UI
    const result = data.map(score => ({
      id: score.id,
      credit_profile_id: score.credit_profile_id,
      client_id: score.client_id,
      broker_id: score.broker_id,
      requested_at: score.requested_at,
      completed_at: score.completed_at,
      status: score.status,
      credit_score: score.credit_score,
      protesti: score.protesti,
      pregiudizievoli: score.pregiudizievoli,
      procedure_concorsuali: score.procedure_concorsuali,
      provider: score.provider,
      raw_response: score.raw_response,
      error_message: score.error_message,
      clientName: `${score.client_first_name} ${score.client_last_name}`.trim(),
      clientEmail: score.client_email,
      profileStatus: score.credit_profile_status
    }));

    console.log('✅ Credit scores reali ottenuti via RPC:', result.length);
    return result;

  } catch (error) {
    console.error('❌ Errore getBrokerCreditScores:', error);
    return [];
  }
}

/**
 * Genera dati mock temporanei per testing finché la migrazione non è completata
 */
function getMockCreditScores(brokerId: string): CreditScoreWithClient[] {
  console.log('🎭 Usando dati mock temporanei per credit scores');
  
  const mockData: CreditScoreWithClient[] = [
    {
      id: 1,
      client_id: 'mock-client-1',
      broker_id: brokerId,
      credit_profile_id: 1,
      requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 settimana fa
      completed_at: new Date().toISOString(),
      status: 'completed',
      credit_score: 750,
      protesti: false,
      pregiudizievoli: false,
      procedure_concorsuali: false,
      provider: 'Mock Provider',
      raw_response: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clientName: 'Mario Rossi',
      clientEmail: 'mario.rossi@example.com',
      profileStatus: 'completed'
    },
    {
      id: 2,
      client_id: 'mock-client-2',
      broker_id: brokerId,
      credit_profile_id: 2,
      requested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 giorni fa
      completed_at: new Date().toISOString(),
      status: 'completed',
      credit_score: 650,
      protesti: true,
      pregiudizievoli: false,
      procedure_concorsuali: false,
      provider: 'Mock Provider',
      raw_response: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clientName: 'Giulia Bianchi',
      clientEmail: 'giulia.bianchi@example.com',
      profileStatus: 'completed'
    },
    {
      id: 3,
      client_id: 'mock-client-3',
      broker_id: brokerId,
      credit_profile_id: 3,
      requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 giorno fa
      completed_at: null,
      status: 'pending',
      credit_score: null,
      protesti: false,
      pregiudizievoli: false,
      procedure_concorsuali: false,
      provider: null,
      raw_response: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clientName: 'Luca Verdi',
      clientEmail: 'luca.verdi@example.com',
      profileStatus: 'pending'
    },
    {
      id: 4,
      client_id: 'mock-client-4',
      broker_id: brokerId,
      credit_profile_id: 4,
      requested_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 settimane fa
      completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      credit_score: 580,
      protesti: true,
      pregiudizievoli: true,
      procedure_concorsuali: false,
      provider: 'Mock Provider',
      raw_response: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clientName: 'Anna Neri',
      clientEmail: 'anna.neri@example.com',
      profileStatus: 'completed'
    },
    {
      id: 5,
      client_id: 'mock-client-5',
      broker_id: brokerId,
      credit_profile_id: 5,
      requested_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 mese fa
      completed_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      credit_score: 820,
      protesti: false,
      pregiudizievoli: false,
      procedure_concorsuali: false,
      provider: 'Mock Provider',
      raw_response: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clientName: 'Francesco Blu',
      clientEmail: 'francesco.blu@example.com',
      profileStatus: 'completed'
    }
  ];
  
  return mockData;
}

/**
 * Crea una nuova richiesta di Credit Score
 */
export async function createCreditScoreRequest(
  clientId: string,
  brokerId: string,
  creditProfileId: number,
  supabaseClient?: SupabaseClient
): Promise<CreditScore> {
  try {
    // Usa il client fornito oppure quello globale
    const clientToUse = supabaseClient || supabase;
    
    // Debug: Controlla lo stato di autenticazione più dettagliato
    const { data: { session } } = await clientToUse.auth.getSession();
    const { data: { user }, error: authError } = await clientToUse.auth.getUser();
    
    console.log('🔍 Debug autenticazione dettagliato:', {
      hasSession: !!session,
      sessionUser: session?.user?.id,
      sessionEmail: session?.user?.email,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      brokerId: brokerId,
      match: user?.id === brokerId,
      sessionExpiry: session?.expires_at,
      currentTime: Math.floor(Date.now() / 1000),
      authError: authError
    });
    
    // Se non c'è sessione, prova a refreshare
    if (!session || !user) {
      console.log('🔄 Tentativo di refresh della sessione...');
      const { data: refreshData, error: refreshError } = await clientToUse.auth.refreshSession();
      console.log('🔄 Refresh result:', { 
        hasNewSession: !!refreshData.session, 
        newUserId: refreshData.session?.user?.id,
        refreshError: refreshError 
      });
      
      if (refreshError || !refreshData.session?.user) {
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      }
      
      // Usa i dati refreshed
      const refreshedUser = refreshData.session.user;
      if (refreshedUser.id !== brokerId) {
        throw new Error('Broker ID non corrisponde all\'utente autenticato');
      }
    } else if (user.id !== brokerId) {
      throw new Error('Broker ID non corrisponde all\'utente autenticato');
    }
    
    // USA RPC per creare/aggiornare credit score (bypassa RLS)
    console.log('📝 Creazione credit score via RPC con dati:', {
      client_id: clientId,
      broker_id: brokerId,
      credit_profile_id: creditProfileId
    });
    
    const { data: rpcData, error } = await clientToUse.rpc('create_credit_score_request', {
      p_client_id: clientId,
      p_broker_id: brokerId,
      p_credit_profile_id: creditProfileId
    });

    const data = rpcData && rpcData.length > 0 ? rpcData[0] : null;

    console.log('💾 Risultato inserimento:', {
      insertedData: data,
      insertError: error?.message,
      insertedId: data?.id,
      insertedBrokerId: data?.broker_id
    });

    if (error) {
      console.error('❌ Errore creazione richiesta credit score:', error);
      throw error;
    }

    console.log('✅ Richiesta Credit Score creata:', data);

    // Simulazione automatica asincrona: dopo breve delay aggiorna con esito random
    try {
      const delayMs = 300 + Math.floor(Math.random() * 600); // 0.3s - 0.9s per feedback
      setTimeout(async () => {
        try {
          const rnd = Math.random();
          console.log('🎲 Simulazione esito credit score per id', data.id, 'rnd=', rnd);
          if (rnd < 0.8) {
            // 80% completato
            const clean = Math.random() < 0.3; // 30% puliti, 70% con segnalazioni
            const targetId = data.id;

            // Genera eventuali segnalazioni/negative reports
            let negativeReports: Array<{ type: 'protesti' | 'pregiudizievoli' | 'procedure_concorsuali'; date: string; amount: number; description?: string; }> = [];
            if (!clean) {
              const possibleTypes: Array<'protesti' | 'pregiudizievoli' | 'procedure_concorsuali'> = ['protesti', 'pregiudizievoli', 'procedure_concorsuali'];
              const reportsCount = 1 + Math.floor(Math.random() * 3); // 1-3 segnalazioni
              for (let i = 0; i < reportsCount; i++) {
                const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
                const daysAgo = 10 + Math.floor(Math.random() * 365);
                negativeReports.push({
                  type,
                  date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                  amount: 200 + Math.floor(Math.random() * 20000),
                  description: type === 'protesti' ? 'Assegno protestato' : type === 'pregiudizievoli' ? 'Segnalazione pregiudizievole' : 'Procedura concorsuale in corso',
                });
              }
            }

            const hasProtesti = negativeReports.some(r => r.type === 'protesti');
            const hasPregiudizievoli = negativeReports.some(r => r.type === 'pregiudizievoli');
            const hasProcedure = negativeReports.some(r => r.type === 'procedure_concorsuali');

            // Score in base alla "pulizia" e severità
            const baseScore = clean ? (710 + Math.floor(Math.random() * 120)) : (560 + Math.floor(Math.random() * 120));

            await updateCreditScore(targetId, {
              status: 'completed',
              credit_score: baseScore,
              protesti: clean ? false : hasProtesti,
              pregiudizievoli: clean ? false : hasPregiudizievoli,
              procedure_concorsuali: clean ? false : hasProcedure,
              provider: 'Mock Provider',
              completed_at: new Date().toISOString(),
              raw_response: { autoSimulated: true, scenario: clean ? 'completed_clean' : 'completed_with_flags', negativeReports }
            }, clientToUse);
          } else if (rnd < 0.95) {
            // 15% resta pending
            const targetId = data.id;
            await updateCreditScore(targetId, {
              status: 'pending',
              credit_score: null,
              provider: 'Mock Provider',
              raw_response: { autoSimulated: true, scenario: 'pending' }
            }, clientToUse);
          } else {
            // 5% failed
            const targetId = data.id;
            await updateCreditScore(targetId, {
              status: 'failed',
              credit_score: null,
              error_message: 'Simulated provider failure',
              provider: 'Mock Provider',
              raw_response: { autoSimulated: true, scenario: 'failed' }
            }, clientToUse);
          }
        } catch (e) {
          console.warn('⚠️ Simulazione automatica fallita:', e);
        }
      }, delayMs);
    } catch {}

    return data;

  } catch (error) {
    console.error('❌ Errore createCreditScoreRequest:', error);
    throw error;
  }
}

/**
 * Aggiorna un Credit Score con i risultati
 */
export async function updateCreditScore(
  id: number,
  updates: {
    status?: 'pending' | 'completed' | 'failed';
    credit_score?: number | null;
    protesti?: boolean;
    pregiudizievoli?: boolean;
    procedure_concorsuali?: boolean;
    provider?: string;
    raw_response?: any;
    error_message?: string;
    completed_at?: string;
  },
  supabaseClient?: SupabaseClient
): Promise<CreditScore> {
  try {
    const clientToUse = supabaseClient || supabase;
    
    // USA RPC per aggiornare credit score (bypassa RLS)
    const { data: rpcData, error } = await clientToUse.rpc('update_credit_score', {
      p_id: id,
      p_status: updates.status || null,
      p_credit_score: updates.credit_score !== undefined ? updates.credit_score : null,
      p_protesti: updates.protesti !== undefined ? updates.protesti : null,
      p_pregiudizievoli: updates.pregiudizievoli !== undefined ? updates.pregiudizievoli : null,
      p_procedure_concorsuali: updates.procedure_concorsuali !== undefined ? updates.procedure_concorsuali : null,
      p_provider: updates.provider || null,
      p_raw_response: updates.raw_response || null,
      p_error_message: updates.error_message || null,
      p_completed_at: updates.completed_at || null
    });

    if (error) {
      console.error('❌ Errore RPC update_credit_score:', error);
      throw error;
    }

    const data = rpcData && rpcData.length > 0 ? rpcData[0] : null;
    
    if (!data) {
      throw new Error('Credit score non trovato dopo update');
    }

    console.log('✅ Credit score aggiornato via RPC:', data);
    return data as CreditScore;

  } catch (error) {
    console.error('❌ Errore updateCreditScore:', error);
    throw error;
  }
}

/**
 * Elimina una richiesta di Credit Score
 */
export async function deleteCreditScoreReport(
  id: number | string,
  supabaseClient?: SupabaseClient,
  brokerId?: string
): Promise<boolean> {
  try {
    const clientToUse = supabaseClient || supabase;
    
    if (!brokerId) {
      console.error('❌ broker_id mancante per deleteCreditScoreReport');
      return false;
    }
    
    // USA RPC per eliminare credit score (bypassa RLS)
    const { data: deletedCount, error } = await clientToUse.rpc('delete_credit_score', {
      p_id: Number(id),
      p_broker_id: brokerId
    });

    if (error) {
      console.error('❌ Errore RPC delete_credit_score:', error);
      return false;
    }

    if (deletedCount === 0) {
      console.warn('⚠️ Nessuna riga eliminata, credit score probabilmente non esisteva:', id);
      return false;
    }

    console.log('🗑️ Credit Score eliminato via RPC:', id);
    return true;
  } catch (error) {
    console.error('❌ Errore deleteCreditScoreReport:', error);
    return false;
  }
}

/**
 * Ottiene Credit Score per un profilo specifico
 */
export async function getCreditScoreByProfile(creditProfileId: number): Promise<CreditScore | null> {
  try {
    const { data, error } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('credit_profile_id', creditProfileId)
      .maybeSingle();

    if (error) {
      console.error('❌ Errore nel recupero credit score per profilo:', error);
      throw error;
    }

    return data;

  } catch (error) {
    console.error('❌ Errore getCreditScoreByProfile:', error);
    throw error;
  }
}

/**
 * Simula una richiesta di Credit Score con risultati mock
 * (sostituirà l'integrazione con provider reali)
 */
export async function simulateCreditScoreCompletion(id: number): Promise<CreditScore> {
  // Simula risultati casuali per testing
  const mockResults = {
    status: 'completed' as const,
    credit_score: Math.floor(Math.random() * 400) + 600, // 600-1000
    protesti: Math.random() < 0.3, // 30% probabilità
    pregiudizievoli: Math.random() < 0.2, // 20% probabilità
    procedure_concorsuali: Math.random() < 0.1, // 10% probabilità
    provider: 'Mock Provider',
    completed_at: new Date().toISOString(),
    raw_response: {
      provider: 'Mock Provider',
      timestamp: new Date().toISOString(),
      details: 'Simulazione risultati Credit Score'
    }
  };

  return updateCreditScore(id, mockResults);
}

/**
 * Calcola statistiche sui Credit Score per il broker
 */
export function getCreditScoreStats(creditScores: CreditScore[]) {
  const total = creditScores.length;
  const completed = creditScores.filter(cs => cs.status === 'completed').length;
  const pending = creditScores.filter(cs => cs.status === 'pending').length;
  const failed = creditScores.filter(cs => cs.status === 'failed').length;

  const completedScores = creditScores.filter(cs => cs.status === 'completed' && cs.credit_score !== null);
  const avgScore = completedScores.length > 0 
    ? Math.round(completedScores.reduce((sum, cs) => sum + (cs.credit_score || 0), 0) / completedScores.length)
    : 0;

  const withProtesti = creditScores.filter(cs => cs.status === 'completed' && cs.protesti).length;
  const withPregiudizievoli = creditScores.filter(cs => cs.status === 'completed' && cs.pregiudizievoli).length;
  const withProcedure = creditScores.filter(cs => cs.status === 'completed' && cs.procedure_concorsuali).length;

  return {
    total,
    completed,
    pending,
    failed,
    avgScore,
    withProtesti,
    withPregiudizievoli,
    withProcedure,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

/**
 * Migra i dati dai mock del localStorage al database
 * (funzione temporanea per la migrazione)
 */
export async function migrateMockDataToDatabase(brokerId: string): Promise<void> {
  try {
    const mockData = localStorage.getItem('creditScoreReports');
    if (!mockData) {
      console.log('ℹ️ Nessun dato mock da migrare');
      return;
    }

    const mockReports = JSON.parse(mockData);
    console.log(`🔄 Migrazione di ${mockReports.length} record mock...`);

    for (const mockReport of mockReports) {
      // Trova il credit_profile_id dal client_id (assumendo un profilo per cliente)
      const { data: profile, error: profileError } = await supabase
        .from('credit_profiles')
        .select('id')
        .eq('client_id', mockReport.clientId)
        .eq('broker_id', brokerId)
        .single();

      if (profileError || !profile) {
        console.warn(`⚠️ Profilo non trovato per client ${mockReport.clientId}`);
        continue;
      }

      // Crea il record nel database
      const creditScoreData = {
        client_id: mockReport.clientId,
        broker_id: brokerId,
        credit_profile_id: profile.id,
        requested_at: mockReport.requestedAt || new Date().toISOString(),
        completed_at: mockReport.status === 'completed' ? (mockReport.completedAt || new Date().toISOString()) : null,
        status: mockReport.status,
        credit_score: mockReport.creditScore || null,
        protesti: mockReport.protesti || false,
        pregiudizievoli: mockReport.pregiudizievoli || false,
        procedure_concorsuali: mockReport.procedureConcorsuali || false,
        provider: 'Mock Data Migration',
        raw_response: mockReport
      };

      const { error: insertError } = await supabase
        .from('credit_scores')
        .insert(creditScoreData);

      if (insertError) {
        console.error(`❌ Errore migrazione record ${mockReport.id}:`, insertError);
      } else {
        console.log(`✅ Migrato record ${mockReport.id}`);
      }
    }

    console.log('✅ Migrazione completata');
    
  } catch (error) {
    console.error('❌ Errore migrazione:', error);
    throw error;
  }
}
