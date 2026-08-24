import { RiskQuizQuestion, UserProfile } from '../types/finance';

export const RISK_QUIZ_QUESTIONS: RiskQuizQuestion[] = [
  {
    id: 1,
    question: "If your equity portfolio drops 20% over 2 months due to a market correction, how would you react?",
    options: [
      { label: "Panic and sell all holdings to prevent further losses", points: 1, explanation: "Capital protection is your top priority." },
      { label: "Feel stressed and sell some volatile stocks to hold cash", points: 2, explanation: "Low tolerance for short-term drawdowns." },
      { label: "Stay invested and wait for the market to recover", points: 3, explanation: "Healthy discipline and emotional patience." },
      { label: "Invest more capital aggressively at discounted valuations", points: 4, explanation: "Opportunistic value-focused mindset (Graham & Buffett style)." },
    ],
  },
  {
    id: 2,
    question: "What is your main investment objective?",
    options: [
      { label: "Preserve capital and beat inflation slightly with guaranteed returns", points: 1, explanation: "Safety first, zero tolerance for capital loss." },
      { label: "Earn steady regular income with minimal fluctuations", points: 2, explanation: "Income-focused with low equity exposure." },
      { label: "Balanced growth and capital appreciation over 5+ years", points: 3, explanation: "Willing to accept moderate volatility for solid compounding." },
      { label: "Maximum aggressive wealth creation over long term (10+ years)", points: 4, explanation: "High risk appetite targeting maximum CAGR." },
    ],
  },
  {
    id: 3,
    question: "How long can you leave your invested funds untouched without needing emergency liquidation?",
    options: [
      { label: "Less than 1 year (High liquidity required)", points: 1, explanation: "Strict short-term horizon." },
      { label: "1 to 3 years", points: 2, explanation: "Short to medium term liquidity." },
      { label: "3 to 7 years", points: 3, explanation: "Comfortable medium-term compounding runway." },
      { label: "More than 7 to 10+ years", points: 4, explanation: "Ideal long-term horizon allowing full market cycles." },
    ],
  },
  {
    id: 4,
    question: "How do you perceive volatility vs. potential returns?",
    options: [
      { label: "I want guaranteed returns (like FDs/PPF) even if returns are lower (6-7%)", points: 1, explanation: "Zero volatility preference." },
      { label: "I can accept minor fluctuations for 8-10% returns in hybrid funds", points: 2, explanation: "Moderate stability preference." },
      { label: "I accept normal market swings for 12-14% equity returns", points: 3, explanation: "Balanced risk-reward orientation." },
      { label: "I embrace high volatility for potential 15-18%+ alpha generation", points: 4, explanation: "Aggressive growth mindset." },
    ],
  },
  {
    id: 5,
    question: "How many months of living expenses do you currently hold in liquid emergency funds?",
    options: [
      { label: "Zero or less than 1 month", points: 1, explanation: "Vulnerable to sudden liquidity shocks." },
      { label: "1 to 3 months of basic expenses", points: 2, explanation: "Basic buffer, needs strengthening." },
      { label: "3 to 6 months of living expenses in FD/Liquid funds", points: 3, explanation: "Optimal emergency fund as advised by SEBI & financial planners." },
      { label: "More than 6 to 12 months in ultra-safe instruments", points: 4, explanation: "Robust fortress balance sheet." },
    ],
  },
];

export function computeRiskScore(profile: {
  ageBracket: UserProfile['ageBracket'];
  incomeBracket: UserProfile['incomeBracket'];
  dependents: number;
  monthlyObligationsValue: number;
  incomeValue: number;
  quizAnswers: number[]; // 1 to 4 each
  riskToleranceSelf?: 'Low' | 'Medium' | 'High';
}): {
  score: number;
  category: UserProfile['riskCategory'];
  breakdown: {
    ageComponent: number;
    incomeComponent: number;
    dependentsComponent: number;
    responsibilitiesComponent: number;
    quizComponent: number;
  };
} {
  // Age Factor (15%)
  let ageFactor = 85;
  switch (profile.ageBracket) {
    case '18-25': ageFactor = 95; break;
    case '26-35': ageFactor = 85; break;
    case '36-45': ageFactor = 65; break;
    case '46-55': ageFactor = 45; break;
    case '55+': ageFactor = 25; break;
  }

  // Income Factor (20%)
  let incomeFactor = 75;
  switch (profile.incomeBracket) {
    case '< 5L': incomeFactor = 35; break;
    case '5-10L': incomeFactor = 55; break;
    case '10-20L': incomeFactor = 75; break;
    case '20-50L': incomeFactor = 88; break;
    case '50L+': incomeFactor = 98; break;
  }

  // Dependents Factor (15%)
  let dependentsFactor = 95;
  if (profile.dependents === 1) dependentsFactor = 75;
  else if (profile.dependents === 2) dependentsFactor = 55;
  else if (profile.dependents === 3) dependentsFactor = 40;
  else if (profile.dependents >= 4) dependentsFactor = 25;

  // Responsibilities Factor (20%) - ratio of monthly obligations to monthly income
  const monthlyIncome = (profile.incomeValue || 1000000) / 12;
  const obligationsRatio = profile.monthlyObligationsValue > 0 
    ? (profile.monthlyObligationsValue / monthlyIncome) 
    : 0.3;

  let responsibilitiesFactor = 75;
  if (obligationsRatio < 0.2) responsibilitiesFactor = 90;
  else if (obligationsRatio <= 0.35) responsibilitiesFactor = 75;
  else if (obligationsRatio <= 0.50) responsibilitiesFactor = 50;
  else responsibilitiesFactor = 25;

  // Quiz / Risk Tolerance Factor (30%)
  let quizScoreSum = 0;
  if (profile.quizAnswers && profile.quizAnswers.length > 0) {
    quizScoreSum = profile.quizAnswers.reduce((acc, curr) => acc + curr, 0);
    // Convert from scale of 5-20 to 0-100
    // points 1 = 25%, 4 = 100%
    const avg = quizScoreSum / profile.quizAnswers.length;
    var quizFactor = Math.round((avg / 4) * 100);
  } else {
    // Fallback from self assessment
    if (profile.riskToleranceSelf === 'Low') quizFactor = 35;
    else if (profile.riskToleranceSelf === 'High') quizFactor = 85;
    else quizFactor = 60;
  }

  // Formula: (Age Factor × 15%) + (Income Factor × 20%) + (Dependents Factor × 15%) + (Responsibilities Factor × 20%) + (Risk Tolerance Quiz × 30%)
  const ageComponent = ageFactor * 0.15;
  const incomeComponent = incomeFactor * 0.20;
  const dependentsComponent = dependentsFactor * 0.15;
  const responsibilitiesComponent = responsibilitiesFactor * 0.20;
  const quizComponent = quizFactor * 0.30;

  const totalScore = Math.round(ageComponent + incomeComponent + dependentsComponent + responsibilitiesComponent + quizComponent);
  const clampedScore = Math.max(5, Math.min(98, totalScore));

  let category: UserProfile['riskCategory'] = 'Moderate';
  if (clampedScore <= 35) category = 'Conservative';
  else if (clampedScore <= 50) category = 'Moderately Conservative';
  else if (clampedScore <= 65) category = 'Moderate';
  else if (clampedScore <= 80) category = 'Moderately Aggressive';
  else category = 'Aggressive';

  return {
    score: clampedScore,
    category,
    breakdown: {
      ageComponent: Math.round(ageComponent),
      incomeComponent: Math.round(incomeComponent),
      dependentsComponent: Math.round(dependentsComponent),
      responsibilitiesComponent: Math.round(responsibilitiesComponent),
      quizComponent: Math.round(quizComponent),
    },
  };
}
