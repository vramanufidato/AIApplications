import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Sliders, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Smile, 
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { PRESET_TEMPLATES } from '../data/templates';
import { AnalyzeRequestPayload, DecisionTemplate } from '../types';

interface DecisionInputFormProps {
  onAnalyze: (payload: AnalyzeRequestPayload) => Promise<void>;
  isLoading: boolean;
}

const CATEGORIES = [
  'General',
  'Career & Work',
  'Finance & Investments',
  'Housing & Real Estate',
  'Tech & Architecture',
  'Buying & Products',
  'Personal & Health',
  'Relationships & Family',
];

const FOCUS_MODES = [
  { id: 'balanced', label: 'Balanced', icon: Sliders, desc: 'Equal weight on risks, rewards, and feasibility' },
  { id: 'speed', label: 'Fast Execution', icon: Zap, desc: 'Prioritize speed to market, ease, and low friction' },
  { id: 'risk-averse', label: 'Risk-Averse', icon: ShieldAlert, desc: 'Minimize worst-case risks and downside vulnerability' },
  { id: 'financial', label: 'Financial Upside', icon: TrendingUp, desc: 'Maximize long-term return on investment and income' },
  { id: 'quality', label: 'Quality & Peace', icon: Smile, desc: 'Prioritize peace of mind, happiness, and low stress' },
] as const;

export const DecisionInputForm: React.FC<DecisionInputFormProps> = ({
  onAnalyze,
  isLoading,
}) => {
  const [dilemma, setDilemma] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [focusMode, setFocusMode] = useState<'balanced' | 'speed' | 'risk-averse' | 'financial' | 'growth'>('balanced');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customOptions, setCustomOptions] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' },
    { title: '', description: '' },
  ]);
  const [customFactorInput, setCustomFactorInput] = useState('');
  const [customFactors, setCustomFactors] = useState<string[]>([]);

  const handleAddCustomOption = () => {
    if (customOptions.length < 5) {
      setCustomOptions([...customOptions, { title: '', description: '' }]);
    }
  };

  const handleRemoveCustomOption = (index: number) => {
    if (customOptions.length > 2) {
      setCustomOptions(customOptions.filter((_, i) => i !== index));
    }
  };

  const handleCustomOptionChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...customOptions];
    updated[index][field] = value;
    setCustomOptions(updated);
  };

  const handleAddCustomFactor = () => {
    if (customFactorInput.trim() && !customFactors.includes(customFactorInput.trim())) {
      setCustomFactors([...customFactors, customFactorInput.trim()]);
      setCustomFactorInput('');
    }
  };

  const handleRemoveCustomFactor = (factor: string) => {
    setCustomFactors(customFactors.filter(f => f !== factor));
  };

  const handleSelectTemplate = (template: DecisionTemplate) => {
    setDilemma(template.dilemma);
    setTitle(template.title);
    setCategory(template.category);
    setCustomOptions(template.options.map(o => ({ title: o.title, description: o.description })));
    setCustomFactors(template.suggestedFactors);
    setShowAdvanced(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemma.trim()) return;

    // Filter valid custom options if filled
    const validCustomOptions = customOptions.filter(o => o.title.trim().length > 0);

    onAnalyze({
      dilemma: dilemma.trim(),
      title: title.trim() || undefined,
      category,
      customOptions: validCustomOptions.length >= 2 ? validCustomOptions : undefined,
      customFactors: customFactors.length > 0 ? customFactors : undefined,
      focusMode,
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      
      {/* Hero Welcome */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-yellow-400 border-2 border-slate-900 px-4 py-1 text-xs font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] mb-4">
          <Sparkles className="h-3.5 w-3.5 text-slate-900" />
          <span>Stop overthinking. Let AI break the deadlock.</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl">
          What decision is on your mind?
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-600 max-w-2xl mx-auto">
          State your dilemma below. The Tiebreaker will analyze pros & cons, build a comparison table, generate a SWOT matrix, and let you tune factor weights in a bento analysis canvas.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Textarea */}
          <div>
            <label htmlFor="dilemma-input" className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center justify-between">
              <span>Describe your dilemma or choice</span>
              <span className="text-[10px] text-slate-500 font-bold lowercase">e.g. "Should I choose Option A or Option B?"</span>
            </label>
            <textarea
              id="dilemma-input"
              rows={4}
              required
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              placeholder="e.g. I received two job offers: Offer A at a 30-person startup with higher equity and fast growth, vs Offer B at an established tech firm with 20% higher base pay and stability. Help me decide..."
              className="w-full rounded-xl border-2 border-slate-900 p-4 text-sm font-medium text-slate-900 shadow-inner focus:border-indigo-600 focus:outline-none placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Title & Category Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title-input" className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                Decision Title <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Job Offer Evaluation"
                className="w-full rounded-xl border-2 border-slate-900 px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-900 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Evaluation Focus Mode */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Select AI Evaluation Lens <span className="text-slate-500 font-medium text-[11px] lowercase">(adjusts default weighting bias)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {FOCUS_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = focusMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFocusMode(mode.id as any)}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 text-center border-2 transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                        : 'border-slate-900 bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-amber-400' : 'text-slate-700'}`} />
                    <span className="text-xs font-black uppercase">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Custom Options / Factors */}
          <div className="border-t-2 border-slate-900 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{showAdvanced ? 'Hide Custom Options & Factors' : '+ Specify Custom Options or Factors (Optional)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 rounded-xl bg-slate-50 p-4 border-2 border-slate-900">
                
                {/* Custom Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-slate-900">Specific Options You Are Comparing:</span>
                    <span className="text-[10px] text-slate-500 font-bold">Leave blank to let AI suggest options automatically</span>
                  </div>

                  <div className="space-y-2">
                    {customOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-900 w-5 text-right">{idx + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1} Name (e.g. ${idx === 0 ? 'Startup Offer' : 'Corporate Offer'})`}
                          value={opt.title}
                          onChange={(e) => handleCustomOptionChange(idx, 'title', e.target.value)}
                          className="flex-1 rounded-lg border-2 border-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Short detail (optional)"
                          value={opt.description}
                          onChange={(e) => handleCustomOptionChange(idx, 'description', e.target.value)}
                          className="hidden sm:block flex-1 rounded-lg border-2 border-slate-900 px-3 py-1.5 text-xs text-slate-900 bg-white"
                        />
                        {customOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomOption(idx)}
                            className="p-1 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {customOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddCustomOption}
                      className="mt-2 inline-flex items-center space-x-1 text-xs font-black uppercase text-slate-900 hover:text-indigo-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                {/* Custom Factors */}
                <div className="border-t-2 border-slate-900 pt-3">
                  <span className="block text-xs font-black uppercase text-slate-900 mb-1.5">Specific Factors That Matter To You:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customFactorInput}
                      onChange={(e) => setCustomFactorInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomFactor(); } }}
                      placeholder="e.g. Commute Time, Health Benefits, Remote Flexibility"
                      className="flex-1 rounded-lg border-2 border-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFactor}
                      className="rounded-lg bg-slate-900 border-2 border-slate-900 px-3 py-1.5 text-xs font-black uppercase text-white hover:bg-slate-800"
                    >
                      Add Factor
                    </button>
                  </div>

                  {customFactors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {customFactors.map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center space-x-1 rounded-md bg-yellow-300 border-2 border-slate-900 px-2 py-0.5 text-xs font-black uppercase text-slate-900"
                        >
                          <span>{f}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomFactor(f)}
                            className="hover:text-rose-600"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading || !dilemma.trim()}
            className="group relative flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-slate-900 bg-yellow-400 px-6 py-4 text-base font-black uppercase tracking-wider text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-yellow-300 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Generating Bento Decision Framework...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-slate-900 group-hover:rotate-12 transition-transform" />
                <span>Analyze & Break The Tie</span>
                <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </form>
      </div>

      {/* Preset Inspiration Templates */}
      <div className="mt-10">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            Or select a preset decision scenario
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className="cursor-pointer rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    {tpl.category}
                  </span>
                  <span className="text-[10px] text-indigo-700 font-black uppercase group-hover:translate-x-0.5 transition-transform">
                    Use scenario &rarr;
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tpl.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-2">
                  {tpl.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
