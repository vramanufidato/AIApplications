import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
} from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

interface DataTableCompProps {
  rows: Record<string, any>[];
  columns: string[];
}

export const DataTableComp: React.FC<DataTableCompProps> = ({
  rows,
  columns,
}) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter search
  const filteredRows = rows.filter((r) => {
    if (!search) return true;
    const line = Object.values(r).join(' ').toLowerCase();
    return line.includes(search.toLowerCase());
  });

  // Sort
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortCol) return 0;
    const valA = a[sortCol];
    const valB = b[sortCol];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    const cmp = valA < valB ? -1 : 1;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const currPage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((currPage - 1) * pageSize, currPage * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-3">
      {/* Search and Table Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search table rows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>{sortedRows.length.toLocaleString()} items</span>
          <button
            onClick={() => downloadCSV(sortedRows, 'table_export.csv')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-900 max-h-96">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/90 text-slate-200 font-semibold sticky top-0 border-b border-slate-700 select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-3.5 py-2.5 border-r border-slate-700/60 whitespace-nowrap cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col}</span>
                    {sortCol === col ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-400" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pageRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-3.5 py-2 border-r border-slate-800/80 whitespace-nowrap max-w-[200px] truncate">
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-slate-500 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>
          Page {currPage} of {totalPages}
        </span>
        <div className="flex items-center space-x-2">
          <button
            disabled={currPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
