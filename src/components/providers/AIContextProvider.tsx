import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { AIContext } from '@/services/ai';

interface AIContextProviderProps {
  children: ReactNode;
}

interface AIContextValue {
  context: AIContext;
  setContext: (updates: Partial<AIContext>) => void;
  clearContext: () => void;
  hasContext: boolean;
}

const AIContextContext = createContext<AIContextValue | undefined>(undefined);

export const AIContextProvider: React.FC<AIContextProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const getContext = useCallback((): AIContext => {
    const context: AIContext = {
      brokerId: profile?.id || '',
    };

    // Priorità: selezione manuale > URL > null
    if (selectedClientId) {
      context.clientId = selectedClientId;
    } else {
      const clientMatch = location.pathname.match(/\/broker\/clients\/([^\/]+)/);
      if (clientMatch) {
        context.clientId = clientMatch[1];
      }
    }

    if (selectedDocumentIds.length > 0) {
      context.documentIds = selectedDocumentIds;
    } else {
      const documentMatch = location.pathname.match(/\/broker\/documents\/([^\/]+)/);
      if (documentMatch) {
        context.documentIds = [documentMatch[1]];
      }
    }

    if (selectedProfileId) {
      context.profileId = selectedProfileId;
    } else {
      const profileMatch = location.pathname.match(/\/broker\/credit-profiles\/([^\/]+)/);
      if (profileMatch) {
        context.profileId = profileMatch[1];
      }
    }

    console.log('📋 getContext restituisce:', context);
    console.log('📋 Stati interni:', { selectedClientId, selectedDocumentIds, selectedProfileId });
    return context;
  }, [profile?.id, selectedClientId, selectedDocumentIds, selectedProfileId, location.pathname]);

  const setContext = useCallback((updates: Partial<AIContext>) => {
    console.log('🔄 setContext chiamato con:', updates);
    if (updates.clientId !== undefined) {
      console.log('👤 Impostando clientId:', updates.clientId);
      setSelectedClientId(updates.clientId || null);
    }
    if (updates.documentIds !== undefined) {
      console.log('📄 Impostando documentIds:', updates.documentIds);
      setSelectedDocumentIds(updates.documentIds || []);
    }
    if (updates.profileId !== undefined) {
      console.log('📊 Impostando profileId:', updates.profileId);
      setSelectedProfileId(updates.profileId || null);
    }
  }, []);

  const clearContext = useCallback(() => {
    setSelectedClientId(null);
    setSelectedDocumentIds([]);
    setSelectedProfileId(null);
  }, []);

  const hasContext = useCallback(() => {
    const context = getContext();
    return !!(context.clientId || context.documentIds?.length || context.profileId);
  }, [getContext]);

  const value: AIContextValue = {
    context: getContext(),
    setContext,
    clearContext,
    hasContext: hasContext(),
  };

  return (
    <AIContextContext.Provider value={value}>
      {children}
    </AIContextContext.Provider>
  );
};

export const useAIContext = () => {
  const context = useContext(AIContextContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
};
