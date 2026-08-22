import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle  } from 'recharts';
import { Award, ShoppingCart } from 'lucide-react';
import type { TopProduct } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TopProductsWidgetProps {
  topProducts: TopProduct[];
  onToggleMetric: (metric: 'revenue' | 'volume') => void;
  currentMetric: 'revenue' | 'volume';
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export const TopProductsWidget: React.FC<TopProductsWidgetProps> = ({
  topProducts,
  onToggleMetric,
  currentMetric,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="glass-panel p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Products</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ranked product sales breakdown by total revenue or quantity volume
          </p>
        </div>

        <div className="flex bg-slate-200/60 dark:bg-white/5 p-1 rounded-lg border border-slate-300 dark:border-white/10">
          <button
            onClick={() => onToggleMetric('revenue')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentMetric === 'revenue' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Revenue
          </button>
          <button
            onClick={() => onToggleMetric('volume')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentMetric === 'volume' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Volume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} />
              <YAxis dataKey="product_name" type="category" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} width={130} />
              <Tooltip
                contentStyle={{ 
                  background: isDark ? '#1e293b' : '#ffffff', 
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                  borderRadius: '8px', 
                  color: isDark ? '#ffffff' : '#0f172a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Bar dataKey={currentMetric === 'revenue' ? 'total_revenue' : 'total_quantity_sold'} radius={[0, 4, 4, 0]}
              shape={(props) => (
                <Rectangle  {...props} fill={COLORS[(props.index ?? 0) % COLORS.length]} />
              )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="max-h-64 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <th className="p-2">Rank</th>
                <th className="p-2">Product</th>
                <th className="p-2">Category</th>
                <th className="p-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
              {topProducts.map((prod, idx) => (
                <tr key={prod.product_id} className="hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors">
                  <td className="p-2 font-bold text-cyan-600 dark:text-cyan-400">#{idx + 1}</td>
                  <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">{prod.product_name}</td>
                  <td className="p-2 text-slate-500 dark:text-slate-400">{prod.category_name || 'N/A'}</td>
                  <td className="p-2 font-bold text-slate-900 dark:text-slate-100">
                    {currentMetric === 'revenue' 
                      ? `$${prod.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : `${prod.total_quantity_sold.toLocaleString()} units`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

