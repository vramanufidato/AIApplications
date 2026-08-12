import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { MoodType, EmotionAnalysisResult } from '../types';
import { Storage } from '../utils/storage';

interface EmotionCheckAIProps {
  onNavigateToTool?: (toolId: string) => void;
  onMoodLogged?: () => void;
}

const PRESET_MOODS: MoodType[] = [
  'Anxious', 'Overwhelmed', 'Sad', 'Frustrated', 'Calm', 'Happy', 'Hopeful', 'Energetic'
];

const PRESET_PROMPTS = [
  {
    label: "Presentation Anxiety",
    mood: "Anxious" as MoodType,
    thought: "I'm going to fail my presentation tomorrow and look incompetent.",
    trigger: "Upcoming quarterly team review"
  },
  {
    label: "Late-Night Stress Snacking",
    mood: "Overwhelmed" as MoodType,
    activity: "Late-night snacking in front of TV",
    trigger: "Work stress and unresolved email backlog"
  },
  {
    label: "Exhaustion & Resentment",
    mood: "Frustrated" as MoodType,
    thought: "I can't say no to anyone, so I'm doing everyone else's work.",
    trigger: "Agreed to work extra hours on weekend"
  },
  {
    label: "Imposter Feeling",
    mood: "Sad" as MoodType,
    thought: "Everyone else here knows what they're doing except me.",
    trigger: "Feedback session at work"
  }
];

export const EmotionCheckAI: React.FC<EmotionCheckAIProps> = ({ onNavigateToTool, onMoodLogged }) => {
  const [mood, setMood] = useState<MoodType | ''>('Anxious');
  const [thought, setThought] = useState('');
  const [activity, setActivity] = useState('');
  const [trigger, setTrigger] = useState('');
  const [context, setContext] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EmotionAnalysisResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectPreset = (preset: typeof PRESET_PROMPTS[0]) => {
    setMood(preset.mood);
    setThought(preset.thought || '');
    setActivity(preset.activity || '');
    setTrigger(preset.trigger || '');
    setContext('');
    setAnalysis(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mood && !thought && !activity && !context) {
      setError("Please select a mood or enter a thought/activity to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: mood || undefined,
          negativeThought: thought || undefined,
          activity: activity || undefined,
          trigger: trigger || undefined,
          context: context || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate emotional analysis");
      }

      setAnalysis(data.analysis);

      // Auto log mood entry to storage
      if (mood) {
        const currentLogs = Storage.getMoodLogs();
        const newEntry = {
          id: `m_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          mood: mood as MoodType,
          intensity: mood === 'Anxious' || mood === 'Overwhelmed' ? 7 : 8,
          notes: thought || activity || 'AI Emotion Check-in',
          timestamp: Date.now()
        };
        Storage.saveMoodLogs([newEntry, ...currentLogs]);
        if (onMoodLogged) onMoodLogged();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to analyze entry right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToJournal = () => {
    if (!analysis) return;

    if (thought) {
      const tcList = Storage.getThoughtChallenges();
      Storage.saveThoughtChallenges([
        {
          id: `tc_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          negativeThought: thought,
          evidenceFor: 'Initial emotional charge',
          evidenceAgainst: analysis.cognitiveReframe.evidenceQuestions.join(' '),
          worstOutcome: 'Temporary discomfort',
          bestOutcome: 'Growth and successful outcome',
          likelyOutcome: analysis.cognitiveReframe.perspectiveShift,
          rationalThought: analysis.cognitiveReframe.reframeText
        },
        ...tcList
      ]);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Banner - Natural Tones Warm Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F0EDE4] text-[#7D8F7D] text-xs font-bold uppercase tracking-wider border border-[#E8E4DB]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Self-Therapy Intelligence Engine</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#2D312D] tracking-tight">
              How are you feeling right now?
            </h2>
            <p className="text-sm text-[#686E68] leading-relaxed">
              Share what’s on your mind or a habit you noticed. Emotion Check provides instant <strong className="text-[#7D8F7D]">Empathetic Reflection</strong>, <strong className="text-[#C47A6A]">Cognitive Reframing</strong>, and <strong className="text-[#2D312D]">Targeted Grounding Exercises</strong>.
            </p>
          </div>
          
          {/* Quick Presets */}
          <div className="w-full md:w-auto bg-[#F9F7F2] p-4 rounded-2xl border border-[#E8E4DB]">
            <span className="text-[10px] font-bold text-[#8A908A] uppercase tracking-wider block mb-2">Try an example:</span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left text-xs px-3 py-2 rounded-xl bg-white hover:bg-[#F0EDE4] text-[#2D312D] transition-colors border border-[#E8E4DB] truncate font-medium cursor-pointer shadow-xs"
                  title={preset.thought || preset.activity}
                >
                  ⚡ {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* Mood Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-3">
              1. Select Primary Mood
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_MOODS.map((m) => {
                const isSelected = mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#7D8F7D] text-white shadow-md shadow-[#7D8F7D]/20 scale-105'
                        : 'bg-[#F9F7F2] text-[#2D312D] hover:bg-[#F0EDE4] border border-[#E8E4DB]'
                    }`}
                  >
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Negative / Anxious Thought */}
            <div>
              <label htmlFor="input-thought" className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-2">
                2. Negative or Anxious Thought (Optional)
              </label>
              <textarea
                id="input-thought"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="e.g., 'I’m going to fail my presentation tomorrow.'"
                rows={3}
                className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] p-3.5 text-sm text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D] focus:bg-white transition-all"
              />
            </div>

            {/* Habit Log / Activity & Trigger */}
            <div className="space-y-4">
              <div>
                <label htmlFor="input-activity" className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-2">
                  3. Habit Log / Activity (Optional)
                </label>
                <input
                  id="input-activity"
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g., 'Late-night snacking', 'Endless phone scrolling'"
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-sm text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="input-trigger" className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-2">
                  Trigger or Cue (Optional)
                </label>
                <input
                  id="input-trigger"
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g., 'Stress from work', 'Overwhelmed by notifications'"
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-sm text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-[#D6A692]/15 border border-[#D6A692]/40 text-[#C47A6A] text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C47A6A]" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Emotions & Reframing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Entry with Emotion AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Output Result Card */}
      {analysis && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7D8F7D]/15 flex items-center justify-center text-[#7D8F7D]">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#2D312D]">AI Self-Therapy Feedback</h3>
                <p className="text-xs text-[#686E68]">Structured analysis using Cognitive Reframing & Human Connection Edge</p>
              </div>
            </div>

            <button
              onClick={handleSaveToJournal}
              className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-full bg-[#F9F7F2] hover:bg-[#F0EDE4] text-[#7D8F7D] border border-[#E8E4DB] transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#7D8F7D]" />
              <span>{savedSuccess ? 'Saved to Journal!' : 'Save Analysis'}</span>
            </button>
          </div>

          {/* Section 1: Empathetic Reflection */}
          <div className="p-5 rounded-2xl bg-[#F9F7F2] border-l-4 border-[#7D8F7D] space-y-2">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <Heart className="w-4 h-4" />
              <span>1. Empathetic Reflection</span>
            </div>
            <p className="text-sm md:text-base text-[#2D312D] font-medium leading-relaxed">
              "{analysis.empatheticReflection}"
            </p>
          </div>

          {/* Section 2: Cognitive Reframe */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E4DB] space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 text-[#C47A6A] text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>2. Cognitive Reframe (Challenging Thoughts)</span>
            </div>
            
            <div className="text-sm text-[#2D312D] leading-relaxed font-medium">
              <span className="text-[#C47A6A] font-bold">Perspective Reframe: </span>
              {analysis.cognitiveReframe.reframeText}
            </div>

            <div className="bg-[#F9F7F2] p-4 rounded-xl border border-[#E8E4DB] space-y-2">
              <span className="text-xs font-bold text-[#8A908A] uppercase tracking-wider block">Reframing Questions to Ask Yourself:</span>
              <ul className="space-y-2 pl-1">
                {analysis.cognitiveReframe.evidenceQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-[#2D312D] flex items-start space-x-2">
                    <span className="text-[#7D8F7D] font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-[#2D312D] bg-[#F0EDE4] p-3 rounded-xl border border-[#E8E4DB]">
              <strong className="text-[#7D8F7D]">Summary Viewpoint Shift:</strong> {analysis.cognitiveReframe.perspectiveShift}
            </div>
          </div>

          {/* Section 3: Actionable Recommendation */}
          <div className="p-6 rounded-2xl bg-[#7D8F7D] text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white/90 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>3. Recommended Tool: {analysis.actionableRecommendation.category}</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                Action Practice
              </span>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-white mb-1">{analysis.actionableRecommendation.title}</h4>
              <p className="text-xs text-white/80 mb-4">{analysis.actionableRecommendation.description}</p>

              <div className="space-y-2 bg-white/10 p-4 rounded-xl border border-white/20">
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider block mb-2">Step-by-Step Action:</span>
                {analysis.actionableRecommendation.actionSteps.map((step, idx) => (
                  <div key={idx} className="text-xs text-white/95 flex items-start space-x-2.5">
                    <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Exercise Button */}
            {onNavigateToTool && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigateToTool(analysis.actionableRecommendation.toolId)}
                  className="inline-flex items-center space-x-2 text-xs font-bold px-5 py-3 rounded-xl bg-white text-[#7D8F7D] hover:bg-[#F9F7F2] transition-all shadow-md cursor-pointer"
                >
                  <span>Launch {analysis.actionableRecommendation.title} Exercise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Recommended Affirmation if provided */}
          {analysis.recommendedAffirmation && (
            <div className="p-5 rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8A908A]">Daily Affirmation for Mental Clarity</span>
              <p className="font-serif text-base font-semibold text-[#7D8F7D] italic">
                "{analysis.recommendedAffirmation}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
