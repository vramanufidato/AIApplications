import React, { useState } from 'react';
import { Table, Star, Plus, Trash2, Edit2, Check, Sparkles, Trophy, Award, SlidersHorizontal, Info } from 'lucide-react';
import { DecisionAnalysis, ComparisonCriterion } from '../types';

interface ComparisonTableViewProps {
  decision: DecisionAnalysis;
  onUpdateComparisonCriteria?: (criteria: ComparisonCriterion[]) => void;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  decision,
  onUpdateComparisonCriteria,
}) => {
  const [editingCell, setEditingCell] = useState<{ criterionId: string; optionId: string } | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [editingScoreVal, setEditingScoreVal] = useState<number>(5);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDimensionName, setNewDimensionName] = useState<string>('');
  const [newDimensionDesc, setNewDimensionDesc] = useState<string>('');
  const [newDimensionScores, setNewDimensionScores] = useState<Record<string, number>>({});
  const [newDimensionNotes, setNewDimensionNotes] = useState<Record<string, string>>({});

  // Ensure default robust dimensions exist if array is empty or missing
  const defaultCriteria: ComparisonCriterion[] = [
    {
      id: 'crit_1',
      name: 'Upfront Investment & Resource Effort',
      description: 'CapEx, launch costs, initial setup time, and team focus required',
      scores: decision.options.reduce((acc, opt, i) => ({ ...acc, [opt.id]: i === 0 ? 8 : 6 }), {}),
      notes: decision.options.reduce((acc, opt, i) => ({ 
        ...acc, 
        [opt.id]: i === 0 ? 'Lower friction & faster initial setup' : 'Higher initial commitment & setup overhead' 
      }), {})
    },
    {
      id: 'crit_2',
      name: 'Time to Value & Speed to Revenue',
      description: 'How quickly this option generates measurable positive outcomes or income',
      scores: decision.options.reduce((acc, opt, i) => ({ ...acc, [opt.id]: i === 0 ? 7 : 9 }), {}),
      notes: decision.options.reduce((acc, opt, i) => ({ 
        ...acc, 
        [opt.id]: i === 0 ? 'Immediate conversion flywheel' : 'Direct upfront monetizable baseline' 
      }), {})
    },
    {
      id: 'crit_3',
      name: 'Scalability & Growth Ceiling',
      description: 'Potential for exponential expansion and long-term leverage',
      scores: decision.options.reduce((acc, opt, i) => ({ ...acc, [opt.id]: i === 0 ? 9 : 7 }), {}),
      notes: decision.options.reduce((acc, opt, i) => ({ 
        ...acc, 
        [opt.id]: i === 0 ? 'High top-of-funnel reach' : 'Steady predictable subscriber growth' 
      }), {})
    },
    {
      id: 'crit_4',
      name: 'Risk Resilience & Downside Protection',
      description: 'Ability to withstand market shifts, churn, and operational errors',
      scores: decision.options.reduce((acc, opt, i) => ({ ...acc, [opt.id]: i === 0 ? 6 : 8 }), {}),
      notes: decision.options.reduce((acc, opt, i) => ({ 
        ...acc, 
        [opt.id]: i === 0 ? 'Higher reliance on conversion funnel' : 'Stronger cash flow floor and buyer commitment' 
      }), {})
    },
    {
      id: 'crit_5',
      name: 'Operational & Support Burden',
      description: 'Ongoing maintenance, support overhead, and complexity',
      scores: decision.options.reduce((acc, opt, i) => ({ ...acc, [opt.id]: i === 0 ? 6 : 9 }), {}),
      notes: decision.options.reduce((acc, opt, i) => ({ 
        ...acc, 
        [opt.id]: i === 0 ? 'Higher volume of free user support requests' : 'Fewer high-intent paying customers to support' 
      }), {})
    }
  ];

  const criteriaList = decision.comparisonCriteria && decision.comparisonCriteria.length > 0
    ? decision.comparisonCriteria
    : defaultCriteria;

  // Calculate total matrix score for each option
  const optionTotals: Record<string, { totalScore: number; count: number; avgScore: number }> = {};
  decision.options.forEach((opt) => {
    optionTotals[opt.id] = { totalScore: 0, count: 0, avgScore: 0 };
  });

  criteriaList.forEach((crit) => {
    decision.options.forEach((opt) => {
      const score = crit.scores?.[opt.id] ?? 5;
      if (optionTotals[opt.id]) {
        optionTotals[opt.id].totalScore += score;
        optionTotals[opt.id].count += 1;
      }
    });
  });

  let winnerOptionId = '';
  let highestAvg = -1;
  Object.keys(optionTotals).forEach((optId) => {
    const item = optionTotals[optId];
    item.avgScore = item.count > 0 ? Math.round((item.totalScore / item.count) * 10) / 10 : 0;
    if (item.avgScore > highestAvg) {
      highestAvg = item.avgScore;
      winnerOptionId = optId;
    }
  });

  const handleStartCellEdit = (criterionId: string, optionId: string, currentScore: number, currentNote: string) => {
    setEditingCell({ criterionId, optionId });
    setEditingScoreVal(currentScore);
    setEditingNoteText(currentNote || '');
  };

  const handleSaveCellEdit = () => {
    if (!editingCell) return;
    const { criterionId, optionId } = editingCell;

    const updatedCriteria = criteriaList.map((crit) => {
      if (crit.id === criterionId) {
        return {
          ...crit,
          scores: {
            ...crit.scores,
            [optionId]: editingScoreVal
          },
          notes: {
            ...crit.notes,
            [optionId]: editingNoteText
          }
        };
      }
      return crit;
    });

    if (onUpdateComparisonCriteria) {
      onUpdateComparisonCriteria(updatedCriteria);
    }
    setEditingCell(null);
  };

  const handleDeleteDimension = (id: string) => {
    const updated = criteriaList.filter((c) => c.id !== id);
    if (onUpdateComparisonCriteria) {
      onUpdateComparisonCriteria(updated);
    }
  };

  const handleCreateDimension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDimensionName.trim()) return;

    const newCriterion: ComparisonCriterion = {
      id: `crit_${Date.now()}`,
      name: newDimensionName.trim(),
      description: newDimensionDesc.trim() || 'Custom comparison dimension',
      scores: { ...newDimensionScores },
      notes: { ...newDimensionNotes }
    };

    // Ensure scores and notes exist for all options
    decision.options.forEach((opt) => {
      if (newCriterion.scores[opt.id] === undefined) newCriterion.scores[opt.id] = 7;
      if (!newCriterion.notes[opt.id]) newCriterion.notes[opt.id] = 'Evaluated';
    });

    const updated = [...criteriaList, newCriterion];
    if (onUpdateComparisonCriteria) {
      onUpdateComparisonCriteria(updated);
    }

    setNewDimensionName('');
    setNewDimensionDesc('');
    setNewDimensionScores({});
    setNewDimensionNotes({});
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Table Card Wrapper */}
      <div className="rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        
        {/* Header Banner */}
        <div className="border-b-2 border-slate-900 bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Table className="h-5 w-5 text-amber-400 stroke-[2.5]" />
              <h3 className="font-black text-lg uppercase tracking-tight text-white">
                Side-by-Side Comparison Matrix
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-300 mt-1">
              Multi-dimensional side-by-side assessment. Highest rating in each dimension is highlighted in gold. Click any cell to edit ratings or notes.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-amber-400 text-slate-900 px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-amber-300 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add Dimension</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-900 uppercase font-black text-[11px] tracking-wider">
                <th className="p-4 w-1/3 border-r-2 border-slate-900">
                  <div className="flex items-center justify-between">
                    <span>Evaluation Dimension</span>
                    <span className="text-[10px] font-bold text-slate-500 lowercase">({criteriaList.length} dimensions)</span>
                  </div>
                </th>
                {decision.options.map((option) => {
                  const isWinner = option.id === winnerOptionId;
                  return (
                    <th key={option.id} className="p-4 text-center border-r-2 border-slate-900 last:border-r-0">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="font-black text-slate-900 text-sm uppercase">{option.title}</span>
                        {isWinner && (
                          <span title="Top Matrix Performer" className="rounded-md bg-amber-400 p-0.5 text-slate-900 border border-slate-900">
                            <Trophy className="h-3.5 w-3.5 fill-amber-300" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold lowercase line-clamp-1 mt-0.5">{option.description}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-900">
              {criteriaList.map((criterion) => {
                // Find highest score in this row
                let maxScoreInRow = -1;
                decision.options.forEach((opt) => {
                  const score = criterion.scores?.[opt.id] ?? 0;
                  if (score > maxScoreInRow) maxScoreInRow = score;
                });

                return (
                  <tr key={criterion.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Dimension Name, Description & Delete */}
                    <td className="p-4 align-top border-r-2 border-slate-900 bg-slate-50/50">
                      <div className="flex items-start justify-between group">
                        <div>
                          <div className="font-black uppercase text-slate-900 text-xs">{criterion.name}</div>
                          {criterion.description && (
                            <div className="text-[11px] font-semibold text-slate-600 mt-1 leading-snug">{criterion.description}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDimension(criterion.id)}
                          title="Delete Dimension"
                          className="opacity-20 hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </td>

                    {/* Option Scores & Notes */}
                    {decision.options.map((option) => {
                      const score = criterion.scores?.[option.id] ?? 5;
                      const note = criterion.notes?.[option.id] || 'Evaluated';
                      const isWinnerInRow = maxScoreInRow > 0 && score === maxScoreInRow;
                      const isEditingThisCell = editingCell?.criterionId === criterion.id && editingCell?.optionId === option.id;

                      return (
                        <td
                          key={option.id}
                          className={`p-4 align-top text-center transition-colors border-r-2 border-slate-900 last:border-r-0 ${
                            isWinnerInRow ? 'bg-amber-100/50' : ''
                          }`}
                        >
                          {isEditingThisCell ? (
                            <div className="rounded-xl border-2 border-slate-900 bg-white p-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-left space-y-2">
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">Rating: {editingScoreVal}/10</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  value={editingScoreVal}
                                  onChange={(e) => setEditingScoreVal(Number(e.target.value))}
                                  className="w-full accent-slate-900 cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">Explanatory Note:</label>
                                <input
                                  type="text"
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  className="w-full rounded-lg border-2 border-slate-900 p-1.5 text-xs font-bold text-slate-900 bg-slate-50"
                                />
                              </div>
                              <div className="flex items-center space-x-2 pt-1">
                                <button
                                  onClick={handleSaveCellEdit}
                                  className="flex items-center space-x-1 rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[10px] font-black uppercase border border-slate-900"
                                >
                                  <Check className="h-3 w-3 stroke-[3]" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => setEditingCell(null)}
                                  className="rounded-lg bg-slate-200 text-slate-900 px-2.5 py-1 text-[10px] font-black uppercase border border-slate-900"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartCellEdit(criterion.id, option.id, score, note)}
                              className="group cursor-pointer inline-flex flex-col items-center p-1 rounded-xl hover:bg-slate-100/80 transition-all w-full"
                              title="Click to edit score or note"
                            >
                              {/* Rating Badge */}
                              <div
                                className={`flex items-center space-x-1 rounded-xl px-3 py-1 font-black text-xs border-2 border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] ${
                                  isWinnerInRow
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-white text-slate-900'
                                }`}
                              >
                                {isWinnerInRow && <Star className="h-3.5 w-3.5 text-slate-900 fill-slate-900" />}
                                <span>{score} / 10</span>
                              </div>

                              {/* Explanatory Note */}
                              <p className="mt-2 text-[11px] font-semibold text-slate-800 leading-snug">
                                {note}
                              </p>

                              <span className="opacity-0 group-hover:opacity-100 mt-1 text-[9px] font-black uppercase text-indigo-600 flex items-center space-x-1">
                                <Edit2 className="h-2.5 w-2.5 stroke-[2.5]" />
                                <span>Click to edit</span>
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>

            {/* Matrix Summary Footer Row */}
            <tfoot>
              <tr className="border-t-2 border-slate-900 bg-slate-900 text-white font-black text-xs">
                <td className="p-4 border-r-2 border-slate-900">
                  <div className="uppercase tracking-wider font-black text-amber-400 text-sm flex items-center space-x-2">
                    <Award className="h-4 w-4 stroke-[2.5]" />
                    <span>Matrix Overall Score</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-300">Average score across all criteria</div>
                </td>
                {decision.options.map((option) => {
                  const stats = optionTotals[option.id] || { totalScore: 0, count: 0, avgScore: 0 };
                  const isWinner = option.id === winnerOptionId;

                  return (
                    <td key={option.id} className="p-4 text-center border-r-2 border-slate-900 last:border-r-0">
                      <div className="inline-flex flex-col items-center">
                        <div className={`rounded-xl border-2 border-slate-900 px-4 py-1.5 font-black text-sm uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                          isWinner ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-white'
                        }`}>
                          {stats.avgScore} / 10 Avg
                        </div>
                        <div className="text-[10px] font-bold text-slate-300 mt-1">
                          Total: {stats.totalScore} pts
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

      {/* Matrix Insights Callout */}
      <div className="rounded-2xl border-2 border-slate-900 bg-indigo-50 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-start space-x-3 text-slate-900">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 border-2 border-slate-900 text-white">
          <Info className="h-4 w-4 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="font-black text-xs uppercase text-slate-900">Matrix Evaluation Insight</h4>
          <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-0.5">
            The top overall option in this matrix is <strong className="text-indigo-950 font-black">{decision.options.find(o => o.id === winnerOptionId)?.title}</strong> with an average score of <strong className="text-indigo-950 font-black">{highestAvg}/10</strong>. You can tweak individual score sliders or notes at any time to test different assumptions.
          </p>
        </div>
      </div>

      {/* Modal: Add Custom Dimension */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 border-2 border-slate-900 text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-base uppercase text-slate-900">Add Custom Dimension</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border-2 border-slate-900 bg-slate-100 p-1 text-slate-900 font-black hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDimension} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-900 block mb-1">Dimension Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Customer Support Effort, Regulatory Compliance, Time-to-Market"
                  value={newDimensionName}
                  onChange={(e) => setNewDimensionName(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-900 p-2.5 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-900 block mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g., How much operational friction this creates for the team"
                  value={newDimensionDesc}
                  onChange={(e) => setNewDimensionDesc(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-900 p-2.5 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Ratings per option */}
              <div className="space-y-3 pt-2 border-t-2 border-slate-200">
                <label className="text-xs font-black uppercase text-slate-900 block">Assign Ratings & Notes Per Option:</label>
                {decision.options.map((option) => (
                  <div key={option.id} className="rounded-xl border-2 border-slate-900 bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase text-slate-900">{option.title}</span>
                      <span className="font-black text-xs text-amber-600">{newDimensionScores[option.id] ?? 7}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={newDimensionScores[option.id] ?? 7}
                      onChange={(e) => setNewDimensionScores({ ...newDimensionScores, [option.id]: Number(e.target.value) })}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder={`Note for ${option.title} (e.g., High initial burden)`}
                      value={newDimensionNotes[option.id] || ''}
                      onChange={(e) => setNewDimensionNotes({ ...newDimensionNotes, [option.id]: e.target.value })}
                      className="w-full rounded-lg border-2 border-slate-900 p-1.5 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border-2 border-slate-900 bg-slate-100 text-slate-900 px-4 py-2 text-xs font-black uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-5 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800"
                >
                  Add Dimension
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
