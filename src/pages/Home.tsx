import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Shield, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { profile: user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const role = user.role || 'client';
      console.log(`Home: Utente autenticato come ${role}, reindirizzamento a /${role}/dashboard`);
      navigate(`/${role}/dashboard`);
    }
  }, [user, authLoading, isAuthenticated, navigate]);

  if (authLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  const features = [
    {
      icon: FileText,
      title: "Gestione Documenti",
      description: "Carica, organizza e gestisci tutti i documenti in modo sicuro e centralizzato."
    },
    {
      icon: Users,
      title: "Gestione Profili di Credito",
      description: "Gestisci i profili di credito dei tuoi clienti e monitora lo stato delle pratiche."
    },
    {
      icon: Shield,
      title: "Sicurezza Garantita",
      description: "I tuoi dati sono protetti con le più avanzate tecnologie di sicurezza."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Gestisci le tue pratiche in modo intelligente
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Una piattaforma moderna per la gestione efficiente delle pratiche creditizie
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/auth/login')}>
              Accedi
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth/register')}>
              Registrati
            </Button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Perché scegliere la nostra piattaforma?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card text-card-foreground"
              >
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Inizia oggi</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Unisciti a noi e scopri come la nostra piattaforma può migliorare la tua gestione delle pratiche
          </p>
          <Button size="lg" onClick={() => navigate('/auth/register')}>
            Registrati ora
          </Button>
        </div>
      </div>
    </div>
  );
};

const benefits = [
  {
    title: 'Efficienza',
    description: 'Riduci i tempi di gestione e aumenta la produttività del tuo team'
  },
  {
    title: 'Trasparenza',
    description: 'Monitora ogni fase del processo in modo chiaro e trasparente'
  },
  {
    title: 'Scalabilità',
    description: 'La piattaforma cresce con te, adattandosi alle tue esigenze'
  }
];

export default Home; 