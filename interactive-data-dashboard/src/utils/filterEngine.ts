import { ColumnProfile, GlobalFilterState } from '../types';

/**
 * Filter dataset rows based on active GlobalFilterState and column profiles
 */
export function applyFilters(
  rows: Record<string, any>[],
  columns: string[],
  profiles: ColumnProfile[],
  filterState: GlobalFilterState
): Record<string, any>[] {
  if (!rows || rows.length === 0) return [];

  const { searchQuery, categorical, numeric, date } = filterState;
  const searchLower = searchQuery ? searchQuery.toLowerCase().trim() : '';

  const profileMap = new Map<string, ColumnProfile>(profiles.map((p) => [p.name, p]));

  return rows.filter((row) => {
    // 1. Global Keyword Search
    if (searchLower) {
      const rowString = Object.values(row)
        .map((val) => (val === null || val === undefined ? '' : String(val)))
        .join(' ')
        .toLowerCase();
      if (!rowString.includes(searchLower)) {
        return false;
      }
    }

    // 2. Categorical Filters
    for (const [col, selectedVals] of Object.entries(categorical)) {
      if (selectedVals && selectedVals.length > 0) {
        const rowVal = row[col] === null || row[col] === undefined ? '(Blank)' : String(row[col]).trim();
        if (!selectedVals.includes(rowVal)) {
          return false;
        }
      }
    }

    // 3. Numeric Range Filters
    for (const [col, [minVal, maxVal]] of Object.entries(numeric)) {
      const rawVal = row[col];
      if (rawVal === null || rawVal === undefined || rawVal === '') continue; // Skip or handle nulls
      
      let num = typeof rawVal === 'number' ? rawVal : Number(String(rawVal).replace(/[\$,]/g, ''));
      if (isNaN(num)) continue;

      if (num < minVal || num > maxVal) {
        return false;
      }
    }

    // 4. Date Range Filters
    for (const [col, [startDate, endDate]] of Object.entries(date)) {
      const rawVal = row[col];
      if (!rawVal) continue;

      const ts = rawVal instanceof Date ? rawVal.getTime() : Date.parse(String(rawVal));
      if (isNaN(ts)) continue;

      const startTs = Date.parse(startDate);
      const endTs = Date.parse(endDate) + 86399999; // Include end of day

      if (!isNaN(startTs) && ts < startTs) return false;
      if (!isNaN(endTs) && ts > endTs) return false;
    }

    return true;
  });
}

/**
 * Initialize default filter state from column profiles
 */
export function createInitialFilterState(profiles: ColumnProfile[]): GlobalFilterState {
  const categorical: Record<string, string[]> = {};
  const numeric: Record<string, [number, number]> = {};
  const date: Record<string, [string, string]> = {};

  for (const p of profiles) {
    if (p.type === 'categorical') {
      categorical[p.name] = []; // empty means all values selected
    } else if (p.type === 'numeric' && p.min !== undefined && p.max !== undefined) {
      numeric[p.name] = [p.min, p.max];
    } else if (p.type === 'datetime' && p.minDate && p.maxDate) {
      date[p.name] = [p.minDate, p.maxDate];
    }
  }

  return {
    searchQuery: '',
    categorical,
    numeric,
    date,
  };
}
