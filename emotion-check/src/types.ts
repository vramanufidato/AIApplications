export type MoodType = 
  | 'Happy' 
  | 'Calm' 
  | 'Anxious' 
  | 'Sad' 
  | 'Overwhelmed' 
  | 'Energetic' 
  | 'Frustrated' 
  | 'Hopeful';

export type CommunicationStyle = 
  | 'Assertive' 
  | 'Passive' 
  | 'Aggressive' 
  | 'Warm & Empathetic' 
  | 'Clear & Direct';

export type RecommendationCategory = 
  | 'Grounding' 
  | 'Daily Affirmations' 
  | 'Mindfulness' 
  | 'Boundaries' 
  | 'Positivity Bias';

export interface EmotionAnalysisRequest {
  mood?: string;
  negativeThought?: string;
  habitLog?: string;
  activity?: string;
  trigger?: string;
  context?: string;
}

export interface CognitiveReframeData {
  reframeText: string;
  evidenceQuestions: string[];
  perspectiveShift: string;
}

export interface ActionableRecommendationData {
  category: RecommendationCategory;
  title: string;
  description: string;
  actionSteps: string[];
  toolId: '54321' | 'breathing' | 'affirmations' | 'mindwandering' | 'boundaries' | 'gratitude';
}

export interface EmotionAnalysisResult {
  empatheticReflection: string;
  cognitiveReframe: CognitiveReframeData;
  actionableRecommendation: ActionableRecommendationData;
  recommendedAffirmation?: string;
  formattedMarkdown: string;
}

export interface ThoughtChallenge {
  id: string;
  date: string;
  negativeThought: string;
  evidenceFor: string;
  evidenceAgainst: string;
  worstOutcome: string;
  bestOutcome: string;
  likelyOutcome: string;
  rationalThought: string;
}

export type ThoughtChallengeEntry = ThoughtChallenge;

export interface CognitiveDistortion {
  id: string;
  name: string;
  description: string;
  example: string;
  reframeStrategy: string;
}

export interface DecatastrophizingEntry {
  id: string;
  date: string;
  worry: string;
  likelihoodPercent: number;
  impact1Week: string;
  impact1Month: string;
  impact1Year: string;
  copingStrategy: string;
}

export interface InnerCriticEntry {
  id: string;
  date: string;
  statement: string;
  impact: 'positive' | 'negative';
  reframe: string;
}

export interface HabitEntry {
  id: string;
  date: string;
  habitName: string;
  trigger: string;
  awarenessLevel: 'High' | 'Medium' | 'Low';
  replacementBehavior: string;
  notes?: string;
}

export type HabitLogEntry = HabitEntry;

export interface MindWanderingEntry {
  id: string;
  date: string;
  topic: string;
  emotionalState: string;
  timeSpentMinutes: number;
  returnedToPresent: boolean;
}

export interface ConnectionCatalystEntry {
  id: string;
  date: string;
  personOrGroup: string;
  interactionType: string;
  communicationStyle: CommunicationStyle;
  connectionQualityScore: number; // 1-5
  notes: string;
}

export interface BetterDayEntry {
  id: string;
  date: string;
  plannedAction: string;
  valueExpressing: string;
  completed: boolean;
  moodAfter?: MoodType;
}

export interface MoodLogEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mood: MoodType;
  intensity: number; // 1-10
  notes: string;
  timestamp: number;
}

export type TimeframeFilter = 'day' | 'week' | 'month' | 'year';
