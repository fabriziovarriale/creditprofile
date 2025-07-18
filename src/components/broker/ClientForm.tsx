import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Client } from '@/mocks/broker-data';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  X,
  UserPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface ClientFormProps {
  onClose: () => void;
  onSubmitSuccess?: (client: Client) => void;
  client?: Client | null; // Per editing
  mode?: 'create' | 'edit';
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  notes?: string;
}

const ClientForm: React.FC<ClientFormProps> = ({
  onClose,
  onSubmitSuccess,
  client = null,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Pre-popola il form se stiamo modificando un cliente esistente
  useEffect(() => {
    if (client && mode === 'edit') {
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        status: client.status,
        notes: ''
      });
    }
  }, [client, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Validazione nome
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Il nome è obbligatorio';
    }

    // Validazione cognome
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Il cognome è obbligatorio';
    }

    // Validazione email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    // Validazione telefono
    if (!formData.phone.trim()) {
      newErrors.phone = 'Il telefono è obbligatorio';
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Formato telefono non valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Correggi gli errori nel form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simula API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Crea oggetto cliente
      const newClient: Client = {
        id: client?.id || Math.random().toString(36).substr(2, 9),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        status: formData.status,
        registrationDate: client?.registrationDate || new Date().toISOString().split('T')[0],
        creditProfiles: client?.creditProfiles || [],
        documents: client?.documents || []
      };

      // Salva anche su Supabase
      const { error } = await supabase.from('clients').insert([
        {
          id: newClient.id,
          first_name: newClient.firstName,
          last_name: newClient.lastName,
          email: newClient.email,
          phone: newClient.phone,
          status: newClient.status,
          registration_date: newClient.registrationDate
        }
      ]);
      if (error) {
        toast.error('Cliente aggiunto solo in locale. Errore Supabase: ' + error.message);
      }

      const successMessage = mode === 'edit' 
        ? 'Cliente aggiornato con successo!' 
        : 'Cliente creato con successo!';
      
      toast.success(successMessage);
      
      onSubmitSuccess?.(newClient);
      onClose();

    } catch (error) {
      toast.error(mode === 'edit' 
        ? 'Errore durante l\'aggiornamento del cliente' 
        : 'Errore durante la creazione del cliente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Rimuovi l'errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informazioni Personali */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  placeholder="Nome"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Cognome *</Label>
                <Input
                  id="lastName"
                  placeholder="Cognome"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informazioni di Contatto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Informazioni di Contatto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                placeholder="+39 333 1234567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Formato: +39 333 1234567 o 333 1234567
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stato Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Stato Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Stato *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'active' | 'pending' | 'suspended') => 
                  handleInputChange('status', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Attivo
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      In attesa
                    </div>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Sospeso
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {client && mode === 'edit' && (
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3 w-3" />
                  Data registrazione: {new Date(client.registrationDate).toLocaleDateString('it-IT')}
                </div>
                <div>
                  Profili credito: {client.creditProfiles.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note opzionali */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Note (opzionale)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Aggiungi note sul cliente..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Azioni */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'edit' ? 'Aggiornamento...' : 'Creazione...'}
              </>
            ) : (
              <>
                {mode === 'edit' ? (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Aggiorna Cliente
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crea Cliente
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm; 