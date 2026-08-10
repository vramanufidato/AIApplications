import React from 'react';
import { Scale, History, PlusCircle, BookOpen } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  onOpenTemplates: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  savedCount,
  onOpenTemplates,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-slate-900 bg-slate-50/95 backdrop-blur-md text-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand Identity */}
        <div 
          onClick={onNewDecision} 
          className="flex cursor-pointer items-center space-x-3 group active:scale-95 transition-transform"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-slate-900 group-hover:bg-amber-300 transition-colors">
            <Scale className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black uppercase tracking-tighter text-xl sm:text-2xl text-slate-900">
                The Tiebreaker
              </span>
              <span className="hidden sm:inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white border border-slate-900">
                Decision Architect
              </span>
            </div>
            <p className="hidden text-[11px] font-bold text-slate-500 uppercase tracking-wider sm:block">
              AI Multi-Criteria Analysis Studio
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenTemplates}
            className="flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-white px-3 py-1.5 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Browse Decision Templates"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-600 stroke-[2.5]" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-white px-3 py-1.5 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Saved Decisions History"
          >
            <History className="h-3.5 w-3.5 text-indigo-600 stroke-[2.5]" />
            <span className="hidden sm:inline">History</span>
            {savedCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-black text-white">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewDecision}
            className="flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-indigo-600 px-3.5 py-1.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-indigo-700 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <PlusCircle className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Case</span>
          </button>
        </div>

      </div>
    </header>
  );
};

