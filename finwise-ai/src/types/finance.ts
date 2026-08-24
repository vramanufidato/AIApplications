export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface UserProfile {
  age: number | string;
  ageBracket: '18-25' | '26-35' | '36-45' | '46-55' | '55+';
  annualIncome: string; // e.g. "₹12,00,000 (₹12 LPA)"
  incomeBracket: '< 5L' | '5-10L' | '10-20L' | '20-50L' | '50L+';
  incomeValue: number; // approximate numeric value
  dependents: number;
  monthlyResponsibilities: string; // EMIs, rent, insurance, loans
  monthlyObligationsValue: number; // approximate numeric
  hobbies: string; // theme interests: Green energy, AI tech, Healthcare, etc.
  riskTolerance: 'Low' | 'Medium' | 'High';
  quizAnswers: number[]; // 5 question answers (1-4 scale)
  riskScore: number; // 0 - 100 calculated
  riskCategory: 'Conservative' | 'Moderately Conservative' | 'Moderate' | 'Moderately Aggressive' | 'Aggressive';
  primaryGoals: string[];
  investmentHorizon: 'Short-term (< 3 yrs)' | 'Medium-term (3-7 yrs)' | 'Long-term (> 7 yrs)';
  isConfirmed: boolean;
}

export interface RiskQuizQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    points: number; // 1 to 4
    explanation: string;
  }[];
}

export interface InvestmentOption {
  id: string;
  category: 'Equity (Stocks)' | 'Mutual Funds' | 'Fixed Income' | 'Gold & Silver' | 'Alternatives';
  subType: string;
  expectedReturns: string;
  historicalReturn: string;
  projectedReturnRange: string;
  riskLevel: RiskLevel;
  liquidity: 'High' | 'Medium' | 'Low';
  taxImplications: string;
  minInvestment: string;
  lockIn: string;
  matchTier: 'Best Match' | 'Good to Consider' | 'Not Recommended';
  suitabilityRationale: string;
  keyInstruments: string[];
}

export interface BookPrinciple {
  id: number;
  title: string;
  author: string;
  coreTheme: string;
  keyRule: string;
  practicalApplication: string;
  quote: string;
}

export interface RedFlagReport {
  overallStatus: 'green' | 'yellow' | 'red';
  statusLabel: string;
  officialFlags: {
    item: string;
    status: 'clean' | 'warning' | 'alert';
    detail: string;
  }[];
  socialSentiment: {
    source: 'Reddit' | 'Stock Forums' | 'Twitter/X';
    finBertSentiment: 'Bullish' | 'Neutral' | 'Bearish';
    score: number; // 0 to 100
    summary: string;
    anomalyDetected: boolean;
  }[];
  verdict: string;
}

export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  marketCap: string;
  currentPrice: number;
  dayChange: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  dividendYield: number;
  quarterlyRevenueGrowth: string;
  quarterlyNetProfitGrowth: string;
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';
  analystTarget: number;
  technical: {
    rsi: number;
    rsiStatus: 'Oversold (<30)' | 'Neutral (30-70)' | 'Overbought (>70)';
    ema50: number;
    ema200: number;
    macdSignal: 'Bullish Crossover' | 'Bearish Crossover' | 'Neutral';
    bollingerStatus: 'Lower Band Support' | 'Mid Band' | 'Upper Band Resistance';
    technicalSignal: 'BUY' | 'SELL' | 'HOLD';
    signalRationale: string;
  };
  bookPrincipleApplied: {
    bookTitle: string;
    author: string;
    principleText: string;
  };
  redFlags: RedFlagReport;
  keyMoatOrAdvantage: string;
}

export interface MutualFundData {
  id: string;
  name: string;
  category: 'Flexi Cap' | 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'ELSS (Tax Saving)' | 'Balanced Advantage' | 'Index Fund' | 'Corporate Debt';
  amc: string;
  aum: string;
  expenseRatio: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  sharpeRatio: number;
  minSip: number;
  exitLoad: string;
  riskRating: 'Low' | 'Moderate' | 'High' | 'Very High';
  topHoldings: string[];
  pros: string[];
  cons: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sourcesCited?: string[];
  redFlagStatus?: 'green' | 'yellow' | 'red';
  isStreaming?: boolean;
}
