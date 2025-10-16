/**
 * Pagina delle notifiche per il broker
 */

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const BrokerNotifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const handleNotificationClick = async (id: number, link?: string) => {
    await markAsRead(id);
    if (link) navigate(link);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Adesso';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minuti fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ore fa`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} giorni fa`;
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_uploaded':
      case 'document_approved':
      case 'document_rejected':
      case 'document_requires_changes':
        return '📄';
      case 'credit_score_completed':
      case 'credit_score_requested':
        return '📊';
      case 'profile_updated':
      case 'profile_completed':
        return '👤';
      case 'message_received':
        return '💬';
      case 'system_alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'document_approved':
      case 'profile_completed':
      case 'credit_score_completed':
        return 'border-l-green-500';
      case 'document_rejected':
        return 'border-l-red-500';
      case 'document_requires_changes':
      case 'system_alert':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifiche</h1>
        <p className="text-gray-600 mt-2">Tutte le notifiche e gli aggiornamenti</p>
      </div>

      {/* Azioni */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Filtri */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Tutte ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Non lette ({notifications.filter((n) => !n.read).length})
              </Button>
            </div>
          </div>

          {/* Azioni bulk */}
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Segna tutte lette
              </Button>
            )}
            {notifications.some((n) => n.read) && (
              <Button variant="outline" size="sm" onClick={deleteAllRead}>
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina lette
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Lista notifiche */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Caricamento notifiche...</p>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'unread' ? 'Nessuna notifica non letta' : 'Nessuna notifica'}
          </h3>
          <p className="text-gray-600">
            {filter === 'unread'
              ? 'Sei aggiornato! Nessuna nuova notifica da leggere.'
              : 'Non hai ancora ricevuto notifiche.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-md border-l-4 ${getNotificationColor(
                notification.type
              )} ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
              onClick={() => handleNotificationClick(notification.id, notification.link)}
            >
              <div className="flex items-start gap-4">
                {/* Icona */}
                <div className="text-3xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                {/* Contenuto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatTimeAgo(notification.created_at)}</span>
                        {notification.read && (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Letto
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Azioni */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await markAsRead(notification.id);
                          }}
                          title="Segna come letto"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteNotification(notification.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Elimina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrokerNotifications;
