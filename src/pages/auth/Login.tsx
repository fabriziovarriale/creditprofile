import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { supabase, loading: authLoading, profile: user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      const role = user.role || 'client';
      console.log('Login.tsx: Utente già loggato e profilo caricato, reindirizzamento a', `/${role}/dashboard`);
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [user, authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
        setError("Servizio di autenticazione non disponibile.");
        toast.error("Servizio di autenticazione non disponibile.");
        setLoading(false);
        return;
    }

    try {
      console.log('Login.tsx: Tentativo di login con:', { email: formData.email });
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (signInError) throw signInError;

      // toast.success("Login effettuato con successo!"); // TEMPORANEAMENTE COMMENTATO
      console.log("Login.tsx: Login Supabase ha avuto successo (toast commentato)");
    } catch (err: any) {
      console.error('Login.tsx: Errore completo durante il login:', err);
      let errorMessage = 'Credenziali non valide o errore del server. Riprova.';
      if (err.message?.toLowerCase().includes('invalid login credentials')) {
        errorMessage = 'Email o password non corrette.';
      } else if (err.message?.toLowerCase().includes('email not confirmed')) {
        errorMessage = 'Devi confermare la tua email prima di accedere.';
      }
      setError(errorMessage);
      // toast.error(errorMessage); // TEMPORANEAMENTE COMMENTATO
      console.log("Login.tsx: Errore durante il login Supabase (toast commentato)", errorMessage);
      setLoading(false);
    }
  };

  if (authLoading && !user && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-8 sm:p-10 bg-card border shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-12 w-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground">Accedi</h1>
          <p className="text-muted-foreground mt-2 text-center">Bentornato! Inserisci le tue credenziali.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/50 rounded-md flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="pl-12 pr-4 py-3 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary text-base"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="pl-12 pr-4 py-3 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary text-base"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold disabled:opacity-70"
            disabled={loading || authLoading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Accesso in corso...
              </>
            ) : (
              <>
                Accedi
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Non hai un account?{' '}
            <Link to="/auth/register" className="font-medium text-primary hover:underline">
              Registrati ora
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login; 