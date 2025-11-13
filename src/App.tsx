import React, { useState } from 'react';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { Layout } from './shared/components/Layout';
import { Login } from './modules/auth/Login';
import { Dashboard } from './modules/dashboard/Dashboard';
import { ClientsPage } from './modules/clients/ClientsPage';
import { PlansPage } from './modules/plans/PlansPage';
import { ContractsPage } from './modules/contracts/ContractsPage';
import { RoutersPage } from './modules/routers/RoutersPage';
import { MonitoringPage } from './modules/monitoring/MonitoringPage';
import { Toaster } from './components/ui/sonner';

type Page = 'dashboard' | 'clients' | 'plans' | 'contracts' | 'routers' | 'monitoring';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsPage />;
      case 'plans':
        return <PlansPage />;
      case 'contracts':
        return <ContractsPage />;
      case 'routers':
        return <RoutersPage />;
      case 'monitoring':
        return <MonitoringPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;
