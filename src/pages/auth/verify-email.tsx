import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pulisci la cache e lo storage all'inizio
  useEffect(() => {
    // Pulisci lo storage di Supabase
    localStorage.removeItem('creditprofile-auth');
    // Pulisci la cache del browser
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
  }, []);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Estrai il token dai parametri di query
        const accessToken = searchParams.get('access_token');
        const type = searchParams.get('type');

        console.log('Access Token:', accessToken);
        console.log('Type:', type);

        if (!accessToken) {
          console.error('Token non trovato nei parametri');
          setError('Token di verifica mancante');
          setVerifying(false);
          return;
        }

        // Verifica il token con Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: searchParams.get('refresh_token') || ''
        });

        if (sessionError || !session) {
          console.error('Errore di verifica:', sessionError);
          setError('Errore durante la verifica dell\'email');
          setVerifying(false);
          return;
        }

        const role = session.user.user_metadata?.role || 'client';
        
        // Rimuovi i parametri di query dall'URL
        window.history.replaceState(null, '', window.location.pathname);
        
        setTimeout(() => {
          navigate(`/${role}/dashboard`, { replace: true });
        }, 2000);

      } catch (err) {
        console.error('Errore completo:', err);
        setError('Errore durante la verifica dell\'email');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  // Aggiungi un listener per il pulsante "indietro" del browser
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifica Email</CardTitle>
          <CardDescription>
            {verifying ? 'Verifica in corso...' : error ? 'Errore di verifica' : 'Email verificata con successo!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifying ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => navigate('/login', { replace: true })} className="w-full">
                Torna al Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-500">La tua email è stata verificata con successo!</p>
              <p>Verrai reindirizzato alla dashboard...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 