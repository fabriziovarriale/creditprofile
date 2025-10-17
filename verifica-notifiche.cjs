/**
 * Script per verificare lo stato delle notifiche
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

async function verificaNotifiche() {
  console.log('🔍 VERIFICA STATO NOTIFICHE\n');
  console.log('═'.repeat(50));
  
  // 1. Verifica tabella notifications
  console.log('\n1️⃣ Verifica Tabella notifications...');
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('count');
  
  if (notifError) {
    console.log('   ❌ ERRORE: Tabella notifications NON esiste');
    console.log('   📝 AZIONE: Esegui Migration 1');
    console.log('   📄 File: supabase/migrations/20251016130000_create_notifications_table.sql');
    console.log('\n   ⚠️  FERMA QUI! Esegui Migration 1 prima di procedere.\n');
    return false;
  } else {
    console.log('   ✅ Tabella notifications ESISTE');
  }
  
  // 2. Conta notifiche
  console.log('\n2️⃣ Conteggio Notifiche nel Database...');
  const { count, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('   ❌ Errore nel conteggio');
  } else {
    console.log(`   📊 Notifiche totali: ${count}`);
    if (count === 0) {
      console.log('   ⚠️  ATTENZIONE: 0 notifiche nel database!');
      console.log('   📝 POSSIBILI CAUSE:');
      console.log('      - I trigger non sono stati creati (esegui Migration 2 e 3)');
      console.log('      - Non hai ancora caricato/modificato documenti dopo le migrazioni');
    }
  }
  
  // 3. Mostra ultime notifiche
  if (count > 0) {
    console.log('\n3️⃣ Ultime 5 Notifiche...');
    const { data: recentNotifs } = await supabase
      .from('notifications')
      .select('id, type, title, created_at, read')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentNotifs && recentNotifs.length > 0) {
      recentNotifs.forEach((n, idx) => {
        console.log(`   ${idx + 1}. ${n.read ? '✅' : '🔔'} ${n.title}`);
        console.log(`      Tipo: ${n.type} | ${new Date(n.created_at).toLocaleString('it-IT')}`);
      });
    }
  }
  
  // 4. Verifica documenti recenti
  console.log('\n4️⃣ Verifica Documenti Recenti (per trigger)...');
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('id, file_name, uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(3);
  
  if (docsError) {
    console.log('   ⚠️  Non posso accedere alla tabella documents');
  } else if (docs && docs.length > 0) {
    console.log(`   📄 Ultimi ${docs.length} documenti caricati:`);
    docs.forEach((d, idx) => {
      console.log(`   ${idx + 1}. ${d.file_name} (${new Date(d.uploaded_at).toLocaleDateString('it-IT')})`);
    });
    
    if (count === 0) {
      console.log('\n   ⚠️  PROBLEMA CONFERMATO:');
      console.log('      - Ci sono documenti caricati');
      console.log('      - Ma 0 notifiche create');
      console.log('      - I TRIGGER NON SONO ATTIVI!');
      console.log('\n   📝 SOLUZIONE:');
      console.log('      Esegui Migration 2 e Migration 3');
    }
  } else {
    console.log('   ℹ️  Nessun documento ancora caricato');
  }
  
  // 5. Riepilogo
  console.log('\n' + '═'.repeat(50));
  console.log('\n📋 RIEPILOGO:\n');
  
  if (count > 0) {
    console.log('✅ TUTTO OK! Le notifiche funzionano.');
    console.log('   Se non le vedi nell\'app:');
    console.log('   1. Fai hard refresh (Cmd+Shift+R)');
    console.log('   2. Controlla console browser (F12)');
    console.log('   3. Verifica di essere loggato come broker');
  } else if (docs && docs.length > 0) {
    console.log('❌ PROBLEMA: Trigger NON attivi');
    console.log('   📝 AZIONE RICHIESTA:');
    console.log('   1. Vai su Supabase Dashboard');
    console.log('   2. Apri SQL Editor');
    console.log('   3. Esegui Migration 2: supabase/migrations/20251016140000_add_notification_triggers.sql');
    console.log('   4. Esegui Migration 3: supabase/migrations/20251016150000_fix_document_upload_notifications.sql');
  } else {
    console.log('ℹ️  STATO: Setup completato, in attesa di dati');
    console.log('   📝 NEXT STEP:');
    console.log('   1. Assicurati che Migration 2 e 3 siano eseguite');
    console.log('   2. Carica un documento o modifica uno status');
    console.log('   3. Ri-esegui questo script per verificare');
  }
  
  console.log('\n📖 Guida completa: ESEGUI_MIGRAZIONI.md\n');
}

verificaNotifiche().catch(console.error);

