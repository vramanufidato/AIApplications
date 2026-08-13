import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Layers,
  Sliders,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">How to Use InsightDash</h3>
              <p className="text-xs text-slate-400">Master interactive data profiling, linked filtering, and chart building</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-300 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">1. Upload CSV or Excel Dataset</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload any `.csv`, `.xlsx`, or `.xls` file. The app automatically detects delimiters (comma, semicolon, tab) and header row names. You can also click <strong>"Try Sample Data"</strong> to test instantly with pre-loaded datasets!
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">2. Data Profiling & Statistics</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Columns are automatically classified into <strong>Numeric</strong>, <strong>Categorical</strong>, or <strong>Date/Time</strong>. Expand the Data Profile panel to inspect Min, Max, Mean, Median, Std Dev, Unique counts, and Missing values %. You can also manually adjust column data types!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">3. Interactive Linked Filtering</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Use the left filter sidebar to slice your dataset by categorical multi-select checkboxes, numeric min-max range sliders, and date pickers. All filters are linked live and instantly re-render all active dashboard charts!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <div className="p-2.5 bg-amber-600/20 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">4. Multi-Chart Dashboard Builder</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add multiple charts to your dashboard grid. Pick from <strong>9 chart types</strong> (Bar, Line, Scatter, Histogram, Box Plot, Pie/Donut, Heatmap, Treemap, Data Table) and customize X/Y mappings, aggregation methods (Sum, Mean, Count), color groups, and palettes.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start space-x-4 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <div className="p-2.5 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">5. Download & Export</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Export your <strong>Filtered Dataset as CSV</strong>, download individual charts as high-resolution <strong>PNG images</strong>, or export the entire dashboard layout as a <strong>PDF report</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-500/20"
          >
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
};
