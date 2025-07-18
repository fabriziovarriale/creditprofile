import React, { createContext, useContext, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { PlusCircle, Eye, Download, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DemoReportModal from '@/components/demo/DemoReportModal';

// Context per credit profiles
const CreditProfilesContext = createContext<{
  profiles: any[];
  addProfile: (profile: any) => void;
  setProfiles: React.Dispatch<React.SetStateAction<any[]>>;
}>({ profiles: [], addProfile: () => {}, setProfiles: () => {} });

export const useCreditProfiles = () => useContext(CreditProfilesContext);

const initialMockCreditProfiles = [
  {
    id: 'CP-001',
    clientName: 'Marco Rossi',
    createdAt: '2024-06-01',
    score: 720,
    partnerBanks: ['Banca Intesa', 'Unicredit'],
  },
  {
    id: 'CP-002',
    clientName: 'Anna Verdi',
    createdAt: '2024-06-02',
    score: 680,
    partnerBanks: ['BPER', 'Banca Sella'],
  },
];

export const CreditProfilesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('creditProfiles');
    return saved ? JSON.parse(saved) : initialMockCreditProfiles;
  });
  const addProfile = (profile: any) => setProfiles(prev => [...prev, profile]);
  React.useEffect(() => {
    localStorage.setItem('creditProfiles', JSON.stringify(profiles));
  }, [profiles]);
  return (
    <CreditProfilesContext.Provider value={{ profiles, addProfile, setProfiles }}>
      {children}
    </CreditProfilesContext.Provider>
  );
};

const CreditProfilesPage = () => {
  const { profiles, setProfiles } = useCreditProfiles();
  const [previewProfile, setPreviewProfile] = React.useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<any | null>(null);

  const handlePreview = (profile: any) => {
    setPreviewProfile(profile);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewProfile(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credit Profiles</h1>
          <p className="text-lg text-muted-foreground">Gestisci i credit profile creati per i clienti</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/broker/credit-profiles/nuovo">
            <PlusCircle className="h-5 w-5" /> Nuovo Credit Profile
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista Credit Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Creato il</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Banche Consigliate</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(profile => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.id}</TableCell>
                  <TableCell>{profile.clientName}</TableCell>
                  <TableCell>{profile.createdAt}</TableCell>
                  <TableCell>{profile.score}</TableCell>
                  <TableCell>{profile.partnerBanks?.join(', ')}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePreview(profile)}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setProfileToDelete(profile)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isModalOpen && previewProfile && (
        <DemoReportModal isOpen={isModalOpen} onClose={handleCloseModal} profile={previewProfile} />
      )}
      {/* Modale di conferma eliminazione */}
      {profileToDelete && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="mb-4 text-lg font-semibold">Conferma eliminazione</div>
            <div className="mb-6 text-sm text-muted-foreground">Sei sicuro di voler eliminare questo credit profile? L'operazione non è reversibile.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProfileToDelete(null)}>Annulla</Button>
              <Button variant="destructive" onClick={() => {
                const newProfiles = profiles.filter((p: any) => p.id !== profileToDelete.id);
                setProfiles(newProfiles);
                localStorage.setItem('creditProfiles', JSON.stringify(newProfiles));
                setProfileToDelete(null);
              }}>Elimina</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditProfilesPage; 