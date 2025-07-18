import { createContext, useContext, useEffect, useState } from 'react'
import type { SupabaseClient, Session, RealtimeChannel, Subscription } from '@supabase/supabase-js'
import type { PropsWithChildren } from 'react'
import type { User as UserProfileType } from '../../types';

type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
  loading: boolean
  userProfile: UserProfileType | null
  loadingProfile: boolean
}

const defaultContextValue: SupabaseContextType = {
  supabase: null as any,
  session: null,
  loading: true,
  userProfile: null,
  loadingProfile: true,
}

const SupabaseContext = createContext<SupabaseContextType>(defaultContextValue)

export const SupabaseProvider = ({
  children,
  supabase: initialSupabaseClient,
}: PropsWithChildren<{ supabase: SupabaseClient }>) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!initialSupabaseClient) {
      console.error("Supabase client non fornito a SupabaseProvider")
      setLoadingSession(false)
      setLoadingProfile(false)
      return
    }

    setLoadingSession(true)
    setLoadingProfile(true)

    initialSupabaseClient.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('SupabaseProvider: Errore nel getSession iniziale:', error.message);
        setSession(null);
        setUserProfile(null);
        setLoadingProfile(false);
        setLoadingSession(false);
        return; 
      }
      setSession(currentSession);

      if (currentSession?.user) {
        console.log("SupabaseProvider (getSession): Tentativo di fetch del profilo per l'utente:", currentSession.user.id, "USANDO .then().catch()");
        setLoadingProfile(true);
        
        initialSupabaseClient
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .maybeSingle<UserProfileType>()
          .then(({ data: profileData, error: profileErrorObj }) => {
            if (profileErrorObj) {
              console.error(`SupabaseProvider (getSession using .then): Errore DB nel fetch del profilo utente iniziale:`, profileErrorObj);
              setUserProfile(null);
            } else if (profileData) {
              console.log(`SupabaseProvider (getSession using .then): Profilo utente iniziale CARICATO:`, profileData);
              setUserProfile(profileData);
            } else {
              console.warn(`SupabaseProvider (getSession using .then): Profilo utente iniziale NON TROVATO (null restituito da maybeSingle).`);
              setUserProfile(null);
            }
          })
          // @ts-ignore
          .catch((e: any) => {
            console.error(`SupabaseProvider (getSession using .then): Eccezione CATTURATA nel fetch del profilo utente iniziale:`, e);
            setUserProfile(null);
          })
          .finally(() => {
            setLoadingProfile(false); 
            console.log("SupabaseProvider (getSession using .then): Fetch profilo completato (finally), loadingProfile false.");
            setLoadingSession(false);
            console.log("SupabaseProvider (getSession): Operazioni getSession (incluso profilo) completate, loadingSession false.");
          });
      } else {
        console.log("SupabaseProvider (getSession): Nessun utente nella sessione, profilo impostato a null.");
        setUserProfile(null);
        setLoadingProfile(false); 
        setLoadingSession(false);
        console.log("SupabaseProvider (getSession): Nessun utente, stati di caricamento impostati a false.");
      }

    }).catch(e => {
        console.error("SupabaseProvider (getSession): Eccezione CATTURATA nella chiamata getSession():", e.message);
        setSession(null);
        setUserProfile(null);
        setLoadingProfile(false);
        setLoadingSession(false);
    });

    const { data: { subscription } } = initialSupabaseClient.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`SupabaseProvider (onAuthStateChange): Evento: ${event}, sessione:`, newSession);
        setLoadingSession(true);
        setSession(newSession);

        if (event === 'SIGNED_OUT') {
          console.log("SupabaseProvider (onAuthStateChange): Utente SIGNED_OUT, profilo impostato a null.");
          setUserProfile(null);
          setLoadingProfile(false);
          setLoadingSession(false);
          return;
        }

        if (newSession?.user) {
          setLoadingProfile(true); 
          console.log(`SupabaseProvider (onAuthStateChange: ${event}): Tentativo di fetch del profilo per l'utente:`, newSession.user.id, "USANDO .then().catch()");
          
          initialSupabaseClient
            .from('users')
            .select('*')
            .eq('id', newSession.user.id)
            .maybeSingle<UserProfileType>()
            .then(({ data: profileData, error: profileErrorObj }) => {
              if (profileErrorObj) {
                console.error(`SupabaseProvider (onAuthStateChange: ${event} using .then): Errore DB nel fetch del profilo utente:`, profileErrorObj);
              } else if (profileData) {
                console.log(`SupabaseProvider (onAuthStateChange: ${event} using .then): Profilo utente CARICATO:`, profileData);
                setUserProfile(profileData);
              } else {
                console.warn(`SupabaseProvider (onAuthStateChange: ${event} using .then): Profilo utente NON TROVATO (null restituito da maybeSingle).`);
                setUserProfile(null); 
              }
            })
            // @ts-ignore
            .catch((e: any) => {
              console.error(`SupabaseProvider (onAuthStateChange: ${event} using .then): Eccezione CATTURATA nel fetch del profilo utente:`, e);
            })
            .finally(() => {
              setLoadingProfile(false);
              console.log(`SupabaseProvider (onAuthStateChange: ${event} using .then): Fetch profilo completato (finally), loadingProfile false.`);
              setLoadingSession(false);
              console.log(`SupabaseProvider (onAuthStateChange: ${event}): Operazioni (incluso profilo) completate, loadingSession false.`);
            });
        } else {
          console.log(`SupabaseProvider (onAuthStateChange: ${event}): Nessun utente nella nuova sessione, profilo impostato a null.`);
          setUserProfile(null);
          setLoadingProfile(false); 
          setLoadingSession(false);
          console.log(`SupabaseProvider (onAuthStateChange: ${event}): Nessun utente, stati di caricamento impostati a false.`);
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [initialSupabaseClient])

  const overallLoading = loadingSession || loadingProfile;

  return (
    <SupabaseContext.Provider value={{ supabase: initialSupabaseClient, session, loading: overallLoading, userProfile, loadingProfile }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined || context.supabase === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider and the Supabase client must be available')
  }
  return context
}

export const useAuth = () => {
  const { session, userProfile, loading, supabase } = useSupabase();
  
  return {
    session,
    user: session?.user,
    profile: userProfile,
    loading,
    isAuthenticated: !!session?.user && !!userProfile && !loading,
    supabase
  };
} 