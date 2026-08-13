import { AggregationType, ChartConfig, ColumnProfile } from '../types';

export interface AggregatedPoint {
  x: string;
  y: number;
  [key: string]: any;
}

export interface BoxPlotPoint {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  count: number;
}

export interface HeatmapMatrix {
  rowKeys: string[];
  colKeys: string[];
  matrix: number[][]; // values normalized or raw
  minVal: number;
  maxVal: number;
  isCorrelation: boolean;
}

/**
 * Compute metric aggregation on array of numbers
 */
export function calculateAggregation(values: number[], method: AggregationType): number {
  if (!values || values.length === 0) return 0;

  if (method === 'count') return values.length;

  if (method === 'sum') {
    const sum = values.reduce((a, b) => a + b, 0);
    return Number(sum.toFixed(2));
  }

  if (method === 'mean') {
    const sum = values.reduce((a, b) => a + b, 0);
    return Number((sum / values.length).toFixed(2));
  }

  if (method === 'min') {
    return Number(Math.min(...values).toFixed(2));
  }

  if (method === 'max') {
    return Number(Math.max(...values).toFixed(2));
  }

  if (method === 'median') {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const val = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return Number(val.toFixed(2));
  }

  return 0;
}

/**
 * Aggregate data for Bar, Line, Pie, and Treemap charts
 */
export function prepareAggregatedChartData(
  rows: Record<string, any>[],
  config: ChartConfig
): { chartData: Record<string, any>[]; seriesKeys: string[] } {
  const { xAxis, yAxis, aggregation, groupBy } = config;

  if (!rows || rows.length === 0 || !xAxis) {
    return { chartData: [], seriesKeys: [yAxis || 'Value'] };
  }

  // 1. If GroupBy is present -> Pivot table
  if (groupBy && groupBy !== xAxis) {
    const groupMap = new Map<string, Map<string, number[]>>();
    const allSeries = new Set<string>();

    for (const row of rows) {
      const xVal = row[xAxis] === null || row[xAxis] === undefined ? '(Blank)' : String(row[xAxis]);
      const gVal = row[groupBy] === null || row[groupBy] === undefined ? '(Other)' : String(row[groupBy]);
      allSeries.add(gVal);

      let yNum = 1;
      if (yAxis && yAxis !== xAxis) {
        const raw = row[yAxis];
        yNum = typeof raw === 'number' ? raw : Number(String(raw).replace(/[\$,]/g, ''));
        if (isNaN(yNum)) yNum = 0;
      }

      if (!groupMap.has(xVal)) {
        groupMap.set(xVal, new Map<string, number[]>());
      }
      const xMap = groupMap.get(xVal)!;
      if (!xMap.has(gVal)) {
        xMap.set(gVal, []);
      }
      xMap.get(gVal)!.push(yNum);
    }

    const seriesKeys = Array.from(allSeries);
    const chartData: Record<string, any>[] = [];

    for (const [xVal, xMap] of groupMap.entries()) {
      const point: Record<string, any> = { x: xVal };
      for (const seriesKey of seriesKeys) {
        const vals = xMap.get(seriesKey) || [];
        point[seriesKey] = vals.length > 0 ? calculateAggregation(vals, aggregation) : 0;
      }
      chartData.push(point);
    }

    return { chartData, seriesKeys };
  }

  // 2. Standard 1-level Aggregation
  const aggMap = new Map<string, number[]>();

  for (const row of rows) {
    const xVal = row[xAxis] === null || row[xAxis] === undefined ? '(Blank)' : String(row[xAxis]);
    
    let yNum = 1;
    if (yAxis && yAxis !== xAxis) {
      const raw = row[yAxis];
      yNum = typeof raw === 'number' ? raw : Number(String(raw).replace(/[\$,]/g, ''));
      if (isNaN(yNum)) yNum = 0;
    }

    if (!aggMap.has(xVal)) {
      aggMap.set(xVal, []);
    }
    aggMap.get(xVal)!.push(yNum);
  }

  const chartData: Record<string, any>[] = [];
  for (const [xVal, vals] of aggMap.entries()) {
    const val = calculateAggregation(vals, aggregation);
    chartData.push({
      x: xVal,
      [yAxis || 'value']: val,
      count: vals.length,
    });
  }

  return { chartData, seriesKeys: [yAxis || 'value'] };
}

/**
 * Generate Histogram frequency distribution bins
 */
export function prepareHistogramData(
  rows: Record<string, any>[],
  column: string,
  binCount: number = 10
): { binLabel: string; count: number; minRange: number; maxRange: number }[] {
  if (!column || !rows || rows.length === 0) return [];

  const validNumbers: number[] = [];
  for (const row of rows) {
    const raw = row[column];
    const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/[\$,]/g, ''));
    if (!isNaN(num) && raw !== null && raw !== undefined) {
      validNumbers.push(num);
    }
  }

  if (validNumbers.length === 0) return [];

  const min = Math.min(...validNumbers);
  const max = Math.max(...validNumbers);

  if (min === max) {
    return [{ binLabel: `${min}`, count: validNumbers.length, minRange: min, maxRange: max }];
  }

  const step = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const minRange = min + i * step;
    const maxRange = min + (i + 1) * step;
    return {
      binLabel: `${minRange.toFixed(1)} - ${maxRange.toFixed(1)}`,
      count: 0,
      minRange,
      maxRange,
    };
  });

  for (const val of validNumbers) {
    let binIdx = Math.floor((val - min) / step);
    if (binIdx >= binCount) binIdx = binCount - 1; // edge case max value
    bins[binIdx].count++;
  }

  return bins;
}

/**
 * Compute Box Plot Stats (Min, Q1, Median, Q3, Max, Outliers)
 */
export function prepareBoxPlotData(
  rows: Record<string, any>[],
  groupCol: string,
  metricCol: string
): BoxPlotPoint[] {
  if (!metricCol || !rows || rows.length === 0) return [];

  const groupsMap = new Map<string, number[]>();

  for (const row of rows) {
    const group = groupCol ? String(row[groupCol] ?? 'All') : 'All Data';
    const raw = row[metricCol];
    const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/[\$,]/g, ''));

    if (!isNaN(num) && raw !== null && raw !== undefined) {
      if (!groupsMap.has(group)) groupsMap.set(group, []);
      groupsMap.get(group)!.push(num);
    }
  }

  const result: BoxPlotPoint[] = [];

  for (const [group, numbers] of groupsMap.entries()) {
    if (numbers.length === 0) continue;
    numbers.sort((a, b) => a - b);

    const n = numbers.length;
    const min = numbers[0];
    const max = numbers[n - 1];

    const getPercentile = (p: number) => {
      const idx = p * (n - 1);
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      const weight = idx - lower;
      if (lower === upper) return numbers[lower];
      return numbers[lower] * (1 - weight) + numbers[upper] * weight;
    };

    const q1 = getPercentile(0.25);
    const median = getPercentile(0.5);
    const q3 = getPercentile(0.75);
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = numbers.filter((x) => x < lowerBound || x > upperBound);

    result.push({
      group,
      min: Number(min.toFixed(2)),
      q1: Number(q1.toFixed(2)),
      median: Number(median.toFixed(2)),
      q3: Number(q3.toFixed(2)),
      max: Number(max.toFixed(2)),
      outliers: outliers.map((o) => Number(o.toFixed(2))),
      count: n,
    });
  }

  return result;
}

/**
 * Calculate Pearson Correlation Matrix for numeric columns
 */
export function prepareCorrelationHeatmap(
  rows: Record<string, any>[],
  numericProfiles: ColumnProfile[]
): HeatmapMatrix {
  const colNames = numericProfiles.map((p) => p.name);
  if (colNames.length < 2 || rows.length === 0) {
    return { rowKeys: colNames, colKeys: colNames, matrix: [], minVal: -1, maxVal: 1, isCorrelation: true };
  }

  // Extract arrays
  const colDataMap: Record<string, number[]> = {};
  for (const col of colNames) {
    colDataMap[col] = rows
      .map((r) => {
        const raw = r[col];
        const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/[\$,]/g, ''));
        return isNaN(num) ? null : num;
      })
      .filter((v): v is number => v !== null);
  }

  const matrix: number[][] = [];

  for (let i = 0; i < colNames.length; i++) {
    const rowRes: number[] = [];
    const nameA = colNames[i];
    const arrA = colDataMap[nameA];

    for (let j = 0; j < colNames.length; j++) {
      const nameB = colNames[j];
      const arrB = colDataMap[nameB];

      if (i === j) {
        rowRes.push(1.0);
        continue;
      }

      // Compute Pearson r
      const minLen = Math.min(arrA.length, arrB.length);
      if (minLen < 2) {
        rowRes.push(0);
        continue;
      }

      const meanA = arrA.reduce((a, b) => a + b, 0) / minLen;
      const meanB = arrB.reduce((a, b) => a + b, 0) / minLen;

      let num = 0;
      let denA = 0;
      let denB = 0;

      for (let k = 0; k < minLen; k++) {
        const diffA = arrA[k] - meanA;
        const diffB = arrB[k] - meanB;
        num += diffA * diffB;
        denA += diffA * diffA;
        denB += diffB * diffB;
      }

      const den = Math.sqrt(denA * denB);
      const r = den === 0 ? 0 : num / den;
      rowRes.push(Number(r.toFixed(2)));
    }
    matrix.push(rowRes);
  }

  return {
    rowKeys: colNames,
    colKeys: colNames,
    matrix,
    minVal: -1,
    maxVal: 1,
    isCorrelation: true,
  };
}
