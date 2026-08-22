import React, { useState } from 'react';
import { 
  Database, UploadCloud, FileText, CheckCircle, AlertCircle, Table,
} from 'lucide-react';
import { uploadCSV } from '../services/api';

export const ETLDataHubPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a valid CSV sales file.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await uploadCSV(file);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Check CSV formatting.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-cyan-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">ETL Data Management Hub</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Data cleaning, anomaly filtering, line-item total derivations, and daily sales window aggregations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Ingestion Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Upload Transactional Sales CSV</h2>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-8 text-center bg-slate-100/50 dark:bg-white/[0.02]">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              {file ? `Selected: ${file.name}` : 'Drag and drop your raw sales CSV file here'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Supported format: .csv with header row
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="hub-csv-input"
            />
            <label htmlFor="hub-csv-input" className="btn-secondary cursor-pointer">
              Browse File
            </label>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <CheckCircle className="w-4 h-4" /> Ingestion Completed Successfully
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-center">
                <div className="bg-emerald-500/10 p-2 rounded">
                  <div className="font-bold text-lg">{result.total_rows_ingested}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Rows</div>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded">
                  <div className="font-bold text-lg text-emerald-500">{result.clean_rows_inserted}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Clean Rows</div>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded">
                  <div className="font-bold text-lg text-amber-500">{result.invalid_rows_skipped}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Skipped</div>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary w-full justify-center">
            {uploading ? 'Processing ETL Pipeline...' : 'Process Ingestion Pipeline'}
          </button>
        </div>

        {/* CSV Format Schema Guide */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-purple-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">CSV Specification & Requirements</h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The ETL cleaner validates each ingested row to guarantee data integrity before executing SQL rollups.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <th className="p-2">Column Header</th>
                  <th className="p-2">Required</th>
                  <th className="p-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 font-mono text-[11px]">
                <tr>
                  <td className="p-2 font-bold text-blue-600 dark:text-blue-400">order_date</td>
                  <td className="p-2 text-rose-500 font-bold">YES</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">ISO format (YYYY-MM-DD)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600 dark:text-blue-400">store_id</td>
                  <td className="p-2 text-rose-500 font-bold">YES</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">Integer FK referencing stores</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600 dark:text-blue-400">product_id</td>
                  <td className="p-2 text-rose-500 font-bold">YES</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">Integer FK referencing products</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600 dark:text-blue-400">quantity_sold</td>
                  <td className="p-2 text-rose-500 font-bold">YES</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">Positive integer (&gt; 0)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-blue-600 dark:text-blue-400">unit_price</td>
                  <td className="p-2 text-rose-500 font-bold">YES</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">Numeric price per unit</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-slate-500">discount_amount</td>
                  <td className="p-2 text-slate-400">OPTIONAL</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">Defaults to 0.0</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-slate-500">tax_amount</td>
                  <td className="p-2 text-slate-400">OPTIONAL</td>
                  <td className="p-2 font-sans text-slate-600 dark:text-slate-400">Defaults to 0.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
