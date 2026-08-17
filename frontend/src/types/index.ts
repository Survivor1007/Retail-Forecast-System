export interface Store {
  id: number;
  store_name: string;
  city: string;
  created_at: string;
}

export interface Product {
  id: number;
  product_name: string;
  category_id?: number;
  unit_price: number;
  created_at: string;
}

export interface AnalyticsSummary {
  total_revenue: number;
  total_units_sold: number;
  total_orders: number;
  average_order_value: number;
  active_stores: number;
  active_products: number;
}

export interface DailyTrendPoint {
  sales_date: string;
  total_quantity: number;
  total_revenue: number;
  total_orders: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  category_name?: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface ForecastDataPoint {
  date: string;
  actual_quantity?: number | null;
  predicted_quantity: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface ForecastResult {
  product_id: number;
  product_name: string;
  store_id: number;
  winning_model: string;
  mape_score?: number;
  rmse_score?: number;
  forecast_points: ForecastDataPoint[];
}

export interface InventoryAlert {
  id: string;
  product_id: number;
  product_name: string;
  store_id: number;
  store_name: string;
  alert_type: 'STOCKOUT_RISK' | 'DEADSTOCK_RISK';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  metric_value: number;
  recommended_action: string;
}

export interface ABCItem {
  product_id: number;
  product_name: string;
  total_revenue: number;
  revenue_share_pct: number;
  cumulative_revenue_pct: number;
  abc_class: 'A' | 'B' | 'C';
}

export interface ABCAnalysis {
  class_a_count: number;
  class_b_count: number;
  class_c_count: number;
  items: ABCItem[];
}
