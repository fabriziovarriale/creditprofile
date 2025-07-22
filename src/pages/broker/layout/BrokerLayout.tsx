import React from 'react';
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

// Puoi personalizzare qui le voci della sidebar
const brokerNavigation = [
  { name: 'Dashboard', href: '/broker/dashboard' },
  { name: 'Clienti', href: '/broker/clients' },
  { name: 'Documenti', href: '/broker/documents' },
  { name: 'Credit Score', href: '/broker/credit-score' },
  { name: 'Credit Profiles', href: '/broker/credit-profiles' },
];

type BrokerLayoutProps = {
  children: React.ReactNode;
};

const BrokerLayout = ({ children }: BrokerLayoutProps) => {
  return (
    <SidebarProvider>
      {/* Pulsante hamburger per mobile, sempre visibile sopra tutto */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <SidebarTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-red-600 hover:bg-red-700 border border-gray-300 shadow"
            aria-label="Apri menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SidebarTrigger>
      </div>

      <div className="flex h-screen w-full bg-black">
        {/* Sidebar responsive */}
        <Sidebar>
          <nav className="flex flex-col h-full p-4 gap-2">
            {/* <div className="mb-6 text-lg font-bold text-white">CreditProfile</div> */}
            {brokerNavigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="justify-start text-base text-white hover:bg-gray-800"
                onClick={() => {
                  window.location.href = item.href;
                }}
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </Sidebar>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-black">
          <Header />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BrokerLayout; 