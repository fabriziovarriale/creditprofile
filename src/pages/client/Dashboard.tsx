
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle, CheckCircle, Clock, ArrowRight, BarChart3 } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import StatusBadge from '@/components/ui/StatusBadge';

const ClientDashboard = () => {
  const { user } = useAuth();

  // Mock data for documents
  const documents = [
    { 
      id: '1', 
      name: 'Carta di identità', 
      status: 'validated' as const,
      lastUpdated: new Date(2023, 10, 15)
    },
    { 
      id: '2', 
      name: 'Busta paga', 
      status: 'pending' as const,
      lastUpdated: new Date(2023, 11, 5)
    },
    { 
      id: '3', 
      name: 'Estratto conto', 
      status: 'rejected' as const,
      lastUpdated: new Date(2023, 11, 10),
      message: 'Documento non leggibile, si prega di ricaricare'
    }
  ];

  // Mock data for application progress
  const applicationProgress = 65;

  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Cliente</h1>
          <p className="text-muted-foreground mt-1">Benvenuto, {user?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Application Progress Card */}
        <AnimatedCard className="col-span-1 md:col-span-2 animate-fade-in animate-delay-100">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Stato Richiesta Mutuo</h2>
              <span className="text-sm text-muted-foreground">
                Ultimo aggiornamento: 10 Nov 2023
              </span>
            </div>
            
            <div className="h-2.5 w-full bg-gray-200 rounded-full mb-2">
              <div 
                className="h-2.5 rounded-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${applicationProgress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground mb-6">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Documenti caricati</span>
                <span className="text-xl font-semibold">5/8</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Documenti convalidati</span>
                <span className="text-xl font-semibold">3/8</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Richiesta completata</span>
                <span className="text-xl font-semibold">{applicationProgress}%</span>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Action Card */}
        <AnimatedCard className="animate-fade-in animate-delay-200">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-4">Azioni Rapide</h2>
            <div className="space-y-3 flex-1">
              <Link
                to="/client/documents"
                className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span>Gestisci Documenti</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link
                to="/client/profile"
                className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <span>Visualizza Profilo</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Recent Documents */}
      <div className="mb-8 animate-fade-in animate-delay-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Documenti Recenti</h2>
          <Link 
            to="/client/documents" 
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
          >
            Vedi Tutti
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <AnimatedCard key={doc.id} className="h-full">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-credit-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-credit-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Aggiornato: {doc.lastUpdated.toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              
              {doc.message && (
                <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
                  <div className="flex gap-1.5">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>{doc.message}</p>
                  </div>
                </div>
              )}
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="animate-fade-in animate-delay-400">
        <h2 className="text-xl font-semibold mb-4">Riepilogo Stato</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AnimatedCard className="bg-green-50 border-green-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-800">Documenti Validati</p>
                <p className="text-2xl font-semibold text-green-900">3</p>
              </div>
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="bg-yellow-50 border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-800">In Attesa</p>
                <p className="text-2xl font-semibold text-yellow-900">1</p>
              </div>
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="bg-red-50 border-red-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-800">Rifiutati</p>
                <p className="text-2xl font-semibold text-red-900">1</p>
              </div>
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="bg-gray-50 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-800">Documenti Richiesti</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
