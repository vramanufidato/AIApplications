import React, { useState, useEffect } from 'react';
import { DecisionAnalysis, DevilsAdvocateResponse } from '../types';
import { 
  Flame, 
  AlertTriangle, 
  HelpCircle, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface DevilsAdvocateViewProps {
  decision: DecisionAnalysis;
  initialChallengeData?: DevilsAdvocateResponse | null;
}

export const DevilsAdvocateView: React.FC<DevilsAdvocateViewProps> = ({ 
  decision, 
  initialChallengeData 
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    decision.aiVerdict?.recommendedOptionId || decision.options[0]?.id || ''
  );
  const [challengeData, setChallengeData] = useState<DevilsAdvocateResponse | null>(
    initialChallengeData || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User Interactive Risk Checklist tracking state
  const [acknowledgedRisks, setAcknowledgedRisks] = useState<Record<string, 'acknowledged' | 'mitigated' | 'dealbreaker'>>({});

  const selectedOption = decision.options.find((o) => o.id === selectedOptionId) || decision.options[0];

  const fetchChallenge = async (optionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/devils-advocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          currentTopOptionId: optionId
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate Devil's Advocate critique.");
      }

      const data = await res.json();
      setChallengeData(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching challenge');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!challengeData) {
      fetchChallenge(selectedOptionId);
    }
  }, [selectedOptionId]);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    fetchChallenge(optId);
  };

  const toggleRiskStatus = (riskKey: string, status: 'acknowledged' | 'mitigated' | 'dealbreaker') => {
    setAcknowledgedRisks((prev) => ({
      ...prev,
      [riskKey]: prev[riskKey] === status ? undefined as any : status
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Option Target Selector Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-black uppercase text-xs mb-1">
            <Flame className="h-4 w-4 stroke-[2.5]" />
            <span>Challenger Engine</span>
          </div>
          <h3 className="text-xl font-black uppercase text-slate-900">
            Devil's Advocate Mode
          </h3>
          <p className="text-xs font-semibold text-slate-600">
            Stress-testing option: <strong className="text-slate-900 font-black">{selectedOption?.title}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {decision.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={isLoading}
              className={`rounded-xl border-2 border-slate-900 px-3 py-1.5 text-xs font-black uppercase transition-all ${
                selectedOptionId === opt.id
                  ? 'bg-rose-500 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              Challenge {opt.title}
            </button>
          ))}

          <button
            onClick={() => fetchChallenge(selectedOptionId)}
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 stroke-[2.5] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-900 bg-white p-12 text-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <Flame className="h-10 w-10 text-rose-500 animate-bounce stroke-[2.5] mb-3" />
          <h4 className="text-lg font-black uppercase text-slate-900">Synthesizing Counterarguments...</h4>
          <p className="text-xs font-semibold text-slate-600 max-w-md mt-1">
            Analyzing hidden biases, cognitive blind spots, and second-order consequences for "{selectedOption?.title}".
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border-2 border-slate-900 bg-rose-100 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
          <p className="text-xs font-black uppercase text-rose-800">Error generating critique:</p>
          <p className="text-sm font-bold mt-1">{error}</p>
          <button
            onClick={() => fetchChallenge(selectedOptionId)}
            className="mt-3 rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-4 py-2 text-xs font-black uppercase"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Content */}
      {challengeData && !isLoading && (
        <div className="space-y-6">
          
          {/* Verdict Reality Check Rebuttal */}
          <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 p-6 text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
            <div className="flex items-center space-x-2 text-rose-400 font-black uppercase text-xs mb-2">
              <Flame className="h-4 w-4 stroke-[2.5]" />
              <span>Challenger Reality Check</span>
            </div>
            <p className="text-base font-bold italic leading-relaxed text-slate-100">
              "{challengeData.verdictRebuttal}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Counterarguments */}
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 border-2 border-slate-900 text-white">
                  <ShieldAlert className="h-4 w-4 stroke-[2.5]" />
                </div>
                <h4 className="font-black text-sm uppercase text-slate-900">
                  Key Counterarguments & Objections
                </h4>
              </div>

              <div className="space-y-3">
                {challengeData.counterArguments.map((arg, idx) => {
                  const status = acknowledgedRisks[`ca_${idx}`];
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border-2 border-slate-900 p-3.5 transition-all ${
                        status === 'dealbreaker'
                          ? 'bg-rose-100 border-rose-900'
                          : status === 'mitigated'
                          ? 'bg-emerald-100 border-emerald-900'
                          : status === 'acknowledged'
                          ? 'bg-amber-100 border-amber-900'
                          : 'bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 leading-relaxed mb-2">
                        {arg}
                      </p>

                      {/* Action Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-500 mr-1">Your Stance:</span>
                        <button
                          onClick={() => toggleRiskStatus(`ca_${idx}`, 'acknowledged')}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border border-slate-900 ${
                            status === 'acknowledged' ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-700'
                          }`}
                        >
                          Acknowledged
                        </button>
                        <button
                          onClick={() => toggleRiskStatus(`ca_${idx}`, 'mitigated')}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border border-slate-900 ${
                            status === 'mitigated' ? 'bg-emerald-400 text-slate-900' : 'bg-white text-slate-700'
                          }`}
                        >
                          Mitigated
                        </button>
                        <button
                          onClick={() => toggleRiskStatus(`ca_${idx}`, 'dealbreaker')}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border border-slate-900 ${
                            status === 'dealbreaker' ? 'bg-rose-500 text-white' : 'bg-white text-slate-700'
                          }`}
                        >
                          Dealbreaker
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cognitive Blind Spots & Hidden Costs */}
            <div className="space-y-6">
              
              {/* Blind Spots */}
              <div className="rounded-2xl border-2 border-slate-900 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 border-2 border-slate-900 text-slate-900">
                    <EyeOff className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <h4 className="font-black text-sm uppercase text-slate-900">
                    Cognitive Blind Spots
                  </h4>
                </div>

                <ul className="space-y-2 text-xs font-bold text-slate-900">
                  {challengeData.blindSpots.map((spot, idx) => (
                    <li key={idx} className="flex items-start space-x-2 rounded-xl bg-white border-2 border-slate-900 p-2.5">
                      <span className="text-amber-500 font-black">•</span>
                      <span>{spot}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hidden Costs or Risks */}
              <div className="rounded-2xl border-2 border-slate-900 bg-rose-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400 border-2 border-slate-900 text-slate-900">
                    <AlertTriangle className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <h4 className="font-black text-sm uppercase text-slate-900">
                    Hidden Costs & Second-Order Effects
                  </h4>
                </div>

                <ul className="space-y-2 text-xs font-bold text-slate-900">
                  {challengeData.hiddenCostsOrRisks.map((cost, idx) => (
                    <li key={idx} className="flex items-start space-x-2 rounded-xl bg-white border-2 border-slate-900 p-2.5">
                      <span className="text-rose-500 font-black">•</span>
                      <span>{cost}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* Diagnostic Probing Questions */}
          <div className="rounded-2xl border-2 border-slate-900 bg-yellow-300 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <HelpCircle className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h4 className="font-black text-base uppercase text-slate-900">
                Diagnostic Diagnostic Questions Before Committing
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {challengeData.probingQuestions.map((q, idx) => (
                <div key={idx} className="rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <span className="text-[10px] font-black uppercase text-indigo-700 block mb-1">
                    Question #{idx + 1}
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 leading-snug">
                    "{q}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Risk Ratings Table */}
          {challengeData.riskRatings && challengeData.riskRatings.length > 0 && (
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <h4 className="font-black text-base uppercase text-slate-900 mb-4 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-500 stroke-[2.5]" />
                <span>Risk Severity & Counter-Mitigation Matrix</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-100">
                      <th className="p-3 text-xs font-black uppercase text-slate-900">Risk Factor</th>
                      <th className="p-3 text-xs font-black uppercase text-slate-900">Severity</th>
                      <th className="p-3 text-xs font-black uppercase text-slate-900">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengeData.riskRatings.map((rr, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-3 text-xs font-bold text-slate-900">{rr.risk}</td>
                        <td className="p-3">
                          <span className={`inline-block rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase border border-slate-900 ${
                            rr.severity === 'high'
                              ? 'bg-rose-400 text-slate-900'
                              : rr.severity === 'medium'
                              ? 'bg-amber-300 text-slate-900'
                              : 'bg-emerald-300 text-slate-900'
                          }`}>
                            {rr.severity}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-medium text-slate-800">{rr.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
