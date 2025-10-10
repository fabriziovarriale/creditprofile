import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/integrations/supabase/types';
import { shouldUseRealData, logDataOperation, logDataError } from '@/config/dataConfig';

type User = Database['public']['Tables']['users']['Row'];
type CreditProfile = Database['public']['Tables']['credit_profiles']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

export interface PlatformStats {
  // Contatori principali
  totalClients: number;
  totalDocuments: number;
  totalProfiles: number;
  totalCreditScores: number;
  
  // Statistiche documenti
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  requiresChangesDocuments: number;
  missingDocuments: number;
  
  // Statistiche profili
  pendingProfiles: number;
  completedProfiles: number;
  draftProfiles: number;
  inReviewProfiles: number;
  
  // Statistiche credit score (da implementare quando avremo la tabella)
  highScores: number;
  mediumScores: number;
  lowScores: number;
  averageScore: number;
  
  // Statistiche clienti
  activeClients: number;
  inactiveClients: number;
  newClients: number;
}

export interface ClientWithDetails extends User {
  creditProfiles: CreditProfile[];
  documents: Document[];
  brokerName?: string;
}

export interface DocumentWithDetails extends Document {
  clientName: string;
  clientEmail: string;
  creditProfileStatus: string;
  brokerName?: string;
}

class SupabaseDataService {
  /**
   * Recupera le statistiche della piattaforma dal database reale
   * @param brokerId - ID del broker per filtrare i dati (opzionale)
   */
  async getPlatformStats(brokerId?: string): Promise<PlatformStats> {
    try {
      console.log('🔍 Recupero statistiche piattaforma da Supabase...', brokerId ? `(filtrato per broker: ${brokerId})` : '(tutti i broker)');
      
      // Query base per utenti client
      let clientsQuery = supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');
      
      // Se specificato un broker, filtra per i profili credito di quel broker
      if (brokerId) {
        // Prima ottieni i client_id dei profili credito del broker
        const { data: brokerProfiles, error: brokerProfilesError } = await supabase
          .from('credit_profiles')
          .select('client_id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (brokerProfilesError) {
          console.error('❌ Errore recupero profili broker:', brokerProfilesError);
        }
        
        if (brokerProfiles && brokerProfiles.length > 0) {
          const clientIds = brokerProfiles.map(p => p.client_id);
          clientsQuery = clientsQuery.in('id', clientIds);
        } else {
          // Se il broker non ha profili, restituisci 0 per tutto
          console.log('⚠️ Broker non ha profili credito, restituendo statistiche vuote');
          return this.getEmptyStats();
        }
      }
      
      const { count: totalClients, error: clientsError } = await clientsQuery;
      
      if (clientsError) {
        console.error('❌ Errore conteggio clienti:', clientsError);
      }

      // Query per profili credito
      let profilesQuery = supabase
        .from('credit_profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      
      if (brokerId) {
        profilesQuery = profilesQuery.eq('broker_id', brokerId);
      }
      
      const { count: totalProfiles, error: profilesError } = await profilesQuery;
      
      if (profilesError) {
        console.error('❌ Errore conteggio profili:', profilesError);
      }

      // Query per documenti (tramite credit_profiles)
      let documentsQuery = supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      
      if (brokerId) {
        // Filtra documenti per profili credito del broker
        const { data: brokerProfileIds, error: profileIdsError } = await supabase
          .from('credit_profiles')
          .select('id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (profileIdsError) {
          console.error('❌ Errore recupero ID profili broker:', profileIdsError);
        }
        
        if (brokerProfileIds && brokerProfileIds.length > 0) {
          const profileIds = brokerProfileIds.map(p => p.id);
          documentsQuery = documentsQuery.in('credit_profile_id', profileIds);
        } else {
          // Se il broker non ha profili, non ha documenti
          console.log('⚠️ Broker non ha profili, quindi 0 documenti');
        }
      }
      
      const { count: totalDocuments, error: documentsError } = await documentsQuery;
      
      if (documentsError) {
        console.error('❌ Errore conteggio documenti:', documentsError);
      }

      // Statistiche profili per status
      let profilesByStatusQuery = supabase
        .from('credit_profiles')
        .select('status')
        .is('deleted_at', null);
      
      if (brokerId) {
        profilesByStatusQuery = profilesByStatusQuery.eq('broker_id', brokerId);
      }
      
      const { data: profilesByStatus, error: profilesStatusError } = await profilesByStatusQuery;
      
      if (profilesStatusError) {
        console.error('❌ Errore statistiche profili:', profilesStatusError);
      }

      // Statistiche documenti per status
      let documentsByStatusQuery = supabase
        .from('documents')
        .select('status');
      
      if (brokerId) {
        // Filtra per profili del broker
        const { data: brokerProfileIds, error: profileIdsError } = await supabase
          .from('credit_profiles')
          .select('id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (profileIdsError) {
          console.error('❌ Errore recupero ID profili per statistiche documenti:', profileIdsError);
        }
        
        if (brokerProfileIds && brokerProfileIds.length > 0) {
          const profileIds = brokerProfileIds.map(p => p.id);
          documentsByStatusQuery = documentsByStatusQuery.in('credit_profile_id', profileIds);
        }
      }
      
      const { data: documentsByStatus, error: documentsStatusError } = await documentsByStatusQuery;
      
      if (documentsStatusError) {
        console.error('❌ Errore statistiche documenti:', documentsStatusError);
      }

      // Calcola statistiche profili
      const pendingProfiles = profilesByStatus?.filter(p => p.status === 'pending').length || 0;
      const completedProfiles = profilesByStatus?.filter(p => p.status === 'completed').length || 0;
      const draftProfiles = profilesByStatus?.filter(p => p.status === 'draft').length || 0;
      const inReviewProfiles = profilesByStatus?.filter(p => p.status === 'in_review').length || 0;

      // Calcola statistiche documenti
      const approvedDocuments = documentsByStatus?.filter(d => d.status === 'approved').length || 0;
      const pendingDocuments = documentsByStatus?.filter(d => d.status === 'pending').length || 0;
      const rejectedDocuments = documentsByStatus?.filter(d => d.status === 'rejected').length || 0;
      const requiresChangesDocuments = documentsByStatus?.filter(d => d.status === 'requires_changes').length || 0;
      const missingDocuments = documentsByStatus?.filter(d => d.status === 'missing').length || 0;

      // Calcola clienti nuovi (ultimi 30 giorni)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let newClientsQuery = supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (brokerId) {
        // Filtra per clienti del broker
        const { data: brokerProfiles, error: brokerProfilesError } = await supabase
          .from('credit_profiles')
          .select('client_id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (brokerProfilesError) {
          console.error('❌ Errore recupero profili broker per clienti nuovi:', brokerProfilesError);
        }
        
        if (brokerProfiles && brokerProfiles.length > 0) {
          const clientIds = brokerProfiles.map(p => p.client_id);
          newClientsQuery = newClientsQuery.in('id', clientIds);
        }
      }
      
      const { count: newClients, error: newClientsError } = await newClientsQuery;
      
      if (newClientsError) {
        console.error('❌ Errore conteggio clienti nuovi:', newClientsError);
      }

      // Per ora, credit score sono mock (da implementare quando avremo la tabella)
      const totalCreditScores = 0;
      const highScores = 0;
      const mediumScores = 0;
      const lowScores = 0;
      const averageScore = 0;

      // Per ora, tutti i clienti sono considerati attivi
      const activeClients = totalClients || 0;
      const inactiveClients = 0;

      const result: PlatformStats = {
        totalClients: totalClients || 0,
        totalDocuments: totalDocuments || 0,
        totalProfiles: totalProfiles || 0,
        totalCreditScores,
        
        approvedDocuments,
        pendingDocuments,
        rejectedDocuments,
        requiresChangesDocuments,
        missingDocuments,
        
        pendingProfiles,
        completedProfiles,
        draftProfiles,
        inReviewProfiles,
        
        highScores,
        mediumScores,
        lowScores,
        averageScore,
        
        activeClients,
        inactiveClients,
        newClients: newClients || 0
      };

      console.log('📊 Statistiche piattaforma recuperate da Supabase:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Errore nel recupero statistiche piattaforma:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Restituisce statistiche vuote
   */
  private getEmptyStats(): PlatformStats {
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

  /**
   * Recupera tutti i clienti con i loro dettagli
   * @param brokerId - ID del broker per filtrare i dati (opzionale)
   */
  async getClientsWithDetails(brokerId?: string): Promise<ClientWithDetails[]> {
    try {
      console.log('🔍 Recupero clienti con dettagli da Supabase...', brokerId ? `(filtrato per broker: ${brokerId})` : '(tutti i broker)');
      
      // Se specificato un broker, ottieni solo i clienti di quel broker
      let clientIds: string[] = [];
      if (brokerId) {
        const { data: brokerProfiles, error: brokerProfilesError } = await supabase
          .from('credit_profiles')
          .select('client_id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (brokerProfilesError) {
          console.error('❌ Errore recupero profili broker:', brokerProfilesError);
          return [];
        }
        
        if (!brokerProfiles || brokerProfiles.length === 0) {
          console.log('⚠️ Broker non ha clienti');
          return [];
        }
        
        clientIds = brokerProfiles.map(p => p.client_id);
      }
      
      // Recupera gli utenti client
      let clientsQuery = supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      
      if (brokerId && clientIds.length > 0) {
        clientsQuery = clientsQuery.in('id', clientIds);
      }
      
      const { data: clients, error: clientsError } = await clientsQuery;
      
      if (clientsError) {
        console.error('❌ Errore recupero clienti:', clientsError);
        return [];
      }

      if (!clients) return [];

      // Per ogni cliente, recupera i profili credito e documenti
      const clientsWithDetails: ClientWithDetails[] = [];
      
      for (const client of clients) {
        // Recupera profili credito del cliente
        let profilesQuery = supabase
          .from('credit_profiles')
          .select('*')
          .eq('client_id', client.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
        
        if (brokerId) {
          profilesQuery = profilesQuery.eq('broker_id', brokerId);
        }
        
        const { data: creditProfiles, error: profilesError } = await profilesQuery;
        
        if (profilesError) {
          console.error(`❌ Errore recupero profili per cliente ${client.id}:`, profilesError);
        }

        // Recupera documenti del cliente (tramite credit_profiles)
        const profileIds = creditProfiles?.map(p => p.id) || [];
        let documents: Document[] = [];
        
        if (profileIds.length > 0) {
          const { data: clientDocuments, error: documentsError } = await supabase
            .from('documents')
            .select('*')
            .in('credit_profile_id', profileIds)
            .order('uploaded_at', { ascending: false });
          
          if (documentsError) {
            console.error(`❌ Errore recupero documenti per cliente ${client.id}:`, documentsError);
          } else {
            documents = clientDocuments || [];
          }
        }

        // Recupera nome del broker se presente
        let brokerName: string | undefined;
        if (creditProfiles && creditProfiles.length > 0 && creditProfiles[0].broker_id) {
          const { data: broker, error: brokerError } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', creditProfiles[0].broker_id)
            .single();
          
          if (!brokerError && broker) {
            brokerName = `${broker.first_name || ''} ${broker.last_name || ''}`.trim();
          }
        }

        clientsWithDetails.push({
          ...client,
          creditProfiles: creditProfiles || [],
          documents,
          brokerName
        });
      }

      console.log(`📊 Recuperati ${clientsWithDetails.length} clienti con dettagli`);
      return clientsWithDetails;
      
    } catch (error) {
      console.error('❌ Errore nel recupero clienti con dettagli:', error);
      return [];
    }
  }

  /**
   * Recupera tutti i documenti con dettagli del cliente
   * @param brokerId - ID del broker per filtrare i dati (opzionale)
   */
  async getDocumentsWithDetails(brokerId?: string): Promise<DocumentWithDetails[]> {
    try {
      console.log('🔍 Recupero documenti con dettagli da Supabase...', brokerId ? `(filtrato per broker: ${brokerId})` : '(tutti i broker)');
      
      // Se specificato un broker, filtra per i profili credito di quel broker
      let profileIds: string[] = [];
      if (brokerId) {
        const { data: brokerProfiles, error: brokerProfilesError } = await supabase
          .from('credit_profiles')
          .select('id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (brokerProfilesError) {
          console.error('❌ Errore recupero profili broker per documenti:', brokerProfilesError);
          return [];
        }
        
        if (!brokerProfiles || brokerProfiles.length === 0) {
          console.log('⚠️ Broker non ha profili, quindi 0 documenti');
          return [];
        }
        
        profileIds = brokerProfiles.map(p => p.id);
      }
      
      // Recupera documenti con join ai profili credito e utenti
      let documentsQuery = supabase
        .from('documents')
        .select(`
          *,
          credit_profiles!inner(
            client_id,
            status,
            users!fk_client(
              first_name,
              last_name,
              email
            )
          )
        `)
        .order('uploaded_at', { ascending: false });
      
      if (brokerId && profileIds.length > 0) {
        documentsQuery = documentsQuery.in('credit_profile_id', profileIds);
      }
      
      const { data: documents, error: documentsError } = await documentsQuery;
      
      if (documentsError) {
        console.error('❌ Errore recupero documenti:', documentsError);
        return [];
      }

      if (!documents) return [];

      // Trasforma i dati nel formato richiesto
      const documentsWithDetails: DocumentWithDetails[] = documents.map(doc => {
        const client = doc.credit_profiles.users;
        const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
        
        return {
          ...doc,
          clientName,
          clientEmail: client.email,
          creditProfileStatus: doc.credit_profiles.status,
          brokerName: undefined // Da implementare se necessario
        };
      });

      console.log(`📄 Recuperati ${documentsWithDetails.length} documenti con dettagli`);
      return documentsWithDetails;
      
    } catch (error) {
      console.error('❌ Errore nel recupero documenti con dettagli:', error);
      return [];
    }
  }

  /**
   * Recupera i documenti recenti (ultimi 5)
   * @param limit - Numero di documenti da recuperare
   * @param brokerId - ID del broker per filtrare i dati (opzionale)
   */
  async getRecentDocuments(limit: number = 5, brokerId?: string): Promise<DocumentWithDetails[]> {
    try {
      console.log('🔍 Recupero documenti recenti da Supabase...', brokerId ? `(filtrato per broker: ${brokerId})` : '(tutti i broker)');
      
      // Se specificato un broker, filtra per i profili credito di quel broker
      let profileIds: string[] = [];
      if (brokerId) {
        const { data: brokerProfiles, error: brokerProfilesError } = await supabase
          .from('credit_profiles')
          .select('id')
          .eq('broker_id', brokerId)
          .is('deleted_at', null);
        
        if (brokerProfilesError) {
          console.error('❌ Errore recupero profili broker per documenti recenti:', brokerProfilesError);
          return [];
        }
        
        if (!brokerProfiles || brokerProfiles.length === 0) {
          console.log('⚠️ Broker non ha profili, quindi 0 documenti recenti');
          return [];
        }
        
        profileIds = brokerProfiles.map(p => p.id);
      }
      
      let documentsQuery = supabase
        .from('documents')
        .select(`
          *,
          credit_profiles!inner(
            client_id,
            status,
            users!fk_client(
              first_name,
              last_name,
              email
            )
          )
        `)
        .order('uploaded_at', { ascending: false })
        .limit(limit);
      
      if (brokerId && profileIds.length > 0) {
        documentsQuery = documentsQuery.in('credit_profile_id', profileIds);
      }
      
      const { data: documents, error: documentsError } = await documentsQuery;
      
      if (documentsError) {
        console.error('❌ Errore recupero documenti recenti:', documentsError);
        return [];
      }

      if (!documents) return [];

      return documents.map(doc => {
        const client = doc.credit_profiles.users;
        const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
        
        return {
          ...doc,
          clientName,
          clientEmail: client.email,
          creditProfileStatus: doc.credit_profiles.status,
          brokerName: undefined
        };
      });
      
    } catch (error) {
      console.error('❌ Errore nel recupero documenti recenti:', error);
      return [];
    }
  }

  /**
   * Recupera un cliente specifico con tutti i dettagli
   * @param clientId - ID del cliente
   * @param brokerId - ID del broker per verificare l'accesso (opzionale)
   */
  async getClientById(clientId: string, brokerId?: string): Promise<ClientWithDetails | null> {
    try {
      // Se specificato un broker, verifica che il cliente appartenga a quel broker
      if (brokerId) {
        const { data: brokerProfile, error: brokerProfileError } = await supabase
          .from('credit_profiles')
          .select('id')
          .eq('client_id', clientId)
          .eq('broker_id', brokerId)
          .is('deleted_at', null)
          .single();
        
        if (brokerProfileError || !brokerProfile) {
          console.error('❌ Cliente non trovato o non accessibile per questo broker');
          return null;
        }
      }
      
      // Recupera il cliente
      const { data: client, error: clientError } = await supabase
        .from('users')
        .select('*')
        .eq('id', clientId)
        .eq('role', 'client')
        .single();
      
      if (clientError || !client) {
        console.error('❌ Errore recupero cliente:', clientError);
        return null;
      }

      // Recupera profili credito del cliente
      let profilesQuery = supabase
        .from('credit_profiles')
        .select('*')
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (brokerId) {
        profilesQuery = profilesQuery.eq('broker_id', brokerId);
      }
      
      const { data: creditProfiles, error: profilesError } = await profilesQuery;
      
      if (profilesError) {
        console.error('❌ Errore recupero profili cliente:', profilesError);
      }

      // Recupera documenti del cliente
      const profileIds = creditProfiles?.map(p => p.id) || [];
      let documents: Document[] = [];
      
      if (profileIds.length > 0) {
        const { data: clientDocuments, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .in('credit_profile_id', profileIds)
          .order('uploaded_at', { ascending: false });
        
        if (documentsError) {
          console.error('❌ Errore recupero documenti cliente:', documentsError);
        } else {
          documents = clientDocuments || [];
        }
      }

      // Recupera nome del broker
      let brokerName: string | undefined;
      if (creditProfiles && creditProfiles.length > 0 && creditProfiles[0].broker_id) {
        const { data: broker, error: brokerError } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', creditProfiles[0].broker_id)
          .single();
        
        if (!brokerError && broker) {
          brokerName = `${broker.first_name || ''} ${broker.last_name || ''}`.trim();
        }
      }

      return {
        ...client,
        creditProfiles: creditProfiles || [],
        documents,
        brokerName
      };
      
    } catch (error) {
      console.error('❌ Errore nel recupero cliente specifico:', error);
      return null;
    }
  }
}

export const supabaseDataService = new SupabaseDataService();
