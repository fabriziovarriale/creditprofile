import { mockClients } from './broker-data';

export interface Document {
  id: string;
  creditProfileId: string;
  uploadedByUserId: string;
  documentType: string;
  filePath: string | null;
  fileName: string;
  fileSizeKb: number;
  status: 'uploaded' | 'approved' | 'rejected' | 'requires_changes' | 'pending';
  uploadedAt: string;
  // Dati aggiuntivi per la visualizzazione
  clientName: string;
  clientEmail: string;
  creditProfileStatus: string;
}

// Utility per caricare i documenti solo da localStorage
function loadPersistedDocuments() {
  const saved = localStorage.getItem('mockDocuments');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export const mockDocuments: Document[] = loadPersistedDocuments();

// Aggregated document statistics
export const getDocumentStats = () => {
  const totalDocuments = mockDocuments.length;
  
  const documentsByStatus = mockDocuments.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const documentsByType = mockDocuments.reduce((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clientsWithDocuments = new Set(mockDocuments.map(doc => doc.clientEmail)).size;

  return {
    totalDocuments,
    documentsByStatus,
    documentsByType,
    clientsWithDocuments
  };
};

// Get documents by client
export const getDocumentsByClient = () => {
  const groupedByClient = mockDocuments.reduce((acc, doc) => {
    const clientKey = `${doc.clientName}|${doc.clientEmail}`;
    if (!acc[clientKey]) {
      acc[clientKey] = {
        clientName: doc.clientName,
        clientEmail: doc.clientEmail,
        creditProfileStatus: doc.creditProfileStatus,
        documents: []
      };
    }
    acc[clientKey].documents.push(doc);
    return acc;
  }, {} as Record<string, { clientName: string; clientEmail: string; creditProfileStatus: string; documents: Document[] }>);

  return Object.values(groupedByClient);
}; 