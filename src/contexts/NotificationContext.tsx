/**
 * Context per gestire le notifiche real-time
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { notificationService, type Notification } from '@/services/notificationService';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { profile, supabase } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const isInitialMount = useRef(true);

  // Imposta il client Supabase nel service quando il provider viene montato
  React.useEffect(() => {
    if (supabase) {
      console.log('🔧 Configurando NotificationService con client Supabase del context');
      notificationService.setSupabaseClient(supabase);
    }
  }, [supabase]);

  // Carica notifiche iniziali
  const loadNotifications = useCallback(async () => {
    console.log('🔄 loadNotifications chiamato, profile?.id:', profile?.id);
    
    if (!profile?.id) {
      console.log('⚠️ Nessun profile.id, skip caricamento');
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📡 Fetching notifiche per user:', profile.id);
      
      const [allNotifications, count] = await Promise.all([
        notificationService.getUserNotifications(profile.id, 50),
        notificationService.getUnreadCount(profile.id),
      ]);

      console.log('✅ Notifiche ricevute:', allNotifications.length, 'Non lette:', count);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Errore caricamento notifiche:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  // Refresh manuale
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Marca come letta
  const markAsRead = useCallback(async (notificationId: number) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Marca tutte come lette
  const markAllAsRead = useCallback(async () => {
    if (!profile?.id) return;
    
    const success = await notificationService.markAllAsRead(profile.id);
    if (success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('Tutte le notifiche sono state marchiate come lette');
    }
  }, [profile?.id]);

  // Elimina notifica
  const deleteNotification = useCallback(async (notificationId: number) => {
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => {
        const deletedNotification = prev.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
      toast.success('Notifica eliminata');
    }
  }, []);

  // Elimina tutte le notifiche lette
  const deleteAllRead = useCallback(async () => {
    if (!profile?.id) return;
    
    const success = await notificationService.deleteAllRead(profile.id);
    if (success) {
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('Notifiche lette eliminate');
    }
  }, [profile?.id]);

  // Setup real-time subscription
  useEffect(() => {
    console.log('🔵 NotificationContext useEffect triggered, profile?.id:', profile?.id);
    
    if (!profile?.id) {
      console.log('⚠️ Nessun profile.id nel useEffect, cleanup');
      // Cleanup se non c'è utente
      if (channel) {
        channel.unsubscribe();
        setChannel(null);
      }
      isInitialMount.current = true; // Reset per il prossimo mount
      return;
    }

    // Reset flag per nuovo utente
    isInitialMount.current = true;

    // Carica notifiche iniziali
    console.log('📞 Chiamando loadNotifications dal useEffect');
    loadNotifications();

    // Dopo il primo caricamento, abilita i toast
    const timeoutId = setTimeout(() => {
      isInitialMount.current = false;
    }, 1000);

    // Subscribe a real-time updates
    const newChannel = notificationService.subscribeToNotifications(
      profile.id,
      // On INSERT (nuova notifica)
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Mostra toast solo dopo il mount iniziale
        if (!isInitialMount.current) {
          // Usa queueMicrotask invece di setTimeout per migliore performance
          queueMicrotask(() => {
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
            });
          });
        }
      },
      // On UPDATE (notifica aggiornata)
      (updatedNotification) => {
        setNotifications(prev =>
          prev.map(n => (n.id === updatedNotification.id ? updatedNotification : n))
        );
        
        // Se è stata marcata come letta, aggiorna il conteggio
        if (updatedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      },
      // On DELETE (notifica eliminata)
      (deletedId) => {
        setNotifications(prev => {
          const deletedNotification = prev.find(n => n.id === deletedId);
          if (deletedNotification && !deletedNotification.read) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(n => n.id !== deletedId);
        });
      }
    );

    setChannel(newChannel);

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (newChannel) {
        newChannel.unsubscribe();
      }
    };
  }, [profile?.id, loadNotifications]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

