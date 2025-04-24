import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Assicurati che il percorso a AuthContext sia corretto
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Mostra un loader mentre verifica lo stato di autenticazione
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Se l'utente non è autenticato, reindirizza alla pagina di login
    // Salva la posizione corrente in modo da poter reindirizzare l'utente indietro dopo il login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se l'utente è autenticato, renderizza il componente figlio (es. BrokerLayout)
  return children;
};

export default PrivateRoute; 