import React from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { profile, supabase, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Errore durante il logout: " + error.message);
    } else {
      toast.success("Logout effettuato con successo!");
      navigate('/auth/login');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  let displayName = 'Utente';
  let initials = 'U';

  if (isAuthenticated && profile) {
    if (profile.first_name && profile.last_name) {
      displayName = `${profile.first_name} ${profile.last_name}`;
      initials = getInitials(profile.first_name, profile.last_name);
    } else if (profile.first_name) {
      displayName = profile.first_name;
      initials = getInitials(profile.first_name);
    } else if (profile.email) {
      displayName = profile.email.split('@')[0];
      const emailPrefix = profile.email.split('@')[0];
      if (emailPrefix.length >= 2) {
        initials = emailPrefix.substring(0,2).toUpperCase();
      } else if (emailPrefix.length === 1) {
        initials = emailPrefix.toUpperCase();
      }
    }
  }

  return (
    <header className="border-b bg-card text-card-foreground">
      <div className="flex h-16 items-center px-4 justify-end">
        {isAuthenticated && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {displayName}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
              <DropdownMenuLabel>Il Mio Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(profile.role === 'broker' ? '/broker/profile' : '/client/profile')}>
                Profilo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="text-sm text-muted-foreground">Non autenticato</div>
        )}
      </div>
    </header>
  );
};

export default Header;
