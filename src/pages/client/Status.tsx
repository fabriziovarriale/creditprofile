import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const ClientStatus = () => {
  // Mock data
  const steps = [
    { id: 1, name: 'Documenti Caricati', status: 'completed' },
    { id: 2, name: 'Verifica Documenti', status: 'in-progress' },
    { id: 3, name: 'Valutazione', status: 'pending' },
    { id: 4, name: 'Approvazione', status: 'pending' },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Stato della Pratica</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Avanzamento Pratica</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={45} className="h-2 mb-4" />
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-4">
                {step.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {step.status === 'in-progress' && (
                  <Clock className="h-5 w-5 text-blue-500" />
                )}
                {step.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <div>
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.status === 'completed' && 'Completato'}
                    {step.status === 'in-progress' && 'In Corso'}
                    {step.status === 'pending' && 'In Attesa'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStatus; 