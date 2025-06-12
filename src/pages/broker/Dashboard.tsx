import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const BrokerDashboard = () => {
  const { profile: brokerProfile, loading: authLoading, isAuthenticated, supabase } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [authLoading, isAuthenticated, brokerProfile, supabase, navigate]);

  if (authLoading) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Caricamento dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex-1 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!brokerProfile) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <p>Profilo utente non disponibile. Potrebbe essere necessario effettuare nuovamente il login.</p>
        <Button onClick={() => navigate('/auth/login')} className="ml-4">Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Benvenuto, {brokerProfile.first_name} {brokerProfile.last_name}!</h1>
        <p className="text-lg text-muted-foreground">Email: {brokerProfile.email}</p>
        <p className="text-sm text-muted-foreground">Ruolo: {brokerProfile.role}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Dashboard Broker</h2>
      </div>

      <p className="text-center mt-8 text-muted-foreground">
        Contenuto della dashboard del broker. Qui verranno visualizzati i tuoi clienti e le pratiche associate.
      </p>
      <div className="mt-6 text-center">
        <Button onClick={() => navigate('/broker/new-document')} variant="default" size="lg">
            Nuovo Documento per Cliente
        </Button>
      </div>
    </div>
  );
};

export default BrokerDashboard;
