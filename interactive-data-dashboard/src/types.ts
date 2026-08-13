export type ColumnDataType = 'numeric' | 'categorical' | 'datetime';

export interface ColumnProfile {
  name: string;
  type: ColumnDataType;
  originalType: ColumnDataType;
  totalCount: number;
  nullCount: number;
  uniqueCount: number;
  // Numeric metrics
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  sum?: number;
  // Categorical metrics
  topValues?: { value: string; count: number }[];
  // Datetime metrics
  minDate?: string;
  maxDate?: string;
}

export interface CategoricalFilter {
  column: string;
  selectedValues: string[]; // empty means all selected
}

export interface NumericFilter {
  column: string;
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
}

export interface DateFilter {
  column: string;
  startDate: string;
  endDate: string;
  currentStartDate: string;
  currentEndDate: string;
}

export interface GlobalFilterState {
  searchQuery: string;
  categorical: Record<string, string[]>; // col -> selected values
  numeric: Record<string, [number, number]>; // col -> [min, max]
  date: Record<string, [string, string]>; // col -> [startDate, endDate]
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'scatter'
  | 'histogram'
  | 'boxplot'
  | 'pie'
  | 'heatmap'
  | 'treemap'
  | 'table';

export type AggregationType = 'sum' | 'mean' | 'count' | 'min' | 'max' | 'median';

export type ColorTheme = 'indigo' | 'emerald' | 'sunset' | 'ocean' | 'purple' | 'monochrome';

export interface ChartConfig {
  id: string;
  title: string;
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  aggregation: AggregationType;
  groupBy?: string; // For stacked/grouped bar, multi-line, or color encoding
  sizeBy?: string; // For scatter plot bubble size
  colorTheme: ColorTheme;
  binCount?: number; // For histogram
  barMode?: 'grouped' | 'stacked'; // For bar chart
  isDonut?: boolean; // For pie chart
  facet?: string;
  // Custom chart size layout span (1, 2, or 3 columns in a 3-col grid)
  spanCols?: 1 | 2 | 3;
}

export interface Dataset {
  fileName: string;
  fileSize?: number;
  delimiter?: string;
  hasHeader: boolean;
  data: Record<string, any>[];
  columns: string[];
  profiles: ColumnProfile[];
  sheets?: string[];
  activeSheet?: string;
}
