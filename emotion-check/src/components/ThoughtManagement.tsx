import React, { useState } from 'react';
import { 
  HeartPulse, 
  Brain, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ThoughtChallenge, CognitiveDistortion } from '../types';
import { Storage } from '../utils/storage';

const DISTORTION_DECK: CognitiveDistortion[] = [
  {
    id: 'd1',
    name: 'All-or-Nothing Thinking',
    description: 'Viewing situations in black-and-white categories with no middle ground.',
    example: 'If my performance isn’t perfect, I am a total failure.',
    reframeStrategy: 'Look for nuances, gray areas, and partial successes.'
  },
  {
    id: 'd2',
    name: 'Catastrophizing',
    description: 'Exaggerating the importance of negative events or expecting the worst-case scenario.',
    example: 'I made a typo in the email, now everyone thinks I’m incompetent and I’ll be fired.',
    reframeStrategy: 'Ask: What is the most likely realistic outcome based on facts?'
  },
  {
    id: 'd3',
    name: 'Mind Reading',
    description: 'Assuming you know what others are thinking without concrete evidence.',
    example: 'She didn’t smile at me in the hallway, so she must be angry at me.',
    reframeStrategy: 'Consider alternative reasons for their behavior (e.g. busy, distracted).'
  },
  {
    id: 'd4',
    name: 'Emotional Reasoning',
    description: 'Believing that because you feel a certain way, it must be true.',
    example: 'I feel anxious about this project, so it must be dangerous and destined to fail.',
    reframeStrategy: 'Separate feelings from objective facts.'
  },
  {
    id: 'd5',
    name: '"Should" Statements',
    description: 'Holding rigid rules for yourself or others, leading to guilt or resentment.',
    example: 'I should never get overwhelmed or make mistakes.',
    reframeStrategy: 'Replace "should" with "I would prefer" or "It is understandable that..."'
  }
];

export const ThoughtManagement: React.FC = () => {
  const [challenges, setChallenges] = useState<ThoughtChallenge[]>(Storage.getThoughtChallenges());
  const [selectedDistortion, setSelectedDistortion] = useState<CognitiveDistortion | null>(DISTORTION_DECK[0]);

  // Form State
  const [negativeThought, setNegativeThought] = useState('');
  const [evidenceFor, setEvidenceFor] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [worstOutcome, setWorstOutcome] = useState('');
  const [bestOutcome, setBestOutcome] = useState('');
  const [likelyOutcome, setLikelyOutcome] = useState('');
  const [rationalThought, setRationalThought] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'challenger' | 'deck'>('challenger');

  const handleSubmitChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!negativeThought || !rationalThought) return;

    const newChallenge: ThoughtChallenge = {
      id: `tc_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      negativeThought,
      evidenceFor: evidenceFor || 'Initial emotional feeling',
      evidenceAgainst: evidenceAgainst || 'Past experiences show I can cope',
      worstOutcome: worstOutcome || 'Temporary stress',
      bestOutcome: bestOutcome || 'Everything goes smoothly',
      likelyOutcome: likelyOutcome || 'A balanced middle outcome',
      rationalThought
    };

    const updated = [newChallenge, ...challenges];
    setChallenges(updated);
    Storage.saveThoughtChallenges(updated);

    // Reset Form
    setNegativeThought('');
    setEvidenceFor('');
    setEvidenceAgainst('');
    setWorstOutcome('');
    setBestOutcome('');
    setLikelyOutcome('');
    setRationalThought('');
  };

  const handleDeleteChallenge = (id: string) => {
    const updated = challenges.filter(c => c.id !== id);
    setChallenges(updated);
    Storage.saveThoughtChallenges(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E4DB] natural-shadow">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7D8F7D] tracking-wider block mb-1">
            CBT Worksheets & Cognitive Reframing
          </span>
          <h2 className="font-serif text-2xl font-semibold text-[#2D312D]">Thought Challenger & Reframer</h2>
        </div>

        <div className="flex space-x-2 bg-[#F9F7F2] p-1.5 rounded-2xl border border-[#E8E4DB]">
          <button
            onClick={() => setActiveSubTab('challenger')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'challenger'
                ? 'bg-[#7D8F7D] text-white shadow-sm'
                : 'text-[#686E68] hover:text-[#2D312D]'
            }`}
          >
            Thought Challenger Form
          </button>
          <button
            onClick={() => setActiveSubTab('deck')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'deck'
                ? 'bg-[#7D8F7D] text-white shadow-sm'
                : 'text-[#686E68] hover:text-[#2D312D]'
            }`}
          >
            Cognitive Distortion Deck
          </button>
        </div>
      </div>

      {activeSubTab === 'challenger' && (
        <div className="space-y-8">
          {/* CBT Thought Challenge Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <HeartPulse className="w-4 h-4" />
              <span>Step-by-Step Cognitive Reframing Worksheet</span>
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-6">
              {/* Negative Thought */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-2">
                  1. Automatic Negative / Anxious Thought *
                </label>
                <input
                  type="text"
                  required
                  value={negativeThought}
                  onChange={(e) => setNegativeThought(e.target.value)}
                  placeholder="e.g., 'I am going to fail my presentation and look incompetent.'"
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-sm text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D] focus:bg-white"
                />
              </div>

              {/* Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C47A6A] mb-2">
                    2. Evidence FOR the Thought (Facts only)
                  </label>
                  <textarea
                    value={evidenceFor}
                    onChange={(e) => setEvidenceFor(e.target.value)}
                    placeholder="e.g., 'I felt nervous during my practice run.'"
                    rows={2}
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] p-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7D8F7D] mb-2">
                    3. Evidence AGAINST the Thought (Objective facts)
                  </label>
                  <textarea
                    value={evidenceAgainst}
                    onChange={(e) => setEvidenceAgainst(e.target.value)}
                    placeholder="e.g., 'I spent 4 hours preparing, and my manager reviewed the slides.'"
                    rows={2}
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] p-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>
              </div>

              {/* Decatastrophizing: Worst, Best, Likely */}
              <div className="bg-[#F9F7F2] p-5 rounded-2xl border border-[#E8E4DB] space-y-4">
                <span className="text-xs font-bold text-[#8A908A] uppercase tracking-wider block">
                  4. Decatastrophizing Analysis
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#C47A6A] uppercase mb-1">
                      Worst-Case Scenario
                    </label>
                    <input
                      type="text"
                      value={worstOutcome}
                      onChange={(e) => setWorstOutcome(e.target.value)}
                      placeholder="e.g., 'I stumble on 1 question.'"
                      className="w-full rounded-xl bg-white border border-[#E8E4DB] p-2.5 text-xs text-[#2D312D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7D8F7D] uppercase mb-1">
                      Best-Case Scenario
                    </label>
                    <input
                      type="text"
                      value={bestOutcome}
                      onChange={(e) => setBestOutcome(e.target.value)}
                      placeholder="e.g., 'Flawless presentation and praise.'"
                      className="w-full rounded-xl bg-white border border-[#E8E4DB] p-2.5 text-xs text-[#2D312D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2D312D] uppercase mb-1">
                      Most Likely Realistic Outcome
                    </label>
                    <input
                      type="text"
                      value={likelyOutcome}
                      onChange={(e) => setLikelyOutcome(e.target.value)}
                      placeholder="e.g., 'It will go fine, with minor nerves.'"
                      className="w-full rounded-xl bg-white border border-[#E8E4DB] p-2.5 text-xs text-[#2D312D]"
                    />
                  </div>
                </div>
              </div>

              {/* Reframed Rational Replacement Thought */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7D8F7D] mb-2">
                  5. Balanced Rational Replacement Thought *
                </label>
                <textarea
                  required
                  value={rationalThought}
                  onChange={(e) => setRationalThought(e.target.value)}
                  placeholder="e.g., 'Feeling nervous is normal when I care. I prepared well, and stumble or not, I will handle it.'"
                  rows={2}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] p-3.5 text-sm text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D] focus:bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Reframed Thought Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Previous Saved Thought Challenges */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#2D312D]">
              Reframed Thought Logs ({challenges.length})
            </h3>

            {challenges.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-[#E8E4DB] text-center text-xs text-[#8A908A]">
                No thought challenges saved yet. Fill out the worksheet above or use AI Check-in.
              </div>
            ) : (
              challenges.map((c) => (
                <div key={c.id} className="bg-white rounded-3xl p-6 border border-[#E8E4DB] natural-shadow space-y-4 relative">
                  <button
                    onClick={() => handleDeleteChallenge(c.id)}
                    className="absolute top-6 right-6 text-[#8A908A] hover:text-[#C47A6A] transition-colors p-1"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-3 text-xs text-[#8A908A]">
                    <span className="font-mono bg-[#F0EDE4] px-2.5 py-1 rounded-full border border-[#E8E4DB]">{c.date}</span>
                    <span className="text-[#7D8F7D] font-bold uppercase">CBT Reframed</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#D6A692]/10 border border-[#D6A692]/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C47A6A] block">
                        Original Negative Thought
                      </span>
                      <p className="text-xs font-semibold text-[#2D312D]">"{c.negativeThought}"</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#7D8F7D]/10 border border-[#7D8F7D]/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8F7D] block">
                        Rational Balanced Thought
                      </span>
                      <p className="text-xs font-semibold text-[#2D312D]">"{c.rationalThought}"</p>
                    </div>
                  </div>

                  {c.likelyOutcome && (
                    <div className="text-xs text-[#686E68] bg-[#F9F7F2] p-3 rounded-xl border border-[#E8E4DB]">
                      <strong className="text-[#2D312D]">Most Likely Outcome:</strong> {c.likelyOutcome}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cognitive Distortion Deck Subtab */}
      {activeSubTab === 'deck' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            <h3 className="font-serif text-lg font-semibold text-[#2D312D] mb-2">Common Distortions</h3>
            {DISTORTION_DECK.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDistortion(d)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDistortion?.id === d.id
                    ? 'bg-[#7D8F7D] text-white border-[#7D8F7D] shadow-md'
                    : 'bg-white text-[#2D312D] border-[#E8E4DB] hover:bg-[#F9F7F2]'
                }`}
              >
                <div className="text-xs font-bold">{d.name}</div>
                <div className={`text-[11px] truncate ${selectedDistortion?.id === d.id ? 'text-white/80' : 'text-[#8A908A]'}`}>
                  {d.description}
                </div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2">
            {selectedDistortion && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
                <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
                  <Brain className="w-5 h-5" />
                  <span>Cognitive Distortion Spotlight</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#2D312D]">
                  {selectedDistortion.name}
                </h3>

                <p className="text-sm text-[#686E68] leading-relaxed">
                  {selectedDistortion.description}
                </p>

                <div className="p-4 rounded-2xl bg-[#D6A692]/15 border border-[#D6A692]/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#C47A6A]">Example Distorted Thought:</span>
                  <p className="text-xs font-semibold text-[#2D312D] italic">
                    "{selectedDistortion.example}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#7D8F7D]/15 border border-[#7D8F7D]/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#7D8F7D]">Recommended Reframe Strategy:</span>
                  <p className="text-xs font-semibold text-[#2D312D]">
                    {selectedDistortion.reframeStrategy}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
