import React from 'react';
import { 
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { Play, Cpu } from 'lucide-react';
import type { ForecastResult, Product } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ForecastChartProps {
  forecastResults: ForecastResult[];
  products: Product[];
  selectedProductId?: number;
  onSelectProduct: (productId?: number) => void;
  horizonDays: number;
  onChangeHorizon: (days: number) => void;
  onGenerateForecast: () => void;
  generating: boolean;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecastResults,
  products,
  selectedProductId,
  onSelectProduct,
  horizonDays,
  onChangeHorizon,
  onGenerateForecast,
  generating,
}) => {
  const { isDark } = useTheme();

  const currentResult = forecastResults.find((r) => !selectedProductId || r.product_id === selectedProductId) || forecastResults[0];

  const chartData = currentResult ? currentResult.forecast_points.map((p) => ({
    date: p.date,
    Actual: p.actual_quantity,
    Predicted: p.predicted_quantity,
    ConfidenceBand: [p.confidence_lower, p.confidence_upper],
  })) : [];

  return (
    <div className="glass-panel p-6 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales Demand Forecast Visualizer</h2>
            {currentResult && (
              <span className="badge-a bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/40">
                <Cpu className="w-3.5 h-3.5" /> {currentResult.winning_model} (MAPE: {currentResult.mape_score ?? '0'}%)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparing actual historical volume with SMA vs. Ridge Regression model predictions
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-end">
          {/* Product Filter */}
          <select
            value={selectedProductId || ''}
            onChange={(e) => onSelectProduct(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">-- Select Item for Deep-Dive --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                {p.product_name}
              </option>
            ))}
          </select>

          {/* Horizon Selector */}
          <div className="flex bg-slate-200/60 dark:bg-white/5 p-1 rounded-lg border border-slate-300 dark:border-white/10">
            <button
              onClick={() => onChangeHorizon(7)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                horizonDays === 7 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => onChangeHorizon(30)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                horizonDays === 30 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Run Model Button */}
          <button onClick={onGenerateForecast} disabled={generating} className="btn-primary">
            <Play className="w-3.5 h-3.5" />
            {generating ? 'Running Models...' : 'Run Forecasting Engine'}
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <Cpu className="w-12 h-12 mb-3 opacity-40 animate-pulse" />
          <p className="text-sm">No forecast data available. Click "Run Forecasting Engine" to train models.</p>
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"} />
              <XAxis dataKey="date" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} />
              <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ 
                  background: isDark ? '#1e293b' : '#ffffff', 
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                  borderRadius: '8px', 
                  color: isDark ? '#ffffff' : '#0f172a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="ConfidenceBand" fill={isDark ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.25)"} stroke="none" name="95% Confidence Interval" />
              <Line type="monotone" dataKey="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} name="Actual Historical Sales" />
              <Line type="monotone" dataKey="Predicted" stroke="#06b6d4" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name={`Predicted Sales (${currentResult?.winning_model})`} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
