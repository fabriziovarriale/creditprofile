interface ClientsStore {
  clients: Client[];
  selectedClient: Client | null;
  documents: Document[];
  reports: Report[];
  actions: {
    addClient: (client: Client) => void;
    uploadDocument: (doc: Document) => void;
    generateReport: (data: ReportData) => void;
  };
} 