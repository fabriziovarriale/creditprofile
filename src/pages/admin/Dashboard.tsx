import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart3, Users, FileText, Settings, LifeBuoy, Loader2 } from "lucide-react";

interface UserDashboardItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'broker' | 'client' | 'admin';
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

const AdminDashboard = () => {
  const { profile: adminUser, loading: authLoading, supabase, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserDashboardItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !supabase || !isAuthenticated) {
        if(!authLoading) setLoadingData(false);
        return;
      }
      setLoadingData(true);
      setError(null);

      try {
        const usersRes = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (usersRes.error) throw usersRes.error;
        setUsers(usersRes.data as UserDashboardItem[] || []);

      } catch (err: any) {
        console.error("Errore nel fetch dei dati della dashboard:", err);
        setError("Impossibile caricare parte dei dati della dashboard."); 
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [authLoading, supabase, isAuthenticated]);

  if (authLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6 text-white flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" /> Caricamento sessione...
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated || !adminUser) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6 text-red-500 flex-1 flex items-center justify-center">
          Accesso negato o sessione non valida. Effettua il login.
        </div>
      </DashboardLayout>
    );
  }

  if (loadingData) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6 text-white flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" /> Caricamento dashboard...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6 text-red-500 flex-1 flex items-center justify-center">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      pending: "secondary",
      inactive: "destructive"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status === "active" ? "Attivo" : 
         status === "pending" ? "In Attesa" : "Inattivo"}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "default",
      broker: "secondary",
      client: "outline"
    } as const

    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {role === "admin" ? "Amministratore" : 
         role === "broker" ? "Broker" : "Cliente"}
      </Badge>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-8 space-y-8">
        {/* Header con statistiche */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +5 rispetto al mese scorso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === "broker").length}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 rispetto al mese scorso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clienti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === "client").length}
              </div>
              <p className="text-xs text-muted-foreground">
                +3 rispetto al mese scorso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtri e ricerca */}
        <Card>
          <CardHeader>
            <CardTitle>Gestione Utenti</CardTitle>
            <CardDescription>
              Cerca e filtra gli utenti del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Cerca</Label>
                <Input
                  id="search"
                  placeholder="Cerca per nome o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-[200px]">
                <Label htmlFor="role">Ruolo</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    <SelectItem value="admin">Amministratori</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="client">Clienti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => navigate('/admin/users/new')}>Nuovo Utente</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabella utenti */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data Registrazione</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>
                            {(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        {`${user.first_name} ${user.last_name}`}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        Modifica
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive"
                      >
                        Elimina
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard; 