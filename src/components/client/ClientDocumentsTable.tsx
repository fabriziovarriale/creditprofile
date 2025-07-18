import React, { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient'; // Rimosso
import { useAuth } from '@/components/providers/SupabaseProvider'; // Modificato import
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // Aggiunto Loader2

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'In attesa', color: 'bg-yellow-500' },
  in_progress: { label: 'In lavorazione', color: 'bg-blue-500' },
  verificato: { label: 'Verificato', color: 'bg-green-600' },
  rifiutato: { label: 'Rifiutato', color: 'bg-red-600' },
};

const ClientDocumentsTable = () => {
  const { profile: user, supabase, loading: authLoading, isAuthenticated } = useAuth(); // Aggiornato
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true); // Loading per i dati della tabella
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      if (authLoading || !isAuthenticated || !user || !supabase) {
        if (!authLoading) setLoadingData(false);
        return;
      }
      setLoadingData(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('documents') // Tabella corretta 'documents'?
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }
        setDocuments(data || []);
      } catch (err: any) {
        console.error("Errore fetch documenti per tabella:", err);
        setError("Impossibile caricare i documenti.");
        setDocuments([]);
      } finally {
        setLoadingData(false);
      }
    }
    fetchDocuments();
  }, [user, authLoading, isAuthenticated, supabase]);

  if (authLoading) {
    return <div className="p-4 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" />Caricamento sessione...</div>;
  }

  if (loadingData) {
    return <div className="p-4 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" />Caricamento documenti...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <div className="p-4 text-orange-500">Utente non autenticato. Effettua il login.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>I tuoi documenti</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2">Tipo Documento</th>
              <th className="text-left py-2">Nome File</th>{/* Aggiunto Nome File */}
              <th className="text-left py-2">Ultimo Aggiornamento</th>
              <th className="text-left py-2">Stato</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">Nessun documento caricato</td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="py-2">{doc.type || 'N/D'}</td>{/* Usa doc.type da DocumentProps */}
                  <td className="py-2">{doc.name || 'N/D'}</td>{/* Usa doc.name da DocumentProps */}
                  <td className="py-2">{doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('it-IT') : '-'}</td> {/* Usa doc.upload_date */}
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-white ${statusMap[doc.status]?.color || 'bg-gray-500'}`}>
                      {statusMap[doc.status]?.label || doc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ClientDocumentsTable;
