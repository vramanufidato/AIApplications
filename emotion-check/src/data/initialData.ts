import { 
  MoodLogEntry, 
  ThoughtChallengeEntry, 
  DecatastrophizingEntry, 
  InnerCriticEntry, 
  HabitEntry, 
  MindWanderingEntry, 
  ConnectionCatalystEntry, 
  BetterDayEntry 
} from '../types';

// Generate realistic dates relative to current time
const now = new Date();
const formatDate = (daysAgo: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_MOOD_LOGS: MoodLogEntry[] = [
  // Today
  { id: 'm1', date: formatDate(0), mood: 'Calm', intensity: 7, notes: 'Morning breathing exercise helped', timestamp: Date.now() - 3600000 * 2 },
  { id: 'm2', date: formatDate(0), mood: 'Happy', intensity: 8, notes: 'Great conversation with a colleague', timestamp: Date.now() - 3600000 * 5 },
  // Yesterday
  { id: 'm3', date: formatDate(1), mood: 'Anxious', intensity: 6, notes: 'Upcoming presentation deadlines', timestamp: Date.now() - 86400000 - 3600000 * 4 },
  { id: 'm4', date: formatDate(1), mood: 'Calm', intensity: 8, notes: 'Evening walk in the park', timestamp: Date.now() - 86400000 - 3600000 * 8 },
  // Past Week
  { id: 'm5', date: formatDate(2), mood: 'Overwhelmed', intensity: 7, notes: 'Multiple emails arriving at once', timestamp: Date.now() - 86400000 * 2 },
  { id: 'm6', date: formatDate(3), mood: 'Sad', intensity: 5, notes: 'Missing home and old friends', timestamp: Date.now() - 86400000 * 3 },
  { id: 'm7', date: formatDate(4), mood: 'Energetic', intensity: 9, notes: 'Completed 5km run', timestamp: Date.now() - 86400000 * 4 },
  { id: 'm8', date: formatDate(5), mood: 'Happy', intensity: 8, notes: 'Finished reading a great book', timestamp: Date.now() - 86400000 * 5 },
  { id: 'm9', date: formatDate(6), mood: 'Hopeful', intensity: 8, notes: 'Started new wellness planner', timestamp: Date.now() - 86400000 * 6 },
  // Past Month
  { id: 'm10', date: formatDate(10), mood: 'Anxious', intensity: 7, notes: 'Work project review', timestamp: Date.now() - 86400000 * 10 },
  { id: 'm11', date: formatDate(14), mood: 'Calm', intensity: 9, notes: 'Weekend retreat', timestamp: Date.now() - 86400000 * 14 },
  { id: 'm12', date: formatDate(18), mood: 'Happy', intensity: 8, notes: 'Family dinner', timestamp: Date.now() - 86400000 * 18 },
  { id: 'm13', date: formatDate(22), mood: 'Frustrated', intensity: 6, notes: 'Traffic delay', timestamp: Date.now() - 86400000 * 22 },
  { id: 'm14', date: formatDate(28), mood: 'Calm', intensity: 7, notes: 'Meditation practice', timestamp: Date.now() - 86400000 * 28 },
  // Past Year
  { id: 'm15', date: formatDate(45), mood: 'Hopeful', intensity: 8, notes: 'New beginnings', timestamp: Date.now() - 86400000 * 45 },
  { id: 'm16', date: formatDate(60), mood: 'Happy', intensity: 9, notes: 'Vacation week', timestamp: Date.now() - 86400000 * 60 },
  { id: 'm17', date: formatDate(90), mood: 'Anxious', intensity: 8, notes: 'Career transition', timestamp: Date.now() - 86400000 * 90 },
  { id: 'm18', date: formatDate(120), mood: 'Sad', intensity: 6, notes: 'Rainy days', timestamp: Date.now() - 86400000 * 120 },
  { id: 'm19', date: formatDate(150), mood: 'Calm', intensity: 8, notes: 'Summer evening', timestamp: Date.now() - 86400000 * 150 },
  { id: 'm20', date: formatDate(200), mood: 'Energetic', intensity: 9, notes: 'Spring festival', timestamp: Date.now() - 86400000 * 200 }
];

export const INITIAL_THOUGHT_CHALLENGES: ThoughtChallengeEntry[] = [
  {
    id: 'tc1',
    date: formatDate(0),
    negativeThought: 'I am going to fail my presentation tomorrow.',
    evidenceFor: 'I still feel nervous when speaking in public.',
    evidenceAgainst: 'I prepared all slides, rehearsed twice, and know the material well.',
    worstOutcome: 'I freeze for a moment or forget a word.',
    bestOutcome: 'I deliver the presentation smoothly and receive praise.',
    likelyOutcome: 'I handle it well, maybe stutter slightly, but deliver the main points clearly.',
    rationalThought: 'Nervousness is normal. I am prepared and one minor stumble will not ruin the talk.'
  },
  {
    id: 'tc2',
    date: formatDate(2),
    negativeThought: 'My friend did not text back, so they must be upset with me.',
    evidenceFor: 'They usually reply within an hour.',
    evidenceAgainst: 'They mentioned having a chaotic deadline week at work.',
    worstOutcome: 'They end the friendship.',
    bestOutcome: 'They reply explaining they were swamped.',
    likelyOutcome: 'They are simply busy and will text back when free.',
    rationalThought: 'Their delay is about their workload, not my worth or our friendship.'
  }
];

export const INITIAL_DECTA_ENTRIES: DecatastrophizingEntry[] = [
  {
    id: 'd1',
    date: formatDate(1),
    worry: 'I might make a minor mistake in the monthly financial report.',
    likelihoodPercent: 15,
    impact1Week: 'My team lead points it out and I issue a corrected version.',
    impact1Month: 'No one remembers, process carries on as normal.',
    impact1Year: 'Completely forgotten and insignificant.',
    copingStrategy: 'Double check key figures and remember that mistakes can be corrected quickly.'
  }
];

export const INITIAL_INNER_CRITIC_ENTRIES: InnerCriticEntry[] = [
  {
    id: 'ic1',
    date: formatDate(0),
    statement: 'I am not doing enough work today compared to others.',
    impact: 'negative',
    reframe: 'I completed three key priorities today with focus. Productivity is about value, not comparison.'
  },
  {
    id: 'ic2',
    date: formatDate(3),
    statement: 'I should have handled that disagreement better.',
    impact: 'negative',
    reframe: 'I spoke honestly and calmly. I can learn from the experience without beating myself up.'
  }
];

export const INITIAL_HABIT_LOGS: HabitEntry[] = [
  {
    id: 'h1',
    date: formatDate(0),
    habitName: 'Late-night stress snacking',
    trigger: 'Stress from work & boredom while scrolling social media',
    awarenessLevel: 'High',
    replacementBehavior: 'Drink warm chamomile tea and do 4-7-8 breathing',
    notes: 'Recognized craving as emotional hunger rather than physical hunger.'
  },
  {
    id: 'h2',
    date: formatDate(1),
    habitName: 'Skipping afternoon water break',
    trigger: 'Back-to-back virtual meetings',
    awarenessLevel: 'Medium',
    replacementBehavior: 'Keep a 1L water bottle directly on the desk',
    notes: 'Noticed slight headache. Set a reminder on desk timer.'
  }
];

export const INITIAL_MIND_WANDERING_LOGS: MindWanderingEntry[] = [
  {
    id: 'mw1',
    date: formatDate(0),
    topic: 'Worrying about upcoming weekend travel logistics',
    emotionalState: 'Restless',
    timeSpentMinutes: 5,
    returnedToPresent: true
  }
];

export const INITIAL_CONNECTION_CATALYST_LOGS: ConnectionCatalystEntry[] = [
  {
    id: 'cc1',
    date: formatDate(0),
    personOrGroup: 'Co-worker Sarah',
    interactionType: 'Project Sync & Coffee Chat',
    communicationStyle: 'Warm & Empathetic',
    connectionQualityScore: 5,
    notes: 'Listened actively to her project concerns and shared supportive feedback.'
  }
];

export const INITIAL_BETTER_DAY_LOGS: BetterDayEntry[] = [
  {
    id: 'bd1',
    date: formatDate(0),
    plannedAction: 'Take a 15-minute screen-free walk outdoors listening to nature sounds',
    valueExpressing: 'Self-care & Mindful Presence',
    completed: true,
    moodAfter: 'Calm'
  }
];
