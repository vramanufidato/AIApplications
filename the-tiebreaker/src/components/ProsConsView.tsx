import React, { useState } from 'react';
import { CheckCircle2, XCircle, Plus, Filter, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DecisionAnalysis, ProConItem, FactorCategory, ImpactLevel } from '../types';

interface ProsConsViewProps {
  decision: DecisionAnalysis;
  onUpdateProsCons: (updatedProsCons: ProConItem[]) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  decision,
  onUpdateProsCons,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [prosConsList, setProsConsList] = useState<ProConItem[]>(decision.prosCons);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'pro' | 'con'>('pro');
  const [newText, setNewText] = useState('');
  const [newOptionId, setNewOptionId] = useState(decision.options[0]?.id || '');
  const [newImpact, setNewImpact] = useState<ImpactLevel>('medium');
  const [newCategory, setNewCategory] = useState<FactorCategory>('other');

  const filteredItems = prosConsList.filter((item) => {
    if (selectedOptionId !== 'all' && item.optionId !== selectedOptionId) return false;
    if (filterImpact !== 'all' && item.impact !== filterImpact) return false;
    return true;
  });

  const handleAddProCon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newOptionId) return;

    const newItem: ProConItem = {
      id: 'pc_' + Date.now(),
      optionId: newOptionId,
      type: newType,
      text: newText.trim(),
      impact: newImpact,
      category: newCategory,
    };

    const updated = [...prosConsList, newItem];
    setProsConsList(updated);
    onUpdateProsCons(updated);
    setNewText('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = prosConsList.filter((item) => item.id !== id);
    setProsConsList(updated);
    onUpdateProsCons(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls: Filter Tabs & Add Pro/Con */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        
        {/* Option Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedOptionId('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase border-2 border-slate-900 transition-all ${
              selectedOptionId === 'all'
                ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Options
          </button>
          {decision.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase border-2 border-slate-900 transition-all ${
                selectedOptionId === opt.id
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {opt.title}
            </button>
          ))}
        </div>

        {/* Filter Impact & Add Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-slate-900 bg-slate-50 border-2 border-slate-900 rounded-xl px-2.5 py-1 font-bold">
            <Filter className="h-3.5 w-3.5 text-slate-700 stroke-[2.5]" />
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="bg-transparent text-xs font-black uppercase text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Impacts</option>
              <option value="high">High Impact Only</option>
              <option value="medium">Medium Impact Only</option>
              <option value="low">Low Impact Only</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-yellow-400 px-3 py-1.5 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-yellow-300 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Add Pro / Con</span>
          </button>
        </div>

      </div>

      {/* Main Options Grid or Side-by-side Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {decision.options
          .filter((opt) => selectedOptionId === 'all' || opt.id === selectedOptionId)
          .map((option) => {
            const optionPros = filteredItems.filter((i) => i.optionId === option.id && i.type === 'pro');
            const optionCons = filteredItems.filter((i) => i.optionId === option.id && i.type === 'con');

            return (
              <div
                key={option.id}
                className="flex flex-col rounded-2xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden"
              >
                {/* Option Header */}
                <div className="border-b-2 border-slate-900 bg-slate-900 text-white px-5 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base uppercase text-white tracking-tight">{option.title}</h3>
                    {option.badge && (
                      <span className="rounded-md bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-900 border border-slate-900">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">{option.description}</p>
                </div>

                {/* Pros & Cons Content */}
                <div className="p-5 space-y-6 flex-1 bg-white">
                  
                  {/* PROS COLUMN */}
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-black text-emerald-700 uppercase tracking-wider mb-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[3]" />
                      <span>PROS & ADVANTAGES ({optionPros.length})</span>
                    </div>

                    {optionPros.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No pros recorded under current filters.</p>
                    ) : (
                      <ul className="space-y-2.5">
                        {optionPros.map((pro) => (
                          <li
                            key={pro.id}
                            className="group relative rounded-xl border-2 border-slate-900 bg-emerald-50 p-3 text-xs text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-emerald-100"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start space-x-2">
                                <ArrowUpRight className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5 stroke-[3]" />
                                <span className="font-bold text-slate-900">{pro.text}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(pro.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-600 transition-opacity font-black text-sm"
                                title="Delete"
                              >
                                &times;
                              </button>
                            </div>

                            <div className="mt-2 flex items-center space-x-2 text-[10px]">
                              <span
                                className={`rounded border border-slate-900 px-1.5 py-0.5 font-black uppercase ${
                                  pro.impact === 'high'
                                    ? 'bg-emerald-300 text-slate-900'
                                    : 'bg-emerald-200 text-slate-900'
                                }`}
                              >
                                {pro.impact} impact
                              </span>
                              <span className="rounded border border-slate-900 bg-white px-1.5 py-0.5 text-slate-900 font-bold uppercase">
                                #{pro.category}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* CONS COLUMN */}
                  <div className="border-t-2 border-slate-900 pt-5">
                    <div className="flex items-center space-x-2 text-xs font-black text-rose-700 uppercase tracking-wider mb-3">
                      <XCircle className="h-4 w-4 text-rose-600 stroke-[3]" />
                      <span>CONS & DRAWBACKS ({optionCons.length})</span>
                    </div>

                    {optionCons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No cons recorded under current filters.</p>
                    ) : (
                      <ul className="space-y-2.5">
                        {optionCons.map((con) => (
                          <li
                            key={con.id}
                            className="group relative rounded-xl border-2 border-slate-900 bg-rose-50 p-3 text-xs text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-rose-100"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start space-x-2">
                                <ArrowDownRight className="h-4 w-4 text-rose-700 shrink-0 mt-0.5 stroke-[3]" />
                                <span className="font-bold text-slate-900">{con.text}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(con.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-600 transition-opacity font-black text-sm"
                                title="Delete"
                              >
                                &times;
                              </button>
                            </div>

                            <div className="mt-2 flex items-center space-x-2 text-[10px]">
                              <span
                                className={`rounded border border-slate-900 px-1.5 py-0.5 font-black uppercase ${
                                  con.impact === 'high'
                                    ? 'bg-rose-300 text-slate-900'
                                    : 'bg-rose-200 text-slate-900'
                                }`}
                              >
                                {con.impact} impact
                              </span>
                              <span className="rounded border border-slate-900 bg-white px-1.5 py-0.5 text-slate-900 font-bold uppercase">
                                #{con.category}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
      </div>

      {/* Add Custom Pro / Con Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Pro or Con Item</h3>
            <p className="text-xs text-slate-500 mb-4">
              Record an additional advantage or drawback for any option.
            </p>

            <form onSubmit={handleAddProCon} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Option
                  </label>
                  <select
                    value={newOptionId}
                    onChange={(e) => setNewOptionId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 bg-white"
                  >
                    {decision.options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type
                  </label>
                  <div className="flex rounded-lg border border-slate-300 p-1 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setNewType('pro')}
                      className={`flex-1 rounded py-1 text-xs font-bold ${
                        newType === 'pro' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Pro (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('con')}
                      className={`flex-1 rounded py-1 text-xs font-bold ${
                        newType === 'con' ? 'bg-rose-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Con (-)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Requires a 45-minute highway commute daily"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Impact Level
                  </label>
                  <select
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value as ImpactLevel)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="high">High Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="low">Low Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FactorCategory)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="financial">Financial</option>
                    <option value="time">Time</option>
                    <option value="risk">Risk</option>
                    <option value="growth">Growth</option>
                    <option value="effort">Effort</option>
                    <option value="emotional">Emotional</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
