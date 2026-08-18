import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, PackageX, Layers } from 'lucide-react';
import { type InventoryAlert, type ABCAnalysis } from '../types';

interface InventoryAlertsTableProps {
  alerts: InventoryAlert[];
  abcAnalysis: ABCAnalysis | null;
  onDismissAlert: (alertId: string) => void;
}

export const InventoryAlertsTable: React.FC<InventoryAlertsTableProps> = ({
  alerts,
  abcAnalysis,
  onDismissAlert,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Risk Alert Cards Section */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Operational Risk Alerts</h2>
          </div>
          <span className="badge-high">{alerts.length} Active Alerts</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm">No stockout or deadstock risk alerts detected.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white/5 p-3.5 rounded-xl border ${
                  alert.alert_type === 'STOCKOUT_RISK' ? 'border-rose-500/30' : 'border-amber-500/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    {alert.alert_type === 'STOCKOUT_RISK' ? (
                      <PackageX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-semibold text-sm text-white">{alert.product_name}</span>
                  </div>
                  <span className={alert.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}>
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-2">
                  {alert.description}
                </p>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 italic font-medium">
                    💡 {alert.recommended_action}
                  </span>
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ABC Analysis Section */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Pareto ABC Classification</h2>
          </div>
        </div>

        {abcAnalysis && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-emerald-400">Class A ({abcAnalysis.class_a_count})</div>
              <div className="text-xs text-slate-400">Top 80% Revenue</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-amber-400">Class B ({abcAnalysis.class_b_count})</div>
              <div className="text-xs text-slate-400">Next 15% Revenue</div>
            </div>
            <div className="bg-slate-500/10 border border-slate-500/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-slate-300">Class C ({abcAnalysis.class_c_count})</div>
              <div className="text-xs text-slate-400">Bottom 5% Revenue</div>
            </div>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="p-2">Product</th>
                <th className="p-2">Revenue</th>
                <th className="p-2">Share %</th>
                <th className="p-2">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {abcAnalysis?.items.map((item) => (
                <tr key={item.product_id} className="hover:bg-white/5 transition-colors">
                  <td className="p-2 font-medium text-slate-200">{item.product_name}</td>
                  <td className="p-2 text-slate-300">${item.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2 text-slate-400">{item.revenue_share_pct}%</td>
                  <td className="p-2">
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
