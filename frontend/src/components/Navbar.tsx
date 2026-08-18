import React from 'react';
import { TrendingUp, UploadCloud, Store as StoreIcon } from 'lucide-react';
import { type Store } from '../types';

interface NavbarProps {
  stores: Store[];
  selectedStoreId?: number;
  onSelectStore: (storeId?: number) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stores,
  selectedStoreId,
  onSelectStore,
  onOpenUpload,
}) => {
  return (
    <header className="glass-panel p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Retail Demand Forecasting Engine
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Data Engineering & Inventory Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        {/* Store Selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          <StoreIcon className="w-4 h-4 text-blue-400" />
          <select
            value={selectedStoreId || ''}
            onChange={(e) => onSelectStore(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-transparent text-slate-100 border-none outline-none text-sm font-medium cursor-pointer"
          >
            <option value="" className="bg-slate-800 text-slate-100">All Stores Combined</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-800 text-slate-100">
                {s.store_name} ({s.city})
              </option>
            ))}
          </select>
        </div>

        {/* Upload CSV Button */}
        <button onClick={onOpenUpload} className="btn-primary">
          <UploadCloud className="w-4 h-4" />
          Upload Sales CSV
        </button>
      </div>
    </header>
  );
};
