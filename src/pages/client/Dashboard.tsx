import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  BarChart3,
  Upload,
  FileCheck
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ClientDashboard = () => {
  const { user } = useAuth();

  // Mock data per i documenti
  const documents = [
    { 
      id: '1', 
      name: 'Carta di identità', 
      status: 'validated',
      lastUpdated: new Date(2023, 10, 15)
    },
    { 
      id: '2', 
      name: 'Busta paga', 
      status: 'pending',
      lastUpdated: new Date(2023, 11, 5)
    },
    { 
      id: '3', 
      name: 'Estratto conto', 
      status: 'rejected',
      lastUpdated: new Date(2023, 11, 10),
      message: 'Documento non leggibile, si prega di ricaricare'
    }
  ];

  // Mock data per lo stato della pratica
  const applicationProgress = 65;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard Cliente</h1>
      <p className="text-muted-foreground mb-8">
        Benvenuto, {user?.name}
      </p>

      {/* Stato della pratica */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Stato della Pratica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={applicationProgress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Documenti caricati</span>
                <span>{applicationProgress}% completato</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/client/documents">
                <Upload className="mr-2 h-4 w-4" />
                Carica Documenti
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/client/profile">
                <FileCheck className="mr-2 h-4 w-4" />
                Verifica Profilo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Documenti Recenti */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documenti Recenti</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/client/documents" className="flex items-center">
                Vedi tutti
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Aggiornato il {doc.lastUpdated.toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                {getStatusIcon(doc.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
