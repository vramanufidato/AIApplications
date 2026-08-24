import React from 'react';
import { AgendaSection } from '../types';
import { Clock, Plus, Minus, AlertTriangle } from 'lucide-react';

interface TimelineBarProps {
  sections: AgendaSection[];
  totalDurationMinutes: number;
  onUpdateSectionDuration?: (sectionId: string, newDuration: number) => void;
  editable?: boolean;
}

const SECTION_COLORS = [
  'bg-indigo-500 hover:bg-indigo-400 text-white border-indigo-400',
  'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-400',
  'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400',
  'bg-amber-500 hover:bg-amber-400 text-slate-900 border-amber-400',
  'bg-purple-500 hover:bg-purple-400 text-white border-purple-400',
  'bg-sky-500 hover:bg-sky-400 text-white border-sky-400',
  'bg-rose-500 hover:bg-rose-400 text-white border-rose-400',
];

export const TimelineBar: React.FC<TimelineBarProps> = ({
  sections,
  totalDurationMinutes,
  onUpdateSectionDuration,
  editable = true,
}) => {
  const sumDuration = sections.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const isMatch = sumDuration === totalDurationMinutes;

  let currentMinuteOffset = 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Interactive Meeting Timeline</h3>
          <span className="text-xs text-slate-400">({sections.length} topics)</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold">
            <span className="text-slate-400">Target:</span>
            <span className="text-slate-200">{totalDurationMinutes} min</span>
          </div>

          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isMatch
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {!isMatch && <AlertTriangle className="w-3.5 h-3.5" />}
            <span>Sum: {sumDuration} min</span>
          </div>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="relative w-full h-10 bg-slate-950 rounded-xl p-1 border border-slate-800 flex overflow-hidden shadow-inner">
        {sections.map((section, idx) => {
          const widthPercent = sumDuration > 0 ? ((section.durationMinutes || 0) / sumDuration) * 100 : 0;
          const startMin = currentMinuteOffset;
          const endMin = startMin + section.durationMinutes;
          currentMinuteOffset = endMin;
          const colorClass = SECTION_COLORS[idx % SECTION_COLORS.length];

          return (
            <div
              key={section.id}
              style={{ width: `${Math.max(widthPercent, 3)}%` }}
              className={`group relative h-full transition-all duration-200 border-r last:border-r-0 border-slate-900/40 flex items-center justify-center ${colorClass} first:rounded-l-lg last:rounded-r-lg`}
            >
              {/* Section Duration Label */}
              <span className="text-[10px] font-bold truncate px-1 opacity-90 select-none">
                {widthPercent > 8 ? `${section.durationMinutes}m` : section.durationMinutes}
              </span>

              {/* Hover Detailed Card Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-20 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-1">
                  <span className="truncate">{section.title}</span>
                  <span className="text-indigo-400 font-mono flex-shrink-0 ml-1">
                    {startMin}m–{endMin}m
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Lead: <strong className="text-slate-300">{section.leadRole}</strong></span>
                  <span className="font-semibold text-slate-300">{section.durationMinutes} min</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 italic">{section.summary}</p>

                {editable && onUpdateSectionDuration && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400">Quick Duration Adjustment:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateSectionDuration(section.id, Math.max(1, section.durationMinutes - 5));
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Reduce 5 min"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateSectionDuration(section.id, section.durationMinutes + 5);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Add 5 min"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Topic Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                SECTION_COLORS[idx % SECTION_COLORS.length].split(' ')[0]
              }`}
            />
            <span className="text-slate-300 font-medium truncate max-w-[140px]">
              {section.title}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({section.durationMinutes}m)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
