/**
 * Pagina di debug per testare le notifiche
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationService } from '@/services/notificationService';

const TestNotifications = () => {
  const { profile, user, supabase } = useAuth();
  const { notifications, unreadCount, loading } = useNotifications();
  const [manualNotifications, setManualNotifications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFetch = async () => {
      if (!profile?.id) {
        console.log('❌ Profile ID non disponibile');
        return;
      }

      console.log('🔍 Testing notifications fetch...');
      console.log('Profile ID:', profile.id);
      console.log('User ID:', user?.id);
      console.log('Role:', profile.role);

      // Test diretto con supabase
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Errore query:', error);
          setError(error.message);
        } else {
          console.log('✅ Notifiche caricate:', data?.length);
          console.log('Notifiche:', data);
          setManualNotifications(data || []);
        }
      } catch (e: any) {
        console.error('❌ Eccezione:', e);
        setError(e.message);
      }

      // Test con service
      const serviceNotifs = await notificationService.getUserNotifications(profile.id);
      console.log('📦 Service notifications:', serviceNotifs.length);
    };

    testFetch();
  }, [profile?.id, supabase, user?.id]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Notifiche</h1>

      <div className="space-y-6">
        {/* Info Utente */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-2">👤 Info Utente</h2>
          <div className="text-sm space-y-1">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>User ID:</strong> {profile?.id}</p>
            <p><strong>Auth User ID:</strong> {user?.id}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
            <p><strong>Nome:</strong> {profile?.first_name} {profile?.last_name}</p>
          </div>
        </div>

        {/* Stato Context */}
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold mb-2">📊 NotificationContext</h2>
          <div className="text-sm space-y-1">
            <p><strong>Loading:</strong> {loading ? '⏳ Sì' : '✅ No'}</p>
            <p><strong>Notifiche nel context:</strong> {notifications.length}</p>
            <p><strong>Non lette:</strong> {unreadCount}</p>
          </div>
        </div>

        {/* Query Diretta */}
        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold mb-2">🔍 Query Diretta Supabase</h2>
          {error ? (
            <p className="text-red-600">❌ Errore: {error}</p>
          ) : (
            <>
              <p className="text-sm mb-2"><strong>Notifiche trovate:</strong> {manualNotifications.length}</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {manualNotifications.map((n) => (
                  <div key={n.id} className="bg-white p-3 rounded border text-sm">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString('it-IT')} | 
                      {n.read ? ' ✅ Letta' : ' 🔔 Non letta'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifiche dal Context */}
        <div className="bg-purple-50 p-4 rounded">
          <h2 className="font-semibold mb-2">📦 Notifiche dal Context</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-600">❌ Nessuna notifica nel context</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-white p-3 rounded border text-sm">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString('it-IT')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNotifications;

