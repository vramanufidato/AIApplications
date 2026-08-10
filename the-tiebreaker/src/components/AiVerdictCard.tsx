import React from 'react';
import { Sparkles, ShieldCheck, Flame, Compass, ArrowRight, Share2, Download, Copy, Check } from 'lucide-react';
import { DecisionAnalysis } from '../types';
import { exportDecisionAsMarkdown } from '../utils/decisionEngine';

interface AiVerdictCardProps {
  decision: DecisionAnalysis;
  onOpenDevilsAdvocate: () => void;
  onOpenGutCheck: () => void;
}

export const AiVerdictCard: React.FC<AiVerdictCardProps> = ({
  decision,
  onOpenDevilsAdvocate,
  onOpenGutCheck,
}) => {
  const [copied, setCopied] = React.useState(false);
  const recommendedOption = decision.options.find(
    (o) => o.id === decision.aiVerdict.recommendedOptionId
  ) || decision.options[0];

  const handleCopyReport = () => {
    const md = exportDecisionAsMarkdown(decision);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = exportDecisionAsMarkdown(decision);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${decision.title.toLowerCase().replace(/\s+/g, '_')}_tiebreaker_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Summary Card */}
      <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-slate-900 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Sparkles className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 block">
                AI Tiebreaker Executive Brief
              </span>
              <h2 className="text-xl font-black uppercase text-slate-900">
                Recommended Choice: {recommendedOption?.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-300 px-3 py-1 text-xs font-black text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <ShieldCheck className="h-3.5 w-3.5 stroke-[3]" />
              <span>{decision.aiVerdict.confidencePercentage}% AI Confidence</span>
            </span>

            <button
              onClick={handleCopyReport}
              className="flex items-center space-x-1 rounded-xl border-2 border-slate-900 bg-white px-2.5 py-1 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Copy Summary Markdown"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="h-3.5 w-3.5 stroke-[2.5]" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center space-x-1 rounded-xl border-2 border-slate-900 bg-white px-2.5 py-1 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Download Report (.md)"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Synthesis Body */}
        <div className="mt-4 space-y-4 text-sm text-slate-900">
          <p className="text-sm font-semibold leading-relaxed text-slate-900">
            {decision.aiVerdict.executiveSummary}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            
            {/* Decisive Factor Callout */}
            <div className="rounded-xl bg-amber-100 p-4 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1 flex items-center space-x-1.5">
                <Compass className="h-4 w-4 stroke-[2.5]" />
                <span>Key Decisive Factor</span>
              </div>
              <p className="text-xs font-black text-slate-900">
                {decision.aiVerdict.keyDecisiveFactor}
              </p>
            </div>

            {/* Sensitivity Insight */}
            <div className="rounded-xl bg-purple-100 p-4 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1 flex items-center space-x-1.5">
                <Flame className="h-4 w-4 stroke-[2.5]" />
                <span>Sensitivity Analysis</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {decision.aiVerdict.sensitivityInsight}
              </p>
            </div>

          </div>

          {/* Actionable Risk Mitigation Tips */}
          {decision.aiVerdict.riskMitigationAdvice && decision.aiVerdict.riskMitigationAdvice.length > 0 && (
            <div className="mt-4 rounded-xl bg-slate-50 border-2 border-slate-900 p-4 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                Actionable Risk Mitigation Steps for {recommendedOption?.title}:
              </h4>
              <ul className="space-y-1.5">
                {decision.aiVerdict.riskMitigationAdvice.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs font-bold text-slate-900">
                    <span className="font-black text-amber-600">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

      {/* Interactive Stress-Test Tools Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        
        {/* Devil's Advocate Button */}
        <div className="rounded-2xl border-2 border-slate-900 bg-rose-600 text-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-yellow-300 font-black text-[10px] uppercase tracking-widest mb-1">
              <Flame className="h-4 w-4 stroke-[3]" />
              <span>STRESS TEST YOUR CHOICE</span>
            </div>
            <h3 className="text-lg font-black uppercase text-white">Challenge With Devil's Advocate</h3>
            <p className="mt-1 text-xs font-semibold text-rose-100">
              Have AI fiercely argue against "{recommendedOption?.title}" to uncover hidden blind spots and worst-case risks.
            </p>
          </div>

          <button
            onClick={onOpenDevilsAdvocate}
            className="mt-4 flex items-center justify-center space-x-2 rounded-xl border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span>Launch Devil's Advocate Challenge</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>

        {/* Gut Check / Coin Flip Button */}
        <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-yellow-400 font-black text-[10px] uppercase tracking-widest mb-1">
              <Sparkles className="h-4 w-4 stroke-[3]" />
              <span>INTUITION ALIGNMENT</span>
            </div>
            <h3 className="text-lg font-black uppercase text-white">Gut Check & Flip-a-Coin</h3>
            <p className="mt-1 text-xs font-semibold text-slate-300">
              Test whether your subconscious emotional gut agrees with the mathematical winner.
            </p>
          </div>

          <button
            onClick={onOpenGutCheck}
            className="mt-4 flex items-center justify-center space-x-2 rounded-xl border-2 border-slate-900 bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-4 py-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span>Open Gut Check Studio</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>

      </div>

    </div>
  );
};
