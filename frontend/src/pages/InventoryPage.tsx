import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, PackageX, Layers, Filter,Loader2
} from 'lucide-react';
import { getInventoryAlerts, getABCAnalysis, dismissAlert } from '../services/api';
import { type InventoryAlert, type ABCAnalysis } from '../types';

interface InventoryPageProps {
  selectedStoreId?: number;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ selectedStoreId }) => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [abcAnalysis, setAbcAnalysis] = useState<ABCAnalysis | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [alertsData, abcData] = await Promise.all([
        getInventoryAlerts(selectedStoreId),
        getABCAnalysis(selectedStoreId),
      ]);
      setAlerts(alertsData);
      setAbcAnalysis(abcData);
    } catch (err) {
      console.error('Failed to load inventory intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedStoreId]);

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (typeFilter !== 'ALL' && a.alert_type !== typeFilter) return false;
    return true;
  });

  const highSeverityCount = alerts.filter((a) => a.severity === 'HIGH').length;
  const stockoutCount = alerts.filter((a) => a.alert_type === 'STOCKOUT_RISK').length;
  const deadstockCount = alerts.filter((a) => a.alert_type === 'DEADSTOCK_RISK').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Risk Intelligence Center</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated Pareto ABC 80/15/5 revenue categorization and real-time stockout/deadstock risk alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel-interactive p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Active Risk Alerts</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{alerts.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{highSeverityCount} High Severity</div>
        </div>
        <div className="glass-panel-interactive p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Stockout Warnings</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stockoutCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Class A Driver Risk</div>
        </div>
        <div className="glass-panel-interactive p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Deadstock Accumulation</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{deadstockCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">&gt; 40% WoW Drop / 0 Sales</div>
        </div>
        <div className="glass-panel-interactive p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Class A Revenue Drivers</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{abcAnalysis?.class_a_count ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Top 80% Revenue Share</div>
        </div>
      </div>

      {/* Risk Alert Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Operational Warnings</h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </div>
            <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg border border-slate-300 dark:border-white/10">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    severityFilter === s ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg border border-slate-300 dark:border-white/10">
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'STOCKOUT_RISK', label: 'Stockout' },
                { id: 'DEADSTOCK_RISK', label: 'Deadstock' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    typeFilter === t.id ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading forecasts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium">No matching operational risk alerts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-slate-100/80 dark:bg-white/5 p-4 rounded-xl border ${
                  alert.alert_type === 'STOCKOUT_RISK' ? 'border-rose-500/30' : 'border-amber-500/30'
                } space-y-3`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {alert.alert_type === 'STOCKOUT_RISK' ? (
                      <PackageX className="w-4 h-4 text-rose-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{alert.product_name}</span>
                  </div>
                  <span className={alert.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}>
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {alert.description}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                  <span className="text-blue-600 dark:text-cyan-400 font-medium flex items-center gap-1">
                    💡 Action: {alert.recommended_action}
                  </span>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="btn-secondary text-[11px] px-2 py-1"
                  >
                    Dismiss Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ABC Classification Matrix */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Pareto ABC Classification Matrix</h2>
          </div>
        </div>

        {abcAnalysis && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Class A ({abcAnalysis.class_a_count})</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Top 80% Revenue Share</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">Class B ({abcAnalysis.class_b_count})</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Next 15% Revenue Share</div>
            </div>
            <div className="bg-slate-500/10 border border-slate-500/20 p-4 rounded-xl text-center">
              <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">Class C ({abcAnalysis.class_c_count})</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bottom 5% Revenue Share</div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <th className="p-3">Product Name</th>
                <th className="p-3">Total Revenue</th>
                <th className="p-3">Revenue Share %</th>
                <th className="p-3">Cumulative Share %</th>
                <th className="p-3">ABC Priority Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/5">
              {abcAnalysis?.items.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-100/80 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.product_name}</td>
                  <td className="p-3 font-medium text-slate-700 dark:text-slate-300">${item.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.revenue_share_pct}%</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.cumulative_revenue_pct}%</td>
                  <td className="p-3">
                    <span className={`badge-${item.abc_class.toLowerCase()}`}>
                      Class {item.abc_class}
                    </span>
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
