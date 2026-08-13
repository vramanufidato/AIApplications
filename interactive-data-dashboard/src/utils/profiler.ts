import { ColumnDataType, ColumnProfile } from '../types';

/**
 * Helper to check if a value is a valid date
 */
function isDateVal(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  if (val instanceof Date) return !isNaN(val.getTime());
  if (typeof val === 'number') return false; // numeric timestamps shouldn't auto-classify unless formatted string
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Reject pure numbers string e.g. "12345"
    if (/^\d+$/.test(trimmed) && trimmed.length < 8) return false;
    const parsed = Date.parse(trimmed);
    return !isNaN(parsed) && (trimmed.includes('-') || trimmed.includes('/') || trimmed.includes(':'));
  }
  return false;
}

/**
 * Infer data type of a column array
 */
export function inferColumnType(values: any[]): ColumnDataType {
  let numCount = 0;
  let dateCount = 0;
  let nonNullCount = 0;

  // Sample up to 100 rows for fast inference
  const sample = values.slice(0, 200);

  for (const v of sample) {
    if (v === null || v === undefined || v === '') continue;
    nonNullCount++;

    // Check number
    if (typeof v === 'number' && !isNaN(v)) {
      numCount++;
    } else if (typeof v === 'string') {
      const cleaned = v.trim().replace(/[\$,]/g, '');
      if (cleaned !== '' && !isNaN(Number(cleaned))) {
        numCount++;
      } else if (isDateVal(v)) {
        dateCount++;
      }
    } else if (v instanceof Date) {
      dateCount++;
    }
  }

  if (nonNullCount === 0) return 'categorical';

  const numRatio = numCount / nonNullCount;
  const dateRatio = dateCount / nonNullCount;

  if (dateRatio > 0.6) return 'datetime';
  if (numRatio > 0.7) return 'numeric';
  return 'categorical';
}

/**
 * Calculate detailed column statistics
 */
export function profileColumn(
  name: string,
  rows: Record<string, any>[],
  forcedType?: ColumnDataType
): ColumnProfile {
  const rawValues = rows.map((r) => r[name]);
  const detectedType = forcedType || inferColumnType(rawValues);

  const totalCount = rawValues.length;
  let nullCount = 0;
  const validValues: any[] = [];

  for (const v of rawValues) {
    if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
      nullCount++;
    } else {
      validValues.push(v);
    }
  }

  const profile: ColumnProfile = {
    name,
    type: detectedType,
    originalType: detectedType,
    totalCount,
    nullCount,
    uniqueCount: new Set(validValues.map((v) => String(v))).size,
  };

  if (detectedType === 'numeric') {
    const numValues: number[] = [];
    for (const v of validValues) {
      if (typeof v === 'number') {
        numValues.push(v);
      } else if (typeof v === 'string') {
        const cleaned = Number(v.replace(/[\$,]/g, ''));
        if (!isNaN(cleaned)) numValues.push(cleaned);
      }
    }

    if (numValues.length > 0) {
      numValues.sort((a, b) => a - b);
      const sum = numValues.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / numValues.length;

      // Median
      const mid = Math.floor(numValues.length / 2);
      const median =
        numValues.length % 2 !== 0
          ? numValues[mid]
          : (numValues[mid - 1] + numValues[mid]) / 2;

      // Std Dev
      const variance =
        numValues.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) /
        numValues.length;
      const stdDev = Math.sqrt(variance);

      profile.min = numValues[0];
      profile.max = numValues[numValues.length - 1];
      profile.mean = Number(mean.toFixed(2));
      profile.median = Number(median.toFixed(2));
      profile.sum = Number(sum.toFixed(2));
      profile.stdDev = Number(stdDev.toFixed(2));
    }
  } else if (detectedType === 'datetime') {
    const dateValues: number[] = [];
    for (const v of validValues) {
      const ts = v instanceof Date ? v.getTime() : Date.parse(String(v));
      if (!isNaN(ts)) dateValues.push(ts);
    }

    if (dateValues.length > 0) {
      dateValues.sort((a, b) => a - b);
      profile.minDate = new Date(dateValues[0]).toISOString().split('T')[0];
      profile.maxDate = new Date(dateValues[dateValues.length - 1]).toISOString().split('T')[0];
    }
  } else {
    // Categorical top frequencies
    const freqMap = new Map<string, number>();
    for (const v of validValues) {
      const str = String(v).trim();
      freqMap.set(str, (freqMap.get(str) || 0) + 1);
    }

    const sortedFreq = Array.from(freqMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    profile.topValues = sortedFreq.slice(0, 5);
  }

  return profile;
}

/**
 * Generate full profiles for dataset columns
 */
export function profileDataset(
  rows: Record<string, any>[],
  columns: string[],
  typeOverrides?: Record<string, ColumnDataType>
): ColumnProfile[] {
  return columns.map((col) => profileColumn(col, rows, typeOverrides?.[col]));
}
