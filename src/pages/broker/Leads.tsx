import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Importa il client Supabase
import { MoreVertical, Phone, Mail, PlusCircle } from "lucide-react";
import { Lead } from '@/types'; // Assumiamo che tu definisca un tipo Lead
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]); // Stato per i leads
  const [loading, setLoading] = useState(true);   // Stato per il caricamento
  const [error, setError] = useState<string | null>(null); // Stato per gli errori
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLeadData, setNewLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    notes: '',
  });

  // Funzione per caricare i leads
  const fetchLeads = async () => {
    // Non impostare loading a true qui se vogliamo un refresh silenzioso
    // setLoading(true); // Potresti volerlo solo al caricamento iniziale
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Errore nel fetch dei leads:", fetchError);
      setError("Impossibile caricare i leads.");
      setLoading(false); // Assicurati che loading sia false anche in caso di errore
    } else {
      setLeads(data || []);
      setLoading(false); // Imposta loading a false solo dopo il primo caricamento riuscito
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    setLoading(true); // Imposta loading a true all'inizio
    fetchLeads();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLeadData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const leadToInsert = {
      name: newLeadData.name,
      email: newLeadData.email || null,
      phone: newLeadData.phone || null,
      source: newLeadData.source || null,
      notes: newLeadData.notes || null,
      status: 'new'
    };

    const { error: insertError } = await supabase
      .from('leads')
      .insert([leadToInsert]);

    setIsSubmitting(false);

    if (insertError) {
      console.error("Errore nell'inserimento del lead:", insertError);
      toast.error("Errore: " + insertError.message);
      // Non impostare l'errore globale qui, la toast è sufficiente
      // setError("Impossibile aggiungere il lead.");
    } else {
      toast.success("Lead aggiunto con successo!");
      setNewLeadData({ name: '', email: '', phone: '', source: '', notes: '' }); // Resetta form
      document.getElementById('close-new-lead-dialog')?.click(); // Chiudi dialog
      fetchLeads(); // Ricarica la lista
    }
  };

  // Gestione stati Loading / Error principali
  if (loading) {
    return <div className="p-6 text-gray-300 flex-1 flex items-center justify-center">Caricamento leads...</div>;
  }

  // Mostra errore solo se il caricamento è fallito e non ci sono dati
  if (error && leads.length === 0) {
    return <div className="p-6 text-red-400 flex-1 flex items-center justify-center">{error}</div>;
  }

  // Definiamo le classi delle colonne per coerenza (simile a Clients, ma adattato)
  const gridColsClass = "grid-cols-[minmax(0,_1fr)_100px_110px_110px_110px_50px]"; // Colonne: Lead, Contatti, Fonte, Stato, Data, Azioni
  const headerGapClass = "gap-4";
  const rowGapClass = "gap-4";

  return (
    <div className="flex-1 flex flex-col">
      {/* Header con contrasto leggermente migliorato */}
      <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-gray-700"> {/* Bordo più visibile */}
        <h1 className="text-gray-100 font-semibold text-lg">Leads</h1> {/* Testo più chiaro */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"> {/* Colori standard blu */}
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuovo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] bg-gray-900 border-gray-700 text-gray-100">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Lead</DialogTitle>
              <DialogDescription className="text-gray-400">
                Inserisci i dettagli del nuovo potenziale cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewLeadSubmit}>
              <div className="grid gap-4 py-4">
                {/* Nome */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-400">Nome*</Label>
                  <Input id="name" name="name" value={newLeadData.name} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                {/* Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-gray-400">Email</Label>
                  <Input id="email" name="email" type="email" value={newLeadData.email} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                {/* Telefono */}
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="phone" className="text-right text-gray-400">Telefono</Label>
                   <Input id="phone" name="phone" value={newLeadData.phone} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                 {/* Fonte */}
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="source" className="text-right text-gray-400">Fonte</Label>
                   <Input id="source" name="source" value={newLeadData.source} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                 </div>
                 {/* Note */}
                 <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="notes" className="text-right text-gray-400">Note</Label>
                   <Textarea id="notes" name="notes" value={newLeadData.notes} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500" rows={3}/>
                 </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button id="close-new-lead-dialog" type="button" variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">Annulla</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || !newLeadData.name} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  {isSubmitting ? 'Salvataggio...' : 'Salva Lead'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content - Lista Leads con Grid Interna e Divisori */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
        {/* Header Tabella Fisso */}
        <div className={`sticky top-0 z-10 flex-shrink-0 bg-gray-800 border-b border-gray-600 px-4 md:px-6 py-2 hidden md:grid ${gridColsClass} ${headerGapClass} items-center`}>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider pl-14">Lead</div> {/* Aggiunto padding per allineare */}
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Contatti</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Fonte</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Stato</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Data Creazione</div> {/* Label aggiornata */}
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Azioni</div>
        </div>

        {/* Lista Scrollabile */}
        <div className="flex-1 overflow-y-auto">
          {error && leads.length === 0 && <div className="p-4 text-center text-red-400 bg-red-900/30">{error}</div>}

          {leads.map((lead) => (
            <div key={lead.id} className="bg-black hover:bg-gray-800/30 border-b border-gray-700 transition-colors duration-150">
              {/* Contenitore Grid per le colonne interne - USA LE STESSE CLASSI DELL'HEADER */}
              <div className={`p-4 md:px-6 grid ${gridColsClass} ${rowGapClass} items-center divide-x divide-gray-700`}>

                {/* Colonna 1: Info Principali */}
                <div className="flex items-center space-x-3 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white text-base font-medium flex-shrink-0">
                    {lead.name ? lead.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-100 font-semibold truncate" title={lead.name}>{lead.name}</div>
                    <div className="text-gray-400 text-sm mt-0.5 truncate" title={lead.email ?? ''}>{lead.email ?? 'N/A'}</div>
                  </div>
                </div>

                {/* Colonna 2: Contatti */}
                <div className="hidden md:flex items-center justify-center space-x-2 px-2">
                  {lead.email && <Mail className="w-4 h-4 text-gray-400 hover:text-gray-200" />}
                  {lead.phone && <Phone className="w-4 h-4 text-gray-400 hover:text-gray-200" />}
                  {!(lead.email || lead.phone) && <span className="text-gray-600">-</span>}
                </div>

                {/* Colonna 3: Fonte */}
                <div className="flex justify-center px-2">
                   <span className="inline-block px-2.5 py-0.5 bg-gray-700 text-gray-200 rounded-full text-xs font-medium text-center whitespace-nowrap">
                     {lead.source ?? 'N/D'}
                   </span>
                </div>

                {/* Colonna 4: Stato */}
                <div className="flex justify-center px-2">
                   <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                     lead.status === 'new' ? 'bg-green-500/20 text-green-300' :
                     lead.status === 'contacted' ? 'bg-blue-500/20 text-blue-300' :
                     lead.status === 'qualified' ? 'bg-purple-500/20 text-purple-300' :
                     'bg-gray-600/50 text-gray-300'
                   }`}>
                     {lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : 'N/A'}
                   </span>
                 </div>

                {/* Colonna 5: Data Creazione */}
                <div className="hidden sm:flex justify-end px-2">
                   <span className="text-gray-400 text-xs text-right whitespace-nowrap" title="Data creazione">
                     {new Date(lead.created_at).toLocaleDateString('it-IT')}
                   </span>
                 </div>

                {/* Colonna 6: Azioni */}
                <div className="flex justify-center pl-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-700 hover:text-gray-100">
                       <span className="sr-only">Azioni</span>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>

              </div> {/* Fine Grid Interna */}
            </div> // Fine Riga/Card
          ))}
          {leads.length === 0 && !loading && !error && (
             <div className="p-10 text-center text-gray-500">Nessun lead trovato. Clicca su "Nuovo Lead" per aggiungerne uno.</div>
          )}
        </div> {/* Fine Lista Scrollabile */}
      </div> {/* Fine Contenitore Lista */}
    </div> // Fine Container Principale
  );
};

export default LeadsPage; 