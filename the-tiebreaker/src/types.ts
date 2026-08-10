export type ImpactLevel = 'high' | 'medium' | 'low';

export type FactorCategory = 
  | 'financial' 
  | 'time' 
  | 'risk' 
  | 'growth' 
  | 'quality' 
  | 'emotional' 
  | 'effort'
  | 'other';

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  color?: string;
  badge?: string;
}

export interface DecisionFactor {
  id: string;
  name: string;
  description: string;
  weight: number; // 0 to 100
  scores: Record<string, number>; // optionId -> score (0 to 10)
}

export interface ProConItem {
  id: string;
  optionId: string;
  type: 'pro' | 'con';
  text: string;
  impact: ImpactLevel;
  category: FactorCategory;
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  description?: string;
  scores: Record<string, number>; // optionId -> score (0 to 10)
  notes: Record<string, string>; // optionId -> short explanation
}

export interface OptionSwot {
  optionId: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ScenarioOutcome {
  type: 'best' | 'most_likely' | 'worst';
  title: string;
  probability: string; // e.g. "20%", "60%", "20%"
  description: string;
  keyTriggers: string[];
  keyConsequences: string[];
  mitigationOrAction: string;
}

export interface OptionScenarios {
  optionId: string;
  bestCase: ScenarioOutcome;
  mostLikely: ScenarioOutcome;
  worstCase: ScenarioOutcome;
}

export interface AiVerdict {
  recommendedOptionId: string;
  confidencePercentage: number;
  executiveSummary: string;
  keyDecisiveFactor: string;
  sensitivityInsight: string;
  riskMitigationAdvice: string[];
}

export interface DecisionAnalysis {
  id: string;
  title: string;
  dilemma: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  options: DecisionOption[];
  factors: DecisionFactor[];
  prosCons: ProConItem[];
  comparisonCriteria: ComparisonCriterion[];
  swotAnalysis: OptionSwot[];
  scenarios?: OptionScenarios[];
  aiVerdict: AiVerdict;
}

export interface DecisionTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  dilemma: string;
  options: { title: string; description: string }[];
  suggestedFactors: string[];
}

export interface DevilsAdvocateResponse {
  topOptionTitle: string;
  counterArguments: string[];
  blindSpots: string[];
  hiddenCostsOrRisks: string[];
  probingQuestions: string[];
  verdictRebuttal: string;
  alternativePerspectives?: string[];
  riskRatings?: {
    risk: string;
    severity: 'high' | 'medium' | 'low';
    mitigation: string;
  }[];
}

export interface AnalyzeRequestPayload {
  dilemma: string;
  title?: string;
  category?: string;
  customOptions?: { title: string; description?: string }[];
  customFactors?: string[];
  focusMode?: 'balanced' | 'speed' | 'risk-averse' | 'financial' | 'growth';
}
