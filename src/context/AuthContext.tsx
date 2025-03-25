
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type UserType = 'client' | 'broker';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  signIn: (email: string, password: string, type: UserType) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS = {
  client: {
    id: 'client-123',
    name: 'Marco Rossi',
    email: 'cliente@example.com',
    password: 'password',
  },
  broker: {
    id: 'broker-456',
    name: 'Giuseppe Verdi',
    email: 'broker@example.com',
    password: 'password',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('creditProfileUser');
    const storedUserType = localStorage.getItem('creditProfileUserType') as UserType | null;
    
    if (storedUser && storedUserType) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, type: UserType) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = type === 'client' ? MOCK_USERS.client : MOCK_USERS.broker;
      
      if (email.toLowerCase() === mockUser.email.toLowerCase() && password === mockUser.password) {
        const userData = {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        };
        
        setUser(userData);
        setUserType(type);
        
        // Store in localStorage
        localStorage.setItem('creditProfileUser', JSON.stringify(userData));
        localStorage.setItem('creditProfileUserType', type);
        
        toast.success(`Benvenuto, ${mockUser.name}!`);
        navigate(type === 'client' ? '/client' : '/broker');
      } else {
        toast.error('Credenziali non valide. Riprova.');
      }
    } catch (error) {
      toast.error('Si è verificato un errore durante l\'accesso.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('creditProfileUser');
    localStorage.removeItem('creditProfileUserType');
    navigate('/');
    toast.success('Logout effettuato con successo');
  };

  return (
    <AuthContext.Provider value={{ user, userType, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
