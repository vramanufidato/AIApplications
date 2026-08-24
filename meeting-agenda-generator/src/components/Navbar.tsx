import React from 'react';
import { Calendar, Clock, FileText, History, Sparkles, Play } from 'lucide-react';

interface NavbarProps {
  activeTab: 'builder' | 'runner' | 'saved';
  setActiveTab: (tab: 'builder' | 'runner' | 'saved') => void;
  savedCount: number;
  hasActiveAgenda: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  hasActiveAgenda,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">AgendaCraft AI</h1>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Gemini 3.6
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Smart Document-to-Agenda & Timing Generator</p>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            id="nav-builder-btn"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'builder'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Builder</span>
          </button>

          <button
            id="nav-runner-btn"
            disabled={!hasActiveAgenda}
            onClick={() => setActiveTab('runner')}
            title={!hasActiveAgenda ? 'Generate or load an agenda first' : 'Launch live meeting timer'}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'runner'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : !hasActiveAgenda
                ? 'text-slate-600 cursor-not-allowed opacity-50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Timer</span>
          </button>

          <button
            id="nav-saved-btn"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-slate-700 text-slate-200 text-[10px] rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
