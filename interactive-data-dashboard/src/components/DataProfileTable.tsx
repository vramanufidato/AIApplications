import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Hash,
  Info,
  Layers,
  PieChart,
  Settings2,
  Sliders,
  Table as TableIcon,
  Type,
} from 'lucide-react';
import { ColumnDataType, ColumnProfile, Dataset } from '../types';

interface DataProfileTableProps {
  dataset: Dataset;
  profiles: ColumnProfile[];
  onTypeOverride: (columnName: string, newType: ColumnDataType) => void;
  filteredCount: number;
}

export const DataProfileTable: React.FC<DataProfileTableProps> = ({
  dataset,
  profiles,
  onTypeOverride,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalRows = dataset.data.length;
  const totalCols = dataset.columns.length;

  const totalNulls = profiles.reduce((acc, p) => acc + p.nullCount, 0);
  const totalCells = totalRows * totalCols;
  const missingPct = totalCells > 0 ? ((totalNulls / totalCells) * 100).toFixed(1) : '0';

  const numCount = profiles.filter((p) => p.type === 'numeric').length;
  const catCount = profiles.filter((p) => p.type === 'categorical').length;
  const dateCount = profiles.filter((p) => p.type === 'datetime').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Overview Stat Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stat 1: Rows */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Rows</p>
            <p className="text-lg font-bold text-white mt-0.5">{totalRows.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {filteredCount < totalRows ? (
                <span className="text-amber-400 font-medium">{filteredCount.toLocaleString()} active</span>
              ) : (
                '100% active'
              )}
            </p>
          </div>
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
            <TableIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Columns */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Columns</p>
            <p className="text-lg font-bold text-white mt-0.5">{totalCols}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{numCount} Num • {catCount} Cat • {dateCount} Date</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Missing % */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Missing Values</p>
            <p className="text-lg font-bold text-white mt-0.5">{missingPct}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{totalNulls.toLocaleString()} empty cells</p>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
            <Info className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Data Quality Toggle */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Data Profile</p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Summary'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <Settings2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Expandable Data Profiling Column Details Table */}
      {isExpanded && (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 pt-2">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Column Profiling & Data Type Classification</span>
            </h4>
            <span className="text-[11px] text-slate-400">You can manually change data types below if needed</span>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-200 font-semibold sticky top-0 border-b border-slate-700">
                <tr>
                  <th className="px-3.5 py-2.5">Column Name</th>
                  <th className="px-3.5 py-2.5">Type</th>
                  <th className="px-3.5 py-2.5">Missing</th>
                  <th className="px-3.5 py-2.5">Unique</th>
                  <th className="px-3.5 py-2.5">Key Statistics / Top Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profiles.map((p) => {
                  const nullPct = totalRows > 0 ? (p.nullCount / totalRows) * 100 : 0;

                  return (
                    <tr key={p.name} className="hover:bg-slate-800/30">
                      {/* Name */}
                      <td className="px-3.5 py-2.5 font-semibold text-white whitespace-nowrap">
                        {p.name}
                      </td>

                      {/* Type Selector */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <select
                          value={p.type}
                          onChange={(e) => onTypeOverride(p.name, e.target.value as ColumnDataType)}
                          className={`text-xs font-medium rounded-lg px-2 py-1 border outline-none bg-slate-900 ${
                            p.type === 'numeric'
                              ? 'text-indigo-300 border-indigo-500/40'
                              : p.type === 'datetime'
                              ? 'text-emerald-300 border-emerald-500/40'
                              : 'text-purple-300 border-purple-500/40'
                          }`}
                        >
                          <option value="numeric">Hash / Numeric</option>
                          <option value="categorical">Type / Categorical</option>
                          <option value="datetime">Calendar / Date</option>
                        </select>
                      </td>

                      {/* Missing count & bar */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-300">
                            {p.nullCount} ({nullPct.toFixed(0)}%)
                          </span>
                          {nullPct > 0 && (
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${Math.min(100, nullPct)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Unique Count */}
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-300">
                        {p.uniqueCount.toLocaleString()}
                      </td>

                      {/* Summary Statistics */}
                      <td className="px-3.5 py-2.5 text-xs text-slate-300">
                        {p.type === 'numeric' && (
                          <div className="flex items-center space-x-3 text-[11px]">
                            <span>Min: <strong className="text-white">{p.min}</strong></span>
                            <span>Max: <strong className="text-white">{p.max}</strong></span>
                            <span>Mean: <strong className="text-indigo-300">{p.mean}</strong></span>
                            <span>Median: <strong className="text-indigo-300">{p.median}</strong></span>
                          </div>
                        )}

                        {p.type === 'datetime' && (
                          <div className="flex items-center space-x-3 text-[11px]">
                            <span>Range: <strong className="text-emerald-300">{p.minDate}</strong> to <strong className="text-emerald-300">{p.maxDate}</strong></span>
                          </div>
                        )}

                        {p.type === 'categorical' && (
                          <div className="flex flex-wrap gap-1 text-[11px]">
                            {p.topValues && p.topValues.length > 0 ? (
                              p.topValues.slice(0, 3).map((tv) => (
                                <span
                                  key={tv.value}
                                  className="bg-slate-800 border border-slate-700/60 px-1.5 py-0.5 rounded text-slate-300"
                                >
                                  {tv.value} ({tv.count})
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
