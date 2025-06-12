import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary-900 z-50 border-b border-primary-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Logo iconSize={6} textSize="text-xl" className="text-primary-50" />
          </Link>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-50 font-medium hover:bg-primary-100 transition-colors"
            >
              Accedi alla Piattaforma
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Registrati
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 