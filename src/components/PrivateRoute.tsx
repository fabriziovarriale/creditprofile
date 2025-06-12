import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider'; // Modificato import
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
  // allowedRoles?: string[]; // Opzionale: per RBAC a livello di route
}

const PrivateRoute = ({ children /*, allowedRoles */ }: PrivateRouteProps) => {
  const { isAuthenticated, loading, profile } = useAuth(); // Usa isAuthenticated, loading e profile
  const location = useLocation();

  if (loading) {
    // Mostra un loader mentre verifica lo stato di autenticazione
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Se l'utente non è autenticato, reindirizza alla pagina di login
    // Salva la posizione corrente in modo da poter reindirizzare l'utente indietro dopo il login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // // Opzionale: Controllo dei ruoli
  // if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
  //   // Utente autenticato ma non ha il ruolo richiesto
  //   // Potresti reindirizzare a una pagina di "Accesso Negato" o alla home
  //   toast.error("Accesso non autorizzato per questa sezione.");
  //   return <Navigate to={profile.role === 'broker' ? '/broker/dashboard' : '/client/dashboard'} replace />;
  // }

  // Se l'utente è autenticato, renderizza il componente figlio (es. BrokerLayout)
  return children;
};

export default PrivateRoute; 