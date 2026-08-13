import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseResult {
  data: Record<string, any>[];
  columns: string[];
  delimiter?: string;
  hasHeader: boolean;
  sheets?: string[];
  activeSheet?: string;
  totalRows: number;
}

/**
 * Detect delimiter in raw CSV text snippet
 */
export function detectDelimiter(textSnippet: string): string {
  const delimiters = [',', ';', '\t', '|'];
  const firstLine = textSnippet.split('\n')[0] || '';
  
  let bestDelimiter = ',';
  let maxCount = 0;

  for (const delim of delimiters) {
    const count = (firstLine.match(new RegExp(`\\${delim}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delim;
    }
  }

  return bestDelimiter;
}

/**
 * Parse CSV File or string
 */
export function parseCSV(fileOrContent: File | string, delimiterOverride?: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileOrContent as any, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      delimiter: delimiterOverride || '', // Empty lets Papa auto-detect
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(results.errors[0].message));
          return;
        }

        const rawData = (results.data as Record<string, any>[]).filter((row) => {
          return row && Object.values(row).some((val) => val !== null && val !== undefined && val !== '');
        });

        const columns = results.meta.fields || (rawData.length > 0 ? Object.keys(rawData[0]) : []);
        
        resolve({
          data: rawData,
          columns: columns.map((c) => String(c).trim()),
          delimiter: results.meta.delimiter || delimiterOverride || ',',
          hasHeader: true,
          totalRows: rawData.length,
        });
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Parse Excel (.xlsx, .xls) file
 */
export async function parseExcel(file: File, sheetIndex: number = 0): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        
        const sheets = workbook.SheetNames;
        if (!sheets || sheets.length === 0) {
          reject(new Error('No sheets found in Excel file'));
          return;
        }

        const targetSheetName = sheets[sheetIndex] || sheets[0];
        const worksheet = workbook.Sheets[targetSheetName];

        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: null,
          raw: false,
        });

        const columns = rawData.length > 0 ? Object.keys(rawData[0]) : [];

        resolve({
          data: rawData,
          columns: columns.map((c) => String(c).trim()),
          sheets,
          activeSheet: targetSheetName,
          hasHeader: true,
          totalRows: rawData.length,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Main unified parse function
 */
export async function parseFile(file: File, options?: { sheetIndex?: number; delimiter?: string }): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
    return parseCSV(file, options?.delimiter);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file, options?.sheetIndex ?? 0);
  } else {
    // Fallback attempt as CSV
    return parseCSV(file, options?.delimiter);
  }
}
