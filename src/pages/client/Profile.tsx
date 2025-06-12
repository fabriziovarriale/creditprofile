import React from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';

const ClientProfile = () => {
  const { profile: user, loading: authLoading, isAuthenticated } = useAuth();
  
  if (authLoading) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        Caricamento profilo...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center text-red-500">
        Devi essere loggato per vedere questa pagina.
        {/* Potrebbe essere utile un redirect al login qui */}
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profilo di {user.first_name} {user.last_name}</h1>
      <p>Email: {user.email}</p>
      <p>Ruolo: {user.role}</p>
      {/* Altri dettagli del profilo qui */}
    </div>
  );
};

export default ClientProfile; 