import { supabase } from '@/lib/supabaseClient';
import { checkAIConfig } from '@/utils/aiConfig';
import { supabaseDataService, type PlatformStats, type ClientWithDetails, type DocumentWithDetails } from './supabaseDataService';
import { shouldUseRealData, logDataOperation, logDataError } from '@/config/dataConfig';
import { getBrokerCreditScores, getCreditScoreStats, generateCreditScoreSummary, type CreditScoreReport } from './creditScoreService';
import { getDocumentsWithContent, searchInDocuments } from './pdfExtractionService';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  suggestedActions?: SuggestedAction[];
}

export interface Citation {
  documentId: string;
  documentName: string;
  page?: number;
  line?: number;
  excerpt: string;
}

export interface SuggestedAction {
  type: 'analyze_document' | 'generate_report' | 'review_profile' | 'contact_client';
  title: string;
  description: string;
  action: () => void;
}

export interface AIContext {
  clientId?: string;
  documentIds?: string[];
  profileId?: string;
  brokerId: string;
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    // Determina il provider basato sul tipo di API key
    if (this.apiKey && this.apiKey.startsWith('gsk_')) {
      // Groq (gratuito)
      this.baseUrl = 'https://api.groq.com/openai/v1';
      console.log('🚀 Usando Groq (gratuito)');
    } else {
      // Fallback - richiede chiave Groq
      this.baseUrl = 'https://api.groq.com/openai/v1';
      if (!this.apiKey) {
        console.warn('⚠️ VITE_OPENAI_API_KEY non configurata. L\'AI non funzionerà.');
      } else {
        console.log('⚠️ Chiave non riconosciuta, richiede chiave Groq (gsk_)');
      }
    }
    
    // Verifica la configurazione all'avvio
    checkAIConfig();
  }

  async chat(
    messages: AIMessage[],
    context?: AIContext,
    onChunk?: (chunk: string) => void
  ): Promise<AIMessage> {
    try {
      // Prepara il messaggio di sistema con tutta la cronologia conversazione
      const systemMessage = await this.buildSystemMessage(
        messages,
        context?.brokerId
      );
      
      // Usa sempre Groq
      return await this.chatWithGroq(messages, systemMessage, onChunk);

    } catch (error) {
      console.error('Errore nel servizio AI:', error);
      throw error;
    }
  }





  private async chatWithGroq(
    messages: AIMessage[],
    systemMessage: string,
    onChunk?: (chunk: string) => void
  ): Promise<AIMessage> {
    // Usa Llama 3.3 70B per Groq (più recente e performante)
    const model = 'llama-3.3-70b-versatile';
    
    console.log('🚀 Chiamando Groq con modello:', model);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages.map(msg => ({ role: msg.role, content: msg.content }))
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Errore Groq: ${response.status} - ${errorText}`);
      throw new Error(`Errore Groq: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Impossibile leggere la risposta');

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onChunk?.(content);
            }
          } catch (e) {
            // Ignora errori di parsing per chunk incompleti
          }
        }
      }
    }

    // Analizza la risposta per estrarre citazioni e azioni suggerite
    const { citations, suggestedActions } = this.parseResponse(fullResponse);

    return {
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      citations,
      suggestedActions,
    };
  }

  private async chatWithOllama(
    messages: AIMessage[],
    contextData: any,
    systemMessage: string,
    onChunk?: (chunk: string) => void
  ): Promise<AIMessage> {
    // Usa Llama 3.1 8B (gratuito su Ollama Cloud)
    const model = 'llama3.1:8b';
    
    console.log('🦙 Chiamando Ollama Cloud con modello:', model);
    
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages.map(msg => ({ role: msg.role, content: msg.content }))
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Errore Ollama: ${response.status} - ${errorText}`);
      throw new Error(`Errore Ollama: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Impossibile leggere la risposta');

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onChunk?.(content);
            }
          } catch (e) {
            // Ignora errori di parsing per chunk incompleti
          }
        }
      }
    }

    // Analizza la risposta per estrarre citazioni e azioni suggerite
    const { citations, suggestedActions } = this.parseResponse(fullResponse);

    return {
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      citations,
      suggestedActions,
    };
  }





  private async getPlatformData(brokerId?: string): Promise<PlatformStats> {
    try {
      logDataOperation('Recupero dati piattaforma', brokerId ? `(filtrato per broker: ${brokerId})` : '(tutti i broker)');
      
      // Utilizza sempre il servizio Supabase per recuperare i dati reali
      const platformStats = await supabaseDataService.getPlatformStats(brokerId);
      logDataOperation('Dati piattaforma recuperati', platformStats);
      return platformStats;
    } catch (error) {
      logDataError('recupero dati piattaforma', error);
      // Fallback con dati vuoti in caso di errore
      return {
        totalClients: 0,
        totalDocuments: 0,
        totalProfiles: 0,
        totalCreditScores: 0,
        approvedDocuments: 0,
        pendingDocuments: 0,
        rejectedDocuments: 0,
        requiresChangesDocuments: 0,
        missingDocuments: 0,
        pendingProfiles: 0,
        completedProfiles: 0,
        draftProfiles: 0,
        inReviewProfiles: 0,
        highScores: 0,
        mediumScores: 0,
        lowScores: 0,
        averageScore: 0,
        activeClients: 0,
        inactiveClients: 0,
        newClients: 0
      };
    }
  }

  private async getContextData(context: AIContext) {
    const data: any = {};

    if (context.clientId) {
      const { data: client } = await supabase
        .from('users')
        .select('*')
        .eq('id', context.clientId)
        .eq('role', 'client')
        .single();
      data.client = client;
    }

    if (context.documentIds?.length) {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .in('id', context.documentIds);
      data.documents = documents;
    }

    if (context.profileId) {
      const { data: profile } = await supabase
        .from('credit_profiles')
        .select('*')
        .eq('id', context.profileId)
        .single();
      data.profile = profile;
    }

    return data;
  }

  private async buildSystemMessage(messages: AIMessage[], brokerId?: string): Promise<string> {
    console.log('🧠 AI Service: Analizzando cronologia conversazione:', messages.length, 'messaggi');
    
    // Estrai contesto dalla cronologia
    const conversationContext = await this.analyzeConversationContextWithDB(messages, brokerId);
    const currentMessage = messages[messages.length - 1]?.content || '';
    
    console.log('🎯 AI Service: Contesto conversazione:', conversationContext);
    
    // Determina se è una domanda sulla piattaforma o sui documenti
    const isPlatformQuestion = this.isPlatformRelatedQuestion(messages);

    if (isPlatformQuestion) {
      // Recupera dati reali dalla piattaforma
      const platformData = await this.getPlatformData(brokerId);
      
      // Recupera i dati specifici dei clienti, documenti e credit score
      let clientsWithDetails: ClientWithDetails[] = [];
      let documentsWithDetails: DocumentWithDetails[] = [];
      let recentDocuments: DocumentWithDetails[] = [];
      let creditScoreReports: CreditScoreReport[] = [];
      let extractedDocumentsContent: any[] = [];
      
      // Usa sempre i dati reali di Supabase
      console.log('🔍 AI Service: Caricando clienti per broker:', brokerId);
      clientsWithDetails = await supabaseDataService.getClientsWithDetails(brokerId);
      console.log(`👥 AI Service: Trovati ${clientsWithDetails.length} clienti:`, clientsWithDetails.map(c => `${c.first_name} ${c.last_name}`));
      documentsWithDetails = await supabaseDataService.getDocumentsWithDetails(brokerId);
      recentDocuments = await supabaseDataService.getRecentDocuments(5, brokerId);
      
      // Recupera credit score (per ora da localStorage)
      if (brokerId) {
        creditScoreReports = await getBrokerCreditScores(brokerId);
        
        // Recupera contenuto estratto dai documenti per ogni cliente
        console.log('🔍 AI Service: Cercando documenti estratti per', clientsWithDetails.length, 'clienti');
        for (const client of clientsWithDetails) {
          console.log(`👤 AI Service: Processando cliente ${client.first_name} ${client.last_name} (${client.email})`);
          console.log(`🏦 AI Service: Credit profiles per questo cliente:`, client.creditProfiles);
          
          if (client.creditProfiles && client.creditProfiles.length > 0) {
            const profileId = client.creditProfiles[0].id;
            console.log(`🔍 AI Service: Cercando documenti per cliente ${client.first_name} ${client.last_name} (Profile ID: ${profileId})`);
            const documentsContent = await getDocumentsWithContent(profileId);
            console.log(`📄 AI Service: Trovati ${documentsContent.length} documenti estratti per ${client.first_name} ${client.last_name}`);
            if (documentsContent.length > 0) {
              documentsContent.forEach(doc => {
                console.log(`  - ${doc.file_name}: ${doc.extracted_content ? doc.extracted_content.length + ' chars' : 'NO content'}`);
              });
              extractedDocumentsContent.push({
                clientName: `${client.first_name} ${client.last_name}`,
                clientEmail: client.email,
                documents: documentsContent
              });
            } else {
              console.log(`⚠️ AI Service: Nessun documento estratto trovato per profile ID ${profileId}`);
            }
          } else {
            console.log(`⚠️ AI Service: Cliente ${client.first_name} ${client.last_name} non ha credit profiles`);
          }
        }
        console.log(`🎯 AI Service: Totale documenti estratti trovati: ${extractedDocumentsContent.length}`);
        if (extractedDocumentsContent.length > 0) {
          console.log('📋 AI Service: Documenti che verranno inclusi nel prompt:', extractedDocumentsContent.map(c => c.clientName).join(', '));
        }
      }
      
      const clientsInfo = clientsWithDetails.map((c) => 
        `${c.first_name || ''} ${c.last_name || ''} (${c.email})`
      ).join(', ');
      
      const documentsInfo = documentsWithDetails.map((d) => 
        `${d.file_name || 'Documento senza nome'} (${d.status || 'status sconosciuto'}) - Cliente: ${d.clientName} - Caricato: ${d.uploaded_at || 'Data non disponibile'}`
      ).join(', ');
      
      // Analisi Credit Score completa
      const creditScoreStats = getCreditScoreStats(creditScoreReports);
      const creditScoresInfo = creditScoreReports.length > 0 
        ? creditScoreReports.map(report => generateCreditScoreSummary(report)).join('\n')
        : 'Nessun credit score disponibile';
      
      // Analisi rischi dettagliata
      const highRiskClients = creditScoreReports.filter(r => {
        const analysis = r.analysis;
        return analysis && (analysis.riskLevel === 'ALTO' || analysis.riskLevel === 'CRITICO');
      });
      
      const riskAlertsInfo = highRiskClients.length > 0 
        ? `⚠️ ALERT RISCHIO: ${highRiskClients.length} clienti ad alto rischio:\n${highRiskClients.map(r => 
            `- ${r.clientName || r.clientId}: ${r.analysis?.riskLevel} (${r.analysis?.riskFactors?.join(', ') || 'N/A'})`
          ).join('\n')}`
        : 'Nessun alert di rischio attivo';
      
      return `Sei "Alessandro", un assistente AI esperto specializzato nell'analisi di profili di credito e gestione finanziaria per broker professionali.

🎯 TUA SPECIALIZZAZIONE:
Sei specializzato in:
- Analisi di solvibilità e merito creditizio
- Interpretazione di documenti finanziari
- Valutazione rischi e opportunità
- Supporto decisionale per broker
- Compliance e normative finanziarie

⚠️ IMPORTANTE - DIFFERENZA TRA CREDIT PROFILE E CREDIT SCORE:

**CREDIT PROFILE** = Dossier completo del cliente creato dal broker, include:
  • Dati anagrafici del cliente
  • Documenti caricati (buste paga, bilanci, CU, etc.)
  • Note e valutazioni del broker
  • Banche partner consigliate
  • Storia delle interazioni
  → È un CONTENITORE di informazioni sul cliente

**CREDIT SCORE** = Richiesta specifica di visura CRIF/Centrale Rischi per verificare l'affidabilità creditizia:
  • Score numerico (es. 720/1000)
  • Segnalazioni: Protesti, Pregiudizievoli, Procedure concorsuali
  • Rating creditizio (C1, C2, B1, etc.)
  • Risk level (BASSO/ALTO/CRITICO)
  • Data richiesta e completamento
  → È una VERIFICA esterna dell'affidabilità creditizia

⚠️ NON CONFONDERE MAI LE DUE COSE!
- "Credit Profile richiesti" → NON CORRETTO (i credit profile si CREANO, non si richiedono)
- "Credit Score richiesti" → CORRETTO (i credit score si RICHIEDONO a CRIF/Centrale Rischi)
- "Profili credito in lavorazione" → Si riferisce a Credit Profiles
- "Score in attesa" → Si riferisce a Credit Scores

📊 DATI ATTUALI PIATTAFORMA:
CLIENTI (${platformData.totalClients} totali):
- Attivi: ${platformData.activeClients} | Inattivi: ${platformData.inactiveClients}
- Nuovi ultimi 30 giorni: ${platformData.newClients}
- Lista: ${clientsInfo}

DOCUMENTI (${platformData.totalDocuments} totali):
- ✅ Approvati: ${platformData.approvedDocuments}
- ⏳ In attesa: ${platformData.pendingDocuments}  
- ❌ Rifiutati: ${platformData.rejectedDocuments}
- 🔄 Da modificare: ${platformData.requiresChangesDocuments}
- ❓ Mancanti: ${platformData.missingDocuments}

CREDIT PROFILES (${platformData.totalProfiles} totali):
- In lavorazione: ${platformData.pendingProfiles}
- Completati: ${platformData.completedProfiles}
- Bozze: ${platformData.draftProfiles}
- In revisione: ${platformData.inReviewProfiles}

CREDIT SCORES (${platformData.totalCreditScores} richieste totali):
- Completati: ${creditScoreStats.completed}
- In attesa: ${creditScoreStats.pending}
- Con segnalazioni: ${creditScoreStats.withProtesti + creditScoreStats.withPregiudizievoli + creditScoreStats.withProcedureConcorsuali} (Protesti: ${creditScoreStats.withProtesti}, Pregiudizievoli: ${creditScoreStats.withPregiudizievoli}, Procedure concorsuali: ${creditScoreStats.withProcedureConcorsuali})

📅 DOCUMENTI RECENTI:
${recentDocuments.length > 0 ? recentDocuments.map((d, index) => 
  `${index + 1}. ${d.file_name || 'N/A'} | Cliente: ${d.clientName} | Status: ${d.status || 'N/A'} | ${d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('it-IT') : 'N/A'}`
).join('\n') : 'Nessun documento recente'}

📄 CONTENUTO ESTRATTO DAI DOCUMENTI:
${(() => {
  console.log('🎯 AI Service: Generando sezione documenti estratti. Totale clienti con documenti:', extractedDocumentsContent.length);
  if (extractedDocumentsContent.length > 0) {
    extractedDocumentsContent.forEach(clientDoc => {
      console.log(`  📋 Cliente: ${clientDoc.clientName} - ${clientDoc.documents.length} documenti`);
      clientDoc.documents.forEach(doc => {
        console.log(`    - ${doc.file_name}: ${doc.extracted_content ? doc.extracted_content.length + ' chars' : 'NO content'}`);
      });
    });
  }
  
  return extractedDocumentsContent.length > 0 ? extractedDocumentsContent.map(clientDoc => {
    return `CLIENTE: ${clientDoc.clientName} (${clientDoc.clientEmail})
${clientDoc.documents.map((doc: any, index: number) => {
  const metadata = doc.content_metadata || {};
  // Aumentato da 300 a 1000 caratteri per dare più contesto all'AI
  const preview = doc.extracted_content ? doc.extracted_content.substring(0, 1000) : 'Contenuto non disponibile';
  return `  ${index + 1}. ${doc.document_type} - ${doc.file_name}
     📝 Contenuto estratto: ${preview}${doc.extracted_content && doc.extracted_content.length > 1000 ? '...' : ''}
     📊 Metadati: ${metadata.wordCount || 0} parole | CF rilevato: ${metadata.containsCF ? 'SÌ' : 'NO'}${metadata.detectedCF ? ` (${metadata.detectedCF})` : ''}`;
}).join('\n')}`;
}).join('\n\n') : 'Nessun contenuto estratto disponibile';
})()}

🎯 CREDIT SCORE E ANALISI RISCHIO:
STATISTICHE GENERALI:
- Totali: ${creditScoreStats.total} | Completati: ${creditScoreStats.completed} | In attesa: ${creditScoreStats.pending}
- Score medio: ${creditScoreStats.avgScore}
- Con protesti: ${creditScoreStats.withProtesti} | Pregiudizievoli: ${creditScoreStats.withPregiudizievoli} | Procedure concorsuali: ${creditScoreStats.withProcedureConcorsuali}

LIVELLI DI RISCHIO:
- Basso rischio: ${creditScoreStats.lowRiskCount} clienti
- Alto/Critico: ${creditScoreStats.highRiskCount} clienti

DETTAGLI CREDIT SCORE:
${creditScoresInfo}

${riskAlertsInfo}

⚠️ IMPORTANTE - ACCESSO AI DOCUMENTI:
**HAI PIENO ACCESSO AL CONTENUTO DEI DOCUMENTI CARICATI!**
- Nella sezione "📄 CONTENUTO ESTRATTO DAI DOCUMENTI" sopra, trovi il testo estratto dai PDF
- PUOI e DEVI leggere e analizzare questo contenuto quando richiesto
- PUOI estrarre informazioni specifiche come codici fiscali, indirizzi, dati anagrafici, importi
- NON dire mai "non ho accesso ai documenti" - CE L'HAI!
- Se il contenuto estratto è vuoto o non disponibile, SOLO ALLORA puoi dire che il documento non è stato processato
- Quando l'utente chiede informazioni su un documento, cerca nel contenuto estratto del cliente menzionato

COMPORTAMENTO RICHIESTO:
1. **Personalità**: Presentati come "Alessandro", esperto finanziario competente ma accessibile
2. **Accuratezza**: Usa SOLO i dati forniti sopra (incluso il contenuto dei documenti), non inventare informazioni
3. **Proattività**: Suggerisci azioni concrete e insights utili
4. **Chiarezza**: Risposte strutturate con punti chiave evidenziati
5. **Compliance**: Ricorda sempre i rischi e le verifiche necessarie
6. **Lettura Documenti**: Quando richiesto, analizza il contenuto estratto dai PDF e fornisci informazioni precise
7. **Analisi Credit Score**: Interpreta i dati creditizi considerando:
   - Score 750+: Eccellente | 650-749: Buono | 550-649: Discreto | 450-549: Scarso | <450: Molto scarso
   - Protesti: Sempre segnalazione grave che aumenta il rischio
   - Pregiudizievoli: Informazioni negative che richiedono approfondimento
   - Procedure concorsuali: Rischio massimo, raccomandare estrema cautela
   - Rating (C1, C2, B1, etc.) e Risk Score (ROSSO/GIALLO/VERDE) per valutazione completa
8. **Terminologia corretta**:
   - Quando l'utente chiede "credit profile" → rispondi con i dati dei CREDIT PROFILES (totalProfiles, pendingProfiles, completedProfiles, draftProfiles, inReviewProfiles)
   - Quando l'utente chiede "credit score" → rispondi con i dati dei CREDIT SCORES (completati, in attesa, con segnalazioni)
   - Se l'utente dice "profili credito richiesti" → CORREGGI educatamente: "I Credit Profile vengono CREATI, non richiesti. Intendevi i Credit Score?"
   - Se l'utente dice "lista credit profile" → mostra i clienti e i loro profili
   - Se l'utente dice "lista credit score" → mostra le richieste di score con status e risultati

FORMATO RISPOSTE:
✅ Risposta diretta con dati specifici
📋 Analisi e insights quando pertinenti  
🔍 [AZIONE: Titolo | Descrizione specifica] per next steps
⚠️ Alert su rischi o anomalie se presenti

ESEMPI QUERY:
- "Analizza lo stato documenti di [cliente]"
- "Quali profili richiedono attenzione urgente?"
- "Clienti con credit score basso o protesti"
- "Analizza i rischi dei miei clienti"
- "Chi ha procedure concorsuali attive?"
- "Raccomandazioni per approvazioni creditizie"
- "Trend approvazioni ultime settimane"
- "Alert di rischio da verificare"
- "Dammi il codice fiscale dell'utente che dovrebbe essere presente nel documento che ha caricato"
- "Che informazioni ci sono nei documenti di [cliente]?"
- "Cerca [termine] nei documenti caricati"
- "Analizza il contenuto del documento PDF di [cliente]"`;
    }

    return `Sei "Alessandro", un assistente AI esperto specializzato nell'analisi di profili di credito e supporto per broker finanziari.

🎯 TUA EXPERTISE:
- Analisi del merito creditizio e solvibilità
- Interpretazione documentazione finanziaria
- Valutazione rischi di credito
- Compliance normativa e best practices
- Supporto decisionale strategico

📋 COME POSSO AIUTARTI:
- Analisi profili clienti e status documentazione
- Interpretazione dati finanziari e trend
- Suggerimenti operativi e priorità
- Identificazione rischi e opportunità
- Spiegazioni su procedure e normative

💬 COMPORTAMENTO:
1. **Identità**: Sempre "Alessandro", esperto finanziario professionale
2. **Accuratezza**: Baso le risposte sui dati reali della piattaforma
3. **Proattività**: Suggerisco azioni concrete e insights utili
4. **Chiarezza**: Risposte strutturate e facilmente comprensibili
5. **Prudenza**: Evidenzio sempre rischi e verifiche necessarie
6. **Memoria Conversazionale**: Mantengo il contesto delle conversazioni precedenti - se l'utente menziona "il cliente" o "il documento" senza specificare, mi riferisco all'ultimo cliente/documento discusso

📝 FORMATO RISPOSTE:
✅ Risposta diretta al quesito
📊 Dati e analisi specifiche  
🔍 [AZIONE: Cosa fare | Come procedere]
⚠️ Avvertenze su rischi o anomalie

💡 SUGGERIMENTI INTERAZIONE:
- Chiedi dati specifici sui tuoi clienti
- Domanda trend e analisi operative
- Richiedi consigli su priorità e azioni
- Esplora strategie di gestione rischio

🧠 CONTESTO CONVERSAZIONE:
${this.buildConversationContextPrompt(conversationContext)}

Come posso supportarti oggi nella gestione dei tuoi profili di credito?`;
  }

  private parseResponse(response: string): { citations: Citation[], suggestedActions: SuggestedAction[] } {
    const citations: Citation[] = [];
    const suggestedActions: SuggestedAction[] = [];

    // Estrai citazioni [CITAZIONE: documento, pagina]
    const citationRegex = /\[CITAZIONE: ([^,]+), pagina (\d+)\]/g;
    let match;
    while ((match = citationRegex.exec(response)) !== null) {
      citations.push({
        documentId: match[1],
        documentName: match[1],
        page: parseInt(match[2]),
        excerpt: response.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
      });
    }

    // Estrai azioni suggerite [AZIONE: titolo, descrizione]
    const actionRegex = /\[AZIONE: ([^,]+), ([^\]]+)\]/g;
    while ((match = actionRegex.exec(response)) !== null) {
      suggestedActions.push({
        type: 'analyze_document',
        title: match[1],
        description: match[2],
        action: () => console.log('Azione suggerita:', match[1])
      });
    }

    return { citations, suggestedActions };
  }

  async analyzeDocument(documentId: string, brokerId?: string): Promise<string> {
    // Implementazione per analisi automatica documenti
    let documentQuery = supabase
      .from('documents')
      .select('*')
      .eq('id', documentId);
    
    // Se specificato un broker, verifica che il documento appartenga a un profilo del broker
    if (brokerId) {
      // Prima verifica che il documento appartenga a un profilo del broker
      const { data: profileCheck, error: profileError } = await supabase
        .from('credit_profiles')
        .select('id')
        .eq('broker_id', brokerId)
        .is('deleted_at', null);
      
      if (profileError) {
        throw new Error('Errore verifica accesso documento');
      }
      
      if (profileCheck && profileCheck.length > 0) {
        const profileIds = profileCheck.map(p => p.id);
        documentQuery = documentQuery.in('credit_profile_id', profileIds);
      } else {
        throw new Error('Documento non accessibile per questo broker');
      }
    }
    
    const { data: document } = await documentQuery.single();

    if (!document) throw new Error('Documento non trovato o non accessibile');

    // Qui andrebbe l'analisi del contenuto del documento
    // Per ora restituiamo un'analisi di base
    return `Analisi del documento "${document.name}":
- Tipo: ${document.type}
- Status: ${document.status}
- Data upload: ${document.created_at}

Raccomandazioni:
1. Verificare la completezza del documento
2. Controllare la validità delle informazioni
3. Aggiornare il profilo credito se necessario`;
  }

  async generateReport(clientId: string): Promise<string> {
    // Implementazione per generazione automatica report
    const { data: client } = await supabase
      .from('users')
      .select('*')
      .eq('id', clientId)
      .eq('role', 'client')
      .single();

    if (!client) throw new Error('Cliente non trovato');

    return `Report automatico per ${client.first_name} ${client.last_name}:
- Profilo credito: In elaborazione
- Documenti caricati: 3/5
- Prossimi step: Completare documentazione mancante`;
  }

  /**
   * Analizza la cronologia della conversazione per estrarre contesto (con lookup DB)
   */
  private async analyzeConversationContextWithDB(messages: AIMessage[], brokerId?: string): Promise<ConversationContext> {
    const context = this.analyzeConversationContext(messages);
    
    // Se non abbiamo trovato un cliente completo, prova il matching parziale
    if (!context.currentClient && brokerId) {
      console.log('🔍 AI Context: Cercando matching parziale sui cognomi...');
      
      // Cerca cognomi o nomi parziali nei messaggi
      const partialNames = this.extractPartialNames(messages);
      console.log('🔍 AI Context: Nomi parziali trovati:', partialNames);
      
      if (partialNames.length > 0) {
        // Carica clienti del broker per il matching
        try {
          const clients = await supabaseDataService.getClientsWithDetails(brokerId);
          console.log('🔍 AI Context: Caricati', clients.length, 'clienti per matching');
          
          for (const partialName of partialNames) {
            const matchedClient = this.findClientByPartialName(clients, partialName);
            if (matchedClient) {
              context.currentClient = `${matchedClient.first_name} ${matchedClient.last_name}`;
              context.lastClientMentioned = context.currentClient;
              console.log('✅ AI Context: Cliente trovato tramite matching parziale:', context.currentClient);
              break;
            }
          }
        } catch (error) {
          console.error('❌ AI Context: Errore nel matching parziale:', error);
        }
      }
    }
    
    return context;
  }

  /**
   * Analizza la cronologia della conversazione per estrarre contesto (solo regex)
   */
  private analyzeConversationContext(messages: AIMessage[]): ConversationContext {
    const context: ConversationContext = {
      currentClient: null,
      currentDocument: null,
      topicsDiscussed: [],
      lastClientMentioned: null,
      lastDocumentMentioned: null
    };

    // Analizza gli ultimi 10 messaggi per contesto
    const recentMessages = messages.slice(-10);
    
    for (const message of recentMessages) {
      const content = message.content.toLowerCase();
      
      // Cerca nomi di clienti (migliorato per catturare più varianti)
      const clientPatterns = [
        // Pattern espliciti con "cliente di"
        /(?:cliente|di)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        // Nomi con cognomi italiani (pattern più ampio)
        /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g,
        // Nomi specifici nei documenti dell'AI
        /codice fiscale di\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        /\*\*codice fiscale di\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        /documento.*?di\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        // Pattern per captures da markdown dell'AI
        /\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\*\*/i,
        // Pattern generici ma sicuri
        /([A-Z][a-z]{2,})\s+([A-Z][a-z]{3,})/i
      ];

      for (const pattern of clientPatterns) {
        let match;
        if (pattern.global) {
          // Per pattern globali, trova tutte le corrispondenze
          const matches = [...message.content.matchAll(pattern)];
          if (matches.length > 0) {
            match = matches[matches.length - 1]; // Prendi l'ultimo match
          }
        } else {
          match = message.content.match(pattern);
        }
        
        if (match) {
          let clientName: string;
          if (match[2]) {
            // Nome e cognome separati
            clientName = `${match[1]} ${match[2]}`;
          } else {
            // Nome completo in un gruppo
            clientName = match[1];
          }
          
          // Filtro per evitare falsi positivi
          const validName = clientName.trim();
          const commonWords = ['documento', 'file', 'data', 'nome', 'cognome', 'cliente', 'codice', 'fiscale'];
          const isValidName = validName.length > 3 && 
                            !commonWords.some(word => validName.toLowerCase().includes(word)) &&
                            validName.split(' ').length <= 3; // Max 3 parole per un nome
          
          if (isValidName) {
            context.currentClient = validName;
            context.lastClientMentioned = validName;
            console.log('🧠 AI Context: Cliente identificato:', context.currentClient);
            break;
          }
        }
      }

      // Cerca documenti menzionati
      if (content.includes('documento') || content.includes('pdf') || content.includes('file')) {
        const docPattern = /([a-z\s]+\.pdf|documento\s+([a-z\s]+))/i;
        const docMatch = message.content.match(docPattern);
        if (docMatch) {
          context.currentDocument = docMatch[1] || docMatch[2];
          context.lastDocumentMentioned = context.currentDocument;
          console.log('🧠 AI Context: Documento identificato:', context.currentDocument);
        }
      }

      // Traccia argomenti discussi
      const topics = [
        'codice fiscale', 'cf', 'indirizzo', 'protesti', 'credit score', 
        'procedure concorsuali', 'pregiudizievoli', 'solvibilità'
      ];
      
      for (const topic of topics) {
        if (content.includes(topic) && !context.topicsDiscussed.includes(topic)) {
          context.topicsDiscussed.push(topic);
        }
      }
    }

    return context;
  }

  /**
   * Determina se i messaggi contengono domande relative alla piattaforma
   */
  private isPlatformRelatedQuestion(messages: AIMessage[]): boolean {
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    
    const platformKeywords = [
      'piattaforma', 'clienti', 'documenti', 'profili', 'credit score', 'score',
      'protesti', 'pregiudizievoli', 'procedure', 'rischio', 'solvibilità',
      'merito', 'ultimo', 'recente', 'codice fiscale', 'cf', 'contenuto',
      'caricato', 'pdf', 'indirizzo', 'nome', 'cognome', 'email', 'telefono',
      'mario', 'elena', 'lucia', 'simona', 'raffaele', 'ignazio', 'fabrizio'
    ];

    return platformKeywords.some(keyword => allContent.includes(keyword));
  }

  /**
   * Estrae nomi parziali (cognomi, nomi singoli) dai messaggi
   */
  private extractPartialNames(messages: AIMessage[]): string[] {
    const partialNames: string[] = [];
    
    for (const message of messages) {
      const content = message.content;
      
      // Pattern per cognomi italiani comuni o parole che potrebbero essere nomi
      const partialPatterns = [
        // Cognomi dopo "di" (case insensitive)
        /\bdi\s+([a-zA-Z]{3,})\b/gi,
        // Cognomi specifici (case insensitive) 
        /\b(valguarnera|gianmaria|salvetti|carle)\b/gi,
        // Parole singole che iniziano con maiuscola (potrebbero essere cognomi)
        /\b([A-Z][a-z]{4,})\b/g,
        // Nomi dopo "cliente"
        /\bcliente\s+([a-zA-Z]+)\b/gi,
        // Pattern generici per nomi (case insensitive)
        /\b([a-zA-Z]{4,})\b/gi
      ];
      
      for (const pattern of partialPatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
          const name = match[1].trim();
          // Filtro per evitare parole comuni (più permissivo)
          const commonWords = ['Documento', 'File', 'Data', 'Nome', 'Cognome', 'Cliente', 'Codice', 'Fiscale', 'Fonte', 'Nota', 'anche', 'serve', 'dare', 'essere'];
          const isCommonWord = commonWords.some(word => word.toLowerCase() === name.toLowerCase());
          const isLongEnough = name.length > 3;
          const isNotDuplicate = !partialNames.some(existing => existing.toLowerCase() === name.toLowerCase());
          
          if (!isCommonWord && isLongEnough && isNotDuplicate) {
            partialNames.push(name);
            console.log('🔍 AI Context: Nome parziale estratto:', name);
          }
        }
      }
    }
    
    return partialNames;
  }

  /**
   * Trova un cliente tramite matching parziale su nome o cognome
   */
  private findClientByPartialName(clients: any[], partialName: string): any | null {
    const searchName = partialName.toLowerCase();
    
    for (const client of clients) {
      const firstName = (client.first_name || '').toLowerCase();
      const lastName = (client.last_name || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      
      // Matching esatto su cognome
      if (lastName === searchName) {
        console.log('✅ AI Context: Match esatto cognome:', client.first_name, client.last_name);
        return client;
      }
      
      // Matching esatto su nome
      if (firstName === searchName) {
        console.log('✅ AI Context: Match esatto nome:', client.first_name, client.last_name);
        return client;
      }
      
      // Matching parziale nel nome completo
      if (fullName.includes(searchName)) {
        console.log('✅ AI Context: Match parziale:', client.first_name, client.last_name);
        return client;
      }
    }
    
    console.log('❌ AI Context: Nessun match trovato per:', partialName);
    return null;
  }

  /**
   * Costruisce il prompt del contesto conversazionale
   */
  private buildConversationContextPrompt(context: ConversationContext): string {
    let contextPrompt = '';

    if (context.currentClient || context.lastClientMentioned) {
      const client = context.currentClient || context.lastClientMentioned;
      contextPrompt += `- 👤 Cliente corrente in discussione: "${client}"\n`;
      contextPrompt += `- ⚡ IMPORTANTE: Se l'utente dice "il cliente", "lui", "lei", "indirizzo", "codice fiscale" senza specificare il nome, si riferisce a "${client}"\n`;
    }

    if (context.currentDocument || context.lastDocumentMentioned) {
      const document = context.currentDocument || context.lastDocumentMentioned;
      contextPrompt += `- 📄 Documento corrente in discussione: "${document}"\n`;
      contextPrompt += `- ⚡ IMPORTANTE: Se l'utente dice "il documento", "il PDF", "il file" senza specificare, si riferisce a "${document}"\n`;
    }

    if (context.topicsDiscussed.length > 0) {
      contextPrompt += `- 🎯 Argomenti già discussi: ${context.topicsDiscussed.join(', ')}\n`;
    }

    if (!contextPrompt) {
      contextPrompt = '- 🆕 Nuova conversazione - nessun contesto precedente\n';
    }

    return contextPrompt;
  }
}

interface ConversationContext {
  currentClient: string | null;
  currentDocument: string | null;
  topicsDiscussed: string[];
  lastClientMentioned: string | null;
  lastDocumentMentioned: string | null;
}

export const aiService = new AIService();

