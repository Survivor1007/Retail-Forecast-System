import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { uploadCSV } from '../services/api';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a valid CSV file.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await uploadCSV(file);
      setResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Check CSV formatting.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-lg p-7 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            <UploadCloud className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ingest Raw Sales CSV</h3>
            <p className="text-xs text-slate-400">
              Upload transactional sales data for automated ETL processing
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center mb-5 bg-white/[0.02]">
          <FileText className="w-9 h-9 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-300 mb-3">
            {file ? `Selected: ${file.name}` : 'Drag & drop your CSV file here, or click to browse'}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="btn-secondary cursor-pointer">
            Choose CSV File
          </label>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg mb-4 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg mb-4 text-xs">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <CheckCircle className="w-4 h-4" /> {result.message}
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              <li>Total Rows Ingested: {result.total_rows_ingested}</li>
              <li>Clean Rows Inserted: {result.clean_rows_inserted}</li>
              <li>Invalid Rows Skipped: {result.invalid_rows_skipped}</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary">
            {uploading ? 'Processing ETL...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  );
};
