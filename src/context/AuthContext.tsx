import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Definizione dei tipi
// Potresti voler rimuovere la tua interfaccia User locale o adattarla
// all'oggetto User restituito da Supabase. Per ora la lascio commentata.
// type UserRole = 'broker' | 'client';
// interface User {
//   id: string;
//   name: string; // Potresti doverlo prendere da user_metadata
//   email: string;
//   role: UserRole; // Il ruolo potrebbe non venire direttamente da Supabase Auth
// }

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Rimuovi impersonificazione se non più necessaria con Supabase reale
  // impersonateClient: (clientId: string) => Promise<void>;
  // isImpersonating: boolean;
  // originalUser: SupabaseUser | null;
  // stopImpersonating: () => void;
  isAuthenticated: boolean;
}

// Rimuovi gli account di test e i mock client se usi Supabase
// const TEST_ACCOUNTS = { ... };
// const mockClients = [ ... ];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Rimuovi stati di impersonificazione se non li usi più
  // const [isImpersonating, setIsImpersonating] = useState(false);
  // const [originalUser, setOriginalUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Session e Listener onAuthStateChange (INVARIATI - Già corretti per Supabase)
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth Event:", event, session);
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);

        if (event !== 'INITIAL_SESSION') {
            setLoading(false);
        }

        if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to /");
          navigate('/');
        } else if (event === 'SIGNED_IN') {
           console.log("User signed in, redirecting to /broker/dashboard");
           navigate('/broker/dashboard');
        } else if (event === 'INITIAL_SESSION') {
           if (loading) {
               setLoading(false);
           }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, loading]);

  // --- NUOVA FUNZIONE LOGIN CON SUPABASE ---
  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Errore Login Supabase:", error);
      toast.error("Credenziali non valide: " + error.message);
      setLoading(false);
      throw new Error(error.message);
    }

    if (data.session && data.user) {
       console.log("Login Supabase riuscito:", data.user.email);
       toast.success("Login effettuato con successo!");
    } else {
        setLoading(false);
        toast.error("Errore imprevisto durante il login.");
        throw new Error("Login non riuscito per un motivo sconosciuto.");
    }
  };
  // --- FINE NUOVA FUNZIONE LOGIN ---

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Errore durante il logout: " + error.message);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
