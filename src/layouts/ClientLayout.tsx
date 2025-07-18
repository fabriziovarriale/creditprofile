import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, UserCircle, LogOut, LifeBuoy, ChevronDown } from 'lucide-react';
import Logo from '@/components/ui/Logo'; // Assumendo che il componente Logo esista
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/components/providers/SupabaseProvider'; // Decommenta se usi Supabase

const ClientLayout: React.FC = () => {
  const { supabase, profile } = useAuth(); // Decommenta se usi Supabase
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (supabase) { // Decommenta se usi Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Errore durante il logout:', error.message);
        // Potresti voler mostrare un messaggio di errore all'utente qui
      } else {
        console.log('Logout eseguito con successo da Supabase');
        navigate('/auth/login', { replace: true }); // Aggiunto replace: true per una navigazione più pulita
      }
    } else {
      // Fallback se supabase non è disponibile (improbabile se useAuth funziona)
      console.warn('Istanza Supabase non disponibile per il logout.');
      navigate('/auth/login', { replace: true });
    }
    // navigate('/auth/login'); // Spostato dentro il blocco if/else
    // console.log('Logout eseguito'); // Placeholder // Rimosso log ridondante
  };

  const userFirstName = profile?.first_name || 'Utente'; // Accesso diretto a first_name da profile

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-border">
          <Link to="/">
            <Logo className="h-8 w-auto" />
          </Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <Link
            to="/client/dashboard"
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/client/documents"
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted"
          >
            <FolderOpen className="w-5 h-5 mr-3" />
            Documenti
          </Link>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-end px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <UserCircle className="w-6 h-6" />
                <span>{userFirstName}</span> {/* Decommenta se usi Supabase */}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-2 mt-1 bg-popover text-popover-foreground border-border" align="end">
              <DropdownMenuLabel>
                Benvenuto, {userFirstName} {/* Decommenta se usi Supabase */}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => navigate('/client/profile')} className="cursor-pointer hover:bg-muted">
                <UserCircle className="w-4 h-4 mr-2" />
                Profilo personale
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Assistenza cliccata')} className="cursor-pointer hover:bg-muted"> {/* Placeholder per Assistenza */}
                <LifeBuoy className="w-4 h-4 mr-2" />
                Assistenza
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border"/>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:!bg-destructive hover:!text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet /> {/* Qui verranno renderizzate le pagine figlie */}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout; 