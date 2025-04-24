import React, { createContext, useContext, useState } from 'react';

interface Document {
  id: string;
  name: string;
  client: string;
  clientId: string;
  type: string;
  status: 'validated' | 'pending' | 'rejected';
  uploadDate: string;
  size: string;
}

// Mock data iniziale
const initialDocuments = [
  // Documenti di Marco Rossi (ID: 1)
  {
    id: 'd1',
    name: 'Busta paga Gennaio 2024.pdf',
    client: 'Marco Rossi',
    clientId: '1',
    type: 'Busta Paga',
    status: 'validated',
    uploadDate: '2024-02-15',
    size: '1.2 MB',
  },
  {
    id: 'd2',
    name: 'Documento identità.pdf',
    client: 'Marco Rossi',
    clientId: '1',
    type: 'Documento Identità',
    status: 'validated',
    uploadDate: '2024-02-14',
    size: '850 KB',
  },
  {
    id: 'd3',
    name: 'Estratto conto Q4 2023.pdf',
    client: 'Marco Rossi',
    clientId: '1',
    type: 'Estratto Conto',
    status: 'pending',
    uploadDate: '2024-02-13',
    size: '2.1 MB',
  },

  // Documenti di Laura Bianchi (ID: 2)
  {
    id: 'd4',
    name: 'Contratto di lavoro.pdf',
    client: 'Laura Bianchi',
    clientId: '2',
    type: 'Contratto',
    status: 'validated',
    uploadDate: '2024-02-12',
    size: '1.5 MB',
  },
  {
    id: 'd5',
    name: 'CUD 2023.pdf',
    client: 'Laura Bianchi',
    clientId: '2',
    type: 'CUD',
    status: 'pending',
    uploadDate: '2024-02-11',
    size: '1.8 MB',
  },
  {
    id: 'd6',
    name: 'Visura catastale.pdf',
    client: 'Laura Bianchi',
    clientId: '2',
    type: 'Visura',
    status: 'rejected',
    uploadDate: '2024-02-10',
    size: '3.2 MB',
  },

  // Documenti di Giuseppe Verdi
  {
    id: 'd7',
    name: 'Dichiarazione redditi 2023.pdf',
    client: 'Giuseppe Verdi',
    clientId: '3',
    type: 'Dichiarazione Redditi',
    status: 'validated',
    uploadDate: '2024-02-09',
    size: '4.1 MB',
  },
  {
    id: 'd8',
    name: 'Busta paga Dicembre 2023.pdf',
    client: 'Giuseppe Verdi',
    clientId: '3',
    type: 'Busta Paga',
    status: 'validated',
    uploadDate: '2024-02-08',
    size: '1.1 MB',
  },
  {
    id: 'd9',
    name: 'Certificato residenza.pdf',
    client: 'Giuseppe Verdi',
    clientId: '3',
    type: 'Certificato',
    status: 'pending',
    uploadDate: '2024-02-07',
    size: '900 KB',
  },

  // Documenti di Sofia Romano
  {
    id: 'd10',
    name: 'Contratto affitto.pdf',
    client: 'Sofia Romano',
    clientId: '4',
    type: 'Contratto',
    status: 'validated',
    uploadDate: '2024-02-06',
    size: '2.3 MB',
  },
  {
    id: 'd11',
    name: 'Estratto conto Q1 2024.pdf',
    client: 'Sofia Romano',
    clientId: '4',
    type: 'Estratto Conto',
    status: 'pending',
    uploadDate: '2024-02-05',
    size: '1.9 MB',
  },
  {
    id: 'd12',
    name: 'Documento identità.pdf',
    client: 'Sofia Romano',
    clientId: '4',
    type: 'Documento Identità',
    status: 'rejected',
    uploadDate: '2024-02-04',
    size: '750 KB',
  },

  // Documenti di Luca Ferrari
  {
    id: 'd13',
    name: 'Busta paga Gennaio 2024.pdf',
    client: 'Luca Ferrari',
    clientId: '5',
    type: 'Busta Paga',
    status: 'validated',
    uploadDate: '2024-02-03',
    size: '1.3 MB',
  },
  {
    id: 'd14',
    name: 'Certificato matrimonio.pdf',
    client: 'Luca Ferrari',
    clientId: '5',
    type: 'Certificato',
    status: 'pending',
    uploadDate: '2024-02-02',
    size: '1.0 MB',
  },
  {
    id: 'd15',
    name: 'Planimetria casa.pdf',
    client: 'Luca Ferrari',
    clientId: '5',
    type: 'Planimetria',
    status: 'pending',
    uploadDate: '2024-02-01',
    size: '5.2 MB',
  }
];

interface DocumentsContextType {
  documents: Document[];
  updateDocumentStatus: (docId: string, newStatus: 'validated' | 'pending' | 'rejected') => void;
  getDocumentById: (id: string) => Document | undefined;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const updateDocumentStatus = (docId: string, newStatus: 'validated' | 'pending' | 'rejected') => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId ? { ...doc, status: newStatus } : doc
      )
    );
  };

  const getDocumentById = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  return (
    <DocumentsContext.Provider value={{ documents, updateDocumentStatus, getDocumentById }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
} 