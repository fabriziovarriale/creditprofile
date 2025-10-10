/**
 * Servizio per la gestione dei documenti con Supabase
 */

import { supabase } from '@/lib/supabaseClient';

export interface Document {
  id: number;
  credit_profile_id: number;
  uploaded_by_user_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size_kb: number;
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  uploaded_at: string;
}

export interface CreateDocumentData {
  credit_profile_id: number;
  uploaded_by_user_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size_kb: number;
  status?: 'pending' | 'approved' | 'rejected' | 'requires_changes';
}

/**
 * Crea un nuovo documento
 */
export async function createDocument(documentData: CreateDocumentData): Promise<Document | null> {
  try {
    const { data: newDocument, error } = await supabase
      .from('documents')
      .insert({
        credit_profile_id: documentData.credit_profile_id,
        uploaded_by_user_id: documentData.uploaded_by_user_id,
        document_type: documentData.document_type,
        file_path: documentData.file_path,
        file_name: documentData.file_name,
        file_size_kb: documentData.file_size_kb,
        status: documentData.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Errore creazione documento:', error);
      return null;
    }

    return newDocument;
  } catch (error) {
    console.error('Errore generale creazione documento:', error);
    return null;
  }
}

/**
 * Recupera i documenti di un profilo credito
 */
export async function getDocumentsByProfile(profileId: number): Promise<Document[]> {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('credit_profile_id', profileId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Errore recupero documenti:', error);
      return [];
    }

    return documents || [];
  } catch (error) {
    console.error('Errore generale recupero documenti:', error);
    return [];
  }
}

/**
 * Documento con informazioni cliente per il broker
 */
export interface DocumentWithClient extends Document {
  clientName: string;
  clientEmail: string;
  creditProfileStatus: string;
}

/**
 * Recupera i documenti di un broker (tramite profili credito) con informazioni cliente
 */
export async function getBrokerDocuments(brokerId: string): Promise<DocumentWithClient[]> {
  try {
    console.log('🔍 Recupero documenti per broker via RPC:', brokerId);

    // USA RPC per bypassare RLS e JOIN complessi
    const { data: documents, error } = await supabase.rpc('get_broker_documents', {
      broker_uuid: brokerId
    });

    if (error) {
      console.error('❌ Errore RPC get_broker_documents:', error);
      return [];
    }

    if (!documents || documents.length === 0) {
      console.log('⚠️ Nessun documento trovato per il broker');
      return [];
    }

    // Trasforma i dati nel formato richiesto
    const documentsWithClient: DocumentWithClient[] = documents.map(doc => ({
      id: doc.id,
      credit_profile_id: doc.credit_profile_id,
      uploaded_by_user_id: doc.uploaded_by_user_id,
      document_type: doc.document_type,
      file_path: doc.file_path,
      file_name: doc.file_name,
      file_size_kb: doc.file_size_kb,
      status: doc.status,
      uploaded_at: doc.uploaded_at,
      clientName: `${doc.client_first_name || ''} ${doc.client_last_name || ''}`.trim(),
      clientEmail: doc.client_email || '',
      creditProfileStatus: doc.credit_profile_status || ''
    }));

    console.log(`✅ Recuperati ${documentsWithClient.length} documenti via RPC`);
    return documentsWithClient;

  } catch (error) {
    console.error('❌ Errore generale recupero documenti broker:', error);
    return [];
  }
}

/**
 * Aggiorna lo status di un documento
 */
export async function updateDocumentStatus(documentId: number, status: Document['status']): Promise<boolean> {
  try {
    // USA RPC per aggiornare status documento (bypassa RLS)
    const { data: success, error } = await supabase.rpc('update_document_status', {
      p_document_id: documentId,
      p_status: status
    });

    if (error) {
      console.error('Errore RPC update_document_status:', error);
      return false;
    }

    return success === true;
  } catch (error) {
    console.error('Errore generale aggiornamento documento:', error);
    return false;
  }
}

/**
 * Elimina un documento
 */
export async function deleteDocument(documentId: number): Promise<boolean> {
  try {
    // USA RPC per eliminare documento (bypassa RLS)
    const { data: deletedCount, error } = await supabase.rpc('delete_document', {
      p_document_id: documentId
    });

    if (error) {
      console.error('Errore RPC delete_document:', error);
      return false;
    }

    if (deletedCount === 0) {
      console.warn('⚠️ Nessuna riga eliminata, documento probabilmente non esisteva:', documentId);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Errore generale eliminazione documento:', error);
    return false;
  }
}


