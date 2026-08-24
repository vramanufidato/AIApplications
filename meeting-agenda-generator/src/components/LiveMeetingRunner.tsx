import React, { useState, useEffect } from 'react';
import { GeneratedAgenda, AgendaSection } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  MessageSquare,
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LiveMeetingRunnerProps {
  agenda: GeneratedAgenda;
  onExit: () => void;
}

export const LiveMeetingRunner: React.FC<LiveMeetingRunnerProps> = ({
  agenda,
  onExit,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    (agenda.sections[0]?.durationMinutes || 10) * 60
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [checkedPoints, setCheckedPoints] = useState<Record<string, boolean>>({});

  const currentSection: AgendaSection | undefined = agenda.sections[currentSectionIndex];
  const nextSection: AgendaSection | undefined = agenda.sections[currentSectionIndex + 1];

  // Total timer calculations
  const totalSecondsAllocated = agenda.totalDurationMinutes * 60;

  // Sound chime creator using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            playChime();
            // Automatically advance to next section if available
            if (currentSectionIndex < agenda.sections.length - 1) {
              const nextIdx = currentSectionIndex + 1;
              setCurrentSectionIndex(nextIdx);
              return (agenda.sections[nextIdx]?.durationMinutes || 10) * 60;
            } else {
              setIsRunning(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentSectionIndex, agenda.sections, soundEnabled]);

  // When switching topic manually
  const handleSelectTopic = (index: number) => {
    setCurrentSectionIndex(index);
    setSecondsRemaining((agenda.sections[index]?.durationMinutes || 10) * 60);
  };

  const handleNextTopic = () => {
    if (currentSectionIndex < agenda.sections.length - 1) {
      handleSelectTopic(currentSectionIndex + 1);
    }
  };

  const handleResetSection = () => {
    setSecondsRemaining((currentSection?.durationMinutes || 10) * 60);
  };

  const toggleCheckPoint = (pointKey: string) => {
    setCheckedPoints((prev) => ({ ...prev, [pointKey]: !prev[pointKey] }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalCurrentSectionSecs = (currentSection?.durationMinutes || 1) * 60;
  const sectionProgressPercent =
    totalCurrentSectionSecs > 0
      ? Math.min(100, Math.max(0, ((totalCurrentSectionSecs - secondsRemaining) / totalCurrentSectionSecs) * 100))
      : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Runner Top Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Live Meeting Assistant Mode
          </span>
          <h2 className="text-xl font-bold text-white mt-1">{agenda.meetingTitle}</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={soundEnabled ? 'Mute Transition Chime' : 'Unmute Transition Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onExit}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Exit Live Runner
          </button>
        </div>
      </div>

      {/* Main Timer Block */}
      {currentSection && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-inner relative overflow-hidden">
          {/* Progress fill line */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-indigo-600/10 transition-all duration-1000 pointer-events-none"
            style={{ width: `${sectionProgressPercent}%` }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Topic {currentSectionIndex + 1} of {agenda.sections.length}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">{currentSection.title}</h3>
            <p className="text-xs text-indigo-300 font-medium mt-1">Lead: {currentSection.leadRole}</p>

            {/* Giant Countdown Clock */}
            <div className="my-6">
              <span className={`font-mono font-black text-6xl sm:text-7xl tracking-tight transition-colors ${
                secondsRemaining < 60 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}>
                {formatTime(secondsRemaining)}
              </span>
              <p className="text-xs text-slate-400 mt-1">Allocated: {currentSection.durationMinutes} min</p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm text-white flex items-center space-x-2 transition-all shadow-xl ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 ml-0.5" />
                    <span>Start Timer</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetSection}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
                title="Reset Section Time"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {currentSectionIndex < agenda.sections.length - 1 && (
                <button
                  onClick={handleNextTopic}
                  className="px-5 py-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all"
                >
                  <span>Next Topic</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Discussion Points Checklist */}
      {currentSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Discussion Points (Check off as discussed)</span>
            </h4>

            <div className="space-y-2">
              {currentSection.keyDiscussionPoints.map((pt, idx) => {
                const key = `${currentSection.id}-pt-${idx}`;
                const checked = !!checkedPoints[key];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleCheckPoint(key)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start space-x-2.5 ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through opacity-70'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                      checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                    }`}>
                      {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span>{pt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Suggested Discussion Prompts</span>
            </h4>

            <ul className="space-y-2">
              {currentSection.suggestedQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-indigo-200 italic"
                >
                  "{q}"
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Up Next Preview & Topic Navigation Strip */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Up Next:</span>
          {nextSection ? (
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              <span>{nextSection.title}</span>
              <span className="text-indigo-400 font-mono">({nextSection.durationMinutes}m)</span>
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-bold">🎉 Final Section</span>
          )}
        </div>

        {/* Quick Topic Jumper */}
        <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar max-w-full">
          {agenda.sections.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => handleSelectTopic(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentSectionIndex === idx
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx + 1}. {sec.durationMinutes}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
