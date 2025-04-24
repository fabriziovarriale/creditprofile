import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Campo per il nome completo

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // Passiamo il nome come user_metadata. Il trigger lo userà.
        data: {
          name: fullName
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error("Errore registrazione: " + error.message);
    } else {
      // Controlla se la conferma email è richiesta nelle impostazioni Supabase
      if (data.user && data.user.identities && data.user.identities.length === 0) {
         // Questo caso a volte indica che la conferma è necessaria ma l'utente esiste già
         // Potrebbe essere meglio mostrare un messaggio generico o controllare specifici codici errore
          toast.info("Se l'utente esiste già, prova a fare il login. Altrimenti, controlla la tua email per la conferma.");
      } else if (data.session) {
         // Se Supabase restituisce una sessione, l'utente è loggato (auto-conferma o conferma disabilitata)
         toast.success("Registrazione e login avvenuti con successo!");
         navigate('/broker'); // Reindirizza alla dashboard
      }
       else {
        // Caso più comune con conferma email abilitata
         toast.success("Registrazione inviata! Controlla la tua email per confermare l'account.");
         navigate('/login'); // Reindirizza al login dopo la registrazione
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-black border-gray-700 text-gray-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Crea un Account Broker</CardTitle>
          <CardDescription className="text-gray-400">
            Inserisci i tuoi dati per iniziare
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nome Completo</Label>
              <Input
                id="full-name"
                type="text"
                placeholder="Mario Rossi"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@esempio.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Conferma Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500 ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}`}
              />
              {password && confirmPassword && password !== confirmPassword && (
                 <p className="text-xs text-red-400">Le password non coincidono.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={loading}>
              {loading ? 'Registrazione...' : 'Registrati'}
            </Button>
             <p className="text-xs text-center text-gray-400">
               Hai già un account?{' '}
               <Link to="/login" className="underline hover:text-blue-400">
                 Accedi qui
               </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage; 