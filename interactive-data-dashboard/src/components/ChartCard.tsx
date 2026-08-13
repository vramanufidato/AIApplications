import React, { useState } from 'react';
import {
  BarChart3,
  BoxSelect,
  Download,
  Grid,
  HelpCircle,
  LineChart as LineChartIcon,
  Maximize2,
  Minimize2,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Settings,
  Sliders,
  Table as TableIcon,
  Trash2,
} from 'lucide-react';
import {
  AggregationType,
  ChartConfig,
  ChartType,
  ColorTheme,
  ColumnProfile,
} from '../types';
import { exportElementAsPNG } from '../utils/exportUtils';
import { prepareAggregatedChartData } from '../utils/chartProcessor';
import { BarChartComp } from './charts/BarChartComp';
import { LineChartComp } from './charts/LineChartComp';
import { ScatterChartComp } from './charts/ScatterChartComp';
import { HistogramChartComp } from './charts/HistogramChartComp';
import { BoxPlotComp } from './charts/BoxPlotComp';
import { PieChartComp } from './charts/PieChartComp';
import { HeatmapComp } from './charts/HeatmapComp';
import { TreemapComp } from './charts/TreemapComp';
import { DataTableComp } from './charts/DataTableComp';

interface ChartCardProps {
  config: ChartConfig;
  profiles: ColumnProfile[];
  filteredRows: Record<string, any>[];
  allColumns: string[];
  onUpdateConfig: (newConfig: ChartConfig) => void;
  onRemoveChart: () => void;
}

const COLOR_PALETTES: Record<ColorTheme, string[]> = {
  indigo: ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#3730a3'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857'],
  sunset: ['#f43f5e', '#fb7185', '#fb923c', '#fbbf24', '#e11d48'],
  ocean: ['#06b6d4', '#38bdf8', '#60a5fa', '#2563eb', '#1d4ed8'],
  purple: ['#a855f7', '#c084fc', '#e879f9', '#7e22ce', '#6b21a8'],
  monochrome: ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'],
};

export const ChartCard: React.FC<ChartCardProps> = ({
  config,
  profiles,
  filteredRows,
  allColumns,
  onUpdateConfig,
  onRemoveChart,
}) => {
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const colors = COLOR_PALETTES[config.colorTheme] || COLOR_PALETTES.indigo;

  const numCols = profiles.filter((p) => p.type === 'numeric').map((p) => p.name);
  const catCols = profiles.filter((p) => p.type === 'categorical' || p.type === 'datetime').map((p) => p.name);

  // Prepare aggregated data for Bar, Line, Pie, Treemap
  const { chartData, seriesKeys } = prepareAggregatedChartData(filteredRows, config);

  const handleChartTypeChange = (type: ChartType) => {
    let updatedX = config.xAxis;
    let updatedY = config.yAxis;

    // Smart defaults when changing type
    if (type === 'histogram') {
      updatedY = numCols[0] || allColumns[0];
    } else if (type === 'boxplot') {
      updatedX = catCols[0] || allColumns[0];
      updatedY = numCols[0] || allColumns[1] || allColumns[0];
    } else if (type === 'scatter') {
      updatedX = numCols[0] || allColumns[0];
      updatedY = numCols[1] || numCols[0] || allColumns[1] || allColumns[0];
    }

    onUpdateConfig({
      ...config,
      chartType: type,
      xAxis: updatedX,
      yAxis: updatedY,
    });
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 transition-all ${
        config.spanCols === 3
          ? 'col-span-1 md:col-span-2 lg:col-span-3'
          : config.spanCols === 2
          ? 'col-span-1 md:col-span-2'
          : 'col-span-1'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        {/* Title Input & Type Selector */}
        <div className="flex items-center space-x-2.5">
          <select
            value={config.chartType}
            onChange={(e) => handleChartTypeChange(e.target.value as ChartType)}
            className="bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-bold text-indigo-300 px-2.5 py-1.5 focus:outline-none"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="histogram">Histogram</option>
            <option value="boxplot">Box Plot</option>
            <option value="pie">Pie / Donut</option>
            <option value="heatmap">Heatmap</option>
            <option value="treemap">Treemap</option>
            <option value="table">Data Table</option>
          </select>

          <input
            type="text"
            value={config.title}
            onChange={(e) => onUpdateConfig({ ...config, title: e.target.value })}
            className="bg-transparent text-sm font-bold text-white focus:bg-slate-800/60 border border-transparent hover:border-slate-800 rounded-lg px-2 py-1 transition-colors outline-none"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 text-slate-400">
          {/* Configure Controls Toggle */}
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showConfigPanel
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Configure Mappings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Width Span Toggle */}
          <button
            onClick={() =>
              onUpdateConfig({
                ...config,
                spanCols: config.spanCols === 1 ? 2 : config.spanCols === 2 ? 3 : 1,
              })
            }
            className="p-1.5 bg-slate-800/80 border border-slate-700 rounded-lg hover:text-white transition-colors"
            title="Toggle Card Grid Span (1, 2, or 3 columns)"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* PNG Export Button */}
          <button
            onClick={() => exportElementAsPNG(`chart-${config.id}`, `${config.title.replace(/\s+/g, '_')}.png`)}
            className="p-1.5 bg-slate-800/80 border border-slate-700 rounded-lg hover:text-white transition-colors"
            title="Export PNG Image"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Remove Chart */}
          <button
            onClick={onRemoveChart}
            className="p-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Remove Chart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Mappings / Configuration Bar */}
      {showConfigPanel && (
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* X Axis Mapping */}
          {config.chartType !== 'heatmap' && (
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                X-Axis
              </label>
              <select
                value={config.xAxis}
                onChange={(e) => onUpdateConfig({ ...config, xAxis: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
              >
                {allColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Y Axis Mapping */}
          {config.chartType !== 'heatmap' && (
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {config.chartType === 'histogram' ? 'Target Column' : 'Y-Axis / Metric'}
              </label>
              <select
                value={config.yAxis}
                onChange={(e) => onUpdateConfig({ ...config, yAxis: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
              >
                {allColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Aggregation Function */}
          {['bar', 'line', 'pie', 'treemap'].includes(config.chartType) && (
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Aggregation
              </label>
              <select
                value={config.aggregation}
                onChange={(e) => onUpdateConfig({ ...config, aggregation: e.target.value as AggregationType })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
              >
                <option value="sum">Sum</option>
                <option value="mean">Average (Mean)</option>
                <option value="count">Count Rows</option>
                <option value="median">Median</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
              </select>
            </div>
          )}

          {/* Group By / Color encoding */}
          {['bar', 'line', 'scatter'].includes(config.chartType) && (
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Group By / Color
              </label>
              <select
                value={config.groupBy || ''}
                onChange={(e) => onUpdateConfig({ ...config, groupBy: e.target.value || undefined })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
              >
                <option value="">(None)</option>
                {catCols.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Palette Selector */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Color Palette
            </label>
            <select
              value={config.colorTheme}
              onChange={(e) => onUpdateConfig({ ...config, colorTheme: e.target.value as ColorTheme })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
            >
              <option value="indigo">Indigo Stream</option>
              <option value="emerald">Emerald Forest</option>
              <option value="sunset">Sunset Coral</option>
              <option value="ocean">Ocean Blue</option>
              <option value="purple">Royal Purple</option>
              <option value="monochrome">Monochrome Slate</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Visualization Container */}
      <div id={`chart-${config.id}`} className="relative bg-slate-900 p-2 rounded-xl">
        {config.chartType === 'bar' && (
          <BarChartComp data={chartData} seriesKeys={seriesKeys} config={config} colors={colors} />
        )}

        {config.chartType === 'line' && (
          <LineChartComp data={chartData} seriesKeys={seriesKeys} config={config} colors={colors} />
        )}

        {config.chartType === 'scatter' && (
          <ScatterChartComp rows={filteredRows} config={config} colors={colors} />
        )}

        {config.chartType === 'histogram' && (
          <HistogramChartComp rows={filteredRows} config={config} color={colors[0]} />
        )}

        {config.chartType === 'boxplot' && (
          <BoxPlotComp rows={filteredRows} config={config} colors={colors} />
        )}

        {config.chartType === 'pie' && (
          <PieChartComp data={chartData} config={config} colors={colors} />
        )}

        {config.chartType === 'heatmap' && (
          <HeatmapComp rows={filteredRows} profiles={profiles} config={config} />
        )}

        {config.chartType === 'treemap' && (
          <TreemapComp data={chartData} config={config} colors={colors} />
        )}

        {config.chartType === 'table' && (
          <DataTableComp rows={filteredRows} columns={allColumns} />
        )}
      </div>
    </div>
  );
};
