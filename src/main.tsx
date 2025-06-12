import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner'
// import { AuthProvider } from './context/AuthContext' // Rimosso AuthProvider
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseProvider } from './components/providers/SupabaseProvider' // Assumiamo che creeremo questo provider

// Definisci qui le tue variabili d'ambiente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env file")
}

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <SupabaseProvider supabase={supabase}>
      <App />
      <Toaster />
    </SupabaseProvider>
  // </React.StrictMode>
)
