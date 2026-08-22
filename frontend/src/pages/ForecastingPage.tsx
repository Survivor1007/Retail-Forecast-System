import React, { useState, useEffect } from 'react';
import { Cpu, Play, Award, Loader2 } from 'lucide-react';
import { ForecastChart } from '../components/ForecastChart';
import { getForecastResults, generateForecast, getProducts } from '../services/api';
import { type ForecastResult, type Product } from '../types';

interface ForecastingPageProps {
  selectedStoreId?: number;
}

export const ForecastingPage: React.FC<ForecastingPageProps> = ({ selectedStoreId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [generating, setGenerating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  const refreshForecasts = async () => {
    setLoading(true);
    try {
      const results = await getForecastResults(selectedProductId, selectedStoreId, horizonDays);
      setForecastResults(results);
    } catch (err) {
      console.error('Failed to load forecast results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshForecasts();
  }, [selectedProductId, selectedStoreId, horizonDays]);

  const handleRunCompetition = async () => {
    setGenerating(true);
    try {
      await generateForecast(horizonDays, selectedStoreId);
      await refreshForecasts();
    } catch (err) {
      console.error('Error generating forecasts:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Forecasting Model Studio</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dynamic model competition evaluating Simple Moving Average (SMA/EMA) vs Scikit-Learn Ridge Regression.
            </p>
          </div>

          <button onClick={handleRunCompetition} disabled={generating} className="btn-primary">
            <Play className="w-4 h-4" />
            {generating ? 'Evaluating Models...' : 'Execute Model Competition'}
          </button>
        </div>
      </div>

      {/* Main Forecast Visualizer */}
      <ForecastChart
        forecastResults={forecastResults}
        products={products}
        selectedProductId={selectedProductId}
        onSelectProduct={setSelectedProductId}
        horizonDays={horizonDays}
        onChangeHorizon={setHorizonDays}
        onGenerateForecast={handleRunCompetition}
        generating={generating}
      />

      {/* Model Performance Leaderboard Table */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Model Competition Leaderboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluation scores comparing train/test split MAPE & RMSE metrics per product
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-300 dark:border-white/10">
            {forecastResults.length} Items Evaluated
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading forecasts...
          </div>
        ) : forecastResults.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No forecast evaluation scores available. Click "Execute Model Competition" to run evaluations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Winning Model</th>
                  <th className="p-3">Winning MAPE %</th>
                  <th className="p-3">RMSE Score</th>
                  <th className="p-3">Selection Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
                {forecastResults.map((res) => (
                  <tr key={res.product_id} className="hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{res.product_name}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        res.winning_model === 'Ridge_Regression'
                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}>
                        {res.winning_model}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {res.mape_score !== undefined ? `${res.mape_score}%` : 'N/A'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {res.rmse_score !== undefined ? res.rmse_score : 'N/A'}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 italic">
                      Lowest holdout error score
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
