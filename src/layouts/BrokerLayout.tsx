import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BarChart3,
  LogOut as LogOutIcon,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  Loader2
} from "lucide-react";
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BrokerLayout = () => {
  const { profile: user, supabase, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigationItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/broker/dashboard' },
  ];

  const bottomNavItems: any[] = [];

  const notifications = [
    {
      id: 1,
      title: "Nuovo documento caricato",
      message: "Marco Rossi ha caricato un nuovo documento",
      time: "5 min fa",
      unread: true
    },
    {
      id: 2,
      title: "Pratica completata",
      message: "La pratica di Laura Bianchi è stata completata",
      time: "1 ora fa",
      unread: false
    },
  ];

  const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '?';
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Utente';
  const userEmail = user?.email || 'Nessuna email';

  const handleLogout = async () => {
    if (!supabase) {
      toast.error("Servizio di autenticazione non disponibile.");
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsProfileOpen(false);
      toast.success("Logout effettuato con successo.");
    } catch (error: any) {
      console.error("Errore durante il logout nel layout:", error);
      toast.error(error.message || "Errore durante il logout.");
    }
  };

  if (authLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-gray-700 flex items-center justify-between z-30">
        <div className="flex items-center px-6">
          <span className="text-blue-500 font-bold text-xl">Credit</span>
          <span className="text-gray-100 font-bold text-xl">Profile</span>
        </div>

        <div className="flex items-center space-x-4 px-6">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-black"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 z-40">
                <div className="px-4 py-2 border-b border-gray-700">
                  <h3 className="text-gray-100 font-medium">Notifiche</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`px-4 py-3 hover:bg-gray-800 cursor-pointer ${notification.unread ? 'bg-gray-800/50' : ''}`}
                    >
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-100">{notification.title}</span>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                    </div>
                  )) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">Nessuna notifica</div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-700">
                    <button className="text-sm text-blue-400 hover:text-blue-300 w-full text-center">
                      Vedi tutte
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-700"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-700 text-white">{userInitials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-gray-200 text-sm">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 z-40">
                <Link
                   to="/broker/profile"
                   onClick={() => setIsProfileOpen(false)}
                   className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                 >
                  <UserIcon className="w-4 h-4 mr-2"/>
                  Il mio profilo
                 </Link>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                >
                   <LogOutIcon className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-black border-r border-gray-700 flex flex-col z-20">
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>

          {bottomNavItems.length > 0 && (
            <div className="mt-auto pt-6 border-t border-gray-700 space-y-1">
              {bottomNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-indigo-700 text-white">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-100 ml-2"
              title="Logout"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 mt-16 flex-1 flex flex-col min-h-screen bg-[#0A0A0A] overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default BrokerLayout; 