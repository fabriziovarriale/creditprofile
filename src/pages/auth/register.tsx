import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User,
  Mail,
  Lock,
  AlertCircle,
  UserCog
} from "lucide-react";
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from '@/components/ui/Logo';
import { toast } from 'sonner';

const Register = () => {
  const { supabase, isAuthenticated, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'broker'
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      console.log('Register.tsx: Utente autenticato e profilo caricato, reindirizzamento a', `/${profile.role}/dashboard`);
      navigate(`/${profile.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, profile, authLoading, navigate]);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Il nome è obbligatorio');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Il cognome è obbligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setError('L\'email è obbligatoria');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Inserisci un\'email valida');
      return false;
    }
    if (!formData.password) {
      setError('La password è obbligatoria');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }
    if (!supabase) {
        setError("Servizio di autenticazione non disponibile. Riprova più tardi.");
        toast.error("Servizio di autenticazione non disponibile.");
        return;
    }

    try {
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }
      
      toast.success('Registrazione completata con successo!');

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'broker'
      });

    } catch (err: any) {
      console.error('Errore durante la registrazione:', err);
      let errorMessage = 'Si è verificato un errore durante la registrazione. Riprova più tardi.';
      if (err.message?.includes('User already registered')) {
        errorMessage = 'Questa email è già registrata. Prova ad accedere o usa un\'altra email.';
      } else if (err.message?.includes('valid email')) {
        errorMessage = "L'email inserita non è valida";
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'La password deve essere di almeno 6 caratteri.';
      } else if (err.message?.includes('weak password')) {
        errorMessage = 'La password è troppo debole. Prova una combinazione più complessa.';
      } 
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <Logo className="h-12 w-auto mx-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Crea il tuo account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Registrati per iniziare a gestire le tue pratiche
          </p>
        </div>

        <Card className="p-6 bg-card border shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center text-foreground">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    Nome *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    placeholder="Mario"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    aria-required="true"
                    aria-invalid={error?.includes('nome')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center text-foreground">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    Cognome *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    placeholder="Rossi"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    aria-required="true"
                    aria-invalid={error?.includes('cognome')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="nome@esempio.com"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  aria-required="true"
                  aria-invalid={error?.includes('email')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center text-foreground">
                  <UserCog className="w-4 h-4 mr-2 text-muted-foreground" />
                  Tipo di account *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="w-full bg-input border-border text-foreground">
                    <SelectValue placeholder="Seleziona il tipo di account" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center text-foreground">
                  <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  aria-required="true"
                  aria-invalid={error?.includes('password')}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center text-foreground">
                  <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                  Conferma Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  aria-required="true"
                  aria-invalid={error?.includes('password non coincidono')}
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center text-sm text-destructive pt-2">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Creazione account...' : 'Registrati'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Hai già un account?{' '}
              <Link to="/auth/login" className="font-medium text-primary hover:underline">
                Accedi qui
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register; 