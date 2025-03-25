
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, FileText, ArrowRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import AnimatedCard from '@/components/ui/AnimatedCard';

const Index = () => {
  const { user, userType } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FileText className="h-6 w-6 text-credit-600" />,
      title: "Gestione Documenti",
      description: "Carica, organizza e controlla lo stato dei documenti in modo semplice e sicuro."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-credit-600" />,
      title: "Validazione Assistita",
      description: "Processo di validazione guidato con feedback in tempo reale."
    },
    {
      icon: <Lock className="h-6 w-6 text-credit-600" />,
      title: "Sicurezza Avanzata",
      description: "I tuoi dati sono protetti con i più elevati standard di sicurezza del settore."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-6 px-4 md:px-6 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-credit-800 to-credit-600 bg-clip-text text-transparent">
              Credit Profile
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to={userType === 'client' ? '/client' : '/broker'}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32 pb-20 overflow-hidden bg-gradient-to-b from-white to-credit-50">
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(179, 211, 255, 0.2) 0%, rgba(179, 211, 255, 0) 50%)'
            }}
          />
          
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4 lg:order-1 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl text-balance">
                    Semplifica il processo di <span className="text-primary">credito</span> per i tuoi clienti
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl text-balance">
                    Una piattaforma dedicata ai broker del credito per raccogliere, analizzare e presentare le opportunità di mutuo per i clienti.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={user ? (userType === 'client' ? '/client' : '/broker') : '/login'}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {user ? 'Vai alla Dashboard' : 'Inizia Ora'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div 
                className="flex justify-center lg:justify-end animate-fade-in animate-delay-200"
                style={{
                  transform: `translateY(${scrollY * 0.1}px)`,
                }}
              >
                <div className="relative mx-auto w-full max-w-[450px]">
                  <div className="absolute top-0 -right-5 h-72 w-72 bg-credit-200 rounded-full opacity-40 blur-3xl -z-10" />
                  <AnimatedCard className="relative z-10 overflow-hidden p-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Richiesta Mutuo</h3>
                        <div className="h-2 bg-green-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full w-[75%]" />
                        </div>
                        <p className="text-sm text-muted-foreground">Completato: 75%</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Documenti di identità</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Buste paga</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          <span className="text-sm">Documenti proprietà</span>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Caratteristiche Principali</h2>
              <p className="mt-4 text-muted-foreground">
                Una suite completa di strumenti progettati per semplificare il processo creditizio.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <AnimatedCard 
                  key={index} 
                  className="h-full p-6"
                >
                  <div className="h-12 w-12 rounded-lg bg-credit-100 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-credit-900 text-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Pronto a migliorare il tuo processo di gestione del credito?
              </h2>
              <p className="mb-8 text-credit-100">
                Unisciti agli altri broker che hanno già semplificato il loro flusso di lavoro.
              </p>
              <Link
                to={user ? (userType === 'client' ? '/client' : '/broker') : '/login'}
                className="inline-flex h-11 items-center justify-center rounded-md bg-white text-credit-900 px-8 py-2 text-md font-medium shadow transition-colors hover:bg-credit-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {user ? 'Vai alla Dashboard' : 'Inizia Ora'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-4">Credit Profile</h3>
              <p className="text-muted-foreground">
                Semplifichiamo il processo creditizio per broker e clienti.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Piattaforma</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                      Accedi
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Informazioni</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      Termini di Servizio
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Credit Profile. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
