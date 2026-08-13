import React from 'react';
import { ChartConfig, ColumnProfile } from '../../types';
import { prepareCorrelationHeatmap } from '../../utils/chartProcessor';

interface HeatmapCompProps {
  rows: Record<string, any>[];
  profiles: ColumnProfile[];
  config: ChartConfig;
}

export const HeatmapComp: React.FC<HeatmapCompProps> = ({
  rows,
  profiles,
}) => {
  const numericProfiles = profiles.filter((p) => p.type === 'numeric');

  if (numericProfiles.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        Requires at least 2 numeric columns to compute Correlation Matrix
      </div>
    );
  }

  const { rowKeys, colKeys, matrix } = prepareCorrelationHeatmap(rows, numericProfiles);

  if (!matrix || matrix.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No valid numeric rows for correlation matrix
      </div>
    );
  }

  // Get color for correlation value r between -1 and +1
  const getCellBgColor = (r: number) => {
    if (r === 1) return 'bg-indigo-600 text-white font-bold';
    if (r > 0.7) return 'bg-indigo-500/80 text-white font-semibold';
    if (r > 0.4) return 'bg-indigo-500/40 text-indigo-200';
    if (r > 0) return 'bg-indigo-500/20 text-indigo-300';
    if (r === 0) return 'bg-slate-800 text-slate-400';
    if (r > -0.4) return 'bg-rose-500/20 text-rose-300';
    if (r > -0.7) return 'bg-rose-500/40 text-rose-200';
    return 'bg-rose-600 text-white font-bold';
  };

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="space-y-3">
        {/* Heatmap Matrix Table */}
        <div className="inline-block border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-inner">
          <table className="text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300">
                <th className="p-2 border-b border-r border-slate-700/60 font-bold text-left">Variable</th>
                {colKeys.map((col) => (
                  <th key={col} className="p-2 border-b border-r border-slate-700/60 font-semibold truncate max-w-[100px]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((rowKey, rIdx) => (
                <tr key={rowKey} className="border-b border-slate-800/60">
                  <td className="p-2 font-bold text-slate-200 border-r border-slate-800 whitespace-nowrap bg-slate-800/40">
                    {rowKey}
                  </td>
                  {colKeys.map((colKey, cIdx) => {
                    const val = matrix[rIdx][cIdx];
                    return (
                      <td
                        key={colKey}
                        className={`p-3 text-center border-r border-slate-800/60 transition-all hover:opacity-80 cursor-pointer ${getCellBgColor(
                          val
                        )}`}
                        title={`Correlation between ${rowKey} & ${colKey}: ${val}`}
                      >
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Intensity Scale Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 max-w-sm pt-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-rose-600 rounded"></span>
            <span>-1.0 (Strong Negative)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-slate-800 rounded"></span>
            <span>0 (Neutral)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-indigo-600 rounded"></span>
            <span>+1.0 (Strong Positive)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
