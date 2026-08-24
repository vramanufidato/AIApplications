import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Calculator,
  Search,
  Activity
} from 'lucide-react';
import { UserProfile } from '../types/finance';

interface CompanionPanelProps {
  userProfile: UserProfile;
  onOpenStockModal: () => void;
  onOpenSimulatorModal: () => void;
  onOpenBooksModal: () => void;
  onOpenComparisonModal: () => void;
  onTriggerPrompt: (prompt: string) => void;
}

export const CompanionPanel: React.FC<CompanionPanelProps> = ({
  userProfile,
  onOpenStockModal,
  onOpenSimulatorModal,
  onOpenBooksModal,
  onOpenComparisonModal,
  onTriggerPrompt,
}) => {
  return (
    <div className="w-full lg:w-80 xl:w-92 flex flex-col gap-4.5 overflow-y-auto shrink-0 pr-0.5">
      {/* 1. Red-Flag Monitoring Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Red-Flag Monitoring</span>
          </h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            SENTINEL ACTIVE
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-600 font-medium">Promoter Pledge (Nifty 50)</span>
            <span className="font-semibold text-slate-800 font-mono">0.0% - 1.2% (Safe)</span>
          </div>

          <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-600 font-medium">Reddit / Social Sentiment</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1 font-mono">
              <Activity className="w-3 h-3" /> Bullish (74%)
            </span>
          </div>

          <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-600 font-medium">Regulatory SEBI Audit</span>
            <span className="font-semibold text-blue-600 font-mono">Clean Filings</span>
          </div>
        </div>

        <button
          onClick={onOpenStockModal}
          className="mt-3.5 w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Audit Specific Stock Fundamentals</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 2. Fundamental Health & Consensus Card (Dark Sleek) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between border border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <span>Fundamental Health</span>
            </h3>
            <span className="text-[10px] text-blue-300 font-mono bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
              Composite
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400">Nifty P/E Ratio</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">21.8x</p>
              <span className="text-[9px] text-emerald-400">Fair valuation zone</span>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400">Avg Debt/Equity</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">0.42</p>
              <span className="text-[9px] text-emerald-400">Low leverage</span>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400">Corporate ROE</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">18.4%</p>
              <span className="text-[9px] text-blue-300">Robust return</span>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-400">Div Yield Avg</p>
              <p className="text-base font-bold font-mono text-white mt-0.5">1.25%</p>
              <span className="text-[9px] text-slate-400">Reinvested CAGR</span>
            </div>
          </div>

          {/* Analyst Consensus */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>Institutional Analyst Consensus</span>
              <span className="text-emerald-400 font-bold text-[11px]">65% Buy</span>
            </div>
            
            <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden">
              <div className="h-full bg-emerald-500 w-[65%]" title="65% Buy"></div>
              <div className="h-full bg-amber-400 w-[20%]" title="20% Hold"></div>
              <div className="h-full bg-rose-500 w-[15%]" title="15% Sell"></div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 65% Buy</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 20% Hold</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 15% Sell</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSimulatorModal}
          className="mt-4 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Launch "What-If" Wealth Simulator</span>
        </button>
      </div>

      {/* 3. Classical Philosophy Radar Spotlight */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between text-amber-900 font-bold">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            Graham & Buffett Spotlight
          </span>
          <button
            onClick={onOpenBooksModal}
            className="text-[10px] text-amber-700 hover:underline font-semibold"
          >
            All 10 Books
          </button>
        </div>
        <p className="text-[11px] text-amber-900/90 leading-relaxed italic">
          "Price is what you pay; value is what you get. Always preserve the Margin of Safety."
        </p>
        <button
          onClick={() => onTriggerPrompt("How do Benjamin Graham's Margin of Safety and Warren Buffett's Economic Moat apply to my active asset allocation?")}
          className="text-amber-800 hover:text-amber-950 font-bold text-[11px] flex items-center gap-1 pt-1"
        >
          <Sparkles className="w-3 h-3 text-amber-700" />
          <span>Test in FinWise AI</span>
        </button>
      </div>
    </div>
  );
};
