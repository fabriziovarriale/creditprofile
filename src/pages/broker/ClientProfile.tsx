
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Download,
  Plus
} from "lucide-react";
import AnimatedCard from '@/components/ui/AnimatedCard';
import StatusBadge from '@/components/ui/StatusBadge';
import DocumentCard, { DocumentProps } from '@/components/ui/DocumentCard';
import { toast } from 'sonner';

// Mock client data
const mockClient = {
  id: '1',
  name: 'Marco Rossi',
  email: 'marco.rossi@example.com',
  phone: '+39 345 1234567',
  address: 'Via Roma 123, Milano',
  birthDate: '15/04/1985',
  occupation: 'Impiegato',
  income: '€35,000',
  documents: [
    {
      id: 'doc1',
      name: 'Carta d\'identità',
      type: 'PDF',
      size: 1200000,
      uploadDate: new Date(2023, 10, 15),
      status: 'validated',
      comments: 'Documento verificato',
      url: '#'
    },
    {
      id: 'doc2',
      name: 'Busta paga Gennaio 2023',
      type: 'PDF',
      size: 850000,
      uploadDate: new Date(2023, 11, 5),
      status: 'pending',
      url: '#'
    },
    {
      id: 'doc3',
      name: 'Estratto conto bancario',
      type: 'PDF',
      size: 1500000,
      uploadDate: new Date(2023, 11, 10),
      status: 'rejected',
      comments: 'Il documento non è leggibile, si prega di ricaricare una versione più chiara',
      url: '#'
    }
  ],
  creditScore: {
    score: 750,
    maxScore: 850,
    risk: 'Basso',
    paymentHistory: 'Ottima',
    creditUtilization: '20%',
    debtToIncome: '28%',
    recommendations: [
      'Mantenere il basso utilizzo del credito',
      'Continuare con i pagamenti puntuali'
    ]
  }
};

const ClientProfile = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'documents' | 'creditScore'>('overview');
  const [documents, setDocuments] = useState<DocumentProps[]>(mockClient.documents);

  const handleStatusChange = (doc: DocumentProps, newStatus: 'validated' | 'pending' | 'rejected') => {
    const updatedDocs = documents.map(d => 
      d.id === doc.id ? { ...d, status: newStatus } : d
    );
    setDocuments(updatedDocs);
    toast.success(`Stato del documento aggiornato a ${newStatus}`);
  };

  const handleDownload = (doc: DocumentProps) => {
    toast.success(`Download di ${doc.name} iniziato`);
    // In a real app, this would trigger a file download
  };

  const calculateProgressPercentage = () => {
    const totalDocs = documents.length;
    const validatedDocs = documents.filter(d => d.status === 'validated').length;
    return Math.round((validatedDocs / totalDocs) * 100);
  };

  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <Link 
          to="/broker" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold">Profilo Cliente</h1>
        </div>
      </div>

      {/* Client Overview Card */}
      <AnimatedCard className="mb-6 p-6 animate-fade-in animate-delay-100">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-credit-100 flex items-center justify-center text-credit-700 text-3xl font-medium">
              {mockClient.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">{mockClient.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{mockClient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{mockClient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{mockClient.address}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Informazioni Personali</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm text-muted-foreground">Data di nascita</dt>
                <dd className="text-sm font-medium">{mockClient.birthDate}</dd>
                
                <dt className="text-sm text-muted-foreground">Occupazione</dt>
                <dd className="text-sm font-medium">{mockClient.occupation}</dd>
                
                <dt className="text-sm text-muted-foreground">Reddito annuale</dt>
                <dd className="text-sm font-medium">{mockClient.income}</dd>
              </dl>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg">
            <div className="mb-2">
              <p className="text-sm text-center text-muted-foreground">Progressione Pratica</p>
              <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E9ECEF"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * calculateProgressPercentage()) / 100}
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xl font-bold">{calculateProgressPercentage()}%</span>
              </div>
            </div>
            <div className="text-sm text-center">
              <p className="font-medium">
                {calculateProgressPercentage() === 100 
                  ? 'Pratica completata' 
                  : 'Pratica in corso'}
              </p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Tabs Navigation */}
      <div className="flex border-b mb-6 animate-fade-in animate-delay-200">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('overview')}
        >
          Panoramica
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'documents'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('documents')}
        >
          Documenti
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'creditScore'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab('creditScore')}
        >
          Profilo Creditizio
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in animate-delay-300">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedCard>
              <div className="flex flex-col h-full">
                <h3 className="font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Stato Documenti
                </h3>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documenti Caricati</span>
                    <span className="font-medium">{documents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documenti Validati</span>
                    <span className="font-medium">{documents.filter(d => d.status === 'validated').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documenti in Attesa</span>
                    <span className="font-medium">{documents.filter(d => d.status === 'pending').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documenti Rifiutati</span>
                    <span className="font-medium">{documents.filter(d => d.status === 'rejected').length}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTab('documents')}
                  className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Vedi tutti i documenti
                </button>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="flex flex-col h-full">
                <h3 className="font-semibold mb-4 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Profilo Creditizio
                </h3>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Punteggio</span>
                    <span className="font-medium">{mockClient.creditScore.score}/{mockClient.creditScore.maxScore}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-2 rounded-full bg-green-500" 
                      style={{ width: `${(mockClient.creditScore.score / mockClient.creditScore.maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Livello di Rischio</span>
                    <span className="font-medium text-green-600">{mockClient.creditScore.risk}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rapporto Debiti/Reddito</span>
                    <span className="font-medium">{mockClient.creditScore.debtToIncome}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTab('creditScore')}
                  className="mt-4 text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Vedi profilo completo
                </button>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="flex flex-col h-full">
                <h3 className="font-semibold mb-4 flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                  Raccomandazioni
                </h3>
                <div className="space-y-3 flex-1">
                  <ul className="space-y-2">
                    {mockClient.creditScore.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      Il cliente potrebbe beneficiare di una consulenza su come migliorare ulteriormente il proprio profilo creditizio.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}

        {selectedTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Documenti del Cliente</h2>
              <button
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Plus className="mr-2 h-4 w-4" />
                Richiedi Documento
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <div 
                  key={doc.id} 
                  className={`animate-fade-in animate-delay-${index < 5 ? (index + 1) * 100 : 500}`}
                >
                  <DocumentCard 
                    document={doc} 
                    onDownload={handleDownload}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'creditScore' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnimatedCard className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Punteggio Creditizio</h3>
                <div className="space-y-6">
                  <div className="flex justify-center items-center">
                    <div className="relative">
                      <div className="h-48 w-48 rounded-full border-8 border-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold">{mockClient.creditScore.score}</div>
                          <div className="text-sm text-muted-foreground">su {mockClient.creditScore.maxScore}</div>
                        </div>
                      </div>
                      <svg 
                        className="absolute top-0 left-0 h-48 w-48 -rotate-90" 
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke="#4CAF50"
                          strokeWidth="8"
                          strokeDasharray="289"
                          strokeDashoffset={289 - (289 * mockClient.creditScore.score / mockClient.creditScore.maxScore)}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-sm text-green-800 mb-1">Livello di Rischio</div>
                      <div className="text-lg font-semibold text-green-900">{mockClient.creditScore.risk}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-sm text-blue-800 mb-1">Storico Pagamenti</div>
                      <div className="text-lg font-semibold text-blue-900">{mockClient.creditScore.paymentHistory}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-sm text-purple-800 mb-1">Utilizzo Credito</div>
                      <div className="text-lg font-semibold text-purple-900">{mockClient.creditScore.creditUtilization}</div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
              
              <AnimatedCard>
                <h3 className="text-lg font-semibold mb-4">Raccomandazioni</h3>
                <div className="space-y-4">
                  {mockClient.creditScore.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800">{rec}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Il profilo creditizio complessivo è solido e supporta una richiesta di mutuo.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
            
            <AnimatedCard>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Rapporto Profilo Creditizio</h3>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica Report Completo
                </button>
              </div>
              <p className="text-muted-foreground mb-4">
                Questo report include un'analisi dettagliata del profilo creditizio del cliente, inclusi i fattori che influenzano il punteggio e le raccomandazioni per migliorarlo.
              </p>
              <div className="p-4 border rounded-md bg-gray-50">
                <p className="text-center text-muted-foreground">
                  [Placeholder per il report dettagliato]
                </p>
              </div>
            </AnimatedCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
