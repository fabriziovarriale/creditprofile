
import React from 'react';
import StatsOverview from '@/components/dashboard/StatsOverview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Panoramica delle attività recenti.</p>
        </div>
        <Button 
          className="bg-accent hover:bg-accent/90"
          onClick={() => navigate('/client/upload')}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Nuovo Cliente
        </Button>
      </div>
      
      <StatsOverview />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attività Recenti</CardTitle>
            <CardDescription>Le ultime 5 attività sul sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {i % 2 === 0 ? 'Documento caricato' : 'Documento validato'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`${i} ${i === 1 ? 'ora' : 'ore'} fa`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documenti da Validare</CardTitle>
            <CardDescription>Documenti in attesa di verifica.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {`Documento ID${i}0${i}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`Cliente ${i}0${i}`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Valida
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profili da Completare</CardTitle>
            <CardDescription>Clienti con profili incompleti.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-destructive rounded-full mr-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {`Cliente ${i}0${i}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`Mancano ${i} documenti`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Gestisci
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
