import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Table,
  Sparkles,
} from 'lucide-react';
import { Dataset } from '../types';
import { parseFile, ParseResult } from '../utils/parser';
import { profileDataset } from '../utils/profiler';
import { getSampleDataset } from '../utils/sampleData';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: Dataset) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [customDelimiter, setCustomDelimiter] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File, sheetIdx = 0, delim?: string) => {
    setLoading(true);
    setError(null);
    setSelectedFile(file);

    try {
      const result = await parseFile(file, {
        sheetIndex: sheetIdx,
        delimiter: delim || undefined,
      });

      if (!result.data || result.data.length === 0) {
        throw new Error('The uploaded file contains no readable data rows.');
      }

      setParseResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse file. Please verify CSV/Excel format.');
      setParseResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleConfirmDataset = () => {
    if (!parseResult || !selectedFile) return;

    const profiles = profileDataset(parseResult.data, parseResult.columns);

    const dataset: Dataset = {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      delimiter: parseResult.delimiter,
      hasHeader: parseResult.hasHeader,
      data: parseResult.data,
      columns: parseResult.columns,
      profiles,
      sheets: parseResult.sheets,
      activeSheet: parseResult.activeSheet,
    };

    onDatasetLoaded(dataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upload Dataset</h3>
              <p className="text-xs text-slate-400">Supports .csv, .xlsx, and .xls files with automatic delimiter detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/80'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-slate-800 rounded-full border border-slate-700 shadow-inner">
                <FileSpreadsheet className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your file here, or <span className="text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  CSV, Excel (.xlsx, .xls) files up to 20MB
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo Dataset Selector */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-slate-300">Don't have a dataset ready? Try a sample:</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onDatasetLoaded(getSampleDataset('saas'));
                  onClose();
                }}
                className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                SaaS Sales
              </button>
              <button
                onClick={() => {
                  onDatasetLoaded(getSampleDataset('retail'));
                  onClose();
                }}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                Retail Store
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl flex items-center justify-center space-x-3 text-slate-300">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Parsing dataset & detecting column types...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3 text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold">Error Processing File</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Preview Section after file uploaded */}
          {parseResult && !loading && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{selectedFile?.name}</p>
                    <p className="text-xs text-slate-400">
                      {parseResult.totalRows.toLocaleString()} rows • {parseResult.columns.length} columns
                      {parseResult.delimiter && ` • Delimiter: '${parseResult.delimiter}'`}
                    </p>
                  </div>
                </div>

                {/* Sheet Selector if Excel */}
                {parseResult.sheets && parseResult.sheets.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-medium">Sheet:</span>
                    <select
                      value={activeSheetIndex}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setActiveSheetIndex(idx);
                        if (selectedFile) handleFileProcess(selectedFile, idx);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 px-2.5 py-1"
                    >
                      {parseResult.sheets.map((sheet, i) => (
                        <option key={sheet} value={i}>
                          {sheet}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Data Preview Table (First 5 Rows) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Table className="w-4 h-4 text-indigo-400" />
                    <span>Data Preview (First 5 rows)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Showing top {Math.min(5, parseResult.data.length)} records
                  </span>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-48 bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/90 text-slate-200 font-semibold sticky top-0 border-b border-slate-700">
                      <tr>
                        {parseResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 border-r border-slate-700/60 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {parseResult.data.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {parseResult.columns.map((col) => (
                            <td key={col} className="px-3 py-2 border-r border-slate-800 whitespace-nowrap truncate max-w-[150px]">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="text-slate-500 italic">null</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-upload"
            disabled={!parseResult || loading}
            onClick={handleConfirmDataset}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              parseResult && !loading
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            Load into Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
