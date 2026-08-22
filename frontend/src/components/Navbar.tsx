import React from 'react';
import { 
  TrendingUp, UploadCloud, Store as StoreIcon, Sun, Moon, Laptop, 
  Home, LayoutDashboard, Cpu, ShieldAlert, Database 
} from 'lucide-react';
import { type Store } from '../types';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'home' | 'dashboard' | 'forecasting' | 'inventory' | 'etl';

interface NavbarProps {
  stores: Store[];
  selectedStoreId?: number;
  onSelectStore: (storeId?: number) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stores,
  selectedStoreId,
  onSelectStore,
  activeTab,
  onTabChange,
  onOpenUpload,
}) => {
  const { theme, setTheme } = useTheme();

  const navTabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'forecasting', label: 'Forecasting Studio', icon: Cpu },
    { id: 'inventory', label: 'Inventory Risk Center', icon: ShieldAlert },
    { id: 'etl', label: 'ETL Data Hub', icon: Database },
  ];

  return (
    <header className="glass-panel p-4 mb-6 space-y-4">
      {/* Top Bar: Brand, Theme Switcher, Store Selector, CTA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand logo & Title */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              DemandForecast <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">AI v2.0</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Retail Analytics & Inventory Intelligence Platform
            </p>
          </div>
        </div>

        {/* Controls: Theme Switcher + Store Selector + Upload Button */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
          {/* Theme Switcher */}
          <div className="flex bg-slate-200/80 dark:bg-white/5 p-1 rounded-lg border border-slate-300 dark:border-white/10">
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded-md text-xs transition-all ${
                theme === 'light' 
                  ? 'bg-white text-blue-600 shadow-sm font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded-md text-xs transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-800 text-blue-400 shadow-sm font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Default"
              className={`p-1.5 rounded-md text-xs transition-all ${
                theme === 'system' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-4 h-4" />
            </button>
          </div>

          {/* Store Selector */}
          <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-lg">
            <StoreIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <select
              value={selectedStoreId || ''}
              onChange={(e) => onSelectStore(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-slate-800 dark:text-slate-100 border-none outline-none text-xs font-medium cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">All Stores Combined</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {s.store_name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <button onClick={onOpenUpload} className="btn-primary text-xs">
            <UploadCloud className="w-4 h-4" />
            Upload Sales CSV
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <nav className="flex items-center gap-1 border-t border-slate-200/80 dark:border-white/10 pt-3 overflow-x-auto">
        {navTabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
