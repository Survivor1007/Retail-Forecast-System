import axios from 'axios';
import { 
  type Store, type Product, type AnalyticsSummary, type DailyTrendPoint, type TopProduct, 
   type ForecastResult, type InventoryAlert, type ABCAnalysis 
} from '../types';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStores = async (): Promise<Store[]> => {
  const response = await apiClient.get('/stores');
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get('/products');
  return response.data;
};

export const getAnalyticsSummary = async (storeId?: number): Promise<AnalyticsSummary> => {
  const params = storeId ? { store_id: storeId } : {};
  const response = await apiClient.get('/analytics/summary', { params });
  return response.data;
};

export const getDailyTrends = async (storeId?: number, productId?: number): Promise<DailyTrendPoint[]> => {
  const params: any = {};
  if (storeId) params.store_id = storeId;
  if (productId) params.product_id = productId;
  const response = await apiClient.get('/analytics/daily-trends', { params });
  return response.data;
};

export const getTopProducts = async (by: 'revenue' | 'volume' = 'revenue'): Promise<TopProduct[]> => {
  const response = await apiClient.get('/analytics/top-products', { params: { by, limit: 10 } });
  return response.data;
};

export const generateForecast = async (horizonDays: number = 7, storeId?: number): Promise<any> => {
  const response = await apiClient.post('/forecasting/generate', {
    horizon_days: horizonDays,
    store_id: storeId,
  });
  return response.data;
};

export const getForecastResults = async (productId?: number, storeId?: number, horizonDays: number = 7): Promise<ForecastResult[]> => {
  const params: any = { horizon_days: horizonDays };
  if (productId) params.product_id = productId;
  if (storeId) params.store_id = storeId;
  const response = await apiClient.get('/forecasting/results', { params });
  return response.data;
};

export const getInventoryAlerts = async (storeId?: number): Promise<InventoryAlert[]> => {
  const params = storeId ? { store_id: storeId } : {};
  const response = await apiClient.get('/inventory/alerts', { params });
  return response.data;
};

export const getABCAnalysis = async (storeId?: number): Promise<ABCAnalysis> => {
  const params = storeId ? { store_id: storeId } : {};
  const response = await apiClient.get('/inventory/abc-analysis', { params });
  return response.data;
};

export const dismissAlert = async (alertId: string): Promise<any> => {
  const response = await apiClient.patch(`/inventory/alerts/${alertId}/dismiss`, { status: 'dismissed' });
  return response.data;
};

export const uploadCSV = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/etl/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
