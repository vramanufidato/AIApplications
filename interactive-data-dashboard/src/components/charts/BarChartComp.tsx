import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartConfig } from '../../types';

interface BarChartCompProps {
  data: Record<string, any>[];
  seriesKeys: string[];
  config: ChartConfig;
  colors: string[];
}

export const BarChartComp: React.FC<BarChartCompProps> = ({
  data,
  seriesKeys,
  config,
  colors,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No data available for selected X/Y mapping
      </div>
    );
  }

  const isStacked = config.barMode === 'stacked';

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis
            dataKey="x"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          {seriesKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={isStacked ? 'stack1' : undefined}
              fill={colors[idx % colors.length]}
              radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
