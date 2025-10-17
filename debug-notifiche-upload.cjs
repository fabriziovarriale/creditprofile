/**
 * Debug dettagliato per capire perché le notifiche non vengono create
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

async function debug() {
  console.log('🔍 DEBUG NOTIFICHE UPLOAD\n');
  console.log('═'.repeat(70));
  
  // 1. Verifica ultimo documento caricato
  console.log('\n1️⃣ Ultimo documento caricato...');
  const { data: lastDoc, error: docError } = await supabase
    .from('documents')
    .select('id, file_name, credit_profile_id, uploaded_by_user_id, uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();
  
  if (docError || !lastDoc) {
    console.log('   ❌ Nessun documento trovato o errore:', docError?.message);
    return;
  }
  
  console.log('   📄 Documento:', lastDoc.file_name);
  console.log('   📅 Caricato:', new Date(lastDoc.uploaded_at).toLocaleString('it-IT'));
  console.log('   🆔 ID Documento:', lastDoc.id);
  console.log('   🔗 Credit Profile ID:', lastDoc.credit_profile_id);
  console.log('   👤 Uploaded by User ID:', lastDoc.uploaded_by_user_id);
  
  // 2. Verifica credit profile
  console.log('\n2️⃣ Verifica Credit Profile...');
  const { data: profile, error: profileError } = await supabase
    .from('credit_profiles')
    .select('id, client_id, broker_id')
    .eq('id', lastDoc.credit_profile_id)
    .single();
  
  if (profileError || !profile) {
    console.log('   ❌ Credit Profile NON trovato:', profileError?.message);
    console.log('   ⚠️  PROBLEMA: Il documento non è associato a un credit profile valido!');
    return;
  }
  
  console.log('   ✅ Credit Profile trovato');
  console.log('   👤 Client ID:', profile.client_id);
  console.log('   🏦 Broker ID:', profile.broker_id);
  
  if (!profile.broker_id) {
    console.log('   ❌ PROBLEMA: broker_id è NULL!');
    console.log('   📝 Il trigger richiede un broker_id per creare la notifica');
    return;
  }
  
  // 3. Verifica chi ha caricato
  console.log('\n3️⃣ Verifica chi ha caricato il documento...');
  const isBrokerUpload = lastDoc.uploaded_by_user_id === profile.broker_id;
  const isClientUpload = lastDoc.uploaded_by_user_id === profile.client_id;
  
  console.log('   🏦 Caricato dal broker:', isBrokerUpload ? '✅ SÌ' : '❌ NO');
  console.log('   👤 Caricato dal cliente:', isClientUpload ? '✅ SÌ' : '❌ NO');
  
  if (!isBrokerUpload && !isClientUpload) {
    console.log('   ⚠️  ATTENZIONE: uploaded_by_user_id non corrisponde né a broker né a cliente!');
    console.log('   📝 Questo potrebbe causare problemi col trigger');
  }
  
  // 4. Verifica notifiche create per questo documento
  console.log('\n4️⃣ Notifiche create per questo documento...');
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .gte('created_at', lastDoc.uploaded_at)
    .order('created_at', { ascending: false });
  
  if (notifError) {
    console.log('   ❌ Errore nel recupero notifiche:', notifError.message);
  } else if (!notifications || notifications.length === 0) {
    console.log('   ❌ NESSUNA notifica creata!');
    console.log('   ⚠️  PROBLEMA CONFERMATO: Il trigger NON ha creato la notifica');
  } else {
    console.log(`   ✅ Trovate ${notifications.length} notifiche create dopo il documento:`);
    notifications.forEach((n, idx) => {
      console.log(`   ${idx + 1}. ${n.title}`);
      console.log(`      Per: ${n.user_id}`);
      console.log(`      Tipo: ${n.type}`);
      console.log(`      Letta: ${n.read ? 'Sì' : 'No'}`);
    });
  }
  
  // 5. Verifica trigger esistente
  console.log('\n5️⃣ Verifica trigger attivo...');
  console.log('   ℹ️  Per verificare, vai su Supabase SQL Editor ed esegui:');
  console.log('   SELECT * FROM information_schema.triggers');
  console.log('   WHERE trigger_name = \'trigger_notify_document_uploaded\';');
  
  // 6. Test manuale del trigger
  console.log('\n6️⃣ Test manuale del trigger...');
  console.log('   📝 Per testare manualmente, esegui su Supabase SQL Editor:');
  console.log(`
   -- Simula l'inserimento di un documento
   SELECT notify_document_uploaded() 
   FROM documents 
   WHERE id = ${lastDoc.id};
  `);
  
  // 7. Riepilogo e diagnosi
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 DIAGNOSI:\n');
  
  if (!profile.broker_id) {
    console.log('❌ PROBLEMA TROVATO: broker_id è NULL');
    console.log('   📝 SOLUZIONE:');
    console.log('      Il credit profile deve avere un broker_id valido.');
    console.log('      Verifica che il broker sia assegnato al cliente.');
  } else if (!lastDoc.uploaded_by_user_id) {
    console.log('❌ PROBLEMA TROVATO: uploaded_by_user_id è NULL');
    console.log('   📝 SOLUZIONE:');
    console.log('      Il documento deve avere uploaded_by_user_id impostato.');
    console.log('      Verifica DocumentUploadForm.tsx linea ~220');
  } else if (!isBrokerUpload && !isClientUpload) {
    console.log('❌ PROBLEMA TROVATO: uploaded_by_user_id non corrisponde');
    console.log('   📝 uploaded_by_user_id:', lastDoc.uploaded_by_user_id);
    console.log('   📝 broker_id:', profile.broker_id);
    console.log('   📝 client_id:', profile.client_id);
    console.log('   SOLUZIONE: Verifica che uploaded_by_user_id sia corretto');
  } else if (notifications && notifications.length > 0) {
    console.log('✅ TUTTO OK! Le notifiche sono state create');
    console.log('   📝 Se non le vedi nell\'app:');
    console.log('      1. Fai hard refresh (Cmd+Shift+R)');
    console.log('      2. Verifica di essere loggato come il broker corretto');
    console.log('      3. Controlla console browser per errori real-time');
  } else {
    console.log('❌ PROBLEMA: Il trigger NON sta creando notifiche');
    console.log('   📝 POSSIBILI CAUSE:');
    console.log('      1. Il trigger non è attivo (verifica con query sopra)');
    console.log('      2. Il trigger ha un errore di logica');
    console.log('      3. Le RLS policies bloccano l\'inserimento');
    console.log('\n   📝 NEXT STEP:');
    console.log('      Esegui Migration 3 SAFE:');
    console.log('      supabase/migrations/20251016150001_fix_document_upload_notifications_safe.sql');
  }
  
  console.log('\n');
}

debug().catch(console.error);

