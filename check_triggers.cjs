const fs = require('fs');
const path = require('path');

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
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTriggers() {
  console.log('🔍 Verificando trigger nel database...\n');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND trigger_name LIKE 'trigger_notify%'
      ORDER BY event_object_table, trigger_name;
    `
  }).single();
  
  if (error) {
    console.log('❌ Non posso verificare i trigger (RPC potrebbe non essere disponibile)');
    console.log('Prova manualmente su Supabase Dashboard → SQL Editor:\n');
    console.log(`SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_name LIKE 'trigger_notify%';`);
  } else {
    console.log('✅ Trigger trovati:', data);
  }
}

checkTriggers();
