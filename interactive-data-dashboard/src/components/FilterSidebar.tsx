import React, { useState } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Hash,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ColumnProfile, GlobalFilterState } from '../types';

interface FilterSidebarProps {
  profiles: ColumnProfile[];
  filterState: GlobalFilterState;
  onFilterChange: (newState: GlobalFilterState) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  profiles,
  filterState,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (colName: string) => {
    setCollapsedSections((prev) => ({ ...prev, [colName]: !prev[colName] }));
  };

  // Calculate total active filter counts
  let activeFilterCount = 0;
  if (filterState.searchQuery) activeFilterCount++;

  for (const selected of Object.values(filterState.categorical) as string[][]) {
    if (selected && selected.length > 0) activeFilterCount++;
  }

  for (const [col, range] of Object.entries(filterState.numeric)) {
    const prof = profiles.find((p) => p.name === col);
    if (prof && prof.min !== undefined && prof.max !== undefined) {
      if (range[0] > prof.min || range[1] < prof.max) activeFilterCount++;
    }
  }

  for (const [col, range] of Object.entries(filterState.date)) {
    const prof = profiles.find((p) => p.name === col);
    if (prof && prof.minDate && prof.maxDate) {
      if (range[0] !== prof.minDate || range[1] !== prof.maxDate) activeFilterCount++;
    }
  }

  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5 h-fit">
      {/* Header & Quick Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Interactive Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filtered Count Alert */}
      <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-2.5 text-xs flex items-center justify-between">
        <span className="text-slate-400">Matching Rows:</span>
        <span className="font-bold text-emerald-400">
          {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
          <span className="text-slate-400 text-[10px] font-normal ml-1">
            ({totalCount > 0 ? ((filteredCount / totalCount) * 100).toFixed(0) : 0}%)
          </span>
        </span>
      </div>

      {/* Global Keyword Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search all fields..."
          value={filterState.searchQuery}
          onChange={(e) =>
            onFilterChange({
              ...filterState,
              searchQuery: e.target.value,
            })
          }
          className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {filterState.searchQuery && (
          <button
            onClick={() => onFilterChange({ ...filterState, searchQuery: '' })}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Column Specific Filter Sections */}
      <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {profiles.map((p) => {
          const isCollapsed = collapsedSections[p.name];

          return (
            <div key={p.name} className="bg-slate-800/30 border border-slate-800 rounded-xl p-3 space-y-2.5">
              {/* Section Header */}
              <div
                onClick={() => toggleSection(p.name)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-2 truncate">
                  {p.type === 'numeric' && <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  {p.type === 'categorical' && <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  {p.type === 'datetime' && <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              {/* Section Body */}
              {!isCollapsed && (
                <div className="pt-1">
                  {/* 1. Categorical Multi-Select Filter */}
                  {p.type === 'categorical' && (
                    <CategoricalFilterControl
                      profile={p}
                      selectedValues={filterState.categorical[p.name] || []}
                      onChange={(selected) =>
                        onFilterChange({
                          ...filterState,
                          categorical: {
                            ...filterState.categorical,
                            [p.name]: selected,
                          },
                        })
                      }
                    />
                  )}

                  {/* 2. Numeric Dual Range Slider */}
                  {p.type === 'numeric' && p.min !== undefined && p.max !== undefined && (
                    <NumericFilterControl
                      profile={p}
                      currentRange={filterState.numeric[p.name] || [p.min, p.max]}
                      onChange={(minVal, maxVal) =>
                        onFilterChange({
                          ...filterState,
                          numeric: {
                            ...filterState.numeric,
                            [p.name]: [minVal, maxVal],
                          },
                        })
                      }
                    />
                  )}

                  {/* 3. Date Range Control */}
                  {p.type === 'datetime' && p.minDate && p.maxDate && (
                    <DateFilterControl
                      profile={p}
                      currentRange={filterState.date[p.name] || [p.minDate, p.maxDate]}
                      onChange={(start, end) =>
                        onFilterChange({
                          ...filterState,
                          date: {
                            ...filterState.date,
                            [p.name]: [start, end],
                          },
                        })
                      }
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

/* --- Sub-Components for Categorical, Numeric, Date controls --- */

const CategoricalFilterControl: React.FC<{
  profile: ColumnProfile;
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}> = ({ profile, selectedValues, onChange }) => {
  const topVals = profile.topValues || [];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVals = topVals.filter((v) =>
    v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="space-y-2">
      {topVals.length > 5 && (
        <input
          type="text"
          placeholder="Filter categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1 text-[11px] text-white placeholder-slate-500"
        />
      )}

      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
        {filteredVals.map((tv) => {
          const isSelected = selectedValues.length === 0 || selectedValues.includes(tv.value);

          return (
            <label
              key={tv.value}
              onClick={() => toggleValue(tv.value)}
              className="flex items-center justify-between text-xs cursor-pointer p-1 rounded hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center space-x-2 truncate">
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                    selectedValues.includes(tv.value)
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : selectedValues.length === 0
                      ? 'bg-slate-700/60 border-slate-600 text-slate-300'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {(selectedValues.includes(tv.value) || selectedValues.length === 0) && (
                    <Check className="w-2.5 h-2.5" />
                  )}
                </div>
                <span className="text-slate-300 truncate max-w-[130px]">{tv.value}</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                {tv.count}
              </span>
            </label>
          );
        })}
      </div>

      {selectedValues.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-[10px] font-medium text-purple-400 hover:text-purple-300 underline pt-1"
        >
          Select All Categories
        </button>
      )}
    </div>
  );
};

const NumericFilterControl: React.FC<{
  profile: ColumnProfile;
  currentRange: [number, number];
  onChange: (min: number, max: number) => void;
}> = ({ profile, currentRange, onChange }) => {
  const min = profile.min ?? 0;
  const max = profile.max ?? 100;

  const [minInput, setMinInput] = useState(currentRange[0]);
  const [maxInput, setMaxInput] = useState(currentRange[1]);

  return (
    <div className="space-y-2 text-xs">
      {/* Number Inputs */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Min</span>
          <input
            type="number"
            value={minInput}
            min={min}
            max={maxInput}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMinInput(v);
              onChange(v, maxInput);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-300"
          />
        </div>
        <span className="text-slate-500 self-end pb-1.5">—</span>
        <div>
          <span className="text-[10px] text-slate-400 block mb-0.5">Max</span>
          <input
            type="number"
            value={maxInput}
            min={minInput}
            max={max}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxInput(v);
              onChange(minInput, v);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-300"
          />
        </div>
      </div>

      {/* Min-Max Range Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / 100 || 1}
        value={maxInput}
        onChange={(e) => {
          const v = Number(e.target.value);
          setMaxInput(v);
          onChange(minInput, v);
        }}
        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
      />
    </div>
  );
};

const DateFilterControl: React.FC<{
  profile: ColumnProfile;
  currentRange: [string, string];
  onChange: (start: string, end: string) => void;
}> = ({ currentRange, onChange }) => {
  return (
    <div className="space-y-2 text-xs">
      <div>
        <span className="text-[10px] text-slate-400 block mb-0.5">Start Date</span>
        <input
          type="date"
          value={currentRange[0]}
          onChange={(e) => onChange(e.target.value, currentRange[1])}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-emerald-300"
        />
      </div>
      <div>
        <span className="text-[10px] text-slate-400 block mb-0.5">End Date</span>
        <input
          type="date"
          value={currentRange[1]}
          onChange={(e) => onChange(currentRange[0], e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-emerald-300"
        />
      </div>
    </div>
  );
};
