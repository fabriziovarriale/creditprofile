import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FileText, Home, Upload, User, PieChart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/SupabaseProvider';
import Header from './Header';
import ImpersonationBanner from './ImpersonationBanner';

const ClientLayout = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/client/dashboard' },
    { icon: FileText, label: 'Documenti', path: '/client/documents' },
    { icon: Upload, label: 'Carica Documenti', path: '/client/upload' },
    { icon: Clock, label: 'Stato Pratica', path: '/client/status' },
    { icon: PieChart, label: 'Report', path: '/client/reports' },
    { icon: User, label: 'Profilo', path: '/client/profile' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-card border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <span className="text-lg font-semibold">Credit Profile</span>
        </div>
        <div className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ImpersonationBanner />
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
