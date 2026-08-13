import React from 'react';
import { ChartConfig } from '../../types';
import { prepareBoxPlotData } from '../../utils/chartProcessor';

interface BoxPlotCompProps {
  rows: Record<string, any>[];
  config: ChartConfig;
  colors: string[];
}

export const BoxPlotComp: React.FC<BoxPlotCompProps> = ({
  rows,
  config,
  colors,
}) => {
  const groupCol = config.xAxis;
  const metricCol = config.yAxis;

  const boxPlotData = prepareBoxPlotData(rows, groupCol, metricCol);

  if (!boxPlotData || boxPlotData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        Please select a Categorical X-Axis and Numeric Y-Axis column for Box Plot
      </div>
    );
  }

  // Calculate overall min and max across all groups for scaling
  let overallMin = Math.min(...boxPlotData.map((d) => d.min));
  let overallMax = Math.max(...boxPlotData.map((d) => d.max));

  for (const d of boxPlotData) {
    if (d.outliers.length > 0) {
      overallMin = Math.min(overallMin, ...d.outliers);
      overallMax = Math.max(overallMax, ...d.outliers);
    }
  }

  const range = overallMax - overallMin || 1;
  const padding = range * 0.1;
  const plotMin = overallMin - padding;
  const plotMax = overallMax + padding;
  const plotRange = plotMax - plotMin;

  const getYPos = (val: number, height: number) => {
    return height - ((val - plotMin) / plotRange) * height;
  };

  const svgHeight = 260;
  const svgWidth = Math.max(320, boxPlotData.length * 100);

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-[320px] h-72 flex flex-col justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full text-xs">
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = plotMin + pct * plotRange;
            const y = svgHeight - pct * (svgHeight - 40) - 20;
            return (
              <g key={pct}>
                <line x1="40" y1={y} x2={svgWidth - 20} y2={y} stroke="#334155" strokeDasharray="3 3" opacity={0.5} />
                <text x="35" y={y + 3} fill="#94a3b8" fontSize="10" textAnchor="end">
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Render Boxes for each Group */}
          {boxPlotData.map((box, idx) => {
            const colWidth = (svgWidth - 60) / boxPlotData.length;
            const centerX = 50 + idx * colWidth + colWidth / 2;
            const boxWidth = Math.min(45, colWidth * 0.6);

            const h = svgHeight - 40;

            const yMin = getYPos(box.min, h) + 10;
            const yQ1 = getYPos(box.q1, h) + 10;
            const yMed = getYPos(box.median, h) + 10;
            const yQ3 = getYPos(box.q3, h) + 10;
            const yMax = getYPos(box.max, h) + 10;

            const themeColor = colors[idx % colors.length];

            return (
              <g key={box.group} className="group cursor-pointer">
                {/* Whisker Line (Min to Max) */}
                <line x1={centerX} y1={yMin} x2={centerX} y2={yMax} stroke="#94a3b8" strokeWidth="1.5" />

                {/* Min Cap & Max Cap */}
                <line x1={centerX - 10} y1={yMin} x2={centerX + 10} y2={yMin} stroke="#94a3b8" strokeWidth="2" />
                <line x1={centerX - 10} y1={yMax} x2={centerX + 10} y2={yMax} stroke="#94a3b8" strokeWidth="2" />

                {/* IQR Box (Q1 to Q3) */}
                <rect
                  x={centerX - boxWidth / 2}
                  y={yQ3}
                  width={boxWidth}
                  height={Math.max(2, yQ1 - yQ3)}
                  fill={themeColor}
                  fillOpacity="0.3"
                  stroke={themeColor}
                  strokeWidth="2"
                  rx="3"
                />

                {/* Median Line */}
                <line
                  x1={centerX - boxWidth / 2}
                  y1={yMed}
                  x2={centerX + boxWidth / 2}
                  y2={yMed}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Outlier Points */}
                {box.outliers.map((out, oIdx) => (
                  <circle
                    key={oIdx}
                    cx={centerX}
                    cy={getYPos(out, h) + 10}
                    r="3.5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}

                {/* Group Label */}
                <text
                  x={centerX}
                  y={svgHeight - 5}
                  fill="#cbd5e1"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {box.group.length > 10 ? box.group.slice(0, 10) + '…' : box.group}
                </text>

                {/* Hover Tooltip SVG Title */}
                <title>
                  {`${box.group}\nMin: ${box.min}\nQ1: ${box.q1}\nMedian: ${box.median}\nQ3: ${box.q3}\nMax: ${box.max}\nOutliers: ${box.outliers.length}`}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
