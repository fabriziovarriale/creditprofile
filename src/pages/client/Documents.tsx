
import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import AnimatedCard from '@/components/ui/AnimatedCard';
import FileUploader from '@/components/ui/FileUploader';
import DocumentCard, { DocumentProps } from '@/components/ui/DocumentCard';
import StatusBadge, { StatusType } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

// Mock documents data
const MOCK_DOCUMENTS: DocumentProps[] = [
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
  },
  {
    id: 'doc4',
    name: 'Contratto di lavoro',
    type: 'PDF',
    size: 950000,
    uploadDate: new Date(2023, 11, 12),
    status: 'validated',
    url: '#'
  },
  {
    id: 'doc5',
    name: 'Dichiarazione dei redditi',
    type: 'PDF',
    size: 2100000,
    uploadDate: new Date(2023, 11, 18),
    status: 'pending',
    url: '#'
  }
];

const ClientDocuments = () => {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentProps[]>(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleFileSelect = (file: File) => {
    // Create a new document
    const newDocument: DocumentProps = {
      id: `doc${documents.length + 1}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: file.size,
      uploadDate: new Date(),
      status: 'pending',
      url: '#'
    };
    
    setDocuments([newDocument, ...documents]);
    setIsUploadModalOpen(false);
    toast.success('Documento caricato con successo');
  };

  const handleDownload = (doc: DocumentProps) => {
    toast.success(`Download di ${doc.name} iniziato`);
    // In a real app, this would trigger a file download
  };

  const filteredDocuments = documents
    .filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || doc.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? a.uploadDate.getTime() - b.uploadDate.getTime()
          : b.uploadDate.getTime() - a.uploadDate.getTime();
      } else {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

  const toggleSort = (field: 'date' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">I Tuoi Documenti</h1>
          <p className="text-muted-foreground mt-1">Gestisci i documenti per la tua richiesta di mutuo</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="mt-4 md:mt-0 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Carica Documento
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 animate-fade-in animate-delay-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Cerca documenti..."
            className="pl-10 w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusType | 'all')}
              className="h-10 w-full appearance-none rounded-md border border-input bg-white px-3 py-2 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Tutti gli stati</option>
              <option value="validated">Validati</option>
              <option value="pending">In Attesa</option>
              <option value="rejected">Rifiutati</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          </div>
          <button
            onClick={() => toggleSort('date')}
            className={`h-10 px-3 rounded-md border ${sortBy === 'date' ? 'border-primary text-primary' : 'border-input'} hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring inline-flex items-center`}
          >
            Data
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`h-10 px-3 rounded-md border ${sortBy === 'name' ? 'border-primary text-primary' : 'border-input'} hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring inline-flex items-center`}
          >
            Nome
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-200">
          {filteredDocuments.map((doc, index) => (
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
      ) : (
        <AnimatedCard className="text-center py-12 animate-fade-in animate-delay-200">
          <p className="text-muted-foreground">Nessun documento trovato.</p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Carica Documento
          </button>
        </AnimatedCard>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <AnimatedCard className="w-full max-w-md relative animate-fade-in">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Carica un nuovo documento</h2>
            <p className="text-muted-foreground mb-6">
              Seleziona o trascina il documento che desideri caricare.
            </p>
            <FileUploader onFileSelect={handleFileSelect} />
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;
