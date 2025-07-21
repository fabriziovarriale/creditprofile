import React from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { PanelRight, PanelRightClose, Bell } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useState } from 'react';

interface HeaderProps {
  isSlideOverOpen?: boolean;
  onToggleSlideOver?: () => void;
  showSlideOverToggle?: boolean;
}

// Mock notifiche
const mockNotifications = [
  {
    id: '1',
    type: 'document',
    message: 'Nuovo documento caricato da Marco Rossi',
    createdAt: '2024-06-10T10:00:00Z',
    read: false,
    link: '/broker/documents'
  },
  {
    id: '2',
    type: 'credit_score',
    message: 'Credit score pronto per Anna Verdi',
    createdAt: '2024-06-10T09:30:00Z',
    read: false,
    link: '/broker/credit-score'
  }
];

const Header: React.FC<HeaderProps> = ({ 
  isSlideOverOpen = false, 
  onToggleSlideOver,
  showSlideOverToggle = false 
}) => {
  const { profile, supabase, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Errore durante il logout: " + error.message);
    } else {
      toast.success("Logout effettuato con successo!");
      navigate('/login');
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, read: true } : n));
    if (link) navigate(link);
    setShowNotifications(false);
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
      <div className="flex h-16 items-center px-4 justify-between">
        {/* Logo Credit Profile */}
        <div className="flex items-center">
          <Logo className="h-8 w-auto" />
        </div>

        {/* User Menu + Notifiche */}
        <div className="flex items-center gap-4">
          {/* Notifiche */}
          <div className="relative">
            <button
              className="relative flex items-center justify-center h-10 w-10 rounded-full transition-colors hover:bg-gray-100 group"
              aria-label="Notifiche"
              onClick={() => setShowNotifications(v => !v)}
            >
              <Bell className="h-6 w-6 transition-colors group-hover:text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                <div className="p-2 font-semibold border-b">Notifiche</div>
                <ul>
                  {notifications.length === 0 ? (
                    <li className="p-4 text-muted-foreground">Nessuna notifica</li>
                  ) : (
                    notifications.map(n => (
                      <li key={n.id} className={`p-3 border-b last:border-0 ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
                        <button className="block text-left w-full hover:underline" onClick={() => handleNotificationClick(n.id, n.link)}>
                          {n.message}
                        </button>
                        <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString('it-IT')}</div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          {/* User Menu */}
          <div className="flex items-center">
            {isAuthenticated && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
