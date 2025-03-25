
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, userType, signOut } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const links = userType === 'broker' ? [
    { name: 'Dashboard', path: '/broker' },
    { name: 'Clienti', path: '/broker/clients' },
    { name: 'Documenti', path: '/broker/documents' },
  ] : [
    { name: 'Dashboard', path: '/client' },
    { name: 'Documenti', path: '/client/documents' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-credit-800 to-credit-600 bg-clip-text text-transparent">
              Credit Profile
            </span>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-credit-100 flex items-center justify-center text-credit-700">
                  {user.name.charAt(0)}
                </span>
                {!isMobile && (
                  <>
                    <span>{user.name}</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Accesso come {userType === 'broker' ? 'Broker' : 'Cliente'}
                  </div>
                  
                  <Link
                    to={userType === 'broker' ? "/broker/settings" : "/client/settings"}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings size={16} />
                    Impostazioni
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut size={16} />
                    Esci
                  </button>
                </div>
              )}
            </div>
            
            <button
              className="block md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Accedi
            </Link>
          </div>
        )}
      </div>
      
      {isMenuOpen && user && (
        <div className="fixed inset-0 top-16 z-30 bg-background md:hidden">
          <nav className="container grid gap-6 p-6">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                  location.pathname === link.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
