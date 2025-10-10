/**
 * Servizio per l'estrazione di contenuto da documenti PDF
 * Utilizza PDF.js per l'estrazione di testo per l'analisi AI
 */

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { supabase } from '@/lib/supabaseClient';

// Configura il worker per PDF.js - approccio robusto con import dinamico
if (typeof GlobalWorkerOptions !== 'undefined') {
  // In sviluppo, usa l'import URL per garantire il percorso corretto
  if (import.meta.env.DEV) {
    try {
      GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      // Fallback al CDN se l'import URL fallisce
      GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
  } else {
    // In produzione, usa CDN stabile
    GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }
}

export interface ExtractedContent {
  text: string;
  pages: number;
  metadata: {
    extractedAt: string;
    confidence: number;
    wordCount: number;
    containsCF: boolean; // Se contiene probabile codice fiscale
    detectedCF?: string; // Codice fiscale rilevato
  };
}

export interface DocumentExtractionResult {
  success: boolean;
  content?: ExtractedContent;
  error?: string;
}

/**
 * Estrae contenuto testuale da un file PDF
 */
export async function extractPDFContent(file: File): Promise<DocumentExtractionResult> {
  try {
    console.log('📄 Inizio estrazione PDF:', file.name);
    
    // Leggi il file come ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Carica il documento PDF
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    console.log('📖 PDF caricato, pagine:', pdf.numPages);
    
    let extractedText = '';
    const pages = pdf.numPages;
    
    // Estrai testo da ogni pagina
    for (let pageNum = 1; pageNum <= pages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += `\n--- Pagina ${pageNum} ---\n${pageText}\n`;
        
        console.log(`📄 Estratta pagina ${pageNum}/${pages}`);
      } catch (pageError) {
        console.warn(`⚠️ Errore estrazione pagina ${pageNum}:`, pageError);
        extractedText += `\n--- Pagina ${pageNum} (Errore estrazione) ---\n`;
      }
    }
    
    // Analizza il contenuto estratto
    const metadata = analyzeExtractedContent(extractedText);
    
    const result: ExtractedContent = {
      text: extractedText.trim(),
      pages,
      metadata
    };
    
    console.log('✅ Estrazione completata:', {
      pages,
      wordCount: metadata.wordCount,
      confidence: metadata.confidence,
      containsCF: metadata.containsCF
    });
    
    return {
      success: true,
      content: result
    };
    
  } catch (error) {
    console.error('❌ Errore estrazione PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Analizza il contenuto estratto per metadati utili
 */
function analyzeExtractedContent(text: string) {
  const now = new Date().toISOString();
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Cerca codici fiscali (pattern basilare)
  const cfPattern = /[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]/g;
  const cfMatches = text.match(cfPattern);
  const containsCF = !!(cfMatches && cfMatches.length > 0);
  const detectedCF = cfMatches?.[0];
  
  // Calcola confidence basato su diversi fattori
  let confidence = 0.5; // Base
  if (wordCount > 10) confidence += 0.2;
  if (wordCount > 50) confidence += 0.2;
  if (containsCF) confidence += 0.1;
  
  confidence = Math.min(confidence, 1.0);
  
  return {
    extractedAt: now,
    confidence: Math.round(confidence * 100) / 100,
    wordCount,
    containsCF,
    detectedCF
  };
}

/**
 * Aggiorna un documento nel database con il contenuto estratto
 */
export async function updateDocumentWithExtractedContent(
  documentId: number,
  extractedContent: ExtractedContent
): Promise<boolean> {
  try {
    console.log('💾 Aggiornamento documento con contenuto estratto:', documentId);
    
    const { error } = await supabase
      .from('documents')
      .update({
        extracted_content: extractedContent.text,
        extraction_status: 'completed',
        content_metadata: extractedContent.metadata
      })
      .eq('id', documentId);
    
    if (error) {
      console.error('❌ Errore aggiornamento documento:', error);
      return false;
    }
    
    console.log('✅ Documento aggiornato con contenuto estratto');
    return true;
    
  } catch (error) {
    console.error('❌ Errore generale aggiornamento documento:', error);
    return false;
  }
}

/**
 * Marca un documento come fallito nell'estrazione
 */
export async function markDocumentExtractionFailed(
  documentId: number,
  errorMessage: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        extraction_status: 'failed',
        content_metadata: {
          extractedAt: new Date().toISOString(),
          error: errorMessage
        }
      })
      .eq('id', documentId);
    
    if (error) {
      console.error('❌ Errore marcatura documento fallito:', error);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore generale marcatura documento fallito:', error);
    return false;
  }
}

/**
 * Ottiene i documenti con contenuto estratto per un profilo di credito
 */
export async function getDocumentsWithContent(creditProfileId: number) {
  try {
    console.log(`🔍 PDF Service: Cercando documenti per credit_profile_id: ${creditProfileId}`);
    
    const { data, error } = await supabase
      .from('documents')
      .select('id, document_type, file_name, extracted_content, content_metadata, extraction_status')
      .eq('credit_profile_id', creditProfileId)
      .eq('extraction_status', 'completed')
      .not('extracted_content', 'is', null);
    
    if (error) {
      console.error('❌ PDF Service: Errore recupero documenti con contenuto:', error);
      return [];
    }
    
    console.log(`📄 PDF Service: Query trovata ${data?.length || 0} documenti completed con contenuto per profile ${creditProfileId}`);
    if (data && data.length > 0) {
      data.forEach(doc => {
        console.log(`  📄 ${doc.file_name} (ID: ${doc.id}) - Status: ${doc.extraction_status} - Content: ${doc.extracted_content ? doc.extracted_content.length + ' chars' : 'NULL'}`);
      });
    }
    
    return data || [];
    
  } catch (error) {
    console.error('❌ PDF Service: Errore generale recupero documenti con contenuto:', error);
    return [];
  }
}

/**
 * Cerca contenuto specifico nei documenti (es. codice fiscale)
 */
export async function searchInDocuments(
  creditProfileId: number, 
  searchTerm: string
): Promise<Array<{
  documentId: number;
  documentType: string;
  fileName: string;
  matches: string[];
}>> {
  try {
    const documents = await getDocumentsWithContent(creditProfileId);
    const results = [];
    
    const searchRegex = new RegExp(searchTerm, 'gi');
    
    for (const doc of documents) {
      if (doc.extracted_content) {
        const matches = doc.extracted_content.match(searchRegex);
        if (matches && matches.length > 0) {
          results.push({
            documentId: doc.id,
            documentType: doc.document_type,
            fileName: doc.file_name,
            matches: [...new Set(matches)] // Rimuovi duplicati
          });
        }
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Errore ricerca nei documenti:', error);
    return [];
  }
}

/**
 * Aggiorna solo lo status di estrazione di un documento
 */
export async function updateDocumentExtractionStatus(
  documentId: number, 
  status: 'pending' | 'completed' | 'failed'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ extraction_status: status })
      .eq('id', documentId);
      
    if (error) {
      console.error('❌ Errore aggiornamento status estrazione:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Errore aggiornamento status estrazione:', error);
    throw error;
  }
}
