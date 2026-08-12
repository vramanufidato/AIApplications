import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Wind, 
  Smile, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Users, 
  Compass,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CommunicationStyle, ConnectionCatalystEntry, BetterDayEntry, MoodType } from '../types';
import { Storage } from '../utils/storage';

const COMMUNICATION_STYLES: CommunicationStyle[] = [
  'Assertive', 'Passive', 'Aggressive', 'Warm & Empathetic', 'Clear & Direct'
];

const AFFIRMATIONS_DECK = [
  { category: 'Self-Empowerment', text: 'I am worthy of respect, peace, and setting clear boundaries.' },
  { category: 'Mental Clarity', text: 'I release what I cannot control and focus on my present step.' },
  { category: 'Success', text: 'I grow through every experience and celebrate my small wins.' },
  { category: 'Empathetic Calm', text: 'My feelings are valid, and I navigate them with gentle patience.' },
  { category: 'Boundaries', text: 'Saying no to extra demands is saying yes to my well-being.' }
];

export const WellnessExercises: React.FC<{ initialSubTab?: string }> = ({ initialSubTab = 'breathing' }) => {
  const [subTab, setSubTab] = useState<string>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  // --- Connection Catalyst State ---
  const [connectionLogs, setConnectionLogs] = useState<ConnectionCatalystEntry[]>(Storage.getConnectionCatalyst());
  const [person, setPerson] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const [commStyle, setCommStyle] = useState<CommunicationStyle>('Warm & Empathetic');
  const [score, setScore] = useState<number>(5);
  const [ccNotes, setCcNotes] = useState('');

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return;

    const newEntry: ConnectionCatalystEntry = {
      id: `cc_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      personOrGroup: person,
      interactionType: interactionType || 'General conversation',
      communicationStyle: commStyle,
      connectionQualityScore: score,
      notes: ccNotes || 'Empathetic interaction logged.'
    };

    const updated = [newEntry, ...connectionLogs];
    setConnectionLogs(updated);
    Storage.saveConnectionCatalyst(updated);

    setPerson('');
    setInteractionType('');
    setCcNotes('');
  };

  const handleDeleteConnection = (id: string) => {
    const updated = connectionLogs.filter(c => c.id !== id);
    setConnectionLogs(updated);
    Storage.saveConnectionCatalyst(updated);
  };

  // --- Guided Visualization / Breathing State ---
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [totalTimer, setTotalTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Web Audio Synthesizer for soothing ambient rain sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const startAmbientSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const bufferSize = audioCtxRef.current.sampleRate * 2;
      const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtxRef.current.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter for soothing ocean wave sound
      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gain = audioCtxRef.current.createGain();
      gain.gain.value = 0.05;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      setIsMuted(false);
    } catch (err) {
      console.warn("Audio synthesis suspended:", err);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try { (noiseNodeRef.current as any).stop(); } catch {}
      noiseNodeRef.current = null;
    }
    setIsMuted(true);
  };

  const toggleAudio = () => {
    if (isMuted) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
  };

  // Breathing Loop Timer
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setTotalTimer(prev => prev + 1);
        setBreathSeconds(prev => {
          if (prev > 1) return prev - 1;

          // Switch phases
          setBreathPhase(current => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4; // 4-second box breathing
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  // --- Better Day Planner State ---
  const [betterDayLogs, setBetterDayLogs] = useState<BetterDayEntry[]>(Storage.getBetterDay());
  const [action, setAction] = useState('');
  const [valueEx, setValueEx] = useState('');

  const handleAddBetterDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;

    const newEntry: BetterDayEntry = {
      id: `bd_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      plannedAction: action,
      valueExpressing: valueEx || 'Self-Care & Mindfulness',
      completed: false
    };

    const updated = [newEntry, ...betterDayLogs];
    setBetterDayLogs(updated);
    Storage.saveBetterDay(updated);

    setAction('');
    setValueEx('');
  };

  const handleToggleComplete = (id: string) => {
    const updated = betterDayLogs.map(b => {
      if (b.id === id) {
        return { ...b, completed: !b.completed, moodAfter: 'Calm' as MoodType };
      }
      return b;
    });
    setBetterDayLogs(updated);
    Storage.saveBetterDay(updated);
  };

  const handleDeleteBetterDay = (id: string) => {
    const updated = betterDayLogs.filter(b => b.id !== id);
    setBetterDayLogs(updated);
    Storage.saveBetterDay(updated);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Subtab Bar */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-3xl border border-[#E8E4DB] natural-shadow">
        <button
          onClick={() => setSubTab('breathing')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
            subTab === 'breathing' || subTab === '54321'
              ? 'bg-[#7D8F7D] text-white shadow-sm'
              : 'text-[#686E68] hover:text-[#2D312D]'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Guided Visualization & Grounding</span>
        </button>

        <button
          onClick={() => setSubTab('connection')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
            subTab === 'connection'
              ? 'bg-[#7D8F7D] text-white shadow-sm'
              : 'text-[#686E68] hover:text-[#2D312D]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Connection Catalyst</span>
        </button>

        <button
          onClick={() => setSubTab('betterday')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
            subTab === 'betterday'
              ? 'bg-[#7D8F7D] text-white shadow-sm'
              : 'text-[#686E68] hover:text-[#2D312D]'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>"Better Day" Planner</span>
        </button>

        <button
          onClick={() => setSubTab('boundaries')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
            subTab === 'boundaries'
              ? 'bg-[#7D8F7D] text-white shadow-sm'
              : 'text-[#686E68] hover:text-[#2D312D]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>8 Boundary Steps & Affirmations</span>
        </button>
      </div>

      {/* GUIDED VISUALIZATION / BREATHING / GROUNDING */}
      {(subTab === 'breathing' || subTab === '54321') && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7D8F7D] tracking-wider block mb-1">Guided Practice</span>
                <h3 className="font-serif text-2xl font-semibold text-[#2D312D]">"Calm in the Storm" Breathing Circle</h3>
                <p className="text-xs text-[#686E68]">
                  Box Breathing exercise (4s Inhale, 4s Hold, 4s Exhale, 4s Rest) with ambient ocean wave sounds.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={toggleAudio}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    !isMuted
                      ? 'bg-[#7D8F7D]/15 text-[#7D8F7D] border-[#7D8F7D]/40'
                      : 'bg-[#F9F7F2] text-[#686E68] border-[#E8E4DB]'
                  }`}
                >
                  {!isMuted ? <Volume2 className="w-4 h-4 text-[#7D8F7D]" /> : <VolumeX className="w-4 h-4" />}
                  <span>{!isMuted ? 'Ambient Waves On' : 'Soothing Sound'}</span>
                </button>

                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    isBreathingActive
                      ? 'bg-[#C47A6A] text-white hover:bg-[#B36858]'
                      : 'bg-[#7D8F7D] text-white hover:bg-[#6A7C6A]'
                  }`}
                >
                  {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isBreathingActive ? 'Pause Session' : 'Start Breathing'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Visualizer Canvas */}
            <div className="flex flex-col items-center justify-center py-10 bg-[#F9F7F2] rounded-3xl border border-[#E8E4DB] relative overflow-hidden">
              <div className="text-xs text-[#686E68] mb-6 font-mono">
                Total Practice Time: <strong className="text-[#7D8F7D]">{Math.floor(totalTimer / 60)}m {totalTimer % 60}s</strong>
              </div>

              {/* Animated Expansion Circle */}
              <div className="relative flex items-center justify-center my-4">
                <div
                  className={`w-48 h-48 rounded-full bg-[#7D8F7D]/20 border-2 border-[#7D8F7D] flex flex-col items-center justify-center transition-all duration-1000 ${
                    breathPhase === 'Inhale' ? 'scale-125 shadow-xl shadow-[#7D8F7D]/30' :
                    breathPhase === 'Hold' ? 'scale-125 shadow-lg shadow-[#7D8F7D]/20' :
                    breathPhase === 'Exhale' ? 'scale-90 shadow-xs' : 'scale-95'
                  }`}
                >
                  <span className="text-xs uppercase font-bold text-[#7D8F7D] tracking-wider">
                    {breathPhase}
                  </span>
                  <span className="font-serif text-4xl font-bold text-[#2D312D] mt-1">
                    {breathSeconds}s
                  </span>
                </div>
              </div>

              <div className="text-center mt-6 max-w-sm px-4">
                <p className="text-xs text-[#686E68] italic font-serif">
                  {breathPhase === 'Inhale' && 'Slowly breathe in through your nose, filling your lower abdomen...'}
                  {breathPhase === 'Hold' && 'Pause gently, holding the stillness in your chest...'}
                  {breathPhase === 'Exhale' && 'Release slowly through parted lips, letting all tension melt away...'}
                  {breathPhase === 'Rest' && 'Rest peacefully before your next refreshing breath...'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Grounding Exercises */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8E4DB] natural-shadow space-y-3">
              <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>5-4-3-2-1 Sensory Grounding Technique</span>
              </div>
              <ul className="space-y-2 text-xs text-[#2D312D]">
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded bg-[#7D8F7D]/20 text-[#7D8F7D] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</span>
                  <span><strong>5 Things You See:</strong> Look around your room for subtle shapes or colors.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded bg-[#7D8F7D]/20 text-[#7D8F7D] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                  <span><strong>4 Things You Touch:</strong> Texture of your shirt, desk wood, cool air on skin.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded bg-[#7D8F7D]/20 text-[#7D8F7D] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span><strong>3 Things You Hear:</strong> Clock ticking, hum of air conditioning, distant birds.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded bg-[#7D8F7D]/20 text-[#7D8F7D] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span><strong>2 Things You Smell:</strong> Coffee scent, fresh laundry or herbal tea.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded bg-[#7D8F7D]/20 text-[#7D8F7D] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span><strong>1 Thing You Taste:</strong> Clean water, lingering mint flavor.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8E4DB] natural-shadow space-y-3">
              <div className="flex items-center space-x-2 text-[#C47A6A] text-xs font-bold uppercase tracking-wider">
                <Wind className="w-4 h-4" />
                <span>Chandra Bhedana (Left Nostril Breathing)</span>
              </div>
              <p className="text-xs text-[#686E68] leading-relaxed">
                Left nostril breathing activates the parasympathetic nervous system (the body’s "rest and digest" brake) to soothe acute anxiety within minutes.
              </p>
              <ol className="space-y-1.5 text-xs text-[#2D312D] list-decimal pl-4">
                <li>Sit comfortably with eyes gently closed.</li>
                <li>Use right thumb to close right nostril.</li>
                <li>Inhale slowly and deeply through left nostril only.</li>
                <li>Close left nostril with ring finger and exhale through right nostril.</li>
                <li>Repeat cycle for 3-5 minutes.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTION CATALYST */}
      {subTab === 'connection' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-4">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <h3>Connection Catalyst (Social Interaction & Communication Style)</h3>
            </div>
            <p className="text-xs text-[#686E68]">
              Track meaningful social connections, evaluate your communication style (Assertive, Warm & Empathetic, Clear & Direct), and build supportive relationships.
            </p>

            <form onSubmit={handleAddConnection} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Person or Group
                  </label>
                  <input
                    type="text"
                    required
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="e.g., 'Co-worker Sarah', 'Family phone call'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Interaction Type
                  </label>
                  <input
                    type="text"
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value)}
                    placeholder="e.g., 'Coffee sync', 'Conflict resolution'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Communication Style Used
                  </label>
                  <select
                    value={commStyle}
                    onChange={(e) => setCommStyle(e.target.value as CommunicationStyle)}
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
                  >
                    {COMMUNICATION_STYLES.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Connection Quality Score (1-5)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setScore(num)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          score === num
                            ? 'bg-[#7D8F7D] text-white shadow-md'
                            : 'bg-[#F9F7F2] text-[#2D312D] border border-[#E8E4DB]'
                        }`}
                      >
                        {num}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                  Reflection & Communication Notes
                </label>
                <input
                  type="text"
                  value={ccNotes}
                  onChange={(e) => setCcNotes(e.target.value)}
                  placeholder="e.g., 'Listened actively and shared authentic feelings.'"
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Connection Entry</span>
                </button>
              </div>
            </form>
          </div>

          {/* Connection Logs */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-[#2D312D]">
              Saved Interactions ({connectionLogs.length})
            </h4>

            {connectionLogs.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl p-5 border border-[#E8E4DB] natural-shadow space-y-2 relative">
                <button
                  onClick={() => handleDeleteConnection(c.id)}
                  className="absolute top-4 right-4 text-[#8A908A] hover:text-[#C47A6A] p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-sm text-[#2D312D]">{c.personOrGroup}</span>
                  <span className="text-xs text-[#7D8F7D] font-mono">[{c.communicationStyle}]</span>
                  <span className="text-xs text-[#8A908A]">{c.date}</span>
                </div>

                <div className="text-xs text-[#686E68]">
                  <strong>Type:</strong> {c.interactionType} | <strong>Score:</strong> {c.connectionQualityScore}/5★
                </div>

                <p className="text-xs text-[#2D312D] italic bg-[#F9F7F2] p-2.5 rounded-xl border border-[#E8E4DB]">
                  "{c.notes}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "BETTER DAY" PLANNER */}
      {subTab === 'betterday' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-4">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <Smile className="w-4 h-4" />
              <h3>"Better Day" Action Planner</h3>
            </div>
            <p className="text-xs text-[#686E68]">
              Plan one small, gentle, doable action today that expresses your core values or brings a warm smile to your face.
            </p>

            <form onSubmit={handleAddBetterDay} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    One Small Gentle Action
                  </label>
                  <input
                    type="text"
                    required
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g., 'Take a 15-min screen-free walk outdoors listening to nature.'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A908A] mb-1">
                    Value Expressed
                  </label>
                  <input
                    type="text"
                    value={valueEx}
                    onChange={(e) => setValueEx(e.target.value)}
                    placeholder="e.g., 'Self-care & Mindful Presence'"
                    className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] px-4 py-3 text-xs text-[#2D312D] placeholder-[#8A908A]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Commit to Action</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Planned Actions */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-[#2D312D]">
              Action Commitments ({betterDayLogs.length})
            </h4>

            {betterDayLogs.map((b) => (
              <div
                key={b.id}
                className={`rounded-3xl p-5 border transition-all relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 natural-shadow ${
                  b.completed
                    ? 'bg-[#7D8F7D]/10 border-[#7D8F7D]/30'
                    : 'bg-white border-[#E8E4DB]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#8A908A] font-mono">{b.date}</span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0EDE4] text-[#7D8F7D]">
                      Value: {b.valueExpressing}
                    </span>
                  </div>
                  <h5 className={`text-sm font-bold ${b.completed ? 'line-through text-[#8A908A]' : 'text-[#2D312D]'}`}>
                    {b.plannedAction}
                  </h5>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-auto">
                  <button
                    onClick={() => handleToggleComplete(b.id)}
                    className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      b.completed
                        ? 'bg-[#7D8F7D] text-white shadow-sm'
                        : 'bg-[#F9F7F2] hover:bg-[#F0EDE4] text-[#2D312D] border border-[#E8E4DB]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{b.completed ? 'Completed!' : 'Mark Completed'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBetterDay(b.id)}
                    className="text-[#8A908A] hover:text-[#C47A6A] p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 BOUNDARY STEPS & AFFIRMATIONS */}
      {subTab === 'boundaries' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-4">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <h3>8 Steps to Setting Healthy Boundaries</h3>
            </div>
            <p className="text-xs text-[#686E68]">
              When feeling exhausted or resentful, use this structured framework to clarify limits and protect your energy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {[
                { step: 1, title: 'Identify Your Limit', desc: 'Recognize resentment or fatigue as an early sign that a boundary is being overstepped.' },
                { step: 2, title: 'Name Your Value', desc: 'Connect your boundary to what matters to you (e.g., family time, rest, mental health).' },
                { step: 3, title: 'Be Clear & Direct', desc: 'State your boundary calmly without excessive over-explaining or lengthy apologies.' },
                { step: 4, title: 'Use "I" Statements', desc: 'Frame with "I need..." or "I am unavailable for..." rather than pointing blame.' },
                { step: 5, title: 'Offer Alternative Options', desc: 'When appropriate, offer a counter-proposal (e.g., "I cannot do Friday, but I can review on Monday").' },
                { step: 6, title: 'Prepare for Resistance', desc: 'Expect mild pushback and hold firm peacefully without getting defensive.' },
                { step: 7, title: 'Enforce Consequences', desc: 'If a boundary is crossed repeatedly, take steps to step back or disengage.' },
                { step: 8, title: 'Practice Self-Compassion', desc: 'Remind yourself that setting boundaries is an act of care for both yourself and your relationships.' }
              ].map((b) => (
                <div key={b.step} className="bg-[#F9F7F2] p-4 rounded-2xl border border-[#E8E4DB] space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#7D8F7D]/20 text-[#7D8F7D] font-bold flex items-center justify-center text-xs shrink-0">
                      {b.step}
                    </span>
                    <span className="text-xs font-bold text-[#2D312D]">{b.title}</span>
                  </div>
                  <p className="text-[11px] text-[#686E68] pl-7">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Affirmations Deck */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-4">
            <div className="flex items-center space-x-2 text-[#7D8F7D] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <h3>Daily Affirmations Deck</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AFFIRMATIONS_DECK.map((aff, idx) => (
                <div key={idx} className="bg-[#F9F7F2] p-4 rounded-2xl border border-[#E8E4DB] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#7D8F7D] tracking-wider">
                    {aff.category}
                  </span>
                  <p className="font-serif text-xs font-semibold text-[#2D312D] italic">
                    "{aff.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
