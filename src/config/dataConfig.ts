/**
 * Configurazione per l'uso dei dati
 * 
 * Ora usa sempre dati reali da Supabase
 */

export const DATA_CONFIG = {
  // Forza sempre l'uso di dati reali
  USE_REAL_DATA: true,
  
  // Configurazione debug
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // Configurazione cache
  CACHE_ENABLED: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minuti
} as const;

/**
 * Log delle operazioni sui dati
 */
export function logDataOperation(operation: string, data?: any) {
  if (DATA_CONFIG.DEBUG_MODE) {
    console.log(`📊 [REAL] ${operation}`, data);
  }
}

/**
 * Log degli errori
 */
export function logDataError(operation: string, error: any) {
  console.error(`❌ [REAL] Errore in ${operation}:`, error);
}

/**
 * Verifica se usare dati reali (sempre true ora)
 */
export function shouldUseRealData(): boolean {
  return DATA_CONFIG.USE_REAL_DATA;
}
