import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Per ottenere dati utente
import { supabase } from '@/lib/supabaseClient'; // Importa supabase client
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from 'lucide-react'; // Icona utente

const SettingsPage = () => {
  const { user } = useAuth(); // Ottieni l'utente corrente dal contesto Auth

  // Stati COPIATI da ProfilePage.tsx per i dati del profilo
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [email, setEmail] = useState(user?.email || ''); // Email da auth (non modificabile)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // useEffect COPIATO da ProfilePage.tsx per fetch dati broker
  useEffect(() => {
    const fetchBrokerProfile = async () => {
      if (!user) {
        setProfileError("Utente non trovato per caricare le impostazioni.");
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setProfileError(null);

      const { data, error } = await supabase
        .from('brokers')
        .select('full_name, phone_number, agent_code') // Seleziona le colonne necessarie
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora errore "nessuna riga trovata"
        console.error("Errore fetch profilo broker in Impostazioni:", error);
        setProfileError("Impossibile caricare i dati per le impostazioni.");
        // Fallback sull'email se disponibile, o stringa vuota
        setFullName(user.user_metadata?.name || ''); // Se user_metadata esiste nel tuo tipo User
        setEmail(user.email || '');
      } else if (data) {
        setFullName(data.full_name || user.user_metadata?.name || ''); // Prendi da brokers, fallback su metadata
        setPhoneNumber(data.phone_number || '');
        setAgentCode(data.agent_code || '');
        setEmail(user.email || ''); // Email sempre da auth
      } else {
         // Nessun record trovato, usa fallback
         setFullName(user.user_metadata?.name || '');
         setEmail(user.email || '');
      }
      setLoadingProfile(false);
    };

    fetchBrokerProfile();
  }, [user]); // Riesegui se l'oggetto user cambia

  // handleProfileUpdate COPIATO da ProfilePage.tsx per aggiornare i dati broker
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingProfile(true);

    const { data, error } = await supabase
      .from('brokers')
      .update({
        full_name: fullName,
        phone_number: phoneNumber || null,
        agent_code: agentCode || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    setIsSubmittingProfile(false);

    if (error) {
      console.error("Errore aggiornamento profilo broker da Impostazioni:", error);
      toast.error("Errore durante il salvataggio delle impostazioni: " + error.message);
    } else {
      toast.success("Impostazioni profilo salvate con successo!");
      // Aggiorna i dati locali se necessario, anche se un refresh li caricherebbe
      if(data) {
          setFullName(data.full_name || '');
          setPhoneNumber(data.phone_number || '');
          setAgentCode(data.agent_code || '');
      }
    }
  };

  // Visualizzazione Loading / Errore
  if (loadingProfile) {
     return <div className="p-6 text-gray-300 flex-1 flex items-center justify-center">Caricamento impostazioni...</div>;
  }
  if (profileError) {
      return <div className="p-6 text-red-400 flex-1 flex items-center justify-center">{profileError}</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Pagina (Opzionale, puoi adattarlo) */}
      <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-gray-100 font-semibold text-lg">Impostazioni Profilo</h1>
      </div>

      {/* Contenuto Pagina */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-950 space-y-6">

        {/* Card Informazioni Profilo (COPIATA da ProfilePage.tsx) */}
        <Card className="bg-black border-gray-700 text-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informazioni Personali e Professionali
            </CardTitle>
            <CardDescription className="text-gray-400">
              Modifica i tuoi dati visualizzati nel profilo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-4">
              {/* Nome Completo */}
              <div className="grid gap-2">
                <Label htmlFor="settings-fullname" className="text-gray-400">Nome Completo</Label>
                <Input
                  id="settings-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
               {/* Telefono */}
               <div className="grid gap-2">
                 <Label htmlFor="settings-phone" className="text-gray-400">Telefono</Label>
                 <Input
                   id="settings-phone"
                   type="tel"
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                   className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
               {/* Codice Agente */}
               <div className="grid gap-2">
                 <Label htmlFor="settings-agentcode" className="text-gray-400">Codice Agente</Label>
                 <Input
                   id="settings-agentcode"
                   value={agentCode}
                   onChange={(e) => setAgentCode(e.target.value)}
                   className="bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
              {/* Email (Non modificabile qui) */}
              <div className="grid gap-2">
                <Label htmlFor="settings-email" className="text-gray-400">Email (Login)</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  disabled
                  readOnly // Aggiungi readOnly per chiarezza semantica
                  className="bg-gray-800 border-gray-600 text-gray-100 disabled:opacity-70 cursor-not-allowed"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700 px-6 py-4">
              <Button type="submit" disabled={isSubmittingProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmittingProfile ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Qui potresti aggiungere altre Card per impostazioni specifiche dell'applicazione */}
        {/* Esempio:
         <Card className="bg-black border-gray-700 text-gray-100">
           <CardHeader>
             <CardTitle>Impostazioni Notifiche</CardTitle>
           </CardHeader>
           <CardContent>
             <p>Controlli per le notifiche...</p>
           </CardContent>
         </Card>
        */}

      </div>
    </div>
  );
};

export default SettingsPage; 