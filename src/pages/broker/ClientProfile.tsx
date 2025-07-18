
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  User, 
  Home, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import DocumentCard from "@/components/ui/DocumentCard";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Define the type for status to match StatusBadge component
type StatusType = 'pending' | 'validated' | 'rejected';

// Define the document type to match DocumentCard requirements
interface DocumentProps {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: StatusType;
  url: string;
  comments?: string;
}

const ClientProfile = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock client data
  const client = {
    id: clientId || "1",
    name: "Marco Rossi",
    email: "marco.rossi@example.com",
    phone: "+39 123 456 7890",
    address: "Via Roma 123, Milano",
    occupation: "Impiegato",
    employer: "Azienda SRL",
    yearlyIncome: "€48,000",
    birthDate: "15/05/1985",
    creditScore: 720,
    documents: 8,
    validatedDocuments: 5,
    pendingDocuments: 2,
    rejectedDocuments: 1,
    lastActivity: "10/11/2023",
    notes: "Cliente interessato a mutuo per prima casa. Ha già un prestito auto in corso."
  };

  // Mock documents
  const documents: DocumentProps[] = [
    {
      id: "1",
      name: "Carta di identità.pdf",
      type: "PDF",
      size: 1240000,
      uploadDate: new Date(2023, 10, 10),
      status: "validated",
      url: "#",
    },
    {
      id: "2",
      name: "Busta paga settembre.pdf",
      type: "PDF",
      size: 890000,
      uploadDate: new Date(2023, 10, 12),
      status: "validated",
      url: "#",
    },
    {
      id: "3",
      name: "Contratto di lavoro.pdf",
      type: "PDF",
      size: 1450000,
      uploadDate: new Date(2023, 10, 15),
      status: "pending",
      url: "#",
    },
    {
      id: "4",
      name: "Estratto conto.pdf",
      type: "PDF",
      size: 2100000,
      uploadDate: new Date(2023, 10, 18),
      status: "rejected",
      url: "#",
      comments: "Documento non leggibile, si prega di ricaricare"
    },
    {
      id: "5",
      name: "Modello ISEE.pdf",
      type: "PDF",
      size: 1870000,
      uploadDate: new Date(2023, 10, 20),
      status: "validated",
      url: "#",
    }
  ];

  // Mock credit report data
  const creditReport = {
    score: 720,
    maxScore: 950,
    status: "Good",
    factors: [
      "Payment history: Excellent",
      "Credit utilization: Good",
      "Credit age: Average",
      "Recent inquiries: Good"
    ],
    loans: [
      {
        type: "Auto Loan",
        amount: "€15,000",
        remaining: "€8,600",
        status: "In good standing"
      }
    ],
    history: [
      {
        date: "10/2023",
        score: 720
      },
      {
        date: "09/2023",
        score: 715
      },
      {
        date: "08/2023",
        score: 710
      },
      {
        date: "07/2023",
        score: 705
      }
    ]
  };

  const handleDownloadReport = () => {
    toast({
      title: "Rapporto in download",
      description: "Il rapporto completo è in fase di download"
    });
  };

  const handleAddNote = () => {
    toast({
      title: "Nota aggiunta",
      description: "La nota è stata aggiunta con successo"
    });
  };

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground mt-1">ID Cliente: {client.id}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button onClick={handleDownloadReport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Scarica Report
          </Button>
          <Button>Modifica Profilo</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="documents">Documenti</TabsTrigger>
          <TabsTrigger value="credit">Profilo Creditizio</TabsTrigger>
          <TabsTrigger value="notes">Note</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informazioni Personali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                    <dd className="text-sm">{client.name}</dd>
                  </div>
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm">{client.email}</dd>
                  </div>
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Telefono</dt>
                    <dd className="text-sm">{client.phone}</dd>
                  </div>
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Data di nascita</dt>
                    <dd className="text-sm">{client.birthDate}</dd>
                  </div>
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Indirizzo</dt>
                    <dd className="text-sm">{client.address}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Informazioni Lavorative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Occupazione</dt>
                    <dd className="text-sm">{client.occupation}</dd>
                  </div>
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Datore di lavoro</dt>
                    <dd className="text-sm">{client.employer}</dd>
                  </div>
                  <div className="flex flex-row justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">Reddito annuo</dt>
                    <dd className="text-sm">{client.yearlyIncome}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Stato Documenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Documenti totali</span>
                    <span className="font-medium">{client.documents}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Validati: {client.validatedDocuments}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">In attesa: {client.pendingDocuments}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Rifiutati: {client.rejectedDocuments}</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full text-sm" size="sm" onClick={() => setActiveTab("documents")}>
                      Gestisci Documenti
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Punteggio Creditizio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative h-36 w-36">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{typeof creditReport.score === 'number' && !isNaN(creditReport.score) ? creditReport.score : (!isNaN(Number(creditReport.score)) ? Number(creditReport.score) : '-')}</div>
                      <div className="text-sm text-muted-foreground">su {creditReport.maxScore}</div>
                    </div>
                  </div>
                  {/* This would be a circular progress indicator */}
                  <div className="h-full w-full rounded-full border-8 border-primary/30">
                    <div className="h-full w-full rounded-full border-8 border-t-primary border-r-primary border-l-transparent border-b-transparent transform -rotate-45"></div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Stato</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {creditReport.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Fattori principali</h4>
                    <ul className="text-sm space-y-1">
                      {creditReport.factors.map((factor, i) => (
                        <li key={i} className="text-muted-foreground">{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-2">Prestiti attivi</h4>
                  {creditReport.loans.map((loan, i) => (
                    <div key={i} className="border rounded-md p-3 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{loan.type}</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {loan.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">Importo totale:</span>
                        <span>{loan.amount}</span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-muted-foreground">Residuo:</span>
                        <span>{loan.remaining}</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-sm mt-2" size="sm" onClick={() => setActiveTab("credit")}>
                    Visualizza Rapporto Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documenti Recenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Caricato: {doc.uploadDate.toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" className="w-full text-sm" size="sm" onClick={() => setActiveTab("documents")}>
                    Vedi Tutti i Documenti
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documenti del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credit" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Rapporto Creditizio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Punteggio e Storico</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="relative h-48 w-48 mx-auto">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold">{typeof creditReport.score === 'number' && !isNaN(creditReport.score) ? creditReport.score : (!isNaN(Number(creditReport.score)) ? Number(creditReport.score) : '-')}</div>
                            <div className="text-sm text-muted-foreground">su {creditReport.maxScore}</div>
                          </div>
                        </div>
                        {/* This would be a circular progress indicator */}
                        <div className="h-full w-full rounded-full border-12 border-primary/20">
                          <div className="h-full w-full rounded-full border-12 border-t-primary border-r-primary border-l-transparent border-b-transparent transform -rotate-45"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-2">Storico Punteggio</h4>
                      <div className="h-48 bg-muted/20 rounded-md p-4 flex items-end">
                        {/* This would be a chart */}
                        <div className="w-full h-full flex items-end justify-between">
                          {creditReport.history.map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div 
                                className="w-6 bg-primary rounded-t-sm" 
                                style={{
                                  height: `${(item.score / creditReport.maxScore) * 100}%`
                                }}
                              ></div>
                              <span className="text-xs text-muted-foreground">{item.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Fattori che influenzano il punteggio</h3>
                  <div className="space-y-4">
                    {creditReport.factors.map((factor, i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <p>{factor}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Prestiti e Finanziamenti</h3>
                  <div className="space-y-4">
                    {creditReport.loans.map((loan, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{loan.type}</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {loan.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Importo totale</p>
                              <p className="font-medium">{loan.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Importo residuo</p>
                              <p className="font-medium">{loan.remaining}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Scarica Rapporto Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <p className="mb-2">{client.notes}</p>
                  <p className="text-sm text-muted-foreground">Aggiunto il: 10/11/2023</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <textarea 
                    className="min-h-[100px] w-full border rounded-md p-3"
                    placeholder="Aggiungi una nuova nota..."
                  />
                  <div className="self-end">
                    <Button onClick={handleAddNote}>Aggiungi Nota</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfile;
