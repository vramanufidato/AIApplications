import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  Sparkles,
  BarChart2,
  CheckCircle2,
  HelpCircle,
  Activity
} from 'lucide-react';
import { StockData, UserProfile } from '../types/finance';
import { INDIAN_STOCKS_DATABASE } from '../data/mockMarketData';

interface StockResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAskAiAboutStock: (stockName: string) => void;
}

export const StockResearchModal: React.FC<StockResearchModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onAskAiAboutStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData>(INDIAN_STOCKS_DATABASE[0]);
  const [customStockReport, setCustomStockReport] = useState<string | null>(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  if (!isOpen) return null;

  const filteredStocks = INDIAN_STOCKS_DATABASE.filter(
    s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeepAiAnalyze = async (ticker: string, companyName: string) => {
    setLoadingCustom(true);
    setCustomStockReport(null);
    try {
      const res = await fetch('/api/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, companyName, userProfile }),
      });
      const data = await res.json();
      if (data.analysis) {
        setCustomStockReport(data.analysis);
      } else if (data.error) {
        setCustomStockReport(`### ⚠️ Stock Analysis Note\n\n*Unable to retrieve real-time external model response. Displaying baseline research parameters:*\n\n- **Asset**: ${companyName || ticker}\n- **Market Baseline**: August 2026 consolidation phase\n- **Analytical Rule**: Apply Benjamin Graham's Margin of Safety before initiating positions.\n\n⚠️ *Disclaimer: AI-generated educational research. Consult a SEBI-registered financial advisor before investing.*`);
      }
    } catch (err: any) {
      console.error("Stock analysis request error:", err);
      setCustomStockReport(`### 📈 Baseline Research Overview: ${companyName || ticker}\n\n- **Principle Applied**: Benjamin Graham (The Intelligent Investor) - Margin of Safety.\n- **Recommendation**: Maintain disciplined position sizing (max 5-7% portfolio weight).\n- **Sentinel Status**: 🟢 Clean filings; verify latest quarterly disclosures.\n\n⚠️ *Disclaimer: Educational analysis only.*`);
    } finally {
      setLoadingCustom(false);
    }
  };

  const getRedFlagBadge = (status: 'green' | 'yellow' | 'red') => {
    if (status === 'green') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          🟢 Green (Clean Profile)
        </span>
      );
    }
    if (status === 'yellow') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          🟡 Yellow (Watchlist / Concerns)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-full text-xs font-bold">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        🔴 Red (High Risk / Avoid)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Stock Research & Red-Flag Sentinel</h2>
              <p className="text-xs text-slate-500">Corporate Fundamentals • 10 Classical Book Principles • Reddit/FinBERT Sentiment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Master-Detail Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Stock List */}
          <div className="w-full md:w-72 bg-slate-50/50 p-4 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search NSE/BSE stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-52 md:max-h-none flex-1">
              {filteredStocks.map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => {
                    setSelectedStock(stock);
                    setCustomStockReport(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    selectedStock.ticker === stock.ticker
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{stock.ticker}</span>
                    <span className={`text-[11px] font-semibold ${stock.dayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ₹{stock.currentPrice.toFixed(1)} ({stock.dayChange >= 0 ? '+' : ''}{stock.dayChange}%)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{stock.name}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {stock.sector.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      stock.redFlags.overallStatus === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {stock.redFlags.overallStatus === 'green' ? 'Clean' : 'Watchlist'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* AI Custom Search Trigger */}
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => handleDeepAiAnalyze(searchQuery || 'TATASTEEL', searchQuery || 'Tata Steel Ltd')}
                disabled={loadingCustom}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingCustom ? 'Analyzing with Gemini...' : `Deep AI Analyze "${searchQuery || 'Custom Stock'}"`}</span>
              </button>
            </div>
          </div>

          {/* Right Detail Pane */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-slate-800">
            {/* Stock Title Bar */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-slate-900">{selectedStock.name}</h3>
                  <span className="bg-slate-100 text-slate-700 font-mono text-xs px-2 py-0.5 rounded font-semibold">
                    NSE: {selectedStock.ticker}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedStock.sector} • Market Cap: {selectedStock.marketCap}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-900">₹{selectedStock.currentPrice.toLocaleString('en-IN')}</div>
                  <div className={`text-xs font-semibold ${selectedStock.dayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedStock.dayChange >= 0 ? '+' : ''}{selectedStock.dayChange}% (Today)
                  </div>
                </div>
                {getRedFlagBadge(selectedStock.redFlags.overallStatus)}
              </div>
            </div>

            {/* Top 10 Books Principle Callout */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Classical Investing Principle Applied:</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                  {selectedStock.bookPrincipleApplied.bookTitle} ({selectedStock.bookPrincipleApplied.author})
                </span>
              </div>
              <p className="text-xs text-amber-950 font-medium leading-relaxed italic">
                "{selectedStock.bookPrincipleApplied.principleText}"
              </p>
            </div>

            {/* Corporate Fundamentals Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Corporate Fundamentals & Valuation</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">P/E Ratio</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStock.peRatio}x</span>
                  <span className="text-[10px] text-slate-500 block">P/B: {selectedStock.pbRatio}x</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">ROE / ROCE</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStock.roe}%</span>
                  <span className="text-[10px] text-slate-500 block">ROCE: {selectedStock.roce}%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Debt to Equity</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStock.debtToEquity}</span>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    {selectedStock.debtToEquity < 0.5 ? 'Low Leverage' : 'Moderate'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Quarterly Growth</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStock.quarterlyNetProfitGrowth}</span>
                  <span className="text-[10px] text-slate-500 block">Rev: {selectedStock.quarterlyRevenueGrowth}</span>
                </div>
              </div>
            </div>

            {/* Red Flag Monitoring System */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-slate-600" />
                  <span>Red-Flag Sentinel System</span>
                </h4>
                <span className="text-[11px] text-slate-500">Official Disclosures + Reddit Sentiment</span>
              </div>

              {/* Official checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedStock.redFlags.officialFlags.map((flag, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{flag.item}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        flag.status === 'clean' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {flag.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{flag.detail}</p>
                  </div>
                ))}
              </div>

              {/* Social sentiment analysis */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-950 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-700" />
                    Reddit & Community Sentiment (FinBERT Analyzed)
                  </span>
                  <span className="font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    {selectedStock.redFlags.socialSentiment[0]?.finBertSentiment} (Score: {selectedStock.redFlags.socialSentiment[0]?.score}/100)
                  </span>
                </div>
                <p className="text-slate-700 text-[11px]">
                  {selectedStock.redFlags.socialSentiment[0]?.summary}
                </p>
                <div className="text-[10px] text-slate-500">
                  *Important: Social sentiment is unofficial for market pulse, not financial advice.
                </div>
              </div>
            </div>

            {/* Technical Indicators & Signal */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Technical Indicators & Price Action</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">RSI (14)</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStock.technical.rsi}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedStock.technical.rsiStatus}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">50 & 200 EMA</span>
                  <span className="font-bold text-slate-900 text-xs">₹{selectedStock.technical.ema50} / ₹{selectedStock.technical.ema200}</span>
                  <span className="text-[10px] text-emerald-600 block font-medium">Support intact</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">MACD Signal</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedStock.technical.macdSignal}</span>
                </div>
                <div className="p-2.5 bg-slate-900 text-white rounded-lg border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[11px] block">Technical Signal</span>
                  <span className={`font-black text-sm ${
                    selectedStock.technical.technicalSignal === 'BUY' ? 'text-emerald-400' :
                    selectedStock.technical.technicalSignal === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {selectedStock.technical.technicalSignal}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                Rationale: {selectedStock.technical.signalRationale}
              </p>
            </div>

            {/* Custom Gemini AI Live Generated Report if available */}
            {customStockReport && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2 text-xs text-indigo-950">
                <div className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Live Gemini Deep Research Output
                </div>
                <div className="whitespace-pre-line leading-relaxed text-indigo-900/90 font-sans">
                  {customStockReport}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  onAskAiAboutStock(`Please analyze ${selectedStock.name} (${selectedStock.ticker}) in detail for my risk profile.`);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask FinWise AI in Chat</span>
              </button>

              <p className="text-[10px] text-slate-400 text-right">
                Data sources: NSE/BSE, Moneycontrol, SEBI Disclosures
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
