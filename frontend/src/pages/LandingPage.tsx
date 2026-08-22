import React from 'react';
import { 
    Cpu, ShieldAlert, BarChart3, Database, Layers, ArrowRight, 
    Zap, Sparkles, Activity, Server
} from 'lucide-react';
import { type ActiveTab } from '../components/Navbar';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenUpload }) => {
  const capabilities = [
    {
      icon: Cpu,
      title: 'Model Competition Engine',
      description: 'Dynamic evaluation comparing baseline Moving Averages against Scikit-Learn Ridge Regression based on MAPE & RMSE error metrics.',
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      tab: 'forecasting' as ActiveTab,
    },
    {
      icon: ShieldAlert,
      title: 'Stockout & Deadstock Risk Radar',
      description: 'Proactive detection triggering alerts for fast-moving Class A stockouts and slow-moving items with >40% WoW sales drops.',
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      tab: 'inventory' as ActiveTab,
    },
    {
      icon: Layers,
      title: 'Pareto ABC Classification',
      description: 'Automated 80/15/5 revenue categorization prioritizing top-performing inventory items for optimal stock replenishment.',
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      tab: 'inventory' as ActiveTab,
    },
    {
      icon: BarChart3,
      title: 'Sub-Millisecond SQL Analytics',
      description: 'High-performance PostgreSQL window aggregations providing instant time-series daily sales rollups and store trends.',
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      tab: 'dashboard' as ActiveTab,
    },
    {
      icon: Database,
      title: 'Automated ETL Ingestion Pipeline',
      description: 'Robust CSV parser, missing value handling, tax/discount calculation, and statistical anomaly filtering.',
      color: 'text-cyan-500 dark:text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      tab: 'etl' as ActiveTab,
    },
    {
      icon: Sparkles,
      title: 'Confidence Interval Bandwidths',
      description: 'Generates 95% statistical confidence bounds around sales predictions to quantify demand uncertainty.',
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      tab: 'forecasting' as ActiveTab,
    },
  ];

  const metricsStats = [
    { label: 'Forecast Accuracy Metric', value: 'MAPE & RMSE', detail: 'Dynamic competition' },
    { label: 'Aggregation Speed', value: '< 15 ms', detail: 'PostgreSQL window functions' },
    { label: 'Pareto Class Distribution', value: '80 / 15 / 5', detail: 'Revenue Pareto rule' },
    { label: 'Forecast Horizon', value: '7 & 30 Days', detail: 'Forward predictions' },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Banner Section */}
      <section className="glass-panel p-8 md:p-12 relative overflow-hidden text-center md:text-left">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Production-Grade Data Engineering Monolith
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Automated Demand Forecasting & <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Inventory Intelligence Engine
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              Transform raw retail sales transactions into statistical forecasts, model competition evaluations, and automated stockout/deadstock risk alerts.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <button 
                onClick={() => onNavigate('dashboard')} 
                className="btn-primary px-6 py-3 text-sm shadow-xl shadow-blue-500/25"
              >
                Launch Executive Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('forecasting')} 
                className="btn-secondary px-6 py-3 text-sm"
              >
                Open Forecasting Studio
              </button>
            </div>
          </div>

          <div className="md:col-span-4 hidden md:block">
            <div className="bg-slate-900/90 dark:bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> System Telemetry
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">ONLINE</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Engine:</span> <span className="text-blue-400">FastAPI + PostgreSQL</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>ML Model:</span> <span className="text-purple-400">Ridge Regression vs SMA</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Evaluation:</span> <span className="text-amber-400">Holdout MAPE Score</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Pareto Analysis:</span> <span className="text-emerald-400">ABC Classification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Metrics Ticker */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsStats.map((stat, idx) => (
          <div key={idx} className="glass-panel-interactive p-5 text-center">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">{stat.detail}</div>
          </div>
        ))}
      </section>

      {/* Interactive Capabilities Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Architectural Capabilities</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Built with strict clean architecture, separation of concerns, and data engineering standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => {
            const IconComponent = cap.icon;
            return (
              <div 
                key={idx} 
                onClick={() => onNavigate(cap.tab)}
                className="glass-panel-interactive p-6 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${cap.bg}`}>
                    <IconComponent className={`w-5 h-5 ${cap.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Blueprint Section */}
      <section className="glass-panel p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" /> End-to-End Data Pipeline Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Data flows seamlessly from raw order line-items to PostgreSQL aggregations, ML forecasters, and presentation APIs.
            </p>
          </div>
          <button onClick={onOpenUpload} className="btn-secondary text-xs">
            <Database className="w-4 h-4" /> Upload Sales CSV Data
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">01. ETL & INGESTION</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Data Cleaner Module</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sanitizes negative quantities, derives line-item totals, and filters pricing outliers.
            </p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400">02. SQL AGGREGATION</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Window Function Rollup</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              UPSERT daily aggregates into PostgreSQL time-series target for instant sub-millisecond queries.
            </p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">03. MODEL COMPETITION</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">SMA vs Ridge Evaluator</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Computes test MAPE & RMSE, picks lowest error model, and generates confidence intervals.
            </p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">04. PRESENTATION</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">FastAPI REST & React UI</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exposes clean HTTP REST endpoints consumed by interactive Recharts visualizers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
