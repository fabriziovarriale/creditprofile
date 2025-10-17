/**
 * Servizio per gestire le notifiche
 */

import { supabase as defaultSupabase } from '@/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
  | 'document_uploaded'
  | 'document_approved'
  | 'document_rejected'
  | 'document_requires_changes'
  | 'credit_score_completed'
  | 'credit_score_requested'
  | 'profile_updated'
  | 'profile_completed'
  | 'message_received'
  | 'system_alert';

export interface Notification {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

class NotificationService {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabaseClient = supabaseClient || defaultSupabase;
  }

  /**
   * Imposta il client Supabase da usare
   */
  setSupabaseClient(client: SupabaseClient) {
    this.supabaseClient = client;
    console.log('✅ NotificationService: client Supabase aggiornato');
  }

  /**
   * Ottiene tutte le notifiche per un utente
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      console.log('🔍 NotificationService.getUserNotifications chiamato per:', userId);
      const { data, error } = await this.supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Errore recupero notifiche:', error);
        return [];
      }

      console.log('✅ NotificationService restituisce:', data?.length, 'notifiche');
      return data || [];
    } catch (error) {
      console.error('❌ Errore generale recupero notifiche:', error);
      return [];
    }
  }

  /**
   * Ottiene solo le notifiche non lette
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Errore recupero notifiche non lette:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Errore generale recupero notifiche non lette:', error);
      return [];
    }
  }

  /**
   * Conta le notifiche non lette
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabaseClient
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('❌ Errore conteggio notifiche non lette:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Errore generale conteggio notifiche:', error);
      return 0;
    }
  }

  /**
   * Crea una nuova notifica
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('notifications')
        .insert({
          user_id: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          link: params.link,
          metadata: params.metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Errore creazione notifica:', error);
        return null;
      }

      console.log('✅ Notifica creata:', data);
      return data;
    } catch (error) {
      console.error('❌ Errore generale creazione notifica:', error);
      return null;
    }
  }

  /**
   * Marca una notifica come letta
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Errore marcatura notifica come letta:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Errore generale marcatura notifica:', error);
      return false;
    }
  }

  /**
   * Marca tutte le notifiche come lette
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('❌ Errore marcatura tutte notifiche:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Errore generale marcatura tutte notifiche:', error);
      return false;
    }
  }

  /**
   * Elimina una notifica
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Errore eliminazione notifica:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Errore generale eliminazione notifica:', error);
      return false;
    }
  }

  /**
   * Elimina tutte le notifiche lette
   */
  async deleteAllRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('read', true);

      if (error) {
        console.error('❌ Errore eliminazione notifiche lette:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Errore generale eliminazione notifiche lette:', error);
      return false;
    }
  }

  /**
   * Subscribe a real-time updates per le notifiche di un utente
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
    onUpdate: (notification: Notification) => void,
    onDelete: (notificationId: number) => void
  ) {
    const channel = this.supabaseClient
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Nuova notifica ricevuta:', payload.new);
          onNotification(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Notifica aggiornata:', payload.new);
          onUpdate(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🗑️ Notifica eliminata:', payload.old);
          onDelete((payload.old as Notification).id);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Helper: Crea notifica per documento caricato
   */
  async notifyDocumentUploaded(brokerId: string, clientName: string, documentName: string, documentId: number) {
    return this.createNotification({
      userId: brokerId,
      type: 'document_uploaded',
      title: 'Nuovo documento caricato',
      message: `${clientName} ha caricato un nuovo documento: ${documentName}`,
      link: `/broker/documents/${documentId}`,
      metadata: { documentId, clientName },
    });
  }

  /**
   * Helper: Crea notifica per documento approvato
   */
  async notifyDocumentApproved(clientId: string, documentName: string, documentId: number) {
    return this.createNotification({
      userId: clientId,
      type: 'document_approved',
      title: 'Documento approvato',
      message: `Il tuo documento "${documentName}" è stato approvato`,
      link: `/client/documents/${documentId}`,
      metadata: { documentId },
    });
  }

  /**
   * Helper: Crea notifica per documento rifiutato
   */
  async notifyDocumentRejected(clientId: string, documentName: string, reason: string, documentId: number) {
    return this.createNotification({
      userId: clientId,
      type: 'document_rejected',
      title: 'Documento rifiutato',
      message: `Il documento "${documentName}" è stato rifiutato. Motivo: ${reason}`,
      link: `/client/documents/${documentId}`,
      metadata: { documentId, reason },
    });
  }

  /**
   * Helper: Crea notifica per credit score completato
   */
  async notifyCreditScoreCompleted(brokerId: string, clientName: string, score: number, profileId: number) {
    return this.createNotification({
      userId: brokerId,
      type: 'credit_score_completed',
      title: 'Credit Score Completato',
      message: `Credit score per ${clientName} completato: ${score}/1000`,
      link: `/broker/credit-profiles/${profileId}`,
      metadata: { profileId, clientName, score },
    });
  }
}

export const notificationService = new NotificationService();

