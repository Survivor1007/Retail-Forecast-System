import React from 'react';
import { DollarSign, ShoppingBag, ShoppingCart, Award, Store as StoreIcon, Layers } from 'lucide-react';
import type { AnalyticsSummary } from '../types';

interface KPIHeaderProps {
  summary: AnalyticsSummary | null;
  loading: boolean;
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({ summary, loading }) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: summary ? `$${summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
      icon: DollarSign,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Units Sold',
      value: summary ? summary.total_units_sold.toLocaleString() : '0',
      icon: ShoppingBag,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Total Orders',
      value: summary ? summary.total_orders.toLocaleString() : '0',
      icon: ShoppingCart,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Avg Order Value',
      value: summary ? `$${summary.average_order_value.toFixed(2)}` : '$0.00',
      icon: Award,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Active Stores',
      value: summary ? summary.active_stores : '0',
      icon: StoreIcon,
      colorClass: 'text-cyan-600 dark:text-cyan-400',
      bgClass: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Active Products',
      value: summary ? summary.active_products : '0',
      icon: Layers,
      colorClass: 'text-pink-600 dark:text-pink-400',
      bgClass: 'bg-pink-500/10 border-pink-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className="glass-panel-interactive p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.bgClass}`}>
                <IconComponent className={`w-4 h-4 ${card.colorClass}`} />
              </div>
            </div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {loading ? <span className="animate-pulse text-slate-500">...</span> : card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
