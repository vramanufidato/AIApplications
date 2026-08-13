import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Dataset } from '../types';
import { getSampleDataset } from '../utils/sampleData';

interface HeaderProps {
  dataset: Dataset | null;
  onUploadClick: () => void;
  onLoadSample: (dataset: Dataset) => void;
  onAddChart: () => void;
  onReset: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onOpenHelp: () => void;
  filteredCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  dataset,
  onUploadClick,
  onLoadSample,
  onAddChart,
  onReset,
  onExportPDF,
  onExportCSV,
  onOpenHelp,
  filteredCount,
}) => {
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">InsightDash</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Interactive Analytics
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {dataset ? (
                <span className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-semibold truncate max-w-[180px] sm:max-w-[260px]">
                    {dataset.fileName}
                  </span>
                  <span>•</span>
                  <span>{filteredCount.toLocaleString()} / {dataset.data.length.toLocaleString()} rows filtered</span>
                </span>
              ) : (
                'Upload CSV or Excel to explore'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {dataset ? (
            <>
              {/* Add Chart */}
              <button
                id="btn-add-chart"
                onClick={onAddChart}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-indigo-500/25"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Add Chart</span>
              </button>

              {/* Export Filtered CSV */}
              <button
                id="btn-export-csv"
                onClick={onExportCSV}
                title="Export Filtered CSV"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">Export CSV</span>
              </button>

              {/* PDF Dashboard Export */}
              <button
                id="btn-export-pdf"
                onClick={onExportPDF}
                title="Export Dashboard PDF"
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>PDF Report</span>
              </button>

              {/* Change Dataset / New File */}
              <button
                id="btn-upload-new"
                onClick={onUploadClick}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-all"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Change Data</span>
              </button>
            </>
          ) : (
            /* Blank State Quick Actions */
            <div className="flex items-center space-x-2">
              <button
                id="btn-upload-main"
                onClick={onUploadClick}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/20"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Dataset</span>
              </button>

              {/* Sample Datasets Dropdown */}
              <div className="relative">
                <button
                  id="btn-samples-menu"
                  onClick={() => setShowSampleMenu(!showSampleMenu)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-medium transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Try Sample Data</span>
                </button>

                {showSampleMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-2 space-y-1">
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Select Demo Dataset
                    </div>
                    <button
                      onClick={() => {
                        onLoadSample(getSampleDataset('saas'));
                        setShowSampleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-slate-700/70 text-slate-200 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">SaaS Sales & Revenue</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">20 rows</span>
                    </button>
                    <button
                      onClick={() => {
                        onLoadSample(getSampleDataset('retail'));
                        setShowSampleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-slate-700/70 text-slate-200 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">Retail Orders & Logistics</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">15 rows</span>
                    </button>
                    <button
                      onClick={() => {
                        onLoadSample(getSampleDataset('hr'));
                        setShowSampleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg hover:bg-slate-700/70 text-slate-200 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">Tech HR & Organization</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">10 rows</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Button */}
          <button
            id="btn-help-guide"
            onClick={onOpenHelp}
            title="How to use guide"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
