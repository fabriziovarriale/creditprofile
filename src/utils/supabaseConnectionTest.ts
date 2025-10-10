/**
 * Test di connessione e configurazione Supabase
 * Verifica che la connessione al database funzioni correttamente
 */

import { supabase } from '@/lib/supabaseClient';
import { getEnvironmentConfig } from '@/config/environment';

export interface ConnectionTestResult {
  success: boolean;
  environment: {
    valid: boolean;
    errors: string[];
  };
  connection: {
    success: boolean;
    error?: string;
    responseTime?: number;
  };
  tables: {
    users: { exists: boolean; count?: number; error?: string };
    credit_profiles: { exists: boolean; count?: number; error?: string };
    documents: { exists: boolean; count?: number; error?: string };
  };
  rls: {
    enabled: boolean;
    policies: string[];
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
}

/**
 * Testa la connessione a Supabase
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  console.log('🔍 Test connessione Supabase...');
  
  const result: ConnectionTestResult = {
    success: false,
    environment: { valid: false, errors: [] },
    connection: { success: false },
    tables: {
      users: { exists: false },
      credit_profiles: { exists: false },
      documents: { exists: false }
    },
    rls: { enabled: false, policies: [] },
    summary: { totalTests: 0, passedTests: 0, failedTests: 0 }
  };

  let totalTests = 0;
  let passedTests = 0;

  try {
    // Test 1: Verifica configurazione ambiente
    console.log('📋 Test 1: Verifica configurazione ambiente...');
    totalTests++;
    const envConfig = getEnvironmentConfig();
    result.environment = envConfig.validation;
    
    if (envConfig.validation.valid) {
      passedTests++;
      console.log('✅ Configurazione ambiente valida');
    } else {
      console.log('❌ Configurazione ambiente non valida:', envConfig.validation.errors);
    }

    // Test 2: Test connessione base
    console.log('🔌 Test 2: Test connessione base...');
    totalTests++;
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    if (error) {
      result.connection = { success: false, error: error.message };
      console.log('❌ Errore connessione:', error.message);
    } else {
      result.connection = { success: true, responseTime };
      passedTests++;
      console.log(`✅ Connessione riuscita (${responseTime.toFixed(2)}ms)`);
    }

    // Test 3: Verifica tabelle
    console.log('📊 Test 3: Verifica tabelle...');
    
    // Test tabella users
    totalTests++;
    try {
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        result.tables.users = { exists: false, error: usersError.message };
        console.log('❌ Tabella users non accessibile:', usersError.message);
      } else {
        result.tables.users = { exists: true, count: usersCount || 0 };
        passedTests++;
        console.log(`✅ Tabella users OK (${usersCount || 0} record)`);
      }
    } catch (error) {
      result.tables.users = { exists: false, error: String(error) };
      console.log('❌ Errore tabella users:', error);
    }

    // Test tabella credit_profiles
    totalTests++;
    try {
      const { count: profilesCount, error: profilesError } = await supabase
        .from('credit_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) {
        result.tables.credit_profiles = { exists: false, error: profilesError.message };
        console.log('❌ Tabella credit_profiles non accessibile:', profilesError.message);
      } else {
        result.tables.credit_profiles = { exists: true, count: profilesCount || 0 };
        passedTests++;
        console.log(`✅ Tabella credit_profiles OK (${profilesCount || 0} record)`);
      }
    } catch (error) {
      result.tables.credit_profiles = { exists: false, error: String(error) };
      console.log('❌ Errore tabella credit_profiles:', error);
    }

    // Test tabella documents
    totalTests++;
    try {
      const { count: documentsCount, error: documentsError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      
      if (documentsError) {
        result.tables.documents = { exists: false, error: documentsError.message };
        console.log('❌ Tabella documents non accessibile:', documentsError.message);
      } else {
        result.tables.documents = { exists: true, count: documentsCount || 0 };
        passedTests++;
        console.log(`✅ Tabella documents OK (${documentsCount || 0} record)`);
      }
    } catch (error) {
      result.tables.documents = { exists: false, error: String(error) };
      console.log('❌ Errore tabella documents:', error);
    }

    // Test 4: Verifica RLS (Row Level Security)
    console.log('🔒 Test 4: Verifica RLS...');
    totalTests++;
    try {
      // Prova a leggere i dati per verificare se RLS è configurato
      const { data: rlsTest, error: rlsError } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1);
      
      if (rlsError && rlsError.message.includes('policy')) {
        result.rls = { enabled: true, policies: ['RLS attivo - richiede autenticazione'] };
        passedTests++;
        console.log('✅ RLS attivo (come previsto)');
      } else if (rlsError) {
        result.rls = { enabled: false, policies: [rlsError.message] };
        console.log('⚠️ RLS non configurato o errore:', rlsError.message);
      } else {
        result.rls = { enabled: false, policies: ['RLS non attivo'] };
        console.log('⚠️ RLS non attivo (dati visibili senza autenticazione)');
      }
    } catch (error) {
      result.rls = { enabled: false, policies: [String(error)] };
      console.log('❌ Errore verifica RLS:', error);
    }

    // Calcola risultati finali
    result.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests
    };

    result.success = passedTests === totalTests;

    console.log('📋 Risultati test:');
    console.log(`   Test totali: ${totalTests}`);
    console.log(`   Test passati: ${passedTests}`);
    console.log(`   Test falliti: ${totalTests - passedTests}`);
    console.log(`   Successo: ${result.success ? '✅' : '❌'}`);

    return result;

  } catch (error) {
    console.error('❌ Errore generale durante i test:', error);
    result.connection.error = String(error);
    result.summary = { totalTests, passedTests, failedTests: totalTests - passedTests };
    return result;
  }
}

/**
 * Test di connessione con autenticazione
 */
export async function testAuthenticatedConnection(): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  console.log('🔐 Test connessione autenticata...');
  
  try {
    // Verifica se c'è una sessione attiva
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Errore sessione:', sessionError.message);
      return { success: false, error: sessionError.message };
    }

    if (!session) {
      console.log('ℹ️ Nessuna sessione attiva (normale per test di connessione)');
      return { success: true };
    }

    console.log('✅ Sessione attiva trovata');
    
    // Test accesso ai dati con autenticazione
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.log('❌ Errore accesso dati utente:', userError.message);
      return { success: false, error: userError.message };
    }

    console.log('✅ Accesso dati utente riuscito');
    return { success: true, user: userData };

  } catch (error) {
    console.error('❌ Errore test autenticazione:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Test completo di connessione
 */
export async function runFullConnectionTest(): Promise<{
  connection: ConnectionTestResult;
  authenticated: { success: boolean; user?: any; error?: string };
}> {
  console.log('🚀 Avvio test completo connessione Supabase...');
  
  const connection = await testSupabaseConnection();
  const authenticated = await testAuthenticatedConnection();
  
  console.log('📊 Riepilogo test completo:');
  console.log(`   Connessione: ${connection.success ? '✅' : '❌'}`);
  console.log(`   Autenticazione: ${authenticated.success ? '✅' : 'ℹ️'}`);
  
  return { connection, authenticated };
}

/**
 * Utility per stampare risultati in formato leggibile
 */
export function printConnectionResults(result: ConnectionTestResult): void {
  console.log('\n📋 RISULTATI TEST CONNESSIONE SUPABASE');
  console.log('=====================================');
  
  console.log(`\n🔧 Configurazione Ambiente:`);
  console.log(`   Valida: ${result.environment.valid ? '✅' : '❌'}`);
  if (!result.environment.valid) {
    result.environment.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log(`\n🔌 Connessione:`);
  console.log(`   Successo: ${result.connection.success ? '✅' : '❌'}`);
  if (result.connection.responseTime) {
    console.log(`   Tempo risposta: ${result.connection.responseTime.toFixed(2)}ms`);
  }
  if (result.connection.error) {
    console.log(`   Errore: ${result.connection.error}`);
  }
  
  console.log(`\n📊 Tabelle:`);
  console.log(`   Users: ${result.tables.users.exists ? '✅' : '❌'} (${result.tables.users.count || 0} record)`);
  console.log(`   Credit Profiles: ${result.tables.credit_profiles.exists ? '✅' : '❌'} (${result.tables.credit_profiles.count || 0} record)`);
  console.log(`   Documents: ${result.tables.documents.exists ? '✅' : '❌'} (${result.tables.documents.count || 0} record)`);
  
  console.log(`\n🔒 RLS (Row Level Security):`);
  console.log(`   Abilitato: ${result.rls.enabled ? '✅' : '⚠️'}`);
  result.rls.policies.forEach(policy => console.log(`   - ${policy}`));
  
  console.log(`\n📈 Riepilogo:`);
  console.log(`   Test totali: ${result.summary.totalTests}`);
  console.log(`   Test passati: ${result.summary.passedTests}`);
  console.log(`   Test falliti: ${result.summary.failedTests}`);
  console.log(`   Successo generale: ${result.success ? '✅' : '❌'}`);
  
  console.log('\n=====================================\n');
}
