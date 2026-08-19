import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { KPIHeader } from '../components/KPIHeader';
import { ForecastChart } from '../components/ForecastChart';
import { InventoryAlertsTable } from '../components/InventoryAlertsTable';
import { TopProductsWidget } from '../components/TopProductsWidget';
import { DataUploadModal } from '../components/DataUploadModal';
import { 
  getStores, getProducts, getAnalyticsSummary, getTopProducts, 
  getForecastResults, generateForecast, getInventoryAlerts, 
  getABCAnalysis, dismissAlert 
} from '../services/api';
import { type Store, type Product, type AnalyticsSummary, type TopProduct, type ForecastResult, type InventoryAlert, type ABCAnalysis } from '../types';

export const DashboardPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topMetric, setTopMetric] = useState<'revenue' | 'volume'>('revenue');

  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [generatingForecast, setGeneratingForecast] = useState<boolean>(false);

  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [abcAnalysis, setAbcAnalysis] = useState<ABCAnalysis | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Initial Master Data load
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [storesData, productsData] = await Promise.all([getStores(), getProducts()]);
        setStores(storesData);
        setProducts(productsData);
      } catch (err) {
        console.error('Failed to load master data:', err);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch Dashboard Analytics Data on Store Change
  const refreshDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, topData, forecastData, alertsData, abcData] = await Promise.all([
        getAnalyticsSummary(selectedStoreId),
        getTopProducts(topMetric),
        getForecastResults(selectedProductId, selectedStoreId, horizonDays),
        getInventoryAlerts(selectedStoreId),
        getABCAnalysis(selectedStoreId),
      ]);
      setSummary(sumData);
      setTopProducts(topData);
      setForecastResults(forecastData);
      setAlerts(alertsData);
      setAbcAnalysis(abcData);
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboardData();
  }, [selectedStoreId, selectedProductId, horizonDays, topMetric]);

  const handleGenerateForecast = async () => {
    setGeneratingForecast(true);
    try {
      await generateForecast(horizonDays, selectedStoreId);
      await refreshDashboardData();
    } catch (err) {
      console.error('Failed to generate forecast:', err);
    } finally {
      setGeneratingForecast(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Navbar
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <KPIHeader summary={summary} loading={loading} />

      <ForecastChart
        forecastResults={forecastResults}
        products={products}
        selectedProductId={selectedProductId}
        onSelectProduct={setSelectedProductId}
        horizonDays={horizonDays}
        onChangeHorizon={setHorizonDays}
        onGenerateForecast={handleGenerateForecast}
        generating={generatingForecast}
      />

      <InventoryAlertsTable
        alerts={alerts}
        abcAnalysis={abcAnalysis}
        onDismissAlert={handleDismissAlert}
      />

      <TopProductsWidget
        topProducts={topProducts}
        currentMetric={topMetric}
        onToggleMetric={setTopMetric}
      />

      <DataUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          refreshDashboardData();
        }}
      />
    </div>
  );
};
