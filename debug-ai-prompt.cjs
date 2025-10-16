/**
 * Script per debuggare il prompt dell'AI e verificare il contenuto estratto
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

async function debugAIPrompt(brokerId) {
  console.log('🔍 Debug prompt AI per broker:', brokerId || 'TUTTI', '\n');
  
  // Simula la logica dell'AI service per recuperare i dati
  
  // 1. Recupera clienti
  const { data: clients, error: clientsError } = await supabase
    .from('users')
    .select(`
      id, email, first_name, last_name,
      credit_profiles:credit_profiles (
        id, status, created_at
      )
    `)
    .eq('role', 'client');
    
  if (clientsError) {
    console.error('❌ Errore recupero clienti:', clientsError);
    return;
  }
  
  // Filtra per broker se necessario
  const clientsForBroker = clients.filter(c => 
    c.credit_profiles && c.credit_profiles.some(p => true) // In produzione si filtra per broker_id
  );
  
  console.log(`👥 Clienti trovati: ${clientsForBroker.length}`);
  
  // 2. Per ogni cliente, recupera i documenti con contenuto estratto
  let extractedDocumentsContent = [];
  
  for (const client of clientsForBroker) {
    console.log(`\n👤 Cliente: ${client.first_name} ${client.last_name} (${client.email})`);
    console.log(`   Credit profiles: ${client.credit_profiles.length}`);
    
    if (client.credit_profiles && client.credit_profiles.length > 0) {
      const profileId = client.credit_profiles[0].id;
      
      // Recupera documenti con contenuto estratto
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, document_type, file_name, extracted_content, content_metadata, extraction_status')
        .eq('credit_profile_id', profileId)
        .eq('extraction_status', 'completed')
        .not('extracted_content', 'is', null);
      
      if (docsError) {
        console.error('   ❌ Errore recupero documenti:', docsError);
        continue;
      }
      
      console.log(`   📄 Documenti con contenuto: ${docs ? docs.length : 0}`);
      
      if (docs && docs.length > 0) {
        docs.forEach(doc => {
          console.log(`      - ${doc.file_name}: ${doc.extracted_content ? doc.extracted_content.length : 0} chars`);
        });
        
        extractedDocumentsContent.push({
          clientName: `${client.first_name} ${client.last_name}`,
          clientEmail: client.email,
          documents: docs
        });
      } else {
        console.log(`      ⚠️  Nessun documento estratto per questo profilo`);
      }
    } else {
      console.log(`   ⚠️  Nessun credit profile per questo cliente`);
    }
  }
  
  console.log(`\n\n📋 RIEPILOGO CONTENUTO DISPONIBILE PER L'AI:`);
  console.log(`   Clienti con documenti estratti: ${extractedDocumentsContent.length}`);
  
  if (extractedDocumentsContent.length > 0) {
    console.log(`\n✅ CONTENUTO CHE L'AI RICEVERÀ:\n`);
    
    extractedDocumentsContent.forEach(clientDoc => {
      console.log(`CLIENTE: ${clientDoc.clientName} (${clientDoc.clientEmail})`);
      clientDoc.documents.forEach((doc, index) => {
        const metadata = doc.content_metadata || {};
        const preview = doc.extracted_content ? doc.extracted_content.substring(0, 300) + '...' : 'Contenuto non disponibile';
        console.log(`  ${index + 1}. ${doc.document_type} - ${doc.file_name}`);
        console.log(`     📝 Contenuto estratto: ${preview}`);
        console.log(`     📊 Metadati: ${metadata.wordCount || 0} parole | CF rilevato: ${metadata.containsCF ? 'SÌ' : 'NO'}${metadata.detectedCF ? ` (${metadata.detectedCF})` : ''}`);
        console.log('');
      });
    });
    
    // Calcola dimensione del prompt
    let totalChars = 0;
    extractedDocumentsContent.forEach(clientDoc => {
      clientDoc.documents.forEach(doc => {
        totalChars += doc.extracted_content ? doc.extracted_content.length : 0;
      });
    });
    
    console.log(`\n📊 STATISTICHE PROMPT:`);
    console.log(`   Caratteri totali di contenuto estratto: ${totalChars.toLocaleString()}`);
    console.log(`   Stima token (~4 char = 1 token): ${Math.ceil(totalChars / 4).toLocaleString()} token`);
    console.log(`   ⚠️  Limite Groq: ~8000 token input`);
    
    if (Math.ceil(totalChars / 4) > 6000) {
      console.log(`   🔴 ATTENZIONE: Il prompt potrebbe essere troppo grande per Groq!`);
      console.log(`   💡 Soluzione: Limitare il contenuto estratto a 300-500 caratteri per documento`);
    }
    
  } else {
    console.log(`\n❌ PROBLEMA: L'AI NON HA CONTENUTO DISPONIBILE!`);
    console.log(`\n📝 CAUSE POSSIBILI:`);
    console.log(`   1. I documenti non sono stati processati (extraction_status != 'completed')`);
    console.log(`   2. L'estrazione PDF non funziona in produzione`);
    console.log(`   3. I documenti non hanno extracted_content nel database`);
    console.log(`\n🔧 SOLUZIONI:`);
    console.log(`   1. Eseguire check-extracted-documents.cjs per vedere lo stato`);
    console.log(`   2. Ri-caricare i documenti per triggerare l'estrazione`);
    console.log(`   3. Verificare i log del browser durante il caricamento PDF`);
  }
}

// Usa il broker ID passato come argomento o un default
const brokerId = process.argv[2] || null;
debugAIPrompt(brokerId).catch(console.error);


