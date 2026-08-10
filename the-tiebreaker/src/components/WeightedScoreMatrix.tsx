import React, { useState } from 'react';
import { Sliders, Award, Plus, Sparkles, AlertCircle, Edit2, Check, RefreshCw } from 'lucide-react';
import { DecisionAnalysis, DecisionFactor, DecisionOption } from '../types';
import { calculateWeightedScores } from '../utils/decisionEngine';

interface WeightedScoreMatrixProps {
  decision: DecisionAnalysis;
  onUpdateFactors: (updatedFactors: DecisionFactor[]) => void;
}

export const WeightedScoreMatrix: React.FC<WeightedScoreMatrixProps> = ({
  decision,
  onUpdateFactors,
}) => {
  const [factors, setFactors] = useState<DecisionFactor[]>(decision.factors);
  const [editingScoreCell, setEditingScoreCell] = useState<{ factorId: string; optionId: string } | null>(null);
  const [newFactorName, setNewFactorName] = useState('');
  const [showAddFactorModal, setShowAddFactorModal] = useState(false);

  // Recalculate options live based on state
  const rankedResults = calculateWeightedScores(decision.options, factors);
  const topOption = rankedResults[0];
  const runnerUp = rankedResults[1];

  const leadPercentage = (topOption && runnerUp)
    ? topOption.percentageScore - runnerUp.percentageScore
    : 0;

  // Handler for factor weight change
  const handleWeightChange = (factorId: string, newWeight: number) => {
    const updated = factors.map((f) => (f.id === factorId ? { ...f, weight: newWeight } : f));
    setFactors(updated);
    onUpdateFactors(updated);
  };

  // Handler for option score for a factor
  const handleScoreChange = (factorId: string, optionId: string, newScore: number) => {
    const updated = factors.map((f) => {
      if (f.id === factorId) {
        return {
          ...f,
          scores: {
            ...f.scores,
            [optionId]: newScore,
          },
        };
      }
      return f;
    });
    setFactors(updated);
    onUpdateFactors(updated);
  };

  // Reset factors to initial AI defaults
  const handleResetDefaults = () => {
    setFactors(decision.factors);
    onUpdateFactors(decision.factors);
  };

  // Add custom factor
  const handleAddFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactorName.trim()) return;

    // Create default scores of 5 for each option
    const defaultScores: Record<string, number> = {};
    decision.options.forEach((opt) => {
      defaultScores[opt.id] = 5;
    });

    const newFactor: DecisionFactor = {
      id: 'f_custom_' + Date.now(),
      name: newFactorName.trim(),
      description: 'Custom factor added by user',
      weight: 50,
      scores: defaultScores,
    };

    const updated = [...factors, newFactor];
    setFactors(updated);
    onUpdateFactors(updated);
    setNewFactorName('');
    setShowAddFactorModal(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Dynamic Leaderboard */}
      <div className="rounded-2xl border-2 border-slate-900 bg-indigo-600 p-6 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          
          <div>
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-yellow-300 mb-1">
              <Award className="h-4 w-4 stroke-[3]" />
              <span>DYNAMIC TIEBREAKER LEADERBOARD</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Current Leading Choice: {topOption?.option.title}
            </h2>
            <p className="mt-1 text-xs font-semibold text-indigo-100">
              {runnerUp ? (
                <>
                  Leads <strong className="text-white uppercase">{runnerUp.option.title}</strong> by{' '}
                  <span className="font-black text-yellow-300">+{leadPercentage}% match points</span>. Adjust factor weights below to test sensitivities.
                </>
              ) : (
                'Highest calculated match based on your factor weightings.'
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={handleResetDefaults}
              className="flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-white px-3 py-1.5 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-100 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <RefreshCw className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Reset AI Weights</span>
            </button>
          </div>

        </div>

        {/* Live Ranked Score Progress Bars */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rankedResults.map((item) => {
            const isWinner = item.rank === 1;
            return (
              <div
                key={item.option.id}
                className={`rounded-xl border-2 border-slate-900 p-4 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                  isWinner
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-slate-900 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black border-2 border-slate-900 ${
                        isWinner
                          ? 'bg-slate-900 text-white'
                          : 'bg-yellow-400 text-slate-900'
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <span className="font-black text-sm uppercase truncate max-w-[150px]">
                      {item.option.title}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${isWinner ? 'text-slate-900' : 'text-yellow-300'}`}>
                      {item.percentageScore}%
                    </span>
                    <span className={`text-[10px] font-bold block ${isWinner ? 'text-slate-800' : 'text-slate-400'}`}>
                      ({item.rawScore} / 10)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`h-2.5 w-full rounded-full border border-slate-900 overflow-hidden ${isWinner ? 'bg-slate-900/20' : 'bg-slate-800'}`}>
                  <div
                    className={`h-full transition-all duration-300 ${
                      isWinner
                        ? 'bg-slate-900'
                        : 'bg-yellow-400'
                    }`}
                    style={{ width: `${item.percentageScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Factor Weighting Controls */}
      <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6 border-b-2 border-slate-900 pb-4">
          <div>
            <h3 className="text-lg font-black uppercase text-slate-900 flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-indigo-600 stroke-[2.5]" />
              <span>Priority Weighting Matrix</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Drag importance sliders to adjust factor priority and customize option scores.
            </p>
          </div>

          <button
            onClick={() => setShowAddFactorModal(true)}
            className="inline-flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-yellow-400 px-3 py-1.5 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-yellow-300 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Add Factor</span>
          </button>
        </div>

        {/* Factors List with Sliders and Ratings Matrix */}
        <div className="space-y-6 divide-y-2 divide-slate-100">
          {factors.map((factor) => (
            <div key={factor.id} className="pt-5 first:pt-0">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
                
                {/* Factor Info & Weight Slider (Cols 1 to 5) */}
                <div className="lg:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase text-slate-900">{factor.name}</span>
                    <span className="rounded-md border-2 border-slate-900 bg-slate-900 px-2.5 py-0.5 text-xs font-black uppercase text-white">
                      Weight: {factor.weight}%
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600">{factor.description}</p>

                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Low</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={factor.weight}
                      onChange={(e) => handleWeightChange(factor.id, Number(e.target.value))}
                      className="h-2.5 w-full cursor-pointer accent-slate-900 rounded-lg bg-slate-200 border border-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Critical</span>
                  </div>
                </div>

                {/* Option Ratings for this Factor (Cols 6 to 12) */}
                <div className="lg:col-span-7">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Ratings for this Factor (0 to 10)
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {decision.options.map((option) => {
                      const score = factor.scores?.[option.id] ?? 5;
                      const isEditing = editingScoreCell?.factorId === factor.id && editingScoreCell?.optionId === option.id;

                      return (
                        <div
                          key={option.id}
                          className="flex items-center justify-between rounded-xl border-2 border-slate-900 bg-slate-50 px-3 py-2 text-xs font-bold"
                        >
                          <span className="font-black text-slate-900 uppercase truncate max-w-[100px]" title={option.title}>
                            {option.title}
                          </span>

                          <div className="flex items-center space-x-1">
                            {isEditing ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={score}
                                  onChange={(e) =>
                                    handleScoreChange(factor.id, option.id, Math.min(10, Math.max(0, Number(e.target.value))))
                                  }
                                  className="w-12 rounded border-2 border-slate-900 px-1 py-0.5 text-center text-xs font-black bg-white text-slate-900"
                                />
                                <button
                                  onClick={() => setEditingScoreCell(null)}
                                  className="rounded border border-slate-900 bg-slate-900 p-1 text-white hover:bg-slate-800"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingScoreCell({ factorId: factor.id, optionId: option.id })}
                                className="group flex items-center space-x-1 rounded-lg bg-white px-2 py-0.5 border-2 border-slate-900 hover:bg-yellow-300 transition-colors shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                              >
                                <span className="font-black text-slate-900">{score}/10</span>
                                <Edit2 className="h-3 w-3 text-slate-600 group-hover:text-slate-900" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Factor Modal */}
      {showAddFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Add Custom Evaluation Factor</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify a new decision driver that is important to your personal choice (e.g., "Commute Time", "Health & Safety").
            </p>

            <form onSubmit={handleAddFactor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Factor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Sustainability"
                  value={newFactorName}
                  onChange={(e) => setNewFactorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFactorModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Add Factor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
