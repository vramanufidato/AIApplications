export interface AgendaSection {
  id: string;
  title: string;
  durationMinutes: number;
  leadRole: string;
  summary: string;
  keyDiscussionPoints: string[];
  suggestedQuestions: string[];
}

export interface Stakeholder {
  nameOrRole: string;
  responsibility: string;
  relevance: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  deadlineSuggestion?: string;
  completed?: boolean;
}

export interface GeneratedAgenda {
  id: string;
  meetingTitle: string;
  totalDurationMinutes: number;
  meetingGoal: string;
  executiveSummary: string;
  preMeetingPrep: string[];
  sections: AgendaSection[];
  stakeholders: Stakeholder[];
  actionItems: ActionItem[];
  createdAt: string;
  sourceDocName?: string;
}

export interface CalendarEventDetails {
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  location: string;
  description: string;
}

export interface SampleDoc {
  id: string;
  name: string;
  type: string;
  description: string;
  content: string;
}
