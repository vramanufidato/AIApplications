import React from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Calculator, 
  Search, 
  BookOpen, 
  Layers, 
  KeyRound, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Flame,
  Activity,
  Edit3,
  X
} from 'lucide-react';
import { UserProfile } from '../types/finance';
import { CURRENT_MARKET_BASELINE } from '../data/mockMarketData';

interface SidebarProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileModal: () => void;
  onOpenStockModal: () => void;
  onOpenSimulatorModal: () => void;
  onOpenComparisonModal: () => void;
  onOpenBooksModal: () => void;
  onOpenIntegrationModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userProfile,
  isOpen,
  onClose,
  onOpenProfileModal,
  onOpenStockModal,
  onOpenSimulatorModal,
  onOpenComparisonModal,
  onOpenBooksModal,
  onOpenIntegrationModal,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="app-sleek-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20 text-base">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white tracking-tight">FinWise AI</span>
                <span className="bg-blue-900/60 text-blue-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-700/50">
                  SEBI AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Research & Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Content */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {/* Client Profile Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Profile</p>
              <button
                onClick={() => { onOpenProfileModal(); onClose(); }}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div 
              onClick={() => { onOpenProfileModal(); onClose(); }}
              className="bg-slate-800/90 hover:bg-slate-800 rounded-xl p-3.5 border border-slate-700/60 cursor-pointer transition-colors space-y-2 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    Investor ({userProfile.ageBracket || '32 Yrs'})
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{userProfile.annualIncome}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                <span className="bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-700/40">
                  {userProfile.riskCategory} Risk
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Score: {userProfile.riskScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Market Pulse (Aug 2026) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Market Pulse (Aug 2026)</p>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Nifty 50</span>
                <span className="text-red-400 font-mono font-semibold flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {CURRENT_MARKET_BASELINE.nifty50.toLocaleString()} ({CURRENT_MARKET_BASELINE.niftyWeeklyChange}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Sensex</span>
                <span className="text-red-400 font-mono font-semibold flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  {CURRENT_MARKET_BASELINE.sensex.toLocaleString()} ({CURRENT_MARKET_BASELINE.sensexWeeklyChange}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">India VIX</span>
                <span className="text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  14.2 (+2.1%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Brent Crude</span>
                <span className="text-amber-400 font-mono font-semibold">
                  {CURRENT_MARKET_BASELINE.crudePrice.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Research Modules & Navigation */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Intelligence Modules
            </p>
            <div className="space-y-1">
              <button
                onClick={() => { onOpenStockModal(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <Search className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Stock & Red-Flag Sentinel</span>
              </button>

              <button
                onClick={() => { onOpenSimulatorModal(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>"What-If" Wealth Simulator</span>
              </button>

              <button
                onClick={() => { onOpenComparisonModal(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Compare Asset Classes</span>
              </button>

              <button
                onClick={() => { onOpenBooksModal(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span>10 Classical Books Radar</span>
              </button>

              <button
                onClick={() => { onOpenIntegrationModal(); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>DigiLocker & Account Aggregator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 text-[11px] leading-relaxed text-slate-400 italic border-t border-slate-800">
          This is AI-generated research. Consult a SEBI-registered advisor before investing.
        </div>
      </aside>
    </>
  );
};
