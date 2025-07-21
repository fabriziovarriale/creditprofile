import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Bell,
  Lock,
  Save,
  AlertCircle,
  Loader2,
  Settings
} from "lucide-react";
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const SettingsPage = () => {
  const { profile, supabase, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    position: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || '',
      });
    }
  }, [profile]);

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    new_leads: true,
    document_updates: true,
    report_generation: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    session_timeout: 30,
  });

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !supabase) {
      setError("Impossibile aggiornare il profilo: utente non autenticato o servizio non disponibile.");
      toast.error("Impossibile aggiornare il profilo.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const updatedFields: Partial<typeof profileData> = {};
    if (profileData.first_name !== (profile.first_name || '')) updatedFields.first_name = profileData.first_name;
    if (profileData.last_name !== (profile.last_name || '')) updatedFields.last_name = profileData.last_name;
    if (profileData.phone !== (profile.phone || '')) updatedFields.phone = profileData.phone;
    if (profileData.company !== (profile.company || '')) updatedFields.company = profileData.company;
    if (profileData.position !== (profile.position || '')) updatedFields.position = profileData.position;

    if (Object.keys(updatedFields).length === 0) {
      toast.info("Nessuna modifica da salvare.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update(updatedFields)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast.success("Profilo aggiornato con successo");
    } catch (err: any) {
      console.error("Errore nell'aggiornamento del profilo:", err);
      setError(err.message || "Impossibile aggiornare il profilo. Riprova.");
      toast.error(err.message || "Errore nell'aggiornamento del profilo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.info("Impostazioni di notifica aggiornate (mock).");
  };

  const handleSecurityChange = (key: string, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.info("Impostazioni di sicurezza aggiornate (mock).");
  };
  
  if (authLoading && !profile) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!profile) {
    return (
        <div className="p-6 space-y-6 text-center">
            <p>Profilo non disponibile. Effettua il login.</p>
            <Button onClick={() => navigate('/login')}>Vai al Login</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Impostazioni</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-border grid w-full grid-cols-1 sm:grid-cols-3 sm:max-w-md">
          <TabsTrigger value="profile" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            <User className="w-4 h-4 mr-2" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            <Bell className="w-4 h-4 mr-2" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            <Lock className="w-4 h-4 mr-2" />
            Sicurezza
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Informazioni Personali</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className="text-sm font-medium text-foreground/90">Nome</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileInputChange}
                    className="bg-background border-input placeholder:text-muted-foreground focus:border-primary"
                    placeholder="Mario"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className="text-sm font-medium text-foreground/90">Cognome</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileInputChange}
                    className="bg-background border-input placeholder:text-muted-foreground focus:border-primary"
                    placeholder="Rossi"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground/90">Telefono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileInputChange}
                    className="bg-background border-input placeholder:text-muted-foreground focus:border-primary"
                    placeholder="+39 123 4567890"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-sm font-medium text-foreground/90">Azienda (Opzionale)</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={handleProfileInputChange}
                    className="bg-background border-input placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="position" className="text-sm font-medium text-foreground/90">Posizione (Opzionale)</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={handleProfileInputChange}
                    className="bg-background border-input placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-destructive pt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting || authLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4 w-full sm:w-auto"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 bg-card border-border">
             <h2 className="text-xl font-semibold mb-6 text-foreground">Impostazioni Notifiche</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notifications" className="text-sm font-medium text-foreground/90">Notifiche Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Ricevi aggiornamenti importanti e promozioni via email.
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                />
              </div>

               <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
                <div className="space-y-0.5">
                  <Label htmlFor="sms_notifications" className="text-sm font-medium text-foreground/90">Notifiche SMS</Label>
                  <p className="text-xs text-muted-foreground">
                    Ricevi avvisi critici e codici di verifica via SMS (funzione futura).
                  </p>
                </div>
                <Switch
                  id="sms_notifications"
                  checked={notificationSettings.sms_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('sms_notifications', checked)}
                  disabled
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Impostazioni Sicurezza</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="two_factor_auth" className="text-sm font-medium text-foreground/90">Autenticazione a Due Fattori (2FA)</Label>
                    <p className="text-xs text-muted-foreground">
                      Aggiungi un ulteriore livello di sicurezza (funzione futura).
                    </p>
                  </div>
                  <Switch
                    id="two_factor_auth"
                    checked={securitySettings.two_factor_auth}
                    onCheckedChange={(checked) => handleSecurityChange('two_factor_auth', checked)}
                    disabled
                  />
                </div>
                 <div className="space-y-2 p-4 rounded-lg border border-border bg-background/50">
                    <Label htmlFor="session_timeout" className="text-sm font-medium text-foreground/90">Timeout Sessione (minuti)</Label>
                     <p className="text-xs text-muted-foreground mb-1.5">
                      Disconnessione automatica dopo inattività (funzione futura).
                    </p>
                    <Input
                      id="session_timeout"
                      type="number"
                      value={securitySettings.session_timeout}
                      onChange={(e) => handleSecurityChange('session_timeout', parseInt(e.target.value, 10))}
                      className="bg-background border-input placeholder:text-muted-foreground focus:border-primary max-w-xs"
                      disabled
                      min={5}
                      max={120}
                    />
                  </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 