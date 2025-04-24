import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

const ClientReports = () => {
  const reports = [
    {
      id: 1,
      name: 'Report Creditizio - Gennaio 2024',
      date: '2024-01-15',
      type: 'Mensile'
    },
    {
      id: 2,
      name: 'Analisi Finanziaria Q4 2023',
      date: '2023-12-31',
      type: 'Trimestrale'
    }
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">I Tuoi Report</h1>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle>{report.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Generato il {new Date(report.date).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-sm font-medium">{report.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Scarica
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientReports; 