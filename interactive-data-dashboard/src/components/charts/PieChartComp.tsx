import React from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartConfig } from '../../types';

interface PieChartCompProps {
  data: Record<string, any>[];
  config: ChartConfig;
  colors: string[];
}

export const PieChartComp: React.FC<PieChartCompProps> = ({
  data,
  config,
  colors,
}) => {
  const valueKey = config.yAxis || 'value';

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No data available for Pie / Donut composition
      </div>
    );
  }

  // Top 8 Slices + Combine others if too many
  let sliceData = [...data];
  if (sliceData.length > 8) {
    const top7 = sliceData.slice(0, 7);
    const rest = sliceData.slice(7);
    const restSum = rest.reduce((acc, curr) => acc + (Number(curr[valueKey]) || 0), 0);

    top7.push({
      x: 'Others',
      [valueKey]: Number(restSum.toFixed(2)),
      count: rest.reduce((acc, curr) => acc + (curr.count || 1), 0),
    });

    sliceData = top7;
  }

  const isDonut = config.isDonut ?? true;

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value: any) => [value, config.yAxis || 'Metric']}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Pie
            data={sliceData}
            dataKey={valueKey}
            nameKey="x"
            cx="50%"
            cy="45%"
            outerRadius={85}
            innerRadius={isDonut ? 45 : 0}
            paddingAngle={2}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {sliceData.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
