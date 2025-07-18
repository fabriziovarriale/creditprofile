import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dati di esempio
const users = [
  {
    id: 1,
    name: "Mario Rossi",
    email: "mario.rossi@example.com",
    role: "broker",
    status: "active",
    avatar: "MR"
  },
  {
    id: 2,
    name: "Luigi Verdi",
    email: "luigi.verdi@example.com",
    role: "client",
    status: "pending",
    avatar: "LV"
  },
  {
    id: 3,
    name: "Anna Bianchi",
    email: "anna.bianchi@example.com",
    role: "broker",
    status: "inactive",
    avatar: "AB"
  }
]

export function DashboardExample() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      pending: "secondary",
      inactive: "destructive"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
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
              +2 rispetto al mese scorso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Broker Attivi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "broker" && u.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              +1 rispetto al mese scorso
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
              +1 rispetto al mese scorso
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
                  <SelectItem value="broker">Broker</SelectItem>
                  <SelectItem value="client">Clienti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>Aggiungi Utente</Button>
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
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Modifica
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 