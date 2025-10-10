import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  FileText, 
  Lightbulb,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { aiService, AIMessage, Citation, SuggestedAction, AIContext } from '@/services/ai';
import { cn } from '@/lib/utils';
import { AIConfigStatus } from '@/components/broker/AIConfigStatus';
import { useAuth } from '@/components/providers/SupabaseProvider';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { profile: brokerProfile } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  const [showConfig, setShowConfig] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Messaggio di benvenuto iniziale
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        role: 'assistant',
        content: `👋 Ciao! Sono **Alessandro**, il tuo assistente AI specializzato in analisi creditizia e gestione profili clienti.

🎯 **La mia expertise:**
• 📊 Analisi dati in tempo reale della tua piattaforma
• 📋 Valutazione stato documenti e profili credito  
• 🔍 Identificazione priorità e azioni urgenti
• 💡 Suggerimenti operativi personalizzati
• ⚠️ Alert su rischi e anomalie

💬 **Prova a chiedermi:**
• *"Qual è lo stato attuale dei miei clienti?"*
• *"Analizza i credit score dei miei clienti"*
• *"Chi ha protesti o procedure concorsuali?"*
• *"Clienti ad alto rischio che richiedono attenzione"*
• *"Raccomandazioni per approvazioni creditizie"*
• *"Documenti in attesa di validazione"*
• *"Alert di rischio da verificare subito"*

🚀 **Sono collegato ai tuoi dati reali** - le mie risposte si basano sulle informazioni aggiornate della piattaforma!

Come posso aiutarti oggi? 🤝`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Auto-scroll alla fine
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollToBottom = () => {
        const element = scrollAreaRef.current!;
        element.scrollTop = element.scrollHeight;
      };
      
      // Scroll immediato
      scrollToBottom();
      
      // Scroll dopo un breve delay per assicurarsi che il contenuto sia renderizzato
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 150);
    }
  }, [messages, streamingMessage]);

  // Focus sull'input quando si apre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);



  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Prepara il contesto del broker
      const aiContext: AIContext = {
        brokerId: brokerProfile?.id || ''
      };

      const response = await aiService.chat(
        [...messages, userMessage],
        aiContext,
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        }
      );

      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Errore nella chat:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const handleSuggestedAction = async (type: string) => {
    setIsLoading(true);
    setStreamingMessage('');

    try {
      let response: string;
      
      switch (type) {
        case 'analyze_document':
          response = 'Per analizzare un documento specifico, chiedimi direttamente. Ad esempio: "Analizza il documento di Mario Rossi"';
          break;
        case 'generate_report':
          response = 'Per generare un report specifico, chiedimi direttamente. Ad esempio: "Genera un report per Elena Frolla"';
          break;
        default:
          response = 'Azione non riconosciuta.';
      }

      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Errore nell\'azione suggerita:', error);
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Errore nell\'esecuzione dell\'azione. Riprova.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseChat = () => {
    if (messages.length > 1) { // Se ci sono messaggi oltre quello di benvenuto
      setShowConfirmClose(true);
    } else {
      // Se non ci sono messaggi, chiudi direttamente
      onClose();
    }
  };

  const confirmCloseChat = () => {
    setMessages([]); // Azzera la cronologia
    setInputValue(''); // Azzera l'input
    setShowConfirmClose(false);
    onClose();
  };

  const cancelCloseChat = () => {
    setShowConfirmClose(false);
  };



  return (
    <div className={cn(
      "fixed inset-y-0 right-0 z-50 w-96 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle className="text-lg">Assistente AI</CardTitle>
            <div className="text-xs text-green-500 flex items-center space-x-1">
              <span>✅</span>
              <span>Pronto per le tue domande</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="h-8 w-8 p-0"
            title="Configurazione AI"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseChat}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <AIConfigStatus />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div className={cn(
                "flex items-start space-x-2",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-900"
                )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Citations */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium text-gray-500">Citazioni:</div>
                      {message.citations.map((citation, idx) => (
                        <div key={idx} className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                          <div className="font-medium">{citation.documentName}</div>
                          {citation.page && <div>Pagina: {citation.page}</div>}
                          <div className="text-gray-600 mt-1">{citation.excerpt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Suggested Actions */}
              {message.suggestedActions && message.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.suggestedActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs"
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {action.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {isLoading && streamingMessage && (
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                <div className="whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="animate-pulse">▋</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingMessage && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}


        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal di conferma chiusura */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Chiudi Chat</h3>
            <p className="text-gray-600 mb-6">
              Sei sicuro di voler chiudere la chat? La cronologia verrà azzerata.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelCloseChat}
              >
                Annulla
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCloseChat}
              >
                Chiudi e Azzera
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
