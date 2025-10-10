import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabaseDataService } from '@/services/supabaseDataService';
import { shouldUseRealData, logDataOperation } from '@/config/dataConfig';
import { supabase } from '@/lib/supabaseClient';

interface VerificationResult {
  config: {
    useRealData: boolean;
    debugMode: boolean;
    supabaseUrl: string;
  };
  connection: {
    status: 'checking' | 'connected' | 'error';
    message: string;
    latency?: number;
  };
  data: {
    users: number;
    creditProfiles: number;
    documents: number;
    totalRecords: number;
  };
  ai: {
    status: 'checking' | 'ready' | 'error';
    message: string;
  };
}

export function RealDataVerifier() {
  const [result, setResult] = useState<VerificationResult>({
    config: {
      useRealData: false,
      debugMode: false,
      supabaseUrl: ''
    },
    connection: {
      status: 'checking',
      message: 'Verificando connessione...'
    },
    data: {
      users: 0,
      creditProfiles: 0,
      documents: 0,
      totalRecords: 0
    },
    ai: {
      status: 'checking',
      message: 'Verificando AI...'
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyRealDataUsage();
  }, []);

  const verifyRealDataUsage = async () => {
    setIsLoading(true);
    
    try {
      // 1. Verifica configurazione
      const config = {
        useRealData: shouldUseRealData(),
        debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Non configurato'
      };

      setResult(prev => ({ ...prev, config }));

      // 2. Test connessione Supabase
      const startTime = Date.now();
      try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        const latency = Date.now() - startTime;
        setResult(prev => ({
          ...prev,
          connection: {
            status: 'connected',
            message: `Connesso a Supabase (${latency}ms)`,
            latency
          }
        }));
      } catch (error) {
        setResult(prev => ({
          ...prev,
          connection: {
            status: 'error',
            message: `Errore connessione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
          }
        }));
      }

      // 3. Conta i dati
      try {
        const [usersResult, profilesResult, documentsResult] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('credit_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('documents').select('*', { count: 'exact', head: true })
        ]);

        const users = usersResult.count || 0;
        const creditProfiles = profilesResult.count || 0;
        const documents = documentsResult.count || 0;

        setResult(prev => ({
          ...prev,
          data: {
            users,
            creditProfiles,
            documents,
            totalRecords: users + creditProfiles + documents
          }
        }));

        logDataOperation('Verifica dati completata', { users, creditProfiles, documents });
      } catch (error) {
        console.error('Errore nel conteggio dati:', error);
      }

      // 4. Verifica AI
      try {
        const platformStats = await supabaseDataService.getPlatformStats();
        
        setResult(prev => ({
          ...prev,
          ai: {
            status: 'ready',
            message: `AI pronta - ${platformStats.totalClients} clienti, ${platformStats.totalDocuments} documenti`
          }
        }));
      } catch (error) {
        setResult(prev => ({
          ...prev,
          ai: {
            status: 'error',
            message: `Errore AI: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
          }
        }));
      }

    } catch (error) {
      console.error('Errore nella verifica:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Verificatore Dati Reali
            {isLoading && <span className="animate-spin">⏳</span>}
          </CardTitle>
          <CardDescription>
            Verifica che l'applicazione stia usando i dati reali di Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configurazione */}
          <div>
            <h3 className="font-semibold mb-2">⚙️ Configurazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Badge variant={result.config.useRealData ? 'default' : 'secondary'}>
                Dati Reali: {result.config.useRealData ? 'ON' : 'OFF'}
              </Badge>
              <Badge variant={result.config.debugMode ? 'default' : 'secondary'}>
                Debug: {result.config.debugMode ? 'ON' : 'OFF'}
              </Badge>
              <Badge variant="outline" className="truncate">
                Supabase: {result.config.supabaseUrl ? 'Configurato' : 'Mancante'}
              </Badge>
            </div>
          </div>

          {/* Connessione */}
          <div>
            <h3 className="font-semibold mb-2">🔌 Connessione Supabase</h3>
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <span>{getStatusIcon(result.connection.status)}</span>
                {result.connection.message}
                {result.connection.latency && (
                  <Badge variant="outline" className="ml-auto">
                    {result.connection.latency}ms
                  </Badge>
                )}
              </AlertDescription>
            </Alert>
          </div>

          {/* Dati */}
          <div>
            <h3 className="font-semibold mb-2">📊 Dati nel Database</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.data.users}</div>
                  <div className="text-sm text-gray-600">Utenti</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{result.data.creditProfiles}</div>
                  <div className="text-sm text-gray-600">Profili Credito</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.data.documents}</div>
                  <div className="text-sm text-gray-600">Documenti</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{result.data.totalRecords}</div>
                  <div className="text-sm text-gray-600">Totale</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI */}
          <div>
            <h3 className="font-semibold mb-2">🤖 Sistema AI</h3>
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <span>{getStatusIcon(result.ai.status)}</span>
                {result.ai.message}
              </AlertDescription>
            </Alert>
          </div>

          {/* Risultato finale */}
          <div className="mt-6 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">🎯 Risultato</h3>
            {result.config.useRealData && result.connection.status === 'connected' ? (
              <div className="text-green-700">
                ✅ <strong>SUCCESSO!</strong> L'applicazione sta usando i dati reali di Supabase.
                {result.data.totalRecords === 0 && (
                  <div className="mt-2 text-amber-700">
                    ⚠️ Il database è vuoto. Inserisci alcuni dati di test per vedere l'AI in azione.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-700">
                ❌ <strong>PROBLEMA!</strong> L'applicazione non sta usando i dati reali.
                <div className="mt-2 text-sm">
                  Verifica la configurazione e la connessione a Supabase.
                </div>
              </div>
            )}
          </div>

          <Button onClick={verifyRealDataUsage} disabled={isLoading} className="w-full">
            {isLoading ? 'Verificando...' : '🔄 Ricarica Verifica'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
