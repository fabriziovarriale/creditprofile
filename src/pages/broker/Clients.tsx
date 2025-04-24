import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types';
import { FileText, MoreVertical, Phone, Mail, PlusCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'pending',
  });

  const fetchClients = async () => {
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Errore nel fetch dei clienti:", fetchError);
      setError("Impossibile caricare i clienti.");
      setLoading(false);
    } else {
      setClients(data || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({ ...prev, [name]: value }));
  };
  const handleStatusChange = (value: string) => {
     setNewClientData(prev => ({ ...prev, status: value }));
  }

  const handleNewClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const clientToInsert = {
      name: newClientData.name,
      email: newClientData.email || null,
      phone: newClientData.phone || null,
      status: newClientData.status,
      progress: 0,
      last_contact: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('clients')
      .insert([clientToInsert]);

    setIsSubmitting(false);

    if (insertError) {
      console.error("Errore nell'inserimento del cliente:", insertError);
      toast.error("Errore: " + insertError.message);
    } else {
      toast.success("Cliente aggiunto con successo!");
      setNewClientData({ name: '', email: '', phone: '', status: 'pending' });
      document.getElementById('close-new-client-dialog')?.click();
      fetchClients();
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-300 flex-1 flex items-center justify-center">Caricamento clienti...</div>;
  }
  if (error && clients.length === 0) {
    return <div className="p-6 text-red-400 flex-1 flex items-center justify-center">{error}</div>;
  }

  // Definiamo le classi delle colonne per riutilizzarle
  const gridColsClass = "grid-cols-[minmax(0,_1fr)_100px_130px_110px_110px_50px]"; // Larghezze aggiustate (px per più controllo)
  const headerGapClass = "gap-4"; // Gap tra le colonne header
  const rowGapClass = "gap-4";    // Gap tra le colonne righe (può essere diverso se serve)

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-gray-100 font-semibold text-lg">Clienti</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuovo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] bg-gray-900 border-gray-700 text-gray-100">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
              <DialogDescription className="text-gray-400">
                Inserisci i dettagli del nuovo cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewClientSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client-name" className="text-right text-gray-400">Nome*</Label>
                  <Input id="client-name" name="name" value={newClientData.name} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client-email" className="text-right text-gray-400">Email</Label>
                  <Input id="client-email" name="email" type="email" value={newClientData.email} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="client-phone" className="text-right text-gray-400">Telefono</Label>
                   <Input id="client-phone" name="phone" value={newClientData.phone} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="client-status" className="text-right text-gray-400">Stato</Label>
                    <Select name="status" value={newClientData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Seleziona stato" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-gray-100">
                            <SelectItem value="pending">In attesa</SelectItem>
                            <SelectItem value="active">Attivo</SelectItem>
                            <SelectItem value="completed">Completato</SelectItem>
                            <SelectItem value="inactive">Inattivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button id="close-new-client-dialog" type="button" variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">Annulla</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || !newClientData.name} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  {isSubmitting ? 'Salvataggio...' : 'Salva Cliente'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
        <div className={`sticky top-0 z-10 flex-shrink-0 bg-gray-800 border-b border-gray-600 px-4 md:px-6 py-2 hidden md:grid ${gridColsClass} ${headerGapClass} items-center`}>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider pl-14">Cliente</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Contatti</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Progresso</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Stato</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Ultimo Contatto</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Azioni</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && clients.length === 0 && <div className="p-4 text-center text-red-400 bg-red-900/30">{error}</div>}

          {clients.map((client) => (
            <div key={client.id} className="bg-black hover:bg-gray-800/30 border-b border-gray-700 transition-colors duration-150">
              <div className={`p-4 md:px-6 grid ${gridColsClass} ${rowGapClass} items-center divide-x divide-gray-700`}>

                <div className="flex items-center space-x-3 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-white text-base font-medium flex-shrink-0">
                    {client.name ? client.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-100 font-semibold truncate" title={client.name}>{client.name}</div>
                    <div className="text-gray-400 text-sm mt-0.5 truncate" title={client.email ?? ''}>{client.email ?? 'N/A'}</div>
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center space-x-2 px-2">
                  {client.email && <Mail className="w-4 h-4 text-gray-400 hover:text-gray-200" />}
                  {client.phone && <Phone className="w-4 h-4 text-gray-400 hover:text-gray-200" />}
                   {!(client.email || client.phone) && <span className="text-gray-600">-</span>}
                </div>

                <div className="flex items-center justify-center px-2">
                  {client.progress !== null && client.progress !== undefined ? (
                     <div className="flex items-center space-x-2" title={`Progresso: ${client.progress}%`}>
                       <Activity className="w-4 h-4 text-gray-400 hidden lg:inline-block flex-shrink-0" />
                       <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${client.progress}%` }}></div>
                       </div>
                     </div>
                   ) : (
                     <span className="text-gray-600 text-xs">N/D</span>
                   )}
                </div>

                <div className="flex justify-center px-2">
                   <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                     client.status === 'active' ? 'bg-green-500/20 text-green-300' :
                     client.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                     client.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                     client.status === 'inactive' ? 'bg-gray-600/50 text-gray-300' :
                     'bg-gray-600/50 text-gray-300'
                   }`}>
                     {client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : 'N/A'}
                   </span>
                 </div>

                <div className="hidden sm:flex justify-end px-2">
                   <span className="text-gray-400 text-xs text-right whitespace-nowrap" title="Ultimo contatto">
                     {client.last_contact ? new Date(client.last_contact).toLocaleDateString('it-IT') : 'N/D'}
                   </span>
                 </div>

                <div className="flex justify-center pl-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-700 hover:text-gray-100">
                       <span className="sr-only">Azioni</span>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>

              </div>
            </div>
          ))}
          {clients.length === 0 && !loading && !error && (
             <div className="p-10 text-center text-gray-500">Nessun cliente trovato. Clicca su "Nuovo Cliente" per aggiungerne uno.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage; 