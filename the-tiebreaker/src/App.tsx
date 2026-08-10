import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  DecisionInputForm 
} from './components/DecisionInputForm';
import { 
  WeightedScoreMatrix 
} from './components/WeightedScoreMatrix';
import { 
  ProsConsView 
} from './components/ProsConsView';
import { 
  ComparisonTableView 
} from './components/ComparisonTableView';
import { 
  SwotView 
} from './components/SwotView';
import { 
  ScenarioPlanningView 
} from './components/ScenarioPlanningView';
import { 
  DevilsAdvocateView 
} from './components/DevilsAdvocateView';
import { 
  AiVerdictCard 
} from './components/AiVerdictCard';
import { 
  DevilsAdvocateModal 
} from './components/DevilsAdvocateModal';
import { 
  GutCheckModal 
} from './components/GutCheckModal';
import { 
  SavedDecisionsDrawer 
} from './components/SavedDecisionsDrawer';
import { 
  PRESET_TEMPLATES 
} from './data/templates';
import { 
  DecisionAnalysis, 
  DecisionFactor, 
  ProConItem, 
  ComparisonCriterion,
  OptionScenarios,
  AnalyzeRequestPayload, 
  DecisionTemplate 
} from './types';
import { 
  getSavedDecisions, 
  saveDecisionToLocalStorage, 
  deleteDecisionFromLocalStorage, 
  calculateWeightedScores 
} from './utils/decisionEngine';
import { 
  Sliders, 
  CheckSquare, 
  Table, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp,
  Flame,
  ArrowLeft, 
  BookOpen, 
  X,
  Share2
} from 'lucide-react';

export default function App() {
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active View Tab inside Decision Analysis Studio
  const [activeTab, setActiveTab] = useState<'weights' | 'proscons' | 'comparison' | 'swot' | 'scenarios' | 'devils' | 'verdict'>('weights');

  // Modals state
  const [showDevilsAdvocate, setShowDevilsAdvocate] = useState(false);
  const [showGutCheck, setShowGutCheck] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Load saved decisions on mount
  useEffect(() => {
    const loaded = getSavedDecisions();
    setSavedDecisions(loaded);
  }, []);

  // Handle main decision analysis trigger
  const handleAnalyze = async (payload: AnalyzeRequestPayload) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to analyze decision');
      }

      const decisionData: DecisionAnalysis = await res.json();

      setCurrentDecision(decisionData);
      setActiveTab('weights');
      
      // Save to history automatically
      saveDecisionToLocalStorage(decisionData);
      setSavedDecisions(getSavedDecisions());
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err?.message || 'Failed to analyze decision. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update factor weights state and save
  const handleUpdateFactors = (updatedFactors: DecisionFactor[]) => {
    if (!currentDecision) return;
    const updated = {
      ...currentDecision,
      factors: updatedFactors,
      updatedAt: new Date().toISOString(),
    };
    setCurrentDecision(updated);
    saveDecisionToLocalStorage(updated);
  };

  // Update pros/cons state and save
  const handleUpdateProsCons = (updatedProsCons: ProConItem[]) => {
    if (!currentDecision) return;
    const updated = {
      ...currentDecision,
      prosCons: updatedProsCons,
      updatedAt: new Date().toISOString(),
    };
    setCurrentDecision(updated);
    saveDecisionToLocalStorage(updated);
  };

  // Delete decision from history
  const handleDeleteDecision = (id: string) => {
    const updatedList = deleteDecisionFromLocalStorage(id);
    setSavedDecisions(updatedList);
    if (currentDecision?.id === id) {
      setCurrentDecision(null);
    }
  };

  const handleUpdateScenarios = (newScenarios: OptionScenarios[]) => {
    if (!currentDecision) return;
    const updated: DecisionAnalysis = {
      ...currentDecision,
      scenarios: newScenarios,
      updatedAt: new Date().toISOString()
    };
    setCurrentDecision(updated);
    saveDecisionToLocalStorage(updated);
    setSavedDecisions(getSavedDecisions());
  };

  const handleUpdateComparisonCriteria = (newCriteria: ComparisonCriterion[]) => {
    if (!currentDecision) return;
    const updated: DecisionAnalysis = {
      ...currentDecision,
      comparisonCriteria: newCriteria,
      updatedAt: new Date().toISOString()
    };
    setCurrentDecision(updated);
    saveDecisionToLocalStorage(updated);
    setSavedDecisions(getSavedDecisions());
  };

  // Get current top option for Devil's Advocate
  const currentTopOptionId = currentDecision
    ? calculateWeightedScores(currentDecision.options, currentDecision.factors)[0]?.option.id || currentDecision.options[0].id
    : '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Global Header */}
      <Header
        onNewDecision={() => setCurrentDecision(null)}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        savedCount={savedDecisions.length}
        onOpenTemplates={() => setShowTemplateModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-auto max-w-4xl px-4 pt-4">
            <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* View State 1: Input Form (When no active decision loaded) */}
        {!currentDecision && (
          <DecisionInputForm
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        )}

        {/* View State 2: Active Decision Studio */}
        {currentDecision && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            
            {/* Top Navigation Bar & Title */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-slate-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <div>
                <button
                  onClick={() => setCurrentDecision(null)}
                  className="mb-3 inline-flex items-center space-x-1.5 rounded-xl border-2 border-slate-900 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase text-slate-900 hover:bg-slate-200 transition-colors shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Start New Decision</span>
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black uppercase text-slate-900 sm:text-3xl">
                    {currentDecision.title}
                  </h1>
                  <span className="rounded-xl bg-yellow-400 px-3 py-1 text-xs font-black text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] uppercase">
                    {currentDecision.category}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700 max-w-3xl">
                  "{currentDecision.dilemma}"
                </p>
              </div>
            </div>

            {/* Analysis Studio Framework Tabs */}
            <div className="mb-8 border-b-2 border-slate-900 pb-2">
              <nav className="flex space-x-2 overflow-x-auto pb-1" aria-label="Tabs">
                
                <button
                  onClick={() => setActiveTab('weights')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'weights'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sliders className="h-4 w-4 text-amber-400 stroke-[2.5]" />
                  <span>Weighted Scoring Matrix</span>
                </button>

                <button
                  onClick={() => setActiveTab('proscons')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'proscons'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CheckSquare className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                  <span>Pros & Cons List ({currentDecision.prosCons.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'comparison'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Table className="h-4 w-4 text-blue-400 stroke-[2.5]" />
                  <span>Comparison Matrix</span>
                </button>

                <button
                  onClick={() => setActiveTab('swot')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'swot'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-purple-400 stroke-[2.5]" />
                  <span>SWOT Analysis</span>
                </button>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'scenarios'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                  <span>Scenario Planning</span>
                </button>

                <button
                  onClick={() => setActiveTab('devils')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'devils'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Flame className="h-4 w-4 text-rose-500 stroke-[2.5]" />
                  <span>Devil's Advocate</span>
                </button>

                <button
                  onClick={() => setActiveTab('verdict')}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl border-2 border-slate-900 px-4 py-2.5 text-xs font-black uppercase transition-all ${
                    activeTab === 'verdict'
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-yellow-400 stroke-[2.5]" />
                  <span>AI Tiebreaker Brief</span>
                </button>

              </nav>
            </div>

            {/* Tab Views Content */}
            {activeTab === 'weights' && (
              <WeightedScoreMatrix
                decision={currentDecision}
                onUpdateFactors={handleUpdateFactors}
              />
            )}

            {activeTab === 'proscons' && (
              <ProsConsView
                decision={currentDecision}
                onUpdateProsCons={handleUpdateProsCons}
              />
            )}

            {activeTab === 'comparison' && (
              <ComparisonTableView
                decision={currentDecision}
                onUpdateComparisonCriteria={handleUpdateComparisonCriteria}
              />
            )}

            {activeTab === 'swot' && (
              <SwotView
                decision={currentDecision}
              />
            )}

            {activeTab === 'scenarios' && (
              <ScenarioPlanningView
                decision={currentDecision}
                onUpdateScenarios={handleUpdateScenarios}
              />
            )}

            {activeTab === 'devils' && (
              <DevilsAdvocateView
                decision={currentDecision}
              />
            )}

            {activeTab === 'verdict' && (
              <AiVerdictCard
                decision={currentDecision}
                onOpenDevilsAdvocate={() => setShowDevilsAdvocate(true)}
                onOpenGutCheck={() => setShowGutCheck(true)}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-900 bg-yellow-400 py-6 text-center text-xs font-black uppercase text-slate-900">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>The Tiebreaker • AI-Powered Multi-Criteria Decision Support Engine</span>
          <span>Powered by Gemini 2.5 & 3.5</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {showDevilsAdvocate && currentDecision && (
        <DevilsAdvocateModal
          decision={currentDecision}
          currentTopOptionId={currentTopOptionId}
          onClose={() => setShowDevilsAdvocate(false)}
        />
      )}

      {showGutCheck && currentDecision && (
        <GutCheckModal
          decision={currentDecision}
          onClose={() => setShowGutCheck(false)}
        />
      )}

      {showHistoryDrawer && (
        <SavedDecisionsDrawer
          savedDecisions={savedDecisions}
          onSelectDecision={(d) => setCurrentDecision(d)}
          onDeleteDecision={handleDeleteDecision}
          onClose={() => setShowHistoryDrawer(false)}
        />
      )}

      {/* Quick Template Selector Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-3xl border-2 border-slate-900 bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-6 right-6 rounded-xl border-2 border-slate-900 bg-slate-100 p-2 text-slate-900 hover:bg-slate-200"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-yellow-500 stroke-[2.5]" />
              <h2 className="text-xl font-black uppercase text-slate-900">Decision Preset Scenarios</h2>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1">
              {PRESET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    handleAnalyze({
                      dilemma: tpl.dilemma,
                      title: tpl.title,
                      category: tpl.category,
                      customOptions: tpl.options,
                      customFactors: tpl.suggestedFactors,
                    });
                    setShowTemplateModal(false);
                  }}
                  className="cursor-pointer rounded-2xl border-2 border-slate-900 p-4 hover:bg-yellow-100/60 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all group bg-white"
                >
                  <span className="inline-block rounded-md bg-slate-900 px-2.5 py-0.5 text-[10px] font-black uppercase text-white mb-2">
                    {tpl.category}
                  </span>
                  <h3 className="font-black text-slate-900 group-hover:text-indigo-700 transition-colors uppercase">
                    {tpl.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-2">
                    {tpl.description}
                  </p>
                  <div className="mt-3 text-xs font-black uppercase text-indigo-700 flex items-center space-x-1">
                    <span>Analyze this scenario &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
