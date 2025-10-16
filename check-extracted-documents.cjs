/**
 * Script per verificare se i documenti hanno il contenuto estratto
 */

const fs = require('fs');
const path = require('path');

// Carica le env variables dal file .env
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

async function checkExtractedDocuments() {
  console.log('🔍 Verifica documenti con contenuto estratto...\n');
  
  // 1. Statistiche generali
  const { data: allDocs, error: allError } = await supabase
    .from('documents')
    .select('id, file_name, extraction_status, extracted_content');
    
  if (allError) {
    console.error('❌ Errore:', allError);
    return;
  }
  
  console.log('📊 STATISTICHE GENERALI:');
  console.log(`   Totale documenti: ${allDocs.length}`);
  
  const withContent = allDocs.filter(d => d.extracted_content && d.extracted_content.trim().length > 0);
  const completed = allDocs.filter(d => d.extraction_status === 'completed');
  const pending = allDocs.filter(d => d.extraction_status === 'pending');
  const failed = allDocs.filter(d => d.extraction_status === 'failed');
  const withoutStatus = allDocs.filter(d => !d.extraction_status);
  
  console.log(`   Con contenuto estratto: ${withContent.length}`);
  console.log(`   Status 'completed': ${completed.length}`);
  console.log(`   Status 'pending': ${pending.length}`);
  console.log(`   Status 'failed': ${failed.length}`);
  console.log(`   Senza status: ${withoutStatus.length}\n`);
  
  // 2. Dettaglio documenti con contenuto
  if (withContent.length > 0) {
    console.log('✅ DOCUMENTI CON CONTENUTO ESTRATTO:');
    withContent.forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc.file_name}`);
      console.log(`      Status: ${doc.extraction_status}`);
      console.log(`      Contenuto: ${doc.extracted_content.length} caratteri`);
      console.log(`      Preview: ${doc.extracted_content.substring(0, 100)}...\n`);
    });
  } else {
    console.log('❌ NESSUN DOCUMENTO CON CONTENUTO ESTRATTO!\n');
  }
  
  // 3. Documenti da processare
  const toProcess = allDocs.filter(d => 
    !d.extracted_content && 
    d.extraction_status !== 'failed'
  );
  
  if (toProcess.length > 0) {
    console.log('⚠️  DOCUMENTI DA PROCESSARE:');
    toProcess.forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc.file_name} (Status: ${doc.extraction_status || 'N/A'})`);
    });
    console.log('');
  }
  
  // 4. Raccomandazioni
  console.log('💡 RACCOMANDAZIONI:');
  if (withContent.length === 0) {
    console.log('   🔴 PROBLEMA: Nessun documento ha contenuto estratto!');
    console.log('   📝 CAUSA PROBABILE: L\'estrazione PDF non funziona in produzione');
    console.log('   🔧 SOLUZIONE: Verificare PDF.js worker e ri-caricare i documenti');
  } else if (withContent.length < allDocs.length) {
    console.log('   🟡 Alcuni documenti mancano di contenuto estratto');
    console.log('   📝 I nuovi caricamenti potrebbero funzionare, ma i vecchi documenti no');
  } else {
    console.log('   🟢 Tutti i documenti hanno contenuto estratto!');
  }
  
  console.log('\n📄 NEXT STEPS:');
  console.log('   1. Verificare i log della console quando si carica un nuovo PDF');
  console.log('   2. Controllare che PDF.js worker si carichi correttamente (rete browser)');
  console.log('   3. Se necessario, ri-caricare i documenti per triggerare l\'estrazione');
}

checkExtractedDocuments().catch(console.error);


