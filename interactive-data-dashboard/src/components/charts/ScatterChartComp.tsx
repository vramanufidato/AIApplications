import React from 'react';
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { ChartConfig } from '../../types';

interface ScatterChartCompProps {
  rows: Record<string, any>[];
  config: ChartConfig;
  colors: string[];
}

export const ScatterChartComp: React.FC<ScatterChartCompProps> = ({
  rows,
  config,
  colors,
}) => {
  const { xAxis, yAxis, sizeBy, groupBy } = config;

  if (!xAxis || !yAxis || !rows || rows.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        Please select numeric X-Axis and Y-Axis columns for Scatter Plot
      </div>
    );
  }

  // Parse points
  const groupPointsMap = new Map<string, any[]>();

  for (const r of rows) {
    const groupName = groupBy ? String(r[groupBy] ?? 'Default') : 'Points';

    const rawX = r[xAxis];
    const rawY = r[yAxis];

    const numX = typeof rawX === 'number' ? rawX : Number(String(rawX).replace(/[\$,]/g, ''));
    const numY = typeof rawY === 'number' ? rawY : Number(String(rawY).replace(/[\$,]/g, ''));

    if (isNaN(numX) || isNaN(numY)) continue;

    let zVal = 100;
    if (sizeBy) {
      const rawZ = r[sizeBy];
      const numZ = typeof rawZ === 'number' ? rawZ : Number(String(rawZ).replace(/[\$,]/g, ''));
      if (!isNaN(numZ)) zVal = numZ;
    }

    if (!groupPointsMap.has(groupName)) {
      groupPointsMap.set(groupName, []);
    }

    groupPointsMap.get(groupName)!.push({
      x: numX,
      y: numY,
      z: zVal,
      label: r[xAxis],
      row: r,
    });
  }

  const groups = Array.from(groupPointsMap.entries());

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxis}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxis}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <ZAxis type="number" dataKey="z" range={[50, 400]} name={sizeBy || 'Size'} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          {groups.map(([gName, pts], idx) => (
            <Scatter
              key={gName}
              name={gName}
              data={pts}
              fill={colors[idx % colors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
