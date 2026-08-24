import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Filter,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { InvestmentOption, UserProfile } from '../types/finance';
import { ASSET_CLASS_COMPARISONS } from '../data/mockMarketData';

interface InvestmentComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAskAi: (prompt: string) => void;
}

export const InvestmentComparisonView: React.FC<InvestmentComparisonViewProps> = ({
  isOpen,
  onClose,
  userProfile,
  onAskAi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Equity (Stocks)', 'Mutual Funds', 'Fixed Income', 'Gold & Silver', 'Alternatives'];

  // Dynamically map suitability based on user risk score
  const dynamicOptions: InvestmentOption[] = ASSET_CLASS_COMPARISONS.map(option => {
    let matchTier: InvestmentOption['matchTier'] = option.matchTier;

    if (option.id === 'fno-unregulated-crypto') {
      matchTier = 'Not Recommended';
    } else if (userProfile.riskCategory === 'Conservative') {
      if (option.category === 'Fixed Income' || option.category === 'Gold & Silver') {
        matchTier = 'Best Match';
      } else if (option.subType.includes('Balanced') || option.category === 'Mutual Funds') {
        matchTier = 'Good to Consider';
      } else {
        matchTier = 'Not Recommended';
      }
    } else if (userProfile.riskCategory === 'Moderate') {
      if (option.category === 'Mutual Funds' || option.category === 'Fixed Income') {
        matchTier = 'Best Match';
      } else if (option.category === 'Equity (Stocks)' || option.category === 'Gold & Silver' || option.category === 'Alternatives') {
        matchTier = 'Good to Consider';
      }
    } else if (userProfile.riskCategory === 'Aggressive' || userProfile.riskCategory === 'Moderately Aggressive') {
      if (option.category === 'Equity (Stocks)' || option.category === 'Mutual Funds') {
        matchTier = 'Best Match';
      } else if (option.category === 'Alternatives' || option.category === 'Gold & Silver') {
        matchTier = 'Good to Consider';
      } else if (option.category === 'Fixed Income') {
        matchTier = 'Good to Consider'; // for emergency buffer
      }
    }

    return { ...option, matchTier };
  });

  const filtered = selectedCategory === 'All' 
    ? dynamicOptions 
    : dynamicOptions.filter(o => o.category === selectedCategory);

  const bestMatches = filtered.filter(o => o.matchTier === 'Best Match');
  const goodToConsider = filtered.filter(o => o.matchTier === 'Good to Consider');
  const notRecommended = filtered.filter(o => o.matchTier === 'Not Recommended');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Personalized Investment Comparison Matrix</h2>
              <p className="text-xs text-slate-500">
                Mapped to your Risk Profile ({userProfile.riskCategory} • Score {userProfile.riskScore}/100)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {/* Best Match Section */}
          {bestMatches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  🟢 Best Match (Optimal for {userProfile.riskCategory} Profile)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {bestMatches.map((opt) => (
                  <OptionCard key={opt.id} option={opt} onAskAi={onAskAi} onClose={onClose} />
                ))}
              </div>
            </div>
          )}

          {/* Good to Consider Section */}
          {goodToConsider.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  🟡 Good to Consider (Diversification & Hedging)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {goodToConsider.map((opt) => (
                  <OptionCard key={opt.id} option={opt} onAskAi={onAskAi} onClose={onClose} />
                ))}
              </div>
            </div>
          )}

          {/* Not Recommended Section */}
          {notRecommended.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  🔴 Not Recommended (Negative Risk-Reward or Mismatch)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {notRecommended.map((opt) => (
                  <OptionCard key={opt.id} option={opt} onAskAi={onAskAi} onClose={onClose} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface OptionCardProps {
  option: InvestmentOption;
  onAskAi: (prompt: string) => void;
  onClose: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, onAskAi, onClose }) => {
  const isBest = option.matchTier === 'Best Match';
  const isNotRec = option.matchTier === 'Not Recommended';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isBest ? 'border-emerald-300 bg-emerald-50/30' :
      isNotRec ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {option.category}
          </span>
          <h4 className="font-bold text-slate-900 text-sm mt-0.5">{option.subType}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          isBest ? 'bg-emerald-100 text-emerald-800' :
          isNotRec ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {option.matchTier}
        </span>
      </div>

      <p className="text-slate-600 mt-2 text-[11px] leading-relaxed">
        {option.suitabilityRationale}
      </p>

      {/* Attributes Table */}
      <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-[11px]">
        <div>
          <span className="text-slate-400 block text-[10px]">Expected Return:</span>
          <span className="font-bold text-slate-900">{option.expectedReturns}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Risk & Liquidity:</span>
          <span className="font-semibold text-slate-800">{option.riskLevel} Risk • {option.liquidity} Liquidity</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Tax Implications:</span>
          <span className="text-slate-700">{option.taxImplications}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Lock-in / Min Ticket:</span>
          <span className="text-slate-700">{option.lockIn} • Min: {option.minInvestment}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {option.keyInstruments.map((item, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
              {item}
            </span>
          ))}
        </div>

        <button
          onClick={() => {
            onAskAi(`Please compare ${option.subType} in detail against my financial profile and recommend specific funds/instruments.`);
            onClose();
          }}
          className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] flex items-center gap-0.5"
        >
          <span>Ask AI</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
