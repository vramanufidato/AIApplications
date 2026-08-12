import React, { useState } from 'react';
import { 
  RefreshCw, 
  Activity, 
  Smile, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  TrendingUp,
  Brain,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { MoodType, HabitEntry, MindWanderingEntry, MoodLogEntry } from '../types';
import { Storage } from '../utils/storage';

const MOOD_OPTIONS: MoodType[] = [
  'Happy', 'Calm', 'Hopeful', 'Energetic', 'Anxious', 'Overwhelmed', 'Sad', 'Frustrated'
];

export const TrackingAndHabits: React.FC = () => {
  const [subTab, setSubTab] = useState<'mood' | 'habit' | 'mindwandering'>('mood');

  // Mood Tracker State
  const [moodLogs, setMoodLogs] = useState<MoodLogEntry[]>(Storage.getMoodLogs());
  const [selectedMood, setSelectedMood] = useState<MoodType>('Calm');
  const [intensity, setIntensity] = useState<number>(7);
  const [notes, setNotes] = useState('');

  // Habit Log State
  const [habitLogs, setHabitLogs] = useState<HabitEntry[]>(Storage.getHabits());
  const [habitName, setHabitName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [awareness, setAwareness] = useState<'High' | 'Medium' | 'Low'>('High');
  const [replacementBehavior, setReplacementBehavior] = useState('');

  // Mind Wandering State
  const [mindLogs, setMindLogs] = useState<MindWanderingEntry[]>(Storage.getMindWandering());
  const [topic, setTopic] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(10);

  // Submit Mood Log
  const handleAddMood = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MoodLogEntry = {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      intensity,
      notes: notes || 'Daily mood check-in',
      timestamp: Date.now()
    };
    const updated = [newEntry, ...moodLogs];
    setMoodLogs(updated);
    Storage.saveMoodLogs(updated);
    setNotes('');
  };

  const handleDeleteMood = (id: string) => {
    const updated = moodLogs.filter(m => m.id !== id);
    setMoodLogs(updated);
    Storage.saveMoodLogs(updated);
  };

  // Submit Habit Log
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName) return;
    const newEntry: HabitEntry = {
      id: `h_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      habitName,
      trigger: trigger || 'General stress or boredom',
      awarenessLevel: awareness,
      replacementBehavior: replacementBehavior || 'Take 3 deep breaths and pause',
      notes: 'Logged habit awareness'
    };
    const updated = [newEntry, ...habitLogs];
    setHabitLogs(updated);
    Storage.saveHabits(updated);
    setHabitName('');
    setTrigger('');
    setReplacementBehavior('');
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habitLogs.filter(h => h.id !== id);
    setHabitLogs(updated);
    Storage.saveHabits(updated);
  };

  // Submit Mind Wandering
  const handleAddMindWandering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    const newEntry: MindWanderingEntry = {
      id: `mw_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      topic,
      emotionalState: emotionalState || 'Mild anxiety',
      timeSpentMinutes,
      returnedToPresent: true
    };
    const updated = [newEntry, ...mindLogs];
    setMindLogs(updated);
    Storage.saveMindWandering(updated);
    setTopic('');
    setEmotionalState('');
  };

  const handleDeleteMind = (id: string) => {
    const updated = mindLogs.filter(m => m.id !== id);
    setMindLogs(updated);
    Storage.saveMindWandering(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Subtab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E4DB] natural-shadow">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7D8F7D] tracking-wider block mb-1">
            Self-Monitoring & Tracking
          </span>
          <h2 className="font-serif text-2xl font-semibold text-[#2D312D]">Tracking & Habits Hub</h2>
        </div>

        <div className="flex space-x-2 bg-[#F9F7F2] p-1.5 rounded-2xl border border-[#E8E4DB]">
          <button
            onClick={() => setSubTab('mood')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'mood'
                ? 'bg-[#7D8F7D] text-white shadow-sm'
                : 'text-[#686E68] hover:text-[#2D312D]'
            }`}
          >
            Mood Journal
          </button>
          <button
            onClick={() => setSubTab('habit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'habit'
                ? 'bg-[#7D8F7D] text-white shadow-sm'
                : 'text-[#686E68] hover:text-[#2D312D]'
            }`}
          >
            Habit Log
          </button>
          <button
            onClick={() => setSubTab('mindwandering')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'mindwandering'
                ? 'bg-[#7D8F7D] text-white shadow-sm'
                : 'text-[#686E68] hover:text-[#2D312D]'
            }`}
          >
            Mind Wandering Tracker
          </button>
        </div>
      </div>

      {/* MOOD JOURNAL SUBTAB */}
      {subTab === 'mood' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <Smile className="w-4 h-4" />
              <span>Log Daily Mood Entry</span>
            </div>

            <form onSubmit={handleAddMood} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-3">
                  Select Mood State
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedMood === m
                          ? 'bg-[#7D8F7D] text-white shadow-md scale-105'
                          : 'bg-[#F9F7F2] text-[#2D312D] hover:bg-[#F0EDE4] border border-[#E8E4DB]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-2">
                    Intensity Level (1 - 10): <strong className="text-[#7D8F7D]">{intensity}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-[#7D8F7D] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A908A] mt-1">
                    <span>1 (Mild)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Intense)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-2">
                    Notes / Context
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., 'Felt productive in morning, tired by afternoon.'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-2.5 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Mood Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* Mood Logs History */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#2D312D]">
              Recent Mood Logs ({moodLogs.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moodLogs.map((m) => (
                <div key={m.id} className="bg-white rounded-3xl p-5 border border-[#E8E4DB] natural-shadow space-y-2 relative">
                  <button
                    onClick={() => handleDeleteMood(m.id)}
                    className="absolute top-4 right-4 text-[#8A908A] hover:text-[#C47A6A] p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7D8F7D]/15 text-[#7D8F7D]">
                      {m.mood} ({m.intensity}/10)
                    </span>
                    <span className="text-xs text-[#8A908A] font-mono">{m.date}</span>
                  </div>

                  <p className="text-xs text-[#686E68] italic pt-1">
                    "{m.notes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HABIT LOG SUBTAB */}
      {subTab === 'habit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <RefreshCw className="w-4 h-4" />
              <span>Habit & Unhelpful Behavior Log</span>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Habit / Behavior Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="e.g., 'Late-night stress snacking', 'Procrastinating emails'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Trigger or Cue
                  </label>
                  <input
                    type="text"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    placeholder="e.g., 'Work deadlines', 'Boredom after dinner'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Awareness Level
                  </label>
                  <select
                    value={awareness}
                    onChange={(e) => setAwareness(e.target.value as any)}
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  >
                    <option value="High">High (Noticed immediately)</option>
                    <option value="Medium">Medium (Noticed midway)</option>
                    <option value="Low">Low (Noticed afterwards)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Healthy Replacement Action
                  </label>
                  <input
                    type="text"
                    value={replacementBehavior}
                    onChange={(e) => setReplacementBehavior(e.target.value)}
                    placeholder="e.g., 'Drink herbal tea & do 4-7-8 breathing'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Habit Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* Habit Logs */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#2D312D]">
              Tracked Habits ({habitLogs.length})
            </h3>

            {habitLogs.map((h) => (
              <div key={h.id} className="bg-white rounded-3xl p-5 border border-[#E8E4DB] natural-shadow space-y-2 relative">
                <button
                  onClick={() => handleDeleteHabit(h.id)}
                  className="absolute top-5 right-5 text-[#8A908A] hover:text-[#C47A6A] p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-sm text-[#2D312D]">{h.habitName}</span>
                  <span className="text-[10px] bg-[#C47A6A]/15 text-[#C47A6A] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Awareness: {h.awarenessLevel}
                  </span>
                  <span className="text-xs text-[#8A908A]">{h.date}</span>
                </div>

                <div className="text-xs text-[#686E68]">
                  <strong>Trigger:</strong> {h.trigger}
                </div>

                <div className="text-xs text-[#7D8F7D] bg-[#F9F7F2] p-2.5 rounded-xl border border-[#E8E4DB] font-medium">
                  <strong>Replacement:</strong> {h.replacementBehavior}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MIND WANDERING SUBTAB */}
      {subTab === 'mindwandering' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Mind Wandering & Rumination Tracker</span>
            </div>

            <form onSubmit={handleAddMindWandering} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Wandering Topic / Worries *
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'Worried about future project outcome', 'Replaying old conversation'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={timeSpentMinutes}
                    onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                  Emotional State during Wandering
                </label>
                <input
                  type="text"
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                  placeholder="e.g., 'Anxious', 'Restless', 'Guilty'"
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Mind Wandering & Return to Present</span>
                </button>
              </div>
            </form>
          </div>

          {/* Mind Wandering Logs */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#2D312D]">
              Logged Wandering Episodes ({mindLogs.length})
            </h3>

            {mindLogs.map((m) => (
              <div key={m.id} className="bg-white rounded-3xl p-5 border border-[#E8E4DB] natural-shadow space-y-2 relative">
                <button
                  onClick={() => handleDeleteMind(m.id)}
                  className="absolute top-5 right-5 text-[#8A908A] hover:text-[#C47A6A] p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-sm text-[#2D312D]">{m.topic}</span>
                  <span className="text-[10px] bg-[#7D8F7D]/15 text-[#7D8F7D] font-bold px-2.5 py-0.5 rounded-full">
                    {m.timeSpentMinutes} mins
                  </span>
                  <span className="text-xs text-[#8A908A]">{m.date}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#7D8F7D]">
                  <CheckCircle2 className="w-4 h-4 text-[#7D8F7D]" />
                  <span>Returned awareness to present moment</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
