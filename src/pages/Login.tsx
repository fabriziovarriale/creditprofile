
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LockKeyhole, ArrowRight, ChevronLeft } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import AnimatedCard from '@/components/ui/AnimatedCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'client' | 'broker' | null>(null);
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;
    
    await signIn(email, password, userType);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-white to-credit-50">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(179, 211, 255, 0.15) 0%, rgba(179, 211, 255, 0) 70%)'
        }}
      />
      
      <div className="w-full max-w-md">
        {userType ? (
          <div className="animate-fade-in">
            <button
              onClick={() => setUserType(null)}
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Indietro
            </button>
            
            <AnimatedCard className="w-full">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">
                  Accedi come {userType === 'client' ? 'Cliente' : 'Broker'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Inserisci le tue credenziali per continuare
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder={userType === 'client' ? "cliente@example.com" : "broker@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockKeyhole className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="text-right mt-1">
                    <a href="#" className="text-sm text-primary hover:text-primary/80">
                      Password dimenticata?
                    </a>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                      Accesso in corso...
                    </>
                  ) : (
                    <>
                      Accedi
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
              
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Per {userType === 'client' ? 'clienti' : 'broker'} di test, usa:
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Email: {userType === 'client' ? 'cliente@example.com' : 'broker@example.com'} / Password: password
                </p>
              </div>
            </AnimatedCard>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-credit-800 to-credit-600 bg-clip-text text-transparent">
                Credit Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Seleziona il tipo di account per accedere
              </p>
            </div>
            
            <AnimatedCard 
              className="p-6 hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => setUserType('client')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium">Cliente</h2>
                    <p className="text-muted-foreground text-sm">Accedi come cliente per gestire i tuoi documenti</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </AnimatedCard>
            
            <AnimatedCard 
              className="p-6 hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => setUserType('broker')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-credit-100 flex items-center justify-center text-credit-600">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="h-6 w-6"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium">Broker</h2>
                    <p className="text-muted-foreground text-sm">Accedi come broker per gestire i profili dei clienti</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </AnimatedCard>
            
            <div className="text-center mt-6 text-sm text-muted-foreground">
              <p>
                Non hai un account?{' '}
                <a href="#" className="text-primary hover:text-primary/80 font-medium">
                  Contattaci per registrarti
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
