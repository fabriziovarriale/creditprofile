import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, CheckCircle, BarChart, LineChart, PieChart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data per il cliente selezionato
const mockClientData = {
  personalInfo: {
    name: "Marco Rossi",
    birthDate: "15/06/1980",
    fiscalCode: "RSSMRC80H15H501U",
    address: "Via Roma 123, Milano",
    phone: "+39 333 1234567",
    email: "marco.rossi@example.com"
  },
  employment: {
    type: "Dipendente a tempo indeterminato",
    employer: "Tech Solutions SpA",
    role: "Senior Developer",
    startDate: "01/03/2015",
    monthlyIncome: 3200
  },
  documents: [
    { name: "Busta paga Gennaio 2024", type: "Busta Paga", status: "validated" },
    { name: "CUD 2023", type: "CUD", status: "validated" },
    { name: "Documento identità", type: "Documento Identità", status: "validated" }
  ],
  creditHistory: {
    score: 750,
    activeLoans: 1,
    monthlyPayments: 450,
    paymentHistory: "Regolare"
  }
};

// Aggiungi questi dati simulati
const mockTrendData = [
  { month: 'Gen', income: 3200, expenses: 1800, savings: 1400 },
  { month: 'Feb', income: 3200, expenses: 1750, savings: 1450 },
  { month: 'Mar', income: 3400, expenses: 1900, savings: 1500 },
  { month: 'Apr', income: 3200, expenses: 1850, savings: 1350 },
  { month: 'Mag', income: 3200, expenses: 1800, savings: 1400 },
  { month: 'Giu', income: 3500, expenses: 1900, savings: 1600 },
];

const mockCreditScoreHistory = [
  { month: 'Gen', score: 720 },
  { month: 'Feb', score: 725 },
  { month: 'Mar', score: 735 },
  { month: 'Apr', score: 740 },
  { month: 'Mag', score: 745 },
  { month: 'Giu', score: 750 },
];

const mockExpenseBreakdown = [
  { category: 'Mutuo', amount: 800, percentage: 44 },
  { category: 'Auto', amount: 350, percentage: 19 },
  { category: 'Utenze', amount: 250, percentage: 14 },
  { category: 'Altro', amount: 400, percentage: 23 },
];

const templates = [
  {
    id: "template1",
    name: "Report Base",
    description: "Report sintetico con informazioni essenziali",
    icon: FileText,
    color: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100",
    preview: (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600">Credit Score</div>
            <div className="text-lg font-semibold">750</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600">Prestiti Attivi</div>
            <div className="text-lg font-semibold">1</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "template2",
    name: "Report Business",
    description: "Report dettagliato con analisi approfondita e grafici",
    icon: BarChart,
    color: "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100",
    preview: (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Distribuzione Entrate</div>
            <div className="h-24 bg-white rounded-lg border p-2 flex items-end gap-1">
              <div className="w-1/4 h-[60%] bg-purple-200 rounded"></div>
              <div className="w-1/4 h-[80%] bg-purple-300 rounded"></div>
              <div className="w-1/4 h-[40%] bg-purple-400 rounded"></div>
              <div className="w-1/4 h-[90%] bg-purple-500 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Analisi Rischio</div>
            <div className="h-24 bg-white rounded-lg border p-4 flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full" 
                     style={{ clipPath: 'inset(0 50% 0 0)' }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  50%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

const ReportPreview = ({ template, data }: { template: string, data: any }) => {
  if (template === "template1") {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        {/* Header */}
        <div className="mb-8 border-b pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Report Base</h2>
              <p className="text-muted-foreground">
                Generato il {new Date().toLocaleDateString('it-IT')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {data.creditHistory.score}
              </div>
              <div className="text-sm text-muted-foreground">Credit Score</div>
            </div>
          </div>
        </div>

        {/* Metriche Principali */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-sky-50 rounded-lg">
            <div className="text-sky-600 text-sm font-medium">Prestiti Attivi</div>
            <div className="text-2xl font-bold">{data.creditHistory.activeLoans}</div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="text-emerald-600 text-sm font-medium">Reddito Mensile</div>
            <div className="text-2xl font-bold">€{data.employment.monthlyIncome}</div>
          </div>
          <div className="p-4 bg-violet-50 rounded-lg">
            <div className="text-violet-600 text-sm font-medium">Rate Mensili</div>
            <div className="text-2xl font-bold">€{data.creditHistory.monthlyPayments}</div>
          </div>
        </div>

        {/* Informazioni Personali */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Informazioni Personali</h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Nome Completo</p>
              <p className="font-medium">{data.personalInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Codice Fiscale</p>
              <p className="font-medium">{data.personalInfo.fiscalCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Indirizzo</p>
              <p className="font-medium">{data.personalInfo.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data di Nascita</p>
              <p className="font-medium">{data.personalInfo.birthDate}</p>
            </div>
          </div>
        </div>

        {/* Situazione Lavorativa */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Situazione Lavorativa</h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Tipo Impiego</p>
              <p className="font-medium">{data.employment.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Azienda</p>
              <p className="font-medium">{data.employment.employer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anzianità Lavorativa</p>
              <p className="font-medium">{data.employment.startDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ruolo</p>
              <p className="font-medium">{data.employment.role}</p>
            </div>
          </div>
        </div>

        {/* Documenti Verificati */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Documenti Verificati</h3>
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            {data.documents.map((doc: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (template === "template2") {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        {/* Header con Credit Score e Trend */}
        <div className="mb-8 border-b pb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Report Business Avanzato</h2>
              <p className="text-muted-foreground">
                Generato il {new Date().toLocaleDateString('it-IT')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {data.creditHistory.score}
              </div>
              <div className="text-sm text-muted-foreground">Credit Score</div>
              <div className="text-xs text-emerald-500 mt-1">↑ +30 punti (6 mesi)</div>
            </div>
          </div>

          {/* Credit Score Trend */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockCreditScoreHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[700, 800]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analisi Finanziaria */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Trend Entrate/Uscite</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#6366f1" name="Entrate" />
                  <Bar dataKey="expenses" fill="#f43f5e" name="Uscite" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Distribuzione Spese</h3>
            <div className="space-y-4">
              {mockExpenseBreakdown.map((expense) => (
                <div key={expense.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{expense.category}</span>
                    <span className="font-medium">€{expense.amount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicatori di Rischio */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Analisi del Rischio</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
              <div className="text-emerald-600 text-sm font-medium">Debt-to-Income Ratio</div>
              <div className="text-2xl font-bold mt-1">14%</div>
              <div className="text-xs text-emerald-500 mt-1">Ottimo</div>
              <Progress value={14} className="h-1 mt-2" />
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Stabilità Lavorativa</div>
              <div className="text-2xl font-bold mt-1">8.5/10</div>
              <div className="text-xs text-blue-500 mt-1">Molto Buona</div>
              <Progress value={85} className="h-1 mt-2" />
            </div>
            <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg">
              <div className="text-violet-600 text-sm font-medium">Capacità di Risparmio</div>
              <div className="text-2xl font-bold mt-1">42%</div>
              <div className="text-xs text-violet-500 mt-1">Eccellente</div>
              <Progress value={42} className="h-1 mt-2" />
            </div>
          </div>
        </div>

        {/* Raccomandazioni */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Raccomandazioni</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Profilo Creditizio</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Il cliente mostra un'ottima gestione del credito con un trend positivo negli ultimi 6 mesi.
                Consigliato per prodotti premium.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Capacità di Rimborso</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Con un DTI del 14% e una capacità di risparmio del 42%, il cliente ha un'eccellente
                capacità di gestire ulteriori impegni finanziari.
              </p>
            </div>
          </div>
        </div>

        {/* Informazioni Personali */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Informazioni Personali</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome Completo</p>
              <p className="font-medium">{data.personalInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Codice Fiscale</p>
              <p className="font-medium">{data.personalInfo.fiscalCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Indirizzo</p>
              <p className="font-medium">{data.personalInfo.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data di Nascita</p>
              <p className="font-medium">{data.personalInfo.birthDate}</p>
            </div>
          </div>
        </div>

        {/* Situazione Lavorativa */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Situazione Lavorativa</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo Impiego</p>
              <p className="font-medium">{data.employment.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Azienda</p>
              <p className="font-medium">{data.employment.employer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reddito Mensile</p>
              <p className="font-medium">€ {data.employment.monthlyIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anzianità Lavorativa</p>
              <p className="font-medium">{data.employment.startDate}</p>
            </div>
          </div>
        </div>

        {/* Profilo Creditizio */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Profilo Creditizio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Credit Score</p>
              <p className="font-medium">{data.creditHistory.score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prestiti Attivi</p>
              <p className="font-medium">{data.creditHistory.activeLoans}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rate Mensili</p>
              <p className="font-medium">€ {data.creditHistory.monthlyPayments}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storico Pagamenti</p>
              <p className="font-medium">{data.creditHistory.paymentHistory}</p>
            </div>
          </div>
        </div>

        {/* Documenti Verificati */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Documenti Verificati</h3>
          <div className="space-y-2">
            {data.documents.map((doc: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{doc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

const BrokerReports = () => {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateReport = () => {
    // Qui andresti a generare effettivamente il PDF
    toast.success("Report generato con successo!");
  };

  const handleDownload = () => {
    // Qui andresti a scaricare effettivamente il PDF
    toast.success("Download del report iniziato");
  };

  return (
    <div className="container px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Report Creditizi</h1>
          <p className="text-muted-foreground mt-1">
            Genera report creditizi per i tuoi clienti
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seleziona Template</CardTitle>
              <CardDescription>
                Scegli il template più adatto alle tue esigenze
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`${template.color} p-4 rounded-lg cursor-pointer transition-all
                    ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start gap-4">
                    <template.icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm">{template.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Seleziona Cliente</CardTitle>
              <CardDescription>
                Scegli il cliente per cui generare il report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Marco Rossi</SelectItem>
                  <SelectItem value="2">Laura Bianchi</SelectItem>
                  <SelectItem value="3">Giuseppe Verdi</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  disabled={!selectedTemplate || !selectedClient}
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Anteprima
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={!selectedTemplate || !selectedClient}
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Anteprima Report</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ReportPreview 
              template={selectedTemplate} 
              data={mockClientData}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerReports; 