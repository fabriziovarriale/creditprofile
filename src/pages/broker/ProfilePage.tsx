import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Per ottenere dati utente
import { supabase } from '@/lib/supabaseClient'; // Importa supabase client
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock } from 'lucide-react'; // Icone

const ProfilePage = () => {
  const { user } = useAuth(); // Ottieni l'utente corrente dal contesto Auth

  // Stati per i dati del profilo (broker + auth)
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // Aggiunto stato per telefono
  const [agentCode, setAgentCode] = useState(''); // Aggiunto stato per codice agente (esempio)
  const [email, setEmail] = useState(user?.email || ''); // Email da auth

  // Stati per i campi del form (inizializzati con i dati utente se disponibili)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Fetch dati specifici del broker all'avvio
  useEffect(() => {
    const fetchBrokerProfile = async () => {
      if (!user) {
         setProfileError("Utente non trovato.");
         setLoadingProfile(false);
         return;
      };

      setLoadingProfile(true);
      setProfileError(null);

      const { data, error } = await supabase
        .from('brokers')
        .select('full_name, phone_number, agent_code') // Seleziona le colonne che ti servono
        .eq('id', user.id)
        .single(); // Ci aspettiamo un solo risultato

      if (error && error.code !== 'PGRST116') { // PGRST116 = nessuna riga trovata (potrebbe essere ok se appena creato)
        console.error("Errore fetch profilo broker:", error);
        setProfileError("Impossibile caricare i dati del profilo.");
        setFullName(user.user_metadata?.name || ''); // Fallback sui metadati iniziali
        setEmail(user.email || '');
      } else if (data) {
        setFullName(data.full_name || user.user_metadata?.name || ''); // Prendi da brokers, fallback su metadata
        setPhoneNumber(data.phone_number || '');
        setAgentCode(data.agent_code || '');
        setEmail(user.email || '');
      } else {
         // Nessun record trovato, usa fallback
         setFullName(user.user_metadata?.name || '');
         setEmail(user.email || '');
      }
      setLoadingProfile(false);
    };

    fetchBrokerProfile();
  }, [user]); // Riesegui se l'oggetto user cambia

  // Gestore per aggiornare il profilo nella tabella BROKERS
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);

    const { data, error } = await supabase
      .from('brokers')
      .update({
        full_name: fullName,
        phone_number: phoneNumber || null, // Assicurati che i tipi corrispondano al DB
        agent_code: agentCode || null,
        // Aggiungi altri campi da aggiornare qui
      })
      .eq('id', user.id) // Aggiorna solo il record del broker corrente
      .select() // Opzionale: restituisce i dati aggiornati
      .single();

    setIsSubmittingProfile(false);

    if (error) {
      console.error("Errore aggiornamento profilo broker:", error);
      toast.error("Errore durante l'aggiornamento del profilo: " + error.message);
    } else {
      toast.success("Profilo aggiornato con successo!");
      if(data) {
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setAgentCode(data.agent_code || '');
      }
      // Potresti voler aggiornare anche user_metadata se lo usi altrove,
      // ma è meglio considerare 'brokers' come fonte primaria ora.
      // await supabase.auth.updateUser({ data: { name: fullName } }) // Aggiorna anche metadata se necessario
    }
  };

  // Gestore per aggiornare la password (tramite supabase.auth) - Logica INVARIATA
  const handlePasswordUpdate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (newPassword !== confirmPassword) {
       toast.error("Le nuove password non coincidono.");
       return;
     }
     if (!currentPassword || !newPassword) {
         toast.error("Compila tutti i campi password.");
         return;
     }
     setIsSubmittingPassword(true);

     // La verifica della password corrente di solito non è fatta qui,
     // ma direttamente nella chiamata updateUser se il backend lo supporta,
     // o tramite una funzione specifica se necessario re-autenticare.
     // L'API updateUser standard aggiorna direttamente se l'utente è già loggato.

     const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

     setIsSubmittingPassword(false);

     if (error) {
       console.error("Errore aggiornamento password:", error);
       // L'errore potrebbe indicare "Requires recent login" se è passato troppo tempo
       toast.error("Errore durante l'aggiornamento della password: " + error.message);
     } else {
       toast.success("Password aggiornata con successo!");
       setCurrentPassword('');
       setNewPassword('');
       setConfirmPassword('');
     }
   };

   // Visualizzazione Loading / Errore Dati Profilo
   if (loadingProfile) {
      return <div className="p-6 text-gray-300 flex-1 flex items-center justify-center">Caricamento profilo...</div>;
   }
   if (profileError) {
       // Potresti mostrare solo un errore o permettere comunque di cambiare la password
      return <div className="p-6 text-red-400 flex-1 flex items-center justify-center">{profileError}</div>;
   }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Pagina */}
      <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-gray-100 font-semibold text-lg">Il Mio Profilo</h1>
      </div>

      {/* Contenuto Pagina Principale */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
         <div className="max-w-3xl mx-auto space-y-6">

            {/* Card Informazioni Profilo (ora dentro il wrapper) */}
            <Card className="bg-black border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informazioni Personali
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Aggiorna i tuoi dati di contatto e professionali.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  {/* Nome Completo */}
                  <div className="grid gap-2">
                    <Label htmlFor="profile-fullname" className="text-gray-400">Nome Completo</Label>
                    <Input
                      id="profile-fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                   {/* Telefono */}
                   <div className="grid gap-2">
                     <Label htmlFor="profile-phone" className="text-gray-400">Telefono</Label>
                     <Input
                       id="profile-phone"
                       type="tel"
                       value={phoneNumber}
                       onChange={(e) => setPhoneNumber(e.target.value)}
                       className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   {/* Codice Agente (Esempio) */}
                   <div className="grid gap-2">
                     <Label htmlFor="profile-agentcode" className="text-gray-400">Codice Agente</Label>
                     <Input
                       id="profile-agentcode"
                       value={agentCode}
                       onChange={(e) => setAgentCode(e.target.value)}
                       className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                  {/* Email (Non modificabile) */}
                  <div className="grid gap-2">
                    <Label htmlFor="profile-email" className="text-gray-400">Email (Login)</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      disabled
                      readOnly
                      className="bg-gray-800 border-gray-600 text-gray-100 disabled:opacity-70 cursor-not-allowed"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 px-6 py-4">
                  <Button type="submit" disabled={isSubmittingProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmittingProfile ? 'Salvataggio...' : 'Salva Modifiche Profilo'}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Card Cambio Password (Logica invariata, usa supabase.auth) */}
            <Card className="bg-black border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Cambia Password
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Aggiorna la tua password di accesso.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password" className="text-gray-400">Password Attuale</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password" className="text-gray-400">Nuova Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password" className="text-gray-400">Conferma Nuova Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500 ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}`}
                      required
                    />
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-400">Le password non coincidono.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 px-6 py-4">
                  <Button type="submit" disabled={isSubmittingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmittingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default ProfilePage; 