import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  Bell, 
  Settings // Aggiunta icona per Settings
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; // Assicurati che il percorso sia corretto
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assicurati che il percorso sia corretto

const sidebarNavItems = [
  { to: '/broker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/broker/clients', label: 'Clienti', icon: Users },
  { to: '/broker/documents', label: 'Documenti', icon: FileText },
  { to: '/broker/reports', label: 'Report', icon: BarChart3 },
];

// Mock Notifiche (puoi sostituire con dati reali)
const mockNotifications = [
  { id: 1, text: "Nuovo documento caricato da Marco Rossi", time: "5 min fa", link: "/broker/documents/1" },
  { id: 2, text: "Pratica #1234 in scadenza domani", time: "1 ora fa", link: "/broker/applications/1234" },
  { id: 3, text: "Validazione richiesta per Carta Identità (Laura Bianchi)", time: "3 ore fa", link: "/broker/documents/2" },
];

const BrokerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col border-r border-primary-100 shrink-0">
        <div className="p-4 border-b border-primary-100 h-16 flex items-center">
           <Logo iconSize={6} textSize="text-xl" />
        </div>
        <nav className="flex-1 py-4">
          <ul>
            {sidebarNavItems.map((item) => (
              <li key={item.to} className="px-4 py-1">
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    location.pathname.startsWith(item.to)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Rimosso User Info & Logout da qui */}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Header */}
         <header className="bg-white shadow-sm border-b border-primary-100 h-16 flex items-center justify-between px-6 shrink-0">
           {/* Placeholder per eventuali elementi a sinistra dell'header (es. breadcrumbs) */}
           <div></div>

           <div className="flex items-center gap-4">
             {/* Dropdown Notifiche */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="relative p-2 rounded-full hover:bg-primary-50 text-primary-300 hover:text-primary-900">
                   <Bell className="h-5 w-5" />
                   {mockNotifications.length > 0 && (
                     <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                   )}
                 </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-80">
                 <DropdownMenuLabel>Notifiche Recenti</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {mockNotifications.length > 0 ? (
                   mockNotifications.slice(0, 3).map(notif => ( // Mostra solo le prime 3
                     <DropdownMenuItem key={notif.id} onClick={() => navigate(notif.link)} className="flex flex-col items-start">
                       <p className="text-sm">{notif.text}</p>
                       <p className="text-xs text-muted-foreground">{notif.time}</p>
                     </DropdownMenuItem>
                   ))
                 ) : (
                   <DropdownMenuItem disabled>Nessuna nuova notifica</DropdownMenuItem>
                 )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => navigate('/broker/notifications')}>
                   Vedi tutte le notifiche
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>

             {/* Dropdown Utente */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="flex items-center gap-2 p-1 rounded-md hover:bg-primary-50">
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                     <AvatarFallback className="bg-primary/10 text-primary">
                       {user?.name?.charAt(0).toUpperCase() || '?'}
                     </AvatarFallback>
                   </Avatar>
                   <span className="text-sm font-medium text-primary-900 hidden md:block">{user?.name || 'Utente'}</span>
                 </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Account</DropdownMenuLabel>
                 <DropdownMenuItem onClick={() => navigate('/broker/profile')}>
                   <Settings className="mr-2 h-4 w-4" />
                   <span>Profilo & Impostazioni</span>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                   <LogOut className="mr-2 h-4 w-4" />
                   <span>Esci</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
         </header>
         
         {/* Contenuto Pagina - Rimuoviamo TUTTI i padding */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet /> {/* Qui verranno renderizzate le pagine figlie */}
        </main>
      </div>
    </div>
  );
};

export default BrokerLayout;
