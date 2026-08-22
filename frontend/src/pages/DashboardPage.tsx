import React, { useState, useEffect } from 'react';
import { KPIHeader } from '../components/KPIHeader';
import { ForecastChart } from '../components/ForecastChart';
import { InventoryAlertsTable } from '../components/InventoryAlertsTable';
import { TopProductsWidget } from '../components/TopProductsWidget';
import { 
  getProducts, getAnalyticsSummary, getTopProducts, 
  getForecastResults, generateForecast, getInventoryAlerts, 
  getABCAnalysis, dismissAlert 
} from '../services/api';
import type { Product, AnalyticsSummary, TopProduct, ForecastResult, InventoryAlert, ABCAnalysis } from '../types';

interface DashboardPageProps {
  selectedStoreId?: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ selectedStoreId }) => {
  const [products, setProducts] = useState<Product[]>([]);
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

  // Initial Master Data load
  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
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
    <div className="space-y-6">
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
    </div>
  );
};
