/**
 * Servizio per la gestione dei profili credito con Supabase
 */

import { supabase } from '@/lib/supabaseClient';

export interface CreditProfile {
  id: number;
  client_id: string;
  broker_id: string;
  administrator_id?: string;
  status: 'pending' | 'completed' | 'draft' | 'in_review' | 'requires_documents';
  document_summary?: any;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateCreditProfileData {
  client_id: string;
  broker_id: string;
  status?: 'pending' | 'completed' | 'draft' | 'in_review' | 'requires_documents';
}

/**
 * Crea un nuovo profilo credito
 */
export async function createCreditProfile(profileData: CreateCreditProfileData): Promise<CreditProfile | null> {
  try {
    const { data: newProfile, error } = await supabase
      .from('credit_profiles')
      .insert({
        client_id: profileData.client_id,
        broker_id: profileData.broker_id,
        status: profileData.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Errore creazione profilo credito:', error);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Errore generale creazione profilo credito:', error);
    return null;
  }
}

/**
 * Recupera i profili credito di un broker
 */
export async function getBrokerCreditProfiles(brokerId: string): Promise<CreditProfile[]> {
  try {
    const { data: profiles, error } = await supabase
      .from('credit_profiles')
      .select('*')
      .eq('broker_id', brokerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Errore recupero profili credito:', error);
      return [];
    }

    return profiles || [];
  } catch (error) {
    console.error('Errore generale recupero profili credito:', error);
    return [];
  }
}

/**
 * Recupera il profilo credito di un cliente
 */
export async function getClientCreditProfile(clientId: string, brokerId: string): Promise<CreditProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('credit_profiles')
      .select('*')
      .eq('client_id', clientId)
      .eq('broker_id', brokerId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Errore recupero profilo credito cliente:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Errore generale recupero profilo credito cliente:', error);
    return null;
  }
}

/**
 * Crea o recupera un profilo credito per un cliente
 */
export async function getOrCreateCreditProfile(clientId: string, brokerId: string): Promise<CreditProfile | null> {
  try {
    // Prima prova a trovare un profilo esistente
    const existingProfile = await getClientCreditProfile(clientId, brokerId);
    
    if (existingProfile) {
      return existingProfile;
    }

    // Se non esiste, creane uno nuovo
    const newProfile = await createCreditProfile({
      client_id: clientId,
      broker_id: brokerId,
      status: 'pending'
    });

    return newProfile;
  } catch (error) {
    console.error('Errore generale getOrCreateCreditProfile:', error);
    return null;
  }
}

/**
 * Aggiorna lo status di un profilo credito
 */
export async function updateCreditProfileStatus(profileId: number, status: CreditProfile['status']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('credit_profiles')
      .update({ status })
      .eq('id', profileId);

    if (error) {
      console.error('Errore aggiornamento profilo credito:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Errore generale aggiornamento profilo credito:', error);
    return false;
  }
}












