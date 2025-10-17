/**
 * Script per eseguire le migrazioni delle notifiche
 */

const fs = require('fs');
const path = require('path');

// Carica env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

// Crea client Supabase con SERVICE_ROLE key se disponibile, altrimenti ANON
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: VITE_SUPABASE_URL o chiave non trovata nel .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function eseguiSQL(sql, descrizione) {
  console.log(`\n📝 Eseguendo: ${descrizione}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Se exec_sql non esiste, proviamo approccio alternativo
      console.log('⚠️  exec_sql non disponibile, usando approccio alternativo...');
      console.log('\n⚠️  ATTENZIONE: Questo approccio non può eseguire DDL (CREATE, ALTER)');
      console.log('📋 Devi eseguire questa migration manualmente su Supabase Dashboard:');
      console.log('   1. Vai su https://supabase.com/dashboard');
      console.log('   2. SQL Editor');
      console.log('   3. Copia e incolla il contenuto della migration');
      console.log('   4. Click RUN\n');
      return false;
    }
    
    console.log('✅ Completato!');
    return true;
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return false;
  }
}

async function eseguiMigrazioni() {
  console.log('🚀 ESECUZIONE MIGRAZIONI NOTIFICHE\n');
  console.log('═'.repeat(60));
  
  // Verifica connessione
  console.log('\n🔍 Verifico connessione al database...');
  const { data, error } = await supabase.from('notifications').select('count', { count: 'exact', head: true });
  
  if (error && error.code === '42P01') {
    console.log('⚠️  Tabella notifications non esiste. Iniziamo con Migration 1...');
  } else if (error) {
    console.error('❌ Errore connessione:', error);
    console.log('\n💡 SOLUZIONE ALTERNATIVA:');
    console.log('   Esegui le migrazioni manualmente su Supabase Dashboard');
    console.log('   Leggi ESEGUI_MIGRAZIONI.md per la guida completa\n');
    return;
  } else {
    console.log('✅ Connesso al database');
  }
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('Il client JavaScript di Supabase non può eseguire DDL (CREATE TABLE, CREATE TRIGGER).');
  console.log('Devi eseguire le migrazioni manualmente.\n');
  
  console.log('📋 OPZIONI:\n');
  
  console.log('OPZIONE 1 - Supabase Dashboard (CONSIGLIATO):');
  console.log('  1. Vai su https://supabase.com/dashboard');
  console.log('  2. Seleziona progetto "creditprofile"');
  console.log('  3. Apri "SQL Editor"');
  console.log('  4. Esegui in ordine:');
  console.log('     a) supabase/migrations/20251016130000_create_notifications_table.sql');
  console.log('     b) supabase/migrations/20251016140000_add_notification_triggers.sql');
  console.log('     c) supabase/migrations/20251016150000_fix_document_upload_notifications.sql');
  console.log('  5. Per ogni file: copia contenuto → incolla → RUN\n');
  
  console.log('OPZIONE 2 - psql (se hai accesso):');
  console.log('  Se hai la password del database, usa:');
  console.log('  psql "postgresql://postgres:[PASSWORD]@[HOST]/postgres" -f migration.sql\n');
  
  console.log('OPZIONE 3 - Esecuzione manuale rapida:');
  console.log('  1. Apri ogni file .sql');
  console.log('  2. Copia il contenuto');
  console.log('  3. Incolla in SQL Editor su Supabase Dashboard');
  console.log('  4. Click RUN\n');
  
  console.log('═'.repeat(60));
  console.log('\n📖 Guida dettagliata: ESEGUI_MIGRAZIONI.md');
  console.log('🔍 Verifica stato: node verifica-notifiche.cjs\n');
}

eseguiMigrazioni().catch(console.error);


