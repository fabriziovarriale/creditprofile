import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
// import DashboardLayout from './components/layout/DashboardLayout'; // Non più usato per /client
import ClientLayout from './layouts/ClientLayout'; // Importa il nuovo layout
import Login from './pages/auth/login';
import NotFound from './pages/NotFound';
import './App.css';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import PrivateRoute from './components/PrivateRoute';
import RegisterPage from './pages/auth/register';
import VerifyEmail from './pages/auth/verify-email';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Broker pages
import BrokerDashboard from './pages/broker/Dashboard';
import ClientsPage from './pages/broker/Clients';
import DocumentsPage from './pages/broker/Documents';
import SupportPage from './pages/broker/Support';
import SettingsPage from './pages/broker/Settings';
import ProfilePage from './pages/broker/ProfilePage';
import CreditScorePage from './pages/broker/CreditScore';
import CreditProfilesPage from './pages/broker/CreditProfiles';
import CreditProfileBuilder from './pages/broker/CreditProfileBuilder';


// Client pages
import ClientDashboard from './pages/client/Dashboard';
import ClientDocuments from './pages/client/Documents';
import ClientProfile from './pages/client/Profile';
import ClientReports from './pages/client/Reports';

// Importa il layout specifico del broker
import BrokerLayout from './layouts/BrokerLayout'; 
import { CreditProfilesProvider } from './pages/broker/CreditProfiles';
import { AIContextProvider } from './components/providers/AIContextProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import Index from './pages/Index';
import BrokerNotifications from './pages/broker/Notifications';


// test
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />}>
      <Route path="/" element={<Index />} />
      <Route path="login" element={<Login />} />
      <Route path="auth/login" element={<Navigate to="/login" replace />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="auth/register" element={<Navigate to="/register" replace />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="auth/verify-email" element={<Navigate to="/verify-email" replace />} />

      {/* Broker Routes - Protette */}
      <Route 
        path="broker"
        element={<PrivateRoute><NotificationProvider><CreditProfilesProvider><AIContextProvider><BrokerLayout /></AIContextProvider></CreditProfilesProvider></NotificationProvider></PrivateRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BrokerDashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="credit-score" element={<CreditScorePage />} />
        <Route path="credit-profiles" element={<CreditProfilesPage />} />
        <Route path="credit-profiles/nuovo" element={<CreditProfileBuilder />} />
        <Route path="notifications" element={<BrokerNotifications />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Client routes - Protette con il nuovo ClientLayout */}
      <Route 
        path="client"
        element={<PrivateRoute><ClientLayout /></PrivateRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="documents" element={<ClientDocuments />} />
        <Route path="reports" element={<ClientReports />} /> {/* Da valutare se mantenere/spostare */}
        <Route path="profile" element={<ClientProfile />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ErrorBoundary>
        <RouterProvider router={router} /> 
      </ErrorBoundary>
      <Toaster />
      <SonnerToaster />
    </ThemeProvider>
  );
}

export default App;
//ciao