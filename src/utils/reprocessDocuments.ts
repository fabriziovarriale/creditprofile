/**
 * Utility per ri-processare documenti esistenti per l'estrazione PDF
 * SOLO PER DEVELOPMENT/TESTING
 */

import { supabase } from '@/lib/supabaseClient';
import { extractPDFContent, updateDocumentWithExtractedContent, markDocumentExtractionFailed } from '@/services/pdfExtractionService';

export async function reprocessDocumentByName(fileName: string): Promise<boolean> {
  try {
    console.log('🔄 Cercando documento:', fileName);
    
    // Trova il documento
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('file_name', `%${fileName}%`)
      .order('uploaded_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Errore ricerca documento:', error);
      return false;
    }
    
    if (!documents || documents.length === 0) {
      console.error('❌ Documento non trovato:', fileName);
      return false;
    }
    
    const document = documents[0];
    console.log('📄 Documento trovato:', document);
    
    // NOTA: In un ambiente reale, dovremmo avere il file originale
    // Per questo test, simuliamo che non possiamo ri-estrarre senza il file originale
    console.warn('⚠️ Per ri-processare documenti esistenti, serve il file originale');
    console.warn('💡 Suggerimento: Carica un nuovo PDF per testare l\'estrazione');
    
    // Aggiorna lo stato per mostrare che abbiamo tentato
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extraction_status: 'failed',
        content_metadata: {
          error: 'Impossibile ri-processare documento esistente - file originale non disponibile',
          attemptedAt: new Date().toISOString()
        }
      })
      .eq('id', document.id);
    
    if (updateError) {
      console.error('❌ Errore aggiornamento documento:', updateError);
      return false;
    }
    
    console.log('✅ Documento marcato come non ri-processabile');
    return true;
    
  } catch (error) {
    console.error('❌ Errore generale ri-elaborazione:', error);
    return false;
  }
}

// Funzione di debug da chiamare dalla console
(window as any).reprocessDocument = reprocessDocumentByName;
