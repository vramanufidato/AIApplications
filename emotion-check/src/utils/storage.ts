import { 
  MoodLogEntry, 
  ThoughtChallengeEntry, 
  DecatastrophizingEntry, 
  InnerCriticEntry, 
  HabitLogEntry, 
  MindWanderingEntry, 
  ConnectionCatalystEntry, 
  BetterDayEntry 
} from '../types';
import { 
  INITIAL_MOOD_LOGS, 
  INITIAL_THOUGHT_CHALLENGES, 
  INITIAL_DECTA_ENTRIES, 
  INITIAL_INNER_CRITIC_ENTRIES, 
  INITIAL_HABIT_LOGS, 
  INITIAL_MIND_WANDERING_LOGS, 
  INITIAL_CONNECTION_CATALYST_LOGS, 
  INITIAL_BETTER_DAY_LOGS 
} from '../data/initialData';

const KEYS = {
  MOOD: 'emotion_check_mood_logs',
  THOUGHT: 'emotion_check_thought_challenges',
  DECTA: 'emotion_check_decta_entries',
  CRITIC: 'emotion_check_critic_entries',
  HABIT: 'emotion_check_habit_logs',
  MIND_WANDERING: 'emotion_check_mind_wandering_logs',
  CONNECTION: 'emotion_check_connection_logs',
  BETTER_DAY: 'emotion_check_better_day_logs'
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage [${key}]:`, err);
  }
}

export const Storage = {
  getMoodLogs: (): MoodLogEntry[] => getItem(KEYS.MOOD, INITIAL_MOOD_LOGS),
  saveMoodLogs: (data: MoodLogEntry[]) => setItem(KEYS.MOOD, data),

  getThoughtChallenges: (): ThoughtChallengeEntry[] => getItem(KEYS.THOUGHT, INITIAL_THOUGHT_CHALLENGES),
  saveThoughtChallenges: (data: ThoughtChallengeEntry[]) => setItem(KEYS.THOUGHT, data),

  getDecatastrophizing: (): DecatastrophizingEntry[] => getItem(KEYS.DECTA, INITIAL_DECTA_ENTRIES),
  saveDecatastrophizing: (data: DecatastrophizingEntry[]) => setItem(KEYS.DECTA, data),

  getInnerCritic: (): InnerCriticEntry[] => getItem(KEYS.CRITIC, INITIAL_INNER_CRITIC_ENTRIES),
  saveInnerCritic: (data: InnerCriticEntry[]) => setItem(KEYS.CRITIC, data),

  getHabits: (): HabitLogEntry[] => getItem(KEYS.HABIT, INITIAL_HABIT_LOGS),
  saveHabits: (data: HabitLogEntry[]) => setItem(KEYS.HABIT, data),

  getMindWandering: (): MindWanderingEntry[] => getItem(KEYS.MIND_WANDERING, INITIAL_MIND_WANDERING_LOGS),
  saveMindWandering: (data: MindWanderingEntry[]) => setItem(KEYS.MIND_WANDERING, data),

  getConnectionCatalyst: (): ConnectionCatalystEntry[] => getItem(KEYS.CONNECTION, INITIAL_CONNECTION_CATALYST_LOGS),
  saveConnectionCatalyst: (data: ConnectionCatalystEntry[]) => setItem(KEYS.CONNECTION, data),

  getBetterDay: (): BetterDayEntry[] => getItem(KEYS.BETTER_DAY, INITIAL_BETTER_DAY_LOGS),
  saveBetterDay: (data: BetterDayEntry[]) => setItem(KEYS.BETTER_DAY, data),
};

// CSV Utilities for Google Sheets Export & Import
export function exportMoodLogsToCSV(logs: MoodLogEntry[]): string {
  const headers = ['ID', 'Date', 'Mood', 'Intensity', 'Notes', 'Timestamp'];
  const rows = logs.map(l => [
    l.id,
    l.date,
    l.mood,
    l.intensity.toString(),
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    l.timestamp.toString()
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function parseMoodLogsFromCSV(csvText: string): MoodLogEntry[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const parsed: MoodLogEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple regex for CSV splitting
    const parts = line.match(/(?:[^\s",]+|"[^"]*")+/g) || line.split(',');
    if (parts.length >= 3) {
      const clean = (str: string) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';
      const date = clean(parts[1]) || new Date().toISOString().split('T')[0];
      const moodRaw = clean(parts[2]);
      const intensity = parseInt(clean(parts[3]) || '7', 10);
      const notes = clean(parts[4]) || '';

      const validMoods = ['Happy', 'Calm', 'Anxious', 'Sad', 'Overwhelmed', 'Energetic', 'Frustrated', 'Hopeful'];
      const mood = validMoods.includes(moodRaw) ? (moodRaw as any) : 'Calm';

      parsed.push({
        id: `csv_${Date.now()}_${i}`,
        date,
        mood,
        intensity: isNaN(intensity) ? 7 : intensity,
        notes,
        timestamp: Date.now() - (i * 3600000)
      });
    }
  }
  return parsed;
}
