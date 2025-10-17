/**
 * Script per testare manualmente le notifiche
 * Crea una notifica per ogni broker nel sistema
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

async function testNotifiche() {
  console.log('🧪 TEST NOTIFICHE MANUALI\n');
  console.log('═'.repeat(60));
  
  // 1. Trova tutti i broker
  console.log('\n1️⃣ Ricerca broker nel database...');
  const { data: brokers, error: brokerError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role')
    .eq('role', 'broker')
    .limit(5);
  
  if (brokerError) {
    console.error('   ❌ Errore:', brokerError.message);
    return;
  }
  
  if (!brokers || brokers.length === 0) {
    console.log('   ⚠️  Nessun broker trovato nel database');
    return;
  }
  
  console.log(`   ✅ Trovati ${brokers.length} broker:`);
  brokers.forEach((b, idx) => {
    const name = b.first_name && b.last_name 
      ? `${b.first_name} ${b.last_name}` 
      : b.email;
    console.log(`      ${idx + 1}. ${name} (${b.id.substring(0, 8)}...)`);
  });
  
  // 2. Crea una notifica di test per ogni broker
  console.log('\n2️⃣ Creazione notifiche di test...');
  
  for (const broker of brokers) {
    const name = broker.first_name && broker.last_name 
      ? `${broker.first_name} ${broker.last_name}` 
      : broker.email;
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: broker.id,
        type: 'system_alert',
        title: '🧪 Test Sistema Notifiche',
        message: `Ciao ${broker.first_name || 'Broker'}! Il sistema di notifiche è attivo e funzionante. Questo è un messaggio di test.`,
        link: '/broker/dashboard',
        metadata: {
          test: true,
          created_by: 'test_script',
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (error) {
      console.log(`   ❌ Errore per ${name}:`, error.message);
    } else {
      console.log(`   ✅ Notifica creata per ${name} (ID: ${data.id})`);
    }
  }
  
  // 3. Conta le notifiche totali
  console.log('\n3️⃣ Conteggio notifiche totali...');
  const { count, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('   ❌ Errore nel conteggio');
  } else {
    console.log(`   📊 Notifiche totali nel database: ${count}`);
  }
  
  // 4. Mostra ultime notifiche
  console.log('\n4️⃣ Ultime 5 notifiche create...');
  const { data: recentNotifs } = await supabase
    .from('notifications')
    .select('id, type, title, created_at, read, user_id')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (recentNotifs && recentNotifs.length > 0) {
    recentNotifs.forEach((n, idx) => {
      const status = n.read ? '✅ Letta' : '🔔 Non letta';
      console.log(`   ${idx + 1}. ${status} | ${n.title}`);
      console.log(`      Tipo: ${n.type} | ${new Date(n.created_at).toLocaleString('it-IT')}`);
    });
  }
  
  // Riepilogo
  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ TEST COMPLETATO!\n');
  console.log('📝 PROSSIMI STEP:');
  console.log('   1. Apri l\'app: http://localhost:5173');
  console.log('   2. Login come broker');
  console.log('   3. Controlla la campanella 🔔 in alto a destra');
  console.log('   4. Dovresti vedere le notifiche di test!');
  console.log('\n💡 Se vedi le notifiche → Il sistema funziona! ✨');
  console.log('   Se NON le vedi → Controlla console browser (F12)\n');
}

testNotifiche().catch(console.error);

