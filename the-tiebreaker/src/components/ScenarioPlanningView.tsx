import React, { useState } from 'react';
import { DecisionAnalysis, OptionScenarios, ScenarioOutcome } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Send,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

interface ScenarioPlanningViewProps {
  decision: DecisionAnalysis;
  onUpdateScenarios?: (scenarios: OptionScenarios[]) => void;
}

export const ScenarioPlanningView: React.FC<ScenarioPlanningViewProps> = ({ 
  decision, 
  onUpdateScenarios 
}) => {
  const [activeOptionId, setActiveOptionId] = useState<string>(
    decision.options[0]?.id || ''
  );
  const [customTrigger, setCustomTrigger] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const activeOption = decision.options.find((o) => o.id === activeOptionId) || decision.options[0];
  const activeScenarios = decision.scenarios?.find((s) => s.optionId === activeOptionId);

  // Fallback default scenarios if not generated yet
  const defaultBestCase: ScenarioOutcome = {
    type: 'best',
    title: `Optimistic Upside for ${activeOption?.title}`,
    probability: '25%',
    description: `Execution exceeds expectations, key risks are managed smoothly, and market/personal conditions align favorably.`,
    keyTriggers: ['Smooth execution timeline', 'High adoption or satisfaction', 'Favorable external conditions'],
    keyConsequences: ['Maximum return on investment', 'Accelerated growth & momentum', 'High satisfaction and confidence'],
    mitigationOrAction: 'Capitalize on early success by reinvesting gains into long-term stability.'
  };

  const defaultMostLikely: ScenarioOutcome = {
    type: 'most_likely',
    title: `Baseline Expected Path for ${activeOption?.title}`,
    probability: '60%',
    description: `Standard outcome with expected trade-offs, manageable friction, and predictable progression.`,
    keyTriggers: ['Consistent effort', 'Average market/personal conditions', 'Standard resource availability'],
    keyConsequences: ['Steady progress toward goals', 'Predictable timelines and costs', 'Minor trade-offs required'],
    mitigationOrAction: 'Maintain discipline and execute according to baseline plan.'
  };

  const defaultWorstCase: ScenarioOutcome = {
    type: 'worst',
    title: `Downside Risk Scenario for ${activeOption?.title}`,
    probability: '15%',
    description: `Unforeseen bottlenecks, resource constraints, or unexpected complications disrupt the primary plan.`,
    keyTriggers: ['Budget or time overruns', 'External unexpected shifts', 'Key assumptions proved wrong'],
    keyConsequences: ['Temporary delays and cost increases', 'Stress and resource strain', 'Need for pivot'],
    mitigationOrAction: 'Establish exit triggers, contingency budget, and early-warning check-ins.'
  };

  const bestCase = activeScenarios?.bestCase || defaultBestCase;
  const mostLikely = activeScenarios?.mostLikely || defaultMostLikely;
  const worstCase = activeScenarios?.worstCase || defaultWorstCase;

  const handleSimulateCustomTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTrigger.trim()) return;

    setIsSimulating(true);
    setSimulationError(null);

    try {
      const res = await fetch('/api/scenario-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          targetOptionId: activeOptionId,
          customTrigger: customTrigger.trim()
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to run scenario simulation.');
      }

      const data = await res.json();
      
      const newOptionScenarios: OptionScenarios = {
        optionId: activeOptionId,
        bestCase: data.bestCase,
        mostLikely: data.mostLikely,
        worstCase: data.worstCase
      };

      const existingScenarios = decision.scenarios ? [...decision.scenarios] : [];
      const index = existingScenarios.findIndex(s => s.optionId === activeOptionId);
      
      if (index >= 0) {
        existingScenarios[index] = newOptionScenarios;
      } else {
        existingScenarios.push(newOptionScenarios);
      }

      if (onUpdateScenarios) {
        onUpdateScenarios(existingScenarios);
      }

      setCustomTrigger('');
    } catch (err: any) {
      setSimulationError(err.message || 'Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Option Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <span className="text-xs font-black uppercase text-slate-900 mr-2 flex items-center space-x-1">
          <Layers className="h-4 w-4 stroke-[2.5]" />
          <span>Option Target:</span>
        </span>
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

      {/* Option Header Info */}
      <div className="rounded-2xl bg-yellow-400 border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">
            Three-Outcome Scenario Projection
          </span>
          <h3 className="font-black text-slate-900 text-lg uppercase">{activeOption?.title}</h3>
          <p className="text-xs font-bold text-slate-800 mt-0.5">{activeOption?.description}</p>
        </div>
        <div className="self-start sm:self-auto rounded-xl bg-white border-2 border-slate-900 px-3 py-1.5 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          {activeOption?.badge || 'Option Scenario'}
        </div>
      </div>

      {/* 3 Scenario Outcome Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* BEST CASE */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-900 bg-emerald-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 border-2 border-slate-900 text-slate-900">
                  <TrendingUp className="h-4 w-4 stroke-[3]" />
                </div>
                <span className="font-black text-sm uppercase text-slate-900">Best-Case</span>
              </div>
              <span className="rounded-xl border-2 border-slate-900 bg-emerald-300 px-2.5 py-0.5 text-xs font-black text-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                Prob: {bestCase.probability}
              </span>
            </div>

            <h4 className="font-black text-base text-slate-900 mb-2">{bestCase.title}</h4>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">
              {bestCase.description}
            </p>

            {/* Key Triggers */}
            <div className="mb-4 rounded-xl border border-emerald-300 bg-white p-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-emerald-800 flex items-center space-x-1">
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                <span>Key Triggers & Catalysts</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-900">
                {bestCase.keyTriggers.map((trig, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <span>{trig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Consequences */}
            <div className="mb-4 rounded-xl border border-emerald-300 bg-white p-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-emerald-800 flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Primary Benefits & Outcomes</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-900">
                {bestCase.keyConsequences.map((cons, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <span>{cons}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Strategy */}
          <div className="mt-2 rounded-xl bg-emerald-200 border-2 border-slate-900 p-3 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <span className="text-[10px] font-black uppercase text-slate-900 block mb-0.5">
              Strategy to Maximize Upside:
            </span>
            <p className="text-xs font-bold text-slate-900">
              {bestCase.mitigationOrAction}
            </p>
          </div>
        </div>

        {/* MOST LIKELY */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-900 bg-blue-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400 border-2 border-slate-900 text-slate-900">
                  <Target className="h-4 w-4 stroke-[3]" />
                </div>
                <span className="font-black text-sm uppercase text-slate-900">Most Likely</span>
              </div>
              <span className="rounded-xl border-2 border-slate-900 bg-blue-300 px-2.5 py-0.5 text-xs font-black text-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                Prob: {mostLikely.probability}
              </span>
            </div>

            <h4 className="font-black text-base text-slate-900 mb-2">{mostLikely.title}</h4>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">
              {mostLikely.description}
            </p>

            {/* Key Triggers */}
            <div className="mb-4 rounded-xl border border-blue-300 bg-white p-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-blue-800 flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>Baseline Assumptions & Drivers</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-900">
                {mostLikely.keyTriggers.map((trig, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-black">•</span>
                    <span>{trig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Consequences */}
            <div className="mb-4 rounded-xl border border-blue-300 bg-white p-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-blue-800 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Expected Realized Outcomes</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-900">
                {mostLikely.keyConsequences.map((cons, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-black">•</span>
                    <span>{cons}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Strategy */}
          <div className="mt-2 rounded-xl bg-blue-200 border-2 border-slate-900 p-3 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <span className="text-[10px] font-black uppercase text-slate-900 block mb-0.5">
              Execution Roadmap:
            </span>
            <p className="text-xs font-bold text-slate-900">
              {mostLikely.mitigationOrAction}
            </p>
          </div>
        </div>

        {/* WORST CASE */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-900 bg-rose-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-400 border-2 border-slate-900 text-slate-900">
                  <TrendingDown className="h-4 w-4 stroke-[3]" />
                </div>
                <span className="font-black text-sm uppercase text-slate-900">Worst-Case</span>
              </div>
              <span className="rounded-xl border-2 border-slate-900 bg-rose-300 px-2.5 py-0.5 text-xs font-black text-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                Prob: {worstCase.probability}
              </span>
            </div>

            <h4 className="font-black text-base text-slate-900 mb-2">{worstCase.title}</h4>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">
              {worstCase.description}
            </p>

            {/* Key Triggers */}
            <div className="mb-4 rounded-xl border border-rose-300 bg-white p-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-rose-800 flex items-center space-x-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span>Risk Triggers & Pitfalls</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-900">
                {worstCase.keyTriggers.map((trig, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-rose-600 font-black">•</span>
                    <span>{trig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Consequences */}
            <div className="mb-4 rounded-xl border border-rose-300 bg-white p-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-rose-800 flex items-center space-x-1">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                <span>Downside Impacts</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-900">
                {worstCase.keyConsequences.map((cons, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-rose-600 font-black">•</span>
                    <span>{cons}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Strategy */}
          <div className="mt-2 rounded-xl bg-rose-200 border-2 border-slate-900 p-3 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <span className="text-[10px] font-black uppercase text-slate-900 block mb-0.5">
              Downside Mitigation Plan:
            </span>
            <p className="text-xs font-bold text-slate-900">
              {worstCase.mitigationOrAction}
            </p>
          </div>
        </div>

      </div>

      {/* AI Custom Scenario Simulator Box */}
      <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 border-2 border-slate-900 text-slate-900">
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-black uppercase text-slate-900">
            AI What-If Scenario Simulator
          </h3>
        </div>
        <p className="text-xs font-medium text-slate-600 mb-4">
          Test custom hypothetical triggers or market conditions (e.g. "What if budget decreases by 30%?", "What if team size doubles?", "What if launching takes 6 extra months?").
        </p>

        <form onSubmit={handleSimulateCustomTrigger} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HelpCircle className="absolute left-3 top-3 h-4 w-4 text-slate-400 stroke-[2.5]" />
            <input
              type="text"
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              placeholder="e.g. What if interest rates increase or team capacity drops?"
              className="w-full rounded-xl border-2 border-slate-900 pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSimulating || !customTrigger.trim()}
            className="flex items-center justify-center space-x-2 rounded-xl border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin stroke-[2.5]" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 stroke-[2.5]" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </form>

        {simulationError && (
          <p className="mt-2 text-xs font-bold text-rose-600">
            {simulationError}
          </p>
        )}
      </div>

    </div>
  );
};
