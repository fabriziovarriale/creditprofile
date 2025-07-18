import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Lock, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/components/providers/SupabaseProvider';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast.success('Password aggiornata con successo!');
      
      // Redirect dopo 3 secondi
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err: any) {
      console.error('Errore durante il reset della password:', err);
      setError('Errore durante il reset della password. Riprova.');
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
              Password aggiornata
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              La tua password è stata reimpostata con successo
            </p>
          </div>

          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Reindirizzamento in corso
                </h3>
                <p className="text-sm text-zinc-400">
                  Verrai reindirizzato alla pagina di login tra pochi secondi...
                </p>
              </div>

              <Button
                onClick={() => navigate('/auth/login')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Vai al login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
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
            Reimposta password
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Inserisci la tua nuova password
          </p>
        </div>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Nuova password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Conferma password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">
                Requisiti password
              </h4>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• Almeno 8 caratteri</li>
                <li>• Almeno una lettera maiuscola</li>
                <li>• Almeno un numero</li>
                <li>• Almeno un carattere speciale</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aggiornamento in corso...
                </>
              ) : (
                <>
                  Reimposta password
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 