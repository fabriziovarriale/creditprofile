
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ClientLayout from "./components/layout/ClientLayout";
import BrokerLayout from "./components/layout/BrokerLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import ClientDocuments from "./pages/client/Documents";

// Broker Pages
import BrokerDashboard from "./pages/broker/Dashboard";
import ClientProfile from "./pages/broker/ClientProfile";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredUserType 
}: { 
  children: JSX.Element, 
  requiredUserType: 'client' | 'broker' | null 
}) => {
  const { user, userType, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to={userType === 'client' ? '/client' : '/broker'} replace />;
  }
  
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    
    {/* Client Routes */}
    <Route path="/client" element={
      <ProtectedRoute requiredUserType="client">
        <ClientLayout />
      </ProtectedRoute>
    }>
      <Route index element={<ClientDashboard />} />
      <Route path="documents" element={<ClientDocuments />} />
    </Route>
    
    {/* Broker Routes */}
    <Route path="/broker" element={
      <ProtectedRoute requiredUserType="broker">
        <BrokerLayout />
      </ProtectedRoute>
    }>
      <Route index element={<BrokerDashboard />} />
      <Route path="client/:clientId" element={<ClientProfile />} />
    </Route>
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
