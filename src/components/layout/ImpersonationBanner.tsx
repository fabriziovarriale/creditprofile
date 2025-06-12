import React from 'react';
// import { useAuth } from '@/context/AuthContext'; // Vecchio import rimosso
// import { ArrowLeft } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';

// TODO: Reimplementare la funzionalità di impersonificazione se necessaria con il nuovo provider di autenticazione.
const ImpersonationBanner = () => {
  // const { isImpersonating, stopImpersonating, user, originalUser } = useAuth(); // useAuth ora viene da SupabaseProvider
  // const navigate = useNavigate();

  // if (!isImpersonating) return null;

  // const handleStopImpersonating = () => {
  //   stopImpersonating();
  //   navigate('/broker/clients'); // La rotta /broker/clients potrebbe non esistere più
  // };

  return null; // Per ora, la banner di impersonificazione è disabilitata

  /* return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 px-4 py-2 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Accesso come cliente:
          </span>
          <span className="font-medium text-gray-900">
            {user?.name} // user.name non esiste più, usare profile.first_name etc.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Broker: {originalUser?.name} // originalUser?.name non esiste più
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStopImpersonating}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al Broker
          </Button>
        </div>
      </div>
    </div>
  ); */
};

export default ImpersonationBanner; 