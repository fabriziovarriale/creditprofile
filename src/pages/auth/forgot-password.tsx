import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Mail, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/components/providers/SupabaseProvider';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { supabase } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast.success('Email di reset inviata con successo!');
    } catch (err: any) {
      console.error('Errore durante il reset della password:', err);
      setError('Errore durante l\'invio dell\'email di reset. Riprova.');
      toast.error('Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-block">
              <Logo className="h-12 w-auto mx-auto" />
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Email inviata
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Controlla la tua casella email per le istruzioni
            </p>
          </div>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-500" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Controlla la tua email
                </h3>
                <p className="text-sm text-zinc-400">
                  Abbiamo inviato un link per reimpostare la tua password.
                  Clicca sul link nell'email per procedere.
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">
                    Non hai ricevuto l'email?
                  </h4>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li>• Controlla la cartella spam</li>
                    <li>• Verifica di aver inserito l'indirizzo email corretto</li>
                    <li>• Attendi qualche minuto e riprova</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setSuccess(false)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Riprova
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-zinc-400">
                  <Link to="/login" className="text-primary hover:text-primary/80">
                    Torna al login
                  </Link>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <Logo className="h-12 w-auto mx-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Recupera password
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Inserisci la tua email per ricevere le istruzioni
          </p>
        </div>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700"
                placeholder="nome@esempio.com"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  Invia istruzioni
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna al login
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword; 