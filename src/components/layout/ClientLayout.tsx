
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { FileText, Home, Upload, User } from 'lucide-react';

const ClientLayout = () => {
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/client/dashboard' },
    { icon: FileText, label: 'Documenti', path: '/client/documents' },
    { icon: Upload, label: 'Carica', path: '/client/upload' },
    { icon: User, label: 'Profilo', path: '/client/profile' }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground p-4">
        <div className="flex items-center mb-8 pt-4">
          <span className="text-xl font-bold">Credit Profile</span>
        </div>
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <a 
                href={item.path}
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto pb-4">
          <div className="flex items-center p-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground text-sm font-medium">CL</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Client User</p>
              <p className="text-xs text-primary-foreground/70">client@example.com</p>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
