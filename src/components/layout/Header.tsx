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
import Logo from '@/components/ui/Logo';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

interface HeaderProps {
  isSlideOverOpen?: boolean;
  onToggleSlideOver?: () => void;
  showSlideOverToggle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  isSlideOverOpen = false, 
  onToggleSlideOver,
  showSlideOverToggle = false 
}) => {
  const { profile, supabase, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const handleLogout = async () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
      if (key.includes('supabase')) localStorage.removeItem(key);
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('sb-')) sessionStorage.removeItem(key);
      if (key.includes('supabase')) sessionStorage.removeItem(key);
    });
    // Rimozione cookie sb-*
    document.cookie.split(';').forEach((c) => {
      if (c.trim().startsWith('sb-')) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      }
    });
    // Hard reload per azzerare tutto lo stato
    window.location.replace('/login');
  };

  const handleNotificationClick = async (id: number, link?: string) => {
    await markAsRead(id);
    if (link) navigate(link);
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Adesso';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ore fa`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} giorni fa`;
    return date.toLocaleDateString('it-IT');
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
        {/* Logo e hamburger menu (mobile) a sinistra */}
        <div className="flex items-center gap-2">
          <Logo iconSize={24} textSize={18} />
          {/* Pulsante hamburger per mobile accanto al logo */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-black bg-white hover:bg-gray-100 border border-gray-300 shadow h-8 w-8"
              onClick={() => {
                // Qui dovremmo triggerare l'apertura della sidebar
                // Per ora uso un evento custom che il DashboardLayout può intercettare
                window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
              }}
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Menu + Notifiche a destra */}
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
              <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-xl z-50 max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <h3 className="font-semibold text-lg">Notifiche</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Segna tutte lette
                      </Button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Lista notifiche */}
                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Caricamento...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Nessuna notifica</p>
                    </div>
                  ) : (
                    <ul>
                      {notifications.slice(0, 10).map(n => (
                        <li 
                          key={n.id} 
                          className={`p-4 border-b last:border-0 cursor-pointer transition-colors relative group ${
                            n.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                          onClick={() => handleNotificationClick(n.id, n.link)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Indicatore non letto */}
                            {!n.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            )}
                            
                            {/* Contenuto */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">{n.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(n.created_at)}
                              </div>
                            </div>

                            {/* Pulsante elimina */}
                            <button
                              onClick={(e) => handleDeleteNotification(n.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded flex-shrink-0"
                              title="Elimina notifica"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t bg-gray-50">
                    <Button
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => {
                        navigate('/broker/notifications');
                        setShowNotifications(false);
                      }}
                    >
                      Vedi tutte le notifiche
                    </Button>
                  </div>
                )}
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
