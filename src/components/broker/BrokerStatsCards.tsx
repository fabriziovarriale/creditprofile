import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, BarChart3, TrendingUp } from 'lucide-react';

interface BrokerStatsCardsProps {
  stats: {
    totalClients: number;
    totalProfiles: number;
    totalReports: number;
    profilesByStatus: Record<string, number>;
    clientsByStatus: Record<string, number>;
    averageScore: number;
  };
}

const BrokerStatsCards: React.FC<BrokerStatsCardsProps> = ({ stats }) => {
  const approvedProfiles = stats.profilesByStatus.approved || 0;
  const pendingProfiles = stats.profilesByStatus.pending || 0;
  const requiresDocumentsProfiles = stats.profilesByStatus.requires_documents || 0;
  const rejectedProfiles = stats.profilesByStatus.rejected || 0;

  const activeClients = stats.clientsByStatus.active || 0;
  const pendingClients = stats.clientsByStatus.pending || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clienti Totali</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
              {activeClients} attivi
            </Badge>
            {pendingClients > 0 && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                {pendingClients} in attesa
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Profiles</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProfiles}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {approvedProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                {approvedProfiles} approvati
              </Badge>
            )}
            {pendingProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {pendingProfiles} in attesa
              </Badge>
            )}
            {requiresDocumentsProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                {requiresDocumentsProfiles} richiedono doc.
              </Badge>
            )}
            {rejectedProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                {rejectedProfiles} respinti
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Report Generati</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReports}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalProfiles > 0 ? Math.round((stats.totalReports / stats.totalProfiles) * 100) / 100 : 0} report per profilo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerStatsCards; 