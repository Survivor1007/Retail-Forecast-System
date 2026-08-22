import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar, type ActiveTab } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { InventoryPage } from './pages/InventoryPage';
import { ETLDataHubPage } from './pages/ETLDataHubPage';
import { DataUploadModal } from './components/DataUploadModal';
import { getStores } from './services/api';
import type { Store } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  useEffect(() => {
    getStores().then(setStores).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navbar
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        <main className="transition-all duration-200">
          {activeTab === 'home' && (
            <LandingPage 
              onNavigate={setActiveTab} 
              onOpenUpload={() => setIsUploadOpen(true)} 
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage selectedStoreId={selectedStoreId} />
          )}

          {activeTab === 'forecasting' && (
            <ForecastingPage selectedStoreId={selectedStoreId} />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage selectedStoreId={selectedStoreId} />
          )}

          {activeTab === 'etl' && (
            <ETLDataHubPage />
          )}
        </main>

        {/* Global CSV Upload Portal */}
        <DataUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            setIsUploadOpen(false);
          }}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
