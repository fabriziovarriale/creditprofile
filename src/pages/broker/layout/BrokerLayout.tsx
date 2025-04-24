import React from 'react';
import Sidebar from '@/components/layout/broker/Sidebar'; // Assumi esista
import BrokerHeader from '@/components/layout/broker/BrokerHeader'; // Assumi esista

type BrokerLayoutProps = {
  children: React.ReactNode;
};

const BrokerLayout = ({ children }: BrokerLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-black"> {/* Sfondo nero, larghezza piena */}
      <Sidebar /> {/* Assicurati che la sidebar non influenzi la larghezza del main */}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-black"> {/* Sfondo nero, flex-1 per occupare spazio */}
        <BrokerHeader /> {/* Header specifico del broker, se necessario */}
        <main className="flex-1 w-full"> {/* Nessun padding, larghezza piena */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default BrokerLayout; 