import React, { useState } from 'react';
import { History, X, Trash2, ExternalLink, Calendar, ChevronRight, Search } from 'lucide-react';
import { DecisionAnalysis } from '../types';

interface SavedDecisionsDrawerProps {
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
  onClose: () => void;
}

export const SavedDecisionsDrawer: React.FC<SavedDecisionsDrawerProps> = ({
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filtered = savedDecisions.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.dilemma.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l-2 border-slate-900">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 p-5 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-yellow-400 stroke-[2.5]" />
            <h2 className="text-base font-black uppercase tracking-wider text-white">Saved Case History</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b-2 border-slate-900 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search past decisions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-900 pl-9 pr-4 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-bold uppercase">
              {search ? 'No saved decisions match your search.' : 'No saved decisions yet.'}
            </div>
          ) : (
            filtered.map((decision) => (
              <div
                key={decision.id}
                className="group relative rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                      {decision.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center space-x-1">
                      <Calendar className="h-3 w-3 stroke-[2]" />
                      <span>{new Date(decision.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {decision.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-2">
                    {decision.dilemma}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t-2 border-slate-900 pt-2.5">
                  <button
                    onClick={() => {
                      onSelectDecision(decision);
                      onClose();
                    }}
                    className="flex items-center space-x-1 text-xs font-black uppercase text-indigo-700 hover:text-indigo-900"
                  >
                    <span>Open Case</span>
                    <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
                  </button>

                  <button
                    onClick={() => onDeleteDecision(decision.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete saved decision"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t-2 border-slate-900 p-4 bg-yellow-400 text-center text-slate-900">
          <p className="text-[11px] font-black uppercase tracking-wider">
            Saved locally in browser storage.
          </p>
        </div>

      </div>
    </div>
  );
};
