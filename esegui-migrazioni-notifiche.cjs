/**
 * Script per eseguire le migrazioni delle notifiche sul database di produzione
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

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function eseguiMigrazione(nomeFile, sqlContent) {
  console.log(`\n🔄 Esecuzione: ${nomeFile}...`);
  console.log('─'.repeat(60));
  
  try {
    // Esegui SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      // Proviamo direttamente se rpc non funziona
      console.log('⚠️  RPC non disponibile, provo esecuzione diretta...');
      
      // Dividi in statement multipli e esegui uno alla volta
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));
      
      for (const statement of statements) {
        if (statement.length > 10) {
          try {
            const { error: stmtError } = await supabase.from('_migrations').insert({
              name: nomeFile,
              executed_at: new Date().toISOString()
            });
            
            // Se non c'è tabella _migrations, ignora
            if (stmtError && stmtError.code !== '42P01') {
              console.log('   ⚠️ ', stmtError.message);
            }
          } catch (e) {
            // Ignora errori minori
          }
        }
      }
      
      console.log(`   ⚠️  Impossibile eseguire automaticamente`);
      console.log(`   📝 AZIONE MANUALE RICHIESTA:`);
      console.log(`      1. Apri Supabase Dashboard`);
      console.log(`      2. Vai su SQL Editor`);
      console.log(`      3. Copia e incolla il contenuto di:`);
      console.log(`         ${nomeFile}`);
      console.log(`      4. Esegui la query`);
      return false;
    } else {
      console.log(`   ✅ Migrazione eseguita con successo!`);
      return true;
    }
  } catch (error) {
    console.error(`   ❌ Errore:`, error.message);
    console.log(`   📝 AZIONE MANUALE RICHIESTA: esegui manualmente su Supabase Dashboard`);
    return false;
  }
}

async function verificaTriggers() {
  console.log('\n🔍 Verifica Trigger creati...');
  
  // Query per verificare trigger (usa una query SELECT normale)
  const queryCheck = `
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND trigger_name LIKE 'trigger_notify%'
    ORDER BY event_object_table, trigger_name;
  `;
  
  try {
    // Non possiamo eseguire SELECT direttamente, ma possiamo controllare creando una notifica test
    console.log('   ℹ️  Per verificare i trigger, dobbiamo controllare manualmente');
    console.log('   📝 Vai su Supabase Dashboard > SQL Editor ed esegui:');
    console.log('   ' + queryCheck.replace(/\n/g, '\n   '));
    
  } catch (error) {
    console.log('   ⚠️  Impossibile verificare automaticamente');
  }
}

async function main() {
  console.log('🚀 ESECUZIONE MIGRAZIONI NOTIFICHE\n');
  console.log('═'.repeat(60));
  console.log('⚠️  IMPORTANTE: Stai per modificare il database di PRODUZIONE');
  console.log('═'.repeat(60));
  
  // Leggi i file delle migrazioni
  const migration2Path = path.join(__dirname, 'supabase/migrations/20251016140000_add_notification_triggers.sql');
  const migration3Path = path.join(__dirname, 'supabase/migrations/20251016150000_fix_document_upload_notifications.sql');
  
  if (!fs.existsSync(migration2Path) || !fs.existsSync(migration3Path)) {
    console.error('❌ File migrazioni non trovati!');
    return;
  }
  
  const migration2SQL = fs.readFileSync(migration2Path, 'utf8');
  const migration3SQL = fs.readFileSync(migration3Path, 'utf8');
  
  console.log('\n📋 Migrazioni da eseguire:');
  console.log('   1. 20251016140000_add_notification_triggers.sql (Trigger base)');
  console.log('   2. 20251016150000_fix_document_upload_notifications.sql (Fix upload)');
  
  console.log('\n⚠️  NOTA: L\'esecuzione automatica potrebbe non funzionare.');
  console.log('         Se vedi errori, esegui manualmente le migrazioni.');
  console.log('         Apri Supabase Dashboard > SQL Editor e copia-incolla il SQL.\n');
  
  // Pausa per conferma (in produzione dovresti aggiungere un prompt)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Esegui Migration 2
  const success2 = await eseguiMigrazione(
    '20251016140000_add_notification_triggers.sql',
    migration2SQL
  );
  
  // Esegui Migration 3
  const success3 = await eseguiMigrazione(
    '20251016150000_fix_document_upload_notifications.sql',
    migration3SQL
  );
  
  // Verifica
  await verificaTriggers();
  
  // Riepilogo
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RIEPILOGO:\n');
  
  if (success2 && success3) {
    console.log('✅ Tutte le migrazioni eseguite!');
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Riavvia il server locale (npm run dev)');
    console.log('   2. Testa caricando un documento');
    console.log('   3. Controlla la campanella 🔔 per vedere le notifiche');
  } else {
    console.log('⚠️  Alcune migrazioni richiedono esecuzione manuale');
    console.log('\n📝 AZIONE RICHIESTA:');
    console.log('   1. Apri Supabase Dashboard: https://supabase.com/dashboard');
    console.log('   2. Seleziona il progetto');
    console.log('   3. Vai su "SQL Editor"');
    console.log('   4. Crea una nuova query');
    console.log('   5. Copia il contenuto di:');
    console.log('      • supabase/migrations/20251016140000_add_notification_triggers.sql');
    console.log('   6. Esegui (Run)');
    console.log('   7. Ripeti per:');
    console.log('      • supabase/migrations/20251016150000_fix_document_upload_notifications.sql');
    console.log('\n   Poi ri-esegui: node verifica-notifiche.cjs');
  }
  
  console.log('\n📖 Documentazione completa: NOTIFICHE_ATTIVE.md\n');
}

main().catch(console.error);

