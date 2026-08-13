import React from 'react';
import { ChartConfig } from '../../types';

interface TreemapCompProps {
  data: Record<string, any>[];
  config: ChartConfig;
  colors: string[];
}

export const TreemapComp: React.FC<TreemapCompProps> = ({
  data,
  config,
  colors,
}) => {
  const metricKey = config.yAxis || 'value';

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No data available for Treemap hierarchy
      </div>
    );
  }

  const sorted = [...data]
    .filter((d) => (Number(d[metricKey]) || 0) > 0)
    .sort((a, b) => (Number(b[metricKey]) || 0) - (Number(a[metricKey]) || 0))
    .slice(0, 12);

  const totalSum = sorted.reduce((acc, curr) => acc + (Number(curr[metricKey]) || 0), 0);

  if (totalSum === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        Total metric value is 0 for selected mapping
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80 py-2">
      <div className="w-full h-full border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80 p-2 flex flex-wrap gap-1.5 align-content-start">
        {sorted.map((item, idx) => {
          const val = Number(item[metricKey]) || 0;
          const pct = (val / totalSum) * 100;
          const tileBg = colors[idx % colors.length];

          return (
            <div
              key={item.x}
              style={{
                flexGrow: Math.max(1, Math.round(pct * 2)),
                flexBasis: `${Math.max(12, Math.min(45, pct))}%`,
                minHeight: '65px',
              }}
              className="rounded-lg p-2.5 flex flex-col justify-between transition-all hover:scale-[1.01] hover:brightness-110 shadow-sm relative group cursor-pointer"
            >
              <div
                className="absolute inset-0 rounded-lg opacity-85"
                style={{ backgroundColor: tileBg }}
              />

              <div className="relative z-10 text-white font-bold text-xs truncate drop-shadow-sm">
                {item.x}
              </div>

              <div className="relative z-10 text-white/90 text-[11px] font-medium drop-shadow-sm flex items-center justify-between">
                <span>{val.toLocaleString()}</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
