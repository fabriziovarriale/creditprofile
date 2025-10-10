export const checkAIConfig = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ VITE_OPENAI_API_KEY non configurata');
    return false;
  }
  
  if (apiKey.startsWith('gsk_')) {
    console.log('🚀 Configurazione Groq OK (gratuito)');
    return true;
  }
  
  console.error('❌ VITE_OPENAI_API_KEY formato non valido (deve iniziare con gsk_)');
  return false;
};

export const getAIConfig = () => {
  return {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    isConfigured: checkAIConfig()
  };
};
