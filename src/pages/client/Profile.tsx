import React from 'react';
import { useAuth } from '@/context/AuthContext';

const ClientProfile = () => {
  const { user } = useAuth();
  
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profilo</h1>
      {/* Contenuto della pagina */}
    </div>
  );
};

export default ClientProfile; 