import { supabase } from '@/lib/supabaseClient';
import type { User } from '@/types';

export interface Client extends User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  creditProfiles?: any[];
  documents?: any[];
  status?: 'active' | 'inactive';
  createdAt?: string;
  created_at?: string;
}

/**
 * Recupera tutti i clienti associati a un broker
 */
export async function getBrokerClients(brokerId: string): Promise<Client[]> {
  try {
    console.log('🔍 Recupero clienti per broker (via RPC):', brokerId);
    
    // USA RPC per bypassare timeout RLS
    const { data: clients, error: rpcError } = await supabase
      .rpc('get_broker_clients', { broker_uuid: brokerId });
    
    if (rpcError) {
      console.error('❌ Errore RPC get_broker_clients:', rpcError);
      return [];
    }
    
    if (!clients || clients.length === 0) {
      console.log('⚠️ Broker non ha clienti');
      return [];
    }
    
    // Trasforma i dati nel formato richiesto
    const formattedClients: Client[] = clients.map(client => ({
      ...client,
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      createdAt: client.created_at,
      status: 'active',
      creditProfiles: [],
      documents: []
    }));
    
    console.log(`✅ Recuperati ${formattedClients.length} clienti per broker ${brokerId}`);
    return formattedClients;
    
  } catch (error) {
    console.error('❌ Errore nel recupero clienti del broker:', error);
    return [];
  }
}

/**
 * Recupera tutti i clienti (per amministratori)
 */
export async function getAllClients(): Promise<Client[]> {
  try {
    console.log('🔍 Recupero tutti i clienti...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    
    if (clientsError) {
      console.error('❌ Errore recupero tutti i clienti:', clientsError);
      return [];
    }
    
    if (!clients) return [];
    
    // Trasforma i dati nel formato richiesto
    const formattedClients: Client[] = clients.map(client => ({
      ...client,
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      createdAt: client.created_at,
      status: 'active', // Rimuoviamo is_active, tutti i clienti sono considerati attivi
      creditProfiles: [],
      documents: []
    }));
    
    console.log(`✅ Recuperati ${formattedClients.length} clienti totali`);
    return formattedClients;
    
  } catch (error) {
    console.error('❌ Errore nel recupero di tutti i clienti:', error);
    return [];
  }
}

/**
 * Elimina un cliente (utente con role=client).
 * Nota: per coerenza referenziale, la tabella credit_profiles ha FK ON DELETE CASCADE,
 * quindi eliminando l'utente dovrebbero eliminarsi profili e a cascata i documenti/credit scores
 * se le relative FK sono in CASCADE. In alternativa, eseguire eliminazioni applicative per le dipendenze.
 */
export async function deleteClient(clientId: string, supabaseClient?: typeof supabase, brokerId?: string): Promise<boolean> {
  try {
    const clientToUse = supabaseClient || supabase;
    
    console.log('🗑️ Eliminazione cliente via RPC:', clientId);
    
    if (!brokerId) {
      console.error('❌ broker_id mancante per deleteClient');
      return false;
    }
    
    const { data: deletedCount, error } = await clientToUse.rpc('delete_broker_client', {
      client_uuid: clientId,
      broker_uuid: brokerId
    });
    
    if (error) {
      console.error('❌ Errore RPC delete_broker_client:', error);
      return false;
    }
    
    if (deletedCount === 0) {
      console.warn('⚠️ Nessuna riga eliminata, cliente probabilmente non esisteva:', clientId);
      return false;
    }
    
    console.log(`✅ Cliente eliminato con successo (${deletedCount} riga/e):`, clientId);
    return true;
  } catch (err) {
    console.error('❌ Errore deleteClient:', err);
    return false;
  }
}

/**
 * Recupera un cliente specifico per ID
 */
export async function getClientById(clientId: string): Promise<Client | null> {
  try {
    console.log('🔍 Recupero cliente per ID:', clientId);
    
    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('*')
      .eq('id', clientId)
      .eq('role', 'client')
      .single();
    
    if (clientError) {
      console.error('❌ Errore recupero cliente:', clientError);
      return null;
    }
    
    if (!client) return null;
    
    // Trasforma i dati nel formato richiesto
    const formattedClient: Client = {
      ...client,
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      createdAt: client.created_at,
      status: 'active', // Rimuoviamo is_active, tutti i clienti sono considerati attivi
      creditProfiles: [],
      documents: []
    };
    
    console.log(`✅ Cliente recuperato:`, formattedClient.email);
    return formattedClient;
    
  } catch (error) {
    console.error('❌ Errore nel recupero cliente specifico:', error);
    return null;
  }
}

/**
 * Crea un nuovo cliente (usa RPC per bypassare RLS)
 */
export async function createClient(
  clientData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
    position?: string;
  },
  brokerId?: string
): Promise<{ client: Client | null; error?: any }> {
  try {
    console.log('🔍 Creazione nuovo cliente via RPC:', clientData.email);
    
    if (!brokerId) {
      console.error('❌ broker_id mancante per createClient');
      return { client: null, error: { message: 'broker_id richiesto' } };
    }
    
    // USA RPC per bypassare RLS e creare cliente + credit_profile in una transazione
    const { data: clients, error: rpcError } = await supabase.rpc('create_broker_client', {
      broker_uuid: brokerId,
      client_email: clientData.email,
      client_first_name: clientData.first_name,
      client_last_name: clientData.last_name,
      client_phone: clientData.phone || null,
      client_company_name: clientData.company || null
    });
    
    if (rpcError) {
      console.error('❌ Errore RPC create_broker_client:', rpcError);
      return { client: null, error: rpcError };
    }
    
    if (!clients || clients.length === 0) {
      console.error('❌ Nessun cliente ritornato da RPC');
      return { client: null };
    }
    
    const client = clients[0];
    
    // Trasforma i dati nel formato richiesto
    const formattedClient: Client = {
      ...client,
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      createdAt: client.created_at,
      status: 'active',
      creditProfiles: [],
      documents: []
    };
    
    console.log(`✅ Cliente creato via RPC:`, formattedClient.email);
    return { client: formattedClient };
    
  } catch (error) {
    console.error('❌ Errore nella creazione del cliente:', error);
    return { client: null, error };
  }
}

/**
 * Aggiorna un cliente esistente
 */
export async function updateClient(clientId: string, updates: Partial<{
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  vat_number: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}>): Promise<Client | null> {
  try {
    console.log('🔍 Aggiornamento cliente via RPC:', clientId);
    
    // USA RPC per aggiornare cliente (bypassa RLS)
    const { data: rpcData, error: clientError } = await supabase.rpc('update_client', {
      p_client_id: clientId,
      p_first_name: updates.first_name || null,
      p_last_name: updates.last_name || null,
      p_phone: updates.phone || null,
      p_company_name: updates.company_name || null,
      p_vat_number: updates.vat_number || null,
      p_address: updates.address || null,
      p_city: updates.city || null,
      p_postal_code: updates.postal_code || null,
      p_country: updates.country || null
    });
    
    if (clientError) {
      console.error('❌ Errore RPC update_client:', clientError);
      return null;
    }
    
    const client = rpcData && rpcData.length > 0 ? rpcData[0] : null;
    
    if (!client) return null;
    
    // Trasforma i dati nel formato richiesto
    const formattedClient: Client = {
      ...client,
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      createdAt: client.created_at,
      status: 'active',
      creditProfiles: [],
      documents: []
    };
    
    console.log(`✅ Cliente aggiornato via RPC:`, formattedClient.email);
    return formattedClient;
    
  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento del cliente:', error);
    return null;
  }
}

/**
 * Cerca clienti per nome o email
 */
export async function searchClients(query: string, brokerId?: string): Promise<Client[]> {
  try {
    console.log('🔍 Ricerca clienti:', query);
    
    let clientIds: string[] = [];
    
    // Se specificato un broker, ottieni solo i suoi clienti
    if (brokerId) {
      const { data: brokerProfiles, error: brokerProfilesError } = await supabase
        .from('credit_profiles')
        .select('client_id')
        .eq('broker_id', brokerId)
        .is('deleted_at', null);
      
      if (brokerProfilesError) {
        console.error('❌ Errore recupero profili broker per ricerca:', brokerProfilesError);
        return [];
      }
      
      if (!brokerProfiles || brokerProfiles.length === 0) {
        return [];
      }
      
      clientIds = brokerProfiles.map(p => p.client_id);
    }
    
    // Esegui la ricerca
    let searchQuery = supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (brokerId && clientIds.length > 0) {
      searchQuery = searchQuery.in('id', clientIds);
    }
    
    const { data: clients, error: clientsError } = await searchQuery;
    
    if (clientsError) {
      console.error('❌ Errore ricerca clienti:', clientsError);
      return [];
    }
    
    if (!clients) return [];
    
    // Trasforma i dati nel formato richiesto
    const formattedClients: Client[] = clients.map(client => ({
      ...client,
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      createdAt: client.created_at,
      status: 'active', // Rimuoviamo is_active, tutti i clienti sono considerati attivi
      creditProfiles: [],
      documents: []
    }));
    
    console.log(`✅ Trovati ${formattedClients.length} clienti per query "${query}"`);
    return formattedClients;
    
  } catch (error) {
    console.error('❌ Errore nella ricerca clienti:', error);
    return [];
  }
}
