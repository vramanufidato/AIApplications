import React, { useState, useEffect } from 'react';
import { Flame, X, AlertOctagon, HelpCircle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { DecisionAnalysis, DevilsAdvocateResponse } from '../types';

interface DevilsAdvocateModalProps {
  decision: DecisionAnalysis;
  currentTopOptionId: string;
  onClose: () => void;
}

export const DevilsAdvocateModal: React.FC<DevilsAdvocateModalProps> = ({
  decision,
  currentTopOptionId,
  onClose,
}) => {
  const [data, setData] = useState<DevilsAdvocateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topOption = decision.options.find((o) => o.id === currentTopOptionId) || decision.options[0];

  const fetchChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/devils-advocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          currentTopOptionId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate Devil\'s Advocate response');
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [currentTopOptionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border-2 border-slate-900 bg-slate-900 text-slate-100 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-xl border-2 border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 border-2 border-slate-900 text-yellow-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <Flame className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                DEVIL'S ADVOCATE STRESS TEST
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase text-white">
              Challenging: "{topOption?.title}"
            </h2>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
            <p className="text-xs font-black uppercase tracking-wider text-rose-300">
              Examining worst-case scenarios & second-order effects...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border-2 border-slate-900 bg-rose-900 p-4 text-center">
            <p className="text-xs font-bold text-rose-100 mb-3">{error}</p>
            <button
              onClick={fetchChallenge}
              className="inline-flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-yellow-400 px-3 py-1.5 text-xs font-black text-slate-900 hover:bg-yellow-300"
            >
              <RefreshCw className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Retry Challenge</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        {data && !loading && (
          <div className="space-y-6">
            
            {/* Reality Check Banner */}
            <div className="rounded-2xl border-2 border-slate-900 bg-rose-600 p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex items-start space-x-3">
                <AlertOctagon className="h-5 w-5 text-yellow-300 shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-yellow-300">
                    Skeptical Reality Check
                  </h4>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-white">
                    "{data.verdictRebuttal}"
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of Challenges */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Counter-Arguments */}
              <div className="rounded-2xl border-2 border-slate-700 bg-slate-800 p-5">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5 border-b border-slate-700 pb-2">
                  <Flame className="h-4 w-4 stroke-[2.5]" />
                  <span>Strongest Counter-Arguments</span>
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-200">
                  {data.counterArguments.map((arg, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-black">•</span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cognitive Blind Spots */}
              <div className="rounded-2xl border-2 border-slate-700 bg-slate-800 p-5">
                <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5 border-b border-slate-700 pb-2">
                  <ShieldAlert className="h-4 w-4 stroke-[2.5]" />
                  <span>Potential Blind Spots</span>
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-200">
                  {data.blindSpots.map((spot, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-yellow-400 font-black">•</span>
                      <span>{spot}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Hidden Costs & Diagnostic Probing Questions */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              <div className="rounded-2xl border-2 border-slate-700 bg-slate-800 p-5">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">
                  Hidden Costs & Unseen Risks
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-200">
                  {data.hiddenCostsOrRisks.map((cost, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-purple-400 font-black">•</span>
                      <span>{cost}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border-2 border-slate-700 bg-slate-800 p-5">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5 border-b border-slate-700 pb-2">
                  <HelpCircle className="h-4 w-4 stroke-[2.5]" />
                  <span>Diagnostic Self-Questions</span>
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-200">
                  {data.probingQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-black">?</span>
                      <span className="italic">"{q}"</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-slate-800 pt-4">
              <span className="text-xs font-medium text-slate-400">
                Does this stress-test alter your confidence? You can adjust factors in the scoring matrix anytime.
              </span>
              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border-2 border-slate-900 bg-yellow-400 px-5 py-2.5 text-xs font-black uppercase text-slate-900 hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                Done Reviewing
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
