/**
 * Configurazione dell'ambiente
 */

export const ENV_CONFIG = {
  // Modalità di sviluppo
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  
  // Configurazione Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Configurazione AI
  AI_PROVIDER: import.meta.env.VITE_AI_PROVIDER || 'ollama',
  AI_API_KEY: import.meta.env.VITE_AI_API_KEY,
  AI_BASE_URL: import.meta.env.VITE_AI_BASE_URL,
  
  // Configurazione debug
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // Configurazione features
  FEATURES: {
    AI_ENABLED: import.meta.env.VITE_AI_ENABLED !== 'false',
    REAL_DATA_ENABLED: true, // Sempre abilitato ora
  },
  
  // Configurazione server
  SERVER: {
    PORT: import.meta.env.VITE_SERVER_PORT || '3000',
    HOST: import.meta.env.VITE_SERVER_HOST || 'localhost',
  }
} as const;

/**
 * Verifica se l'ambiente è configurato correttamente
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verifica Supabase
  if (!ENV_CONFIG.SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL non è configurato');
  }
  
  if (!ENV_CONFIG.SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY non è configurato');
  }
  
  // Verifica AI
  if (!ENV_CONFIG.AI_API_KEY) {
    errors.push('VITE_AI_API_KEY non è configurato');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Ottieni configurazione per ambiente specifico
 */
export function getEnvironmentConfig() {
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    console.warn('⚠️ Configurazione ambiente incompleta:', validation.errors);
  }
  
  return {
    ...ENV_CONFIG,
    validation
  };
}

/**
 * Verifica se siamo in modalità sviluppo
 */
export function isDevelopment(): boolean {
  return ENV_CONFIG.IS_DEV;
}

/**
 * Verifica se siamo in modalità produzione
 */
export function isProduction(): boolean {
  return ENV_CONFIG.IS_PROD;
}

/**
 * Verifica se il debug è abilitato
 */
export function isDebugEnabled(): boolean {
  return ENV_CONFIG.DEBUG_MODE || isDevelopment();
}
