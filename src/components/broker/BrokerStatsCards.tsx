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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">👥 Clienti Totali</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {stats.totalClients}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
              ✅ {activeClients} attivi
            </Badge>
            {pendingClients > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 font-medium">
                ⏳ {pendingClients} in attesa
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">📊 Credit Profiles</CardTitle>
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {stats.totalProfiles}
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {approvedProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                ✅ {approvedProfiles}
              </Badge>
            )}
            {pendingProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
                ⏳ {pendingProfiles}
              </Badge>
            )}
            {requiresDocumentsProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 font-medium">
                📄 {requiresDocumentsProfiles}
              </Badge>
            )}
            {rejectedProfiles > 0 && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 font-medium">
                ❌ {rejectedProfiles}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">📄 Report Generati</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {stats.totalReports}
          </div>
          <p className="text-xs text-gray-600 mt-2 font-medium">
            📊 {stats.totalProfiles > 0 ? Math.round((stats.totalReports / stats.totalProfiles) * 100) / 100 : 0} report per profilo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerStatsCards; 