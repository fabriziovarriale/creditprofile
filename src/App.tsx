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
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import RegisterPage from './pages/auth/register';
import VerifyEmail from './pages/auth/verify-email';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Broker pages
import BrokerDashboard from './pages/broker/Dashboard';
import DocumentsPage from './pages/broker/Documents';
import SupportPage from './pages/broker/Support';
import SettingsPage from './pages/broker/Settings';
import ProfilePage from './pages/broker/ProfilePage';
import NewDocumentPage from './pages/broker/NewDocument';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import ClientDocuments from './pages/client/Documents';
import ClientProfile from './pages/client/Profile';
import ClientReports from './pages/client/Reports';

// Manteniamo DashboardLayout per il broker se serve
import DashboardLayout from './components/layout/DashboardLayout'; 

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />}>
      <Route path="/" element={<Home />} />
      <Route path="auth/login" element={<Login />} />
      <Route path="auth/register" element={<RegisterPage />} />
      <Route path="auth/verify-email" element={<VerifyEmail />} />

      {/* Broker Routes - Protette */}
      <Route 
        path="broker"
        element={<PrivateRoute><DashboardLayout role="broker" /></PrivateRoute>} // Mantenuto per il broker
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BrokerDashboard />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="new-document" element={<NewDocumentPage />} />
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
