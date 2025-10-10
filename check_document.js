// Script per verificare il documento CODICE FISCALE TOM.pdf
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

async function checkDocument() {
  console.log('🔍 Verificando documento CODICE FISCALE TOM.pdf...');
  console.log('URL:', process.env.VITE_SUPABASE_URL);
  console.log('Key presente:', !!process.env.VITE_SUPABASE_ANON_KEY);
  
  const { data: docs, error } = await supabase
    .from('documents')
    .select('id, file_name, extracted_content, extraction_status, content_metadata')
    .ilike('file_name', '%CODICE FISCALE TOM%');
    
  if (error) {
    console.error('❌ Errore:', error);
    return;
  }
  
  console.log('📄 Documenti trovati:', docs.length);
  docs.forEach(doc => {
    console.log(`\nDocumento ID: ${doc.id}`);
    console.log(`Nome: ${doc.file_name}`);
    console.log(`Status estrazione: ${doc.extraction_status}`);
    console.log(`Contenuto estratto: ${doc.extracted_content ? 'SI (' + doc.extracted_content.length + ' chars)' : 'NO'}`);
    console.log(`Metadata: ${doc.content_metadata ? JSON.stringify(doc.content_metadata) : 'NO'}`);
    
    if (doc.extracted_content) {
      console.log(`\n📄 CONTENUTO ESTRATTO:\n${doc.extracted_content.substring(0, 500)}...`);
    }
  });
}

checkDocument().catch(console.error);
