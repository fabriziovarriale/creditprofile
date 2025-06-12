import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider'; // Modificato import
// import { supabase } from '@/lib/supabaseClient'; // Rimosso
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock, Loader2 } from 'lucide-react'; // Aggiunto Loader2
import { User as UserProfileType } from '@/types'; // Importa il tipo User

const ProfilePage = () => {
  const { 
    profile: currentUserProfile, 
    supabase,
    loading: authLoading,
    isAuthenticated 
  } = useAuth();

  // Stati per i dati del profilo
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState(''); // Esempio, se presente nel tipo UserProfileType
  const [email, setEmail] = useState('');

  const [loadingData, setLoadingData] = useState(true); // Loading per i dati del profilo specifico
  const [profileError, setProfileError] = useState<string | null>(null);

  // Stati per il form di cambio password
  const [currentPassword, setCurrentPassword] = useState(''); // Non usato da supabase.auth.updateUser se già loggato
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setLoadingData(true); // Mantieni il loading dei dati se l'auth sta caricando
      return;
    }
    if (!isAuthenticated || !currentUserProfile || !supabase) {
      setProfileError("Utente non autenticato o dati non disponibili.");
      setLoadingData(false);
      return;
    }

    // Popola gli stati con i dati dal profilo utente del contesto
    setFirstName(currentUserProfile.first_name || '');
    setLastName(currentUserProfile.last_name || '');
    setPhoneNumber(currentUserProfile.phone || '');
    setCompanyName(currentUserProfile.company_name || '');
    setEmail(currentUserProfile.email || '');
    setLoadingData(false); // Dati caricati dal contesto
    setProfileError(null);

  }, [currentUserProfile, authLoading, isAuthenticated, supabase]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserProfile || !supabase) return;
    setIsSubmittingProfile(true);

    const updates: Partial<UserProfileType> = {
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber || null,
      company_name: companyName || null,
      // Non aggiornare email o ruolo qui, dovrebbero essere gestiti separatamente se necessario
    };

    const { data, error } = await supabase
      .from('users') // Aggiorna la tabella 'users'
      .update(updates)
      .eq('id', currentUserProfile.id)
      .select()
      .single();

    setIsSubmittingProfile(false);

    if (error) {
      console.error("Errore aggiornamento profilo:", error);
      toast.error("Errore durante l'aggiornamento del profilo: " + error.message);
    } else {
      toast.success("Profilo aggiornato con successo!");
      // SupabaseProvider dovrebbe ri-fetchare il profilo, ma potremmo aggiornare lo stato locale per reattività immediata
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhoneNumber(data.phone || '');
        setCompanyName(data.company_name || '');
      }
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!supabase) return;
     if (newPassword !== confirmPassword) {
       toast.error("Le nuove password non coincidono.");
       return;
     }
     if (!newPassword) { // Current password non è richiesta da supabase.auth.updateUser
         toast.error("Inserisci la nuova password.");
         return;
     }
     setIsSubmittingPassword(true);

     const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

     setIsSubmittingPassword(false);

     if (error) {
       console.error("Errore aggiornamento password:", error);
       toast.error("Errore durante l'aggiornamento della password: " + error.message);
     } else {
       toast.success("Password aggiornata con successo!");
       setNewPassword('');
       setConfirmPassword('');
     }
   };

   if (authLoading || loadingData) {
      return (
        <div className="p-6 text-gray-300 flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />Caricamento profilo...
        </div>
      );
   }
   
   if (profileError || !isAuthenticated || !currentUserProfile) {
      return (
        <div className="p-6 text-red-400 flex-1 flex items-center justify-center">
            {profileError || "Impossibile caricare il profilo utente."}
        </div>
      );
   }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-gray-100 font-semibold text-lg">Il Mio Profilo</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
         <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-black border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informazioni Personali
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Aggiorna i tuoi dati di contatto.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="profile-firstname" className="text-gray-400">Nome</Label>
                      <Input
                        id="profile-firstname"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="profile-lastname" className="text-gray-400">Cognome</Label>
                      <Input
                        id="profile-lastname"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="profile-email" className="text-gray-400">Email</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={email} // L'email viene da Supabase Auth, solitamente non modificabile qui direttamente
                      disabled // Rendi l'email non modificabile dall'utente in questo form
                      readOnly
                      className="bg-gray-800/50 border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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
                   <div className="grid gap-2">
                     <Label htmlFor="profile-companyname" className="text-gray-400">Nome Azienda (Opzionale)</Label>
                     <Input
                       id="profile-companyname"
                       value={companyName}
                       onChange={(e) => setCompanyName(e.target.value)}
                       className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 px-6 py-4">
                  <Button type="submit" disabled={isSubmittingProfile} className="ml-auto">
                    {isSubmittingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio...</> : 'Salva Modifiche'}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="bg-black border-gray-700 text-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5"/>
                    Cambia Password
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Aggiorna la tua password di accesso. Assicurati che sia sicura.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  {/* <div className="grid gap-2">
                    <Label htmlFor="current-password">Password Attuale</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  </div> */}
                  <div className="grid gap-2">
                    <Label htmlFor="new-password" className="text-gray-400">Nuova Password</Label>
                    <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password" className="text-gray-400">Conferma Nuova Password</Label>
                    <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-700 px-6 py-4">
                  <Button type="submit" disabled={isSubmittingPassword} className="ml-auto">
                    {isSubmittingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Aggiornamento...</> : 'Aggiorna Password'}
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