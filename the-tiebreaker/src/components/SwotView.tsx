import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import { DecisionAnalysis } from '../types';

interface SwotViewProps {
  decision: DecisionAnalysis;
}

export const SwotView: React.FC<SwotViewProps> = ({ decision }) => {
  const [activeOptionId, setActiveOptionId] = useState<string>(
    decision.options[0]?.id || ''
  );

  const activeOption = decision.options.find((o) => o.id === activeOptionId) || decision.options[0];
  const swot = decision.swotAnalysis.find((s) => s.optionId === activeOptionId) || {
    optionId: activeOptionId,
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  return (
    <div className="space-y-6">
      
      {/* Option Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <span className="text-xs font-black uppercase text-slate-900 mr-2">SWOT Target:</span>
        {decision.options.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveOptionId(option.id)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase border-2 border-slate-900 transition-all ${
              activeOptionId === option.id
                ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            {option.title}
          </button>
        ))}
      </div>

      {/* Option Subheader */}
      <div className="rounded-2xl bg-yellow-400 border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <h3 className="font-black text-slate-900 text-base uppercase">{activeOption?.title}</h3>
        <p className="text-xs font-bold text-slate-800 mt-0.5">{activeOption?.description}</p>
      </div>

      {/* 2x2 SWOT Matrix Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* STRENGTHS */}
        <div className="rounded-2xl border-2 border-slate-900 bg-emerald-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wider mb-3 pb-2 border-b-2 border-slate-900">
            <ShieldCheck className="h-5 w-5 text-emerald-700 stroke-[2.5]" />
            <span>Strengths (Internal Advantages)</span>
          </div>
          <ul className="space-y-2">
            {swot.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs font-bold text-slate-900">
                <span className="font-black text-emerald-700">•</span>
                <span>{item}</span>
              </li>
            ))}
            {swot.strengths.length === 0 && (
              <li className="text-xs text-slate-500 italic">No specific strengths generated.</li>
            )}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="rounded-2xl border-2 border-slate-900 bg-rose-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wider mb-3 pb-2 border-b-2 border-slate-900">
            <AlertTriangle className="h-5 w-5 text-rose-700 stroke-[2.5]" />
            <span>Weaknesses (Internal Vulnerabilities)</span>
          </div>
          <ul className="space-y-2">
            {swot.weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs font-bold text-slate-900">
                <span className="font-black text-rose-700">•</span>
                <span>{item}</span>
              </li>
            ))}
            {swot.weaknesses.length === 0 && (
              <li className="text-xs text-slate-500 italic">No specific weaknesses generated.</li>
            )}
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="rounded-2xl border-2 border-slate-900 bg-blue-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wider mb-3 pb-2 border-b-2 border-slate-900">
            <TrendingUp className="h-5 w-5 text-blue-700 stroke-[2.5]" />
            <span>Opportunities (External Upside)</span>
          </div>
          <ul className="space-y-2">
            {swot.opportunities.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs font-bold text-slate-900">
                <span className="font-black text-blue-700">•</span>
                <span>{item}</span>
              </li>
            ))}
            {swot.opportunities.length === 0 && (
              <li className="text-xs text-slate-500 italic">No specific opportunities generated.</li>
            )}
          </ul>
        </div>

        {/* THREATS */}
        <div className="rounded-2xl border-2 border-slate-900 bg-amber-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-sm uppercase tracking-wider mb-3 pb-2 border-b-2 border-slate-900">
            <ShieldAlert className="h-5 w-5 text-amber-700 stroke-[2.5]" />
            <span>Threats (External Risks & Pitfalls)</span>
          </div>
          <ul className="space-y-2">
            {swot.threats.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs font-bold text-slate-900">
                <span className="font-black text-amber-700">•</span>
                <span>{item}</span>
              </li>
            ))}
            {swot.threats.length === 0 && (
              <li className="text-xs text-slate-500 italic">No specific threats generated.</li>
            )}
          </ul>
        </div>

      </div>

    </div>
  );
};
