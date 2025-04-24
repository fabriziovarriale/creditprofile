import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BrokerLayout from './layouts/BrokerLayout';
import ClientLayout from './components/layout/ClientLayout';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './App.css';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { Toaster as SonnerToaster } from 'sonner';
import { DocumentsProvider } from './context/DocumentsContext';
import ImpersonationBanner from './components/layout/ImpersonationBanner';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import SignupPage from './pages/SignupPage';

// Broker pages
import BrokerDashboard from './pages/broker/Dashboard';
import ClientsPage from './pages/broker/Clients';
import LeadsPage from './pages/broker/Leads';
import SupportPage from './pages/broker/Support';
import SettingsPage from './pages/broker/Settings';
import ProfilePage from './pages/broker/ProfilePage';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import ClientDocuments from './pages/client/Documents';
import ClientApplication from './pages/client/Application';
import ClientProfile from './pages/client/Profile';
import ClientStatus from './pages/client/Status';
import ClientReports from './pages/client/Reports';

function App() {
  return (
    <div className="dark">
      <Router>
        <AuthProvider>
          <DocumentsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Broker routes */}
              <Route path="/broker" element={<BrokerLayout />}>
                <Route index element={<BrokerDashboard />} />
                <Route path="dashboard" element={<BrokerDashboard />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/broker/dashboard" replace />} />
              </Route>
              
              {/* Client routes */}
              <Route path="/client" element={<ClientLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="documents" element={<ClientDocuments />} />
                <Route path="upload" element={<ClientDocuments />} />
                <Route path="status" element={<ClientStatus />} />
                <Route path="reports" element={<ClientReports />} />
                <Route path="profile" element={<ClientProfile />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SonnerToaster />
          </DocumentsProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
