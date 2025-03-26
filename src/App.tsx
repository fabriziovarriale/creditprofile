
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BrokerLayout from './components/layout/BrokerLayout';
import ClientLayout from './components/layout/ClientLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import './App.css';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { Toaster as SonnerToaster } from 'sonner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/broker" element={<BrokerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Add other broker routes here */}
          </Route>
          
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Add other client routes here */}
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <SonnerToaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
