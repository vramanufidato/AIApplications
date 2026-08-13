import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { ChartConfig, ColumnDataType, Dataset, GlobalFilterState } from './types';
import { applyFilters, createInitialFilterState } from './utils/filterEngine';
import { profileDataset } from './utils/profiler';
import { getSampleDataset } from './utils/sampleData';
import { downloadCSV, exportDashboardAsPDF } from './utils/exportUtils';
import { Header } from './components/Header';
import { FileUploadModal } from './components/FileUploadModal';
import { DataProfileTable } from './components/DataProfileTable';
import { FilterSidebar } from './components/FilterSidebar';
import { ChartCard } from './components/ChartCard';
import { HowToUseModal } from './components/HowToUseModal';

export default function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [filterState, setFilterState] = useState<GlobalFilterState | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Default Chart Configuration Setup when a Dataset is Loaded
  const setupDefaultCharts = (loadedDataset: Dataset) => {
    const profiles = loadedDataset.profiles;
    const catCols = profiles.filter((p) => p.type === 'categorical').map((p) => p.name);
    const numCols = profiles.filter((p) => p.type === 'numeric').map((p) => p.name);
    const dateCols = profiles.filter((p) => p.type === 'datetime').map((p) => p.name);

    const xCol = catCols[0] || dateCols[0] || loadedDataset.columns[0];
    const yCol = numCols[0] || loadedDataset.columns[1] || loadedDataset.columns[0];
    const secondaryYCol = numCols[1] || yCol;

    const initialCharts: ChartConfig[] = [
      {
        id: 'chart-1',
        title: `Metric Summary by ${xCol}`,
        chartType: 'bar',
        xAxis: xCol,
        yAxis: yCol,
        aggregation: 'sum',
        colorTheme: 'indigo',
        barMode: 'grouped',
        spanCols: 2,
      },
      {
        id: 'chart-2',
        title: `${yCol} Composition Breakdown`,
        chartType: 'pie',
        xAxis: xCol,
        yAxis: yCol,
        aggregation: 'sum',
        colorTheme: 'emerald',
        isDonut: true,
        spanCols: 1,
      },
      {
        id: 'chart-3',
        title: numCols.length >= 2 ? `${numCols[0]} vs ${numCols[1]} Distribution` : 'Data Records Table',
        chartType: numCols.length >= 2 ? 'scatter' : 'table',
        xAxis: numCols[0] || loadedDataset.columns[0],
        yAxis: secondaryYCol,
        aggregation: 'mean',
        colorTheme: 'sunset',
        spanCols: 3,
      },
    ];

    setCharts(initialCharts);
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    setFilterState(createInitialFilterState(newDataset.profiles));
    setupDefaultCharts(newDataset);
  };

  // Handle Type Overrides by user
  const handleTypeOverride = (columnName: string, newType: ColumnDataType) => {
    if (!dataset) return;

    const updatedProfiles = profileDataset(dataset.data, dataset.columns, {
      ...dataset.profiles.reduce((acc, p) => ({ ...acc, [p.name]: p.type }), {}),
      [columnName]: newType,
    });

    const updatedDataset = {
      ...dataset,
      profiles: updatedProfiles,
    };

    setDataset(updatedDataset);
    setFilterState(createInitialFilterState(updatedProfiles));
  };

  // Filtered rows dynamically computed
  const filteredRows = useMemo(() => {
    if (!dataset || !filterState) return [];
    return applyFilters(dataset.data, dataset.columns, dataset.profiles, filterState);
  }, [dataset, filterState]);

  // Chart Handlers
  const handleAddChart = () => {
    if (!dataset) return;
    const newId = `chart-${Date.now()}`;
    const xCol = dataset.columns[0];
    const yCol = dataset.columns[1] || dataset.columns[0];

    const newChart: ChartConfig = {
      id: newId,
      title: `New Custom Chart ${charts.length + 1}`,
      chartType: 'bar',
      xAxis: xCol,
      yAxis: yCol,
      aggregation: 'sum',
      colorTheme: 'purple',
      spanCols: 1,
    };

    setCharts([...charts, newChart]);
  };

  const handleUpdateChart = (updatedConfig: ChartConfig) => {
    setCharts(charts.map((c) => (c.id === updatedConfig.id ? updatedConfig : c)));
  };

  const handleRemoveChart = (chartId: string) => {
    setCharts(charts.filter((c) => c.id !== chartId));
  };

  const handleResetDashboard = () => {
    if (dataset) {
      setFilterState(createInitialFilterState(dataset.profiles));
      setupDefaultCharts(dataset);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        dataset={dataset}
        onUploadClick={() => setIsUploadOpen(true)}
        onLoadSample={(s) => handleDatasetLoaded(s)}
        onAddChart={handleAddChart}
        onReset={handleResetDashboard}
        onExportPDF={() => exportDashboardAsPDF('dashboard-main-area', 'InsightDash_Report.pdf')}
        onExportCSV={() => downloadCSV(filteredRows, `${dataset?.fileName.replace(/\.[^/.]+$/, '')}_filtered.csv`)}
        onOpenHelp={() => setIsHelpOpen(true)}
        filteredCount={filteredRows.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {dataset && filterState ? (
          <div id="dashboard-main-area" className="space-y-6">
            {/* Top Data Profiling & Stat Summary */}
            <DataProfileTable
              dataset={dataset}
              profiles={dataset.profiles}
              onTypeOverride={handleTypeOverride}
              filteredCount={filteredRows.length}
            />

            {/* Main Workspace Layout: Filter Sidebar + Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Left Column: Interactive Linked Filters */}
              <div className="lg:col-span-1 sticky top-20">
                <FilterSidebar
                  profiles={dataset.profiles}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onResetFilters={() => setFilterState(createInitialFilterState(dataset.profiles))}
                  totalCount={dataset.data.length}
                  filteredCount={filteredRows.length}
                />
              </div>

              {/* Right Columns: Multi-Chart Visualization Grid */}
              <div className="lg:col-span-3 space-y-6">
                {charts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {charts.map((chart) => (
                      <ChartCard
                        key={chart.id}
                        config={chart}
                        profiles={dataset.profiles}
                        filteredRows={filteredRows}
                        allColumns={dataset.columns}
                        onUpdateConfig={handleUpdateChart}
                        onRemoveChart={() => handleRemoveChart(chart.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                    <p className="text-sm font-semibold text-slate-300">No active charts on the dashboard</p>
                    <button
                      onClick={handleAddChart}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Chart</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Blank Welcome State when no dataset uploaded yet */
          <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto">
            {/* Icon Header */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-0.5 shadow-2xl shadow-indigo-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            {/* Headline & Description */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Interactive Data Analytics & Visualization
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                Upload your CSV or Excel file to instantly generate automated column profiling, linked multi-select filters, and customizable chart dashboards.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <button
                id="btn-upload-welcome"
                onClick={() => setIsUploadOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/25 hover:scale-[1.02]"
              >
                <Upload className="w-5 h-5" />
                <span>Upload CSV / Excel File</span>
              </button>

              <button
                onClick={() => handleDatasetLoaded(getSampleDataset('saas'))}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Try Demo SaaS Dataset</span>
              </button>
            </div>

            {/* Quick Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left w-full border-t border-slate-900">
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1.5">
                <div className="p-2 bg-indigo-500/10 rounded-lg w-fit text-indigo-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">Auto Delimiter & Sheets</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Supports .csv, .xlsx, and .xls with automatic delimiter detection and multi-sheet selection.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1.5">
                <div className="p-2 bg-purple-500/10 rounded-lg w-fit text-purple-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">9 Chart Types</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bar, Line, Scatter, Histogram, Box plot, Pie/Donut, Heatmap, Treemap, and Data Table views.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg w-fit text-emerald-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-white">Linked Live Filters</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Multi-selects, min-max range sliders, and date pickers update all active visualizations in real time.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      {/* How to Use Guide Modal */}
      <HowToUseModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
