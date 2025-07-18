import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
  Home,
  UserCircle,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { toast } from 'sonner';
import Header from './Header';

interface DashboardLayoutProps {
  role: 'broker' | 'client' | 'admin';
  isSlideOverOpen?: boolean;
  onToggleSlideOver?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  role,
  isSlideOverOpen = false,
  onToggleSlideOver
}) => {
  const { profile, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const baseNavigation = {
    broker: [
      { name: 'Dashboard', href: '/broker/dashboard', icon: Home },
      { name: 'Clienti', href: '/broker/clients', icon: Users },
      { name: 'Documenti', href: '/broker/documents', icon: FileText },
      { name: 'Credit Score', href: '/broker/credit-score', icon: HelpCircle },
      { name: 'Credit Profiles', href: '/broker/credit-profiles', icon: FileText },
    ],
    client: [
      { name: 'Dashboard', href: '/client/dashboard', icon: Home },
      { name: 'Documenti', href: '/client/documents', icon: FileText },
      { name: 'Profilo', href: '/client/profile', icon: UserCircle },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    ]
  };

  const currentNavigation = baseNavigation[role] || [];

  if (!isAuthenticated && !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header con supporto slide over per broker */}
      <Header 
        isSlideOverOpen={isSlideOverOpen}
        onToggleSlideOver={onToggleSlideOver}
        showSlideOverToggle={role === 'broker' && !!onToggleSlideOver}
      />

      <div className="flex flex-1">
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] flex-shrink-0 ${
            isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
          }`}
        >
          <nav className="h-full flex flex-col px-3 py-4">
            {/* Logo e titolo per mobile */}
            <div className="md:hidden mb-4 px-2">
              <Link to={`/${role}/dashboard`} className="flex items-center">
                <Logo className="h-8 w-auto" />
                <span className="ml-2 font-semibold text-lg">CreditProfile</span>
              </Link>
            </div>

            <div className="space-y-1.5 flex-grow">
              {currentNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href ||
                               (item.href !== `/${role}/dashboard` && location.pathname.startsWith(item.href));

                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start text-base py-2.5 h-auto font-medium"
                    onClick={() => {
                      navigate(item.href);
                      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-secondary-foreground' : 'text-muted-foreground'}`} />
                    {item.name}
                  </Button>
                );
              })}
            </div>
            <div className="mt-auto py-2 px-2">
                <Button variant="ghost" className="w-full justify-start text-base py-2.5 h-auto font-medium text-muted-foreground hover:text-foreground" onClick={() => toast.info('Supporto non ancora implementato')}>
                    <HelpCircle className="w-5 h-5 mr-3 text-muted-foreground" /> Supporto
                </Button>
            </div>
          </nav>
        </aside>

        {/* Mobile menu toggle per navbar integrata */}
        {!onToggleSlideOver && (
          <div className="md:hidden fixed top-4 left-4 z-30">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        )}

        {/* Main content con margine dinamico */}
        <main 
          className={`flex-1 overflow-y-auto ${isSlideOverOpen ? 'md:mr-[500px]' : ''}`}
          style={{ transition: 'margin-right 0.3s ease-in-out' }}
        >
          <Outlet />
        </main>
      </div>
      {isMobileMenuOpen && (
        <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout; 