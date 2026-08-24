import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, ShieldCheck, Flame, Globe } from 'lucide-react';
import { CURRENT_MARKET_BASELINE } from '../data/mockMarketData';

export const MarketPulseBar: React.FC = () => {
  return (
    <div id="market-pulse-ticker" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Market Indices */}
        <div className="flex items-center gap-4 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-slate-400">Baseline Context:</span>
            <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-800/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              August 2026
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
            <span className="font-semibold text-white">NIFTY 50</span>
            <span className="text-slate-300">{CURRENT_MARKET_BASELINE.nifty50.toLocaleString()}</span>
            <span className="text-rose-400 flex items-center font-medium">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              {CURRENT_MARKET_BASELINE.niftyWeeklyChange}% Wk ({CURRENT_MARKET_BASELINE.niftyYtd}% YTD)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
            <span className="font-semibold text-white">SENSEX</span>
            <span className="text-slate-300">{CURRENT_MARKET_BASELINE.sensex.toLocaleString()}</span>
            <span className="text-rose-400 flex items-center font-medium">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              {CURRENT_MARKET_BASELINE.sensexWeeklyChange}% Wk
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
            <span className="text-amber-300 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Crude:
            </span>
            <span className="text-slate-200">{CURRENT_MARKET_BASELINE.crudePrice.split(' ')[0]}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
            <span className="text-slate-400">India VIX:</span>
            <span className="text-amber-400 font-medium">14.85</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
            <span className="text-slate-400">FII Flows:</span>
            <span className="text-emerald-400 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Recovery Mode
            </span>
          </div>
        </div>

        {/* Cautious Research Note */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>SEBI-Equivalent Research Standards • Data Grounded • 10 Classical Books Baseline</span>
        </div>
      </div>
    </div>
  );
};
