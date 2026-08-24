import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Zap } from 'lucide-react';

interface RefineAiBarProps {
  onRefine: (instruction: string) => Promise<void>;
  isLoading: boolean;
}

const QUICK_REFINEMENTS = [
  'Compress total time to 30 min',
  'Add a 10-min Q&A buffer at the end',
  'Focus more on Action Items & Owners',
  'Simplify technical terms for executive audience',
  'Re-time equal duration for all topics',
];

export const RefineAiBar: React.FC<RefineAiBarProps> = ({ onRefine, isLoading }) => {
  const [instruction, setInstruction] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isLoading) return;
    onRefine(instruction.trim());
    setInstruction('');
  };

  const handleQuickClick = (text: string) => {
    if (isLoading) return;
    onRefine(text);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Refine Agenda with AI Assistant</span>
      </div>

      {/* Quick Refinement Pills */}
      <div className="flex flex-wrap gap-2">
        {QUICK_REFINEMENTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickClick(q)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-all flex items-center space-x-1 disabled:opacity-50"
          >
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Custom Refinement Input */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          id="ai-refinement-instruction-input"
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. 'Add a topic for budget approval and shorten engineering retro to 10 min'..."
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          id="submit-refinement-btn"
          type="submit"
          disabled={!instruction.trim() || isLoading}
          className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-all"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-300" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
};
