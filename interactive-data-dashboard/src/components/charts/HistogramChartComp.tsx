import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartConfig } from '../../types';
import { prepareHistogramData } from '../../utils/chartProcessor';

interface HistogramChartCompProps {
  rows: Record<string, any>[];
  config: ChartConfig;
  color: string;
}

export const HistogramChartComp: React.FC<HistogramChartCompProps> = ({
  rows,
  config,
  color,
}) => {
  const targetCol = config.yAxis || config.xAxis;
  const binCount = config.binCount || 10;

  const data = prepareHistogramData(rows, targetCol, binCount);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        Please select a numeric column for Histogram distribution
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis
            dataKey="binLabel"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            angle={-20}
            textAnchor="end"
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Frequency Count', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} name="Frequency" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
