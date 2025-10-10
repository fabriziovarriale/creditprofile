import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Bot } from 'lucide-react';
import { getAIConfig } from '@/utils/aiConfig';
import { aiService } from '@/services/ai';

export const AIConfigStatus: React.FC = () => {
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    apiKey: string;
  } | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const config = getAIConfig();
    setConfigStatus(config);
  }, []);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const testMessage = {
        role: 'user' as const,
        content: 'Ciao! Puoi confermare che la connessione funziona?',
        timestamp: new Date()
      };

      const response = await aiService.chat(
        [testMessage],
        { brokerId: 'test' },
        (chunk) => {
          // Streaming test
        }
      );

      setTestResult({
        success: true,
        message: 'Connessione Groq funzionante! ✅'
      });
    } catch (error) {
      console.error('Test connessione fallito:', error);
      setTestResult({
        success: false,
        message: `Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!configStatus) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Stato Configurazione AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>Caricamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Stato Configurazione AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status API Key */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Key OpenAI:</span>
          <div className="flex items-center space-x-2">
            {configStatus.isConfigured ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  Groq (Gratuito)
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <Badge variant="destructive">
                  Non Configurata
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* API Key Preview */}
        {configStatus.apiKey && (
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            <span className="font-mono">
              {configStatus.apiKey.substring(0, 4)}...{configStatus.apiKey.substring(configStatus.apiKey.length - 3)}
            </span>
          </div>
        )}

        {/* Test Connection */}
        <div className="space-y-2">
          <Button
            onClick={testConnection}
            disabled={!configStatus.isConfigured || isTesting}
            className="w-full"
            size="sm"
          >
            {isTesting ? 'Testando...' : 'Testa Connessione'}
          </Button>

          {testResult && (
            <div className={`text-sm p-2 rounded ${
              testResult.success 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Instructions */}
        {!configStatus.isConfigured && (
          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
            <strong>Per configurare:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Crea un file <code>.env</code> nella root del progetto</li>
              <li>Aggiungi una delle seguenti opzioni:</li>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li><code>VITE_OPENAI_API_KEY=gsk-tuo_token_groq</code> (Groq - gratuito)</li>
              </ul>
              <li>Riavvia il server di sviluppo</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
