import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  PieChart, 
  Target, 
  Clock, 
  Sparkles,
  Wallet,
  Users,
  Home,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types/finance';
import { RISK_QUIZ_QUESTIONS, computeRiskScore } from '../utils/riskCalculator';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [tab, setTab] = useState<'details' | 'quiz' | 'summary'>('details');
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  if (!isOpen) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compute preliminary score
    const result = computeRiskScore({
      ageBracket: formData.ageBracket,
      incomeBracket: formData.incomeBracket,
      dependents: formData.dependents,
      monthlyObligationsValue: formData.monthlyObligationsValue,
      incomeValue: formData.incomeValue,
      quizAnswers: formData.quizAnswers,
      riskToleranceSelf: formData.riskTolerance,
    });

    setFormData(prev => ({
      ...prev,
      riskScore: result.score,
      riskCategory: result.category,
    }));

    setTab('quiz');
  };

  const handleQuizAnswer = (points: number) => {
    const updatedAnswers = [...formData.quizAnswers];
    updatedAnswers[currentQuizIndex] = points;

    const result = computeRiskScore({
      ageBracket: formData.ageBracket,
      incomeBracket: formData.incomeBracket,
      dependents: formData.dependents,
      monthlyObligationsValue: formData.monthlyObligationsValue,
      incomeValue: formData.incomeValue,
      quizAnswers: updatedAnswers,
      riskToleranceSelf: formData.riskTolerance,
    });

    setFormData(prev => ({
      ...prev,
      quizAnswers: updatedAnswers,
      riskScore: result.score,
      riskCategory: result.category,
    }));

    if (currentQuizIndex < RISK_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setTab('summary');
    }
  };

  const handleGoalToggle = (goal: string) => {
    const goals = formData.primaryGoals.includes(goal)
      ? formData.primaryGoals.filter(g => g !== goal)
      : [...formData.primaryGoals, goal];
    setFormData({ ...formData, primaryGoals: goals });
  };

  const handleConfirmAndSave = () => {
    const finalProfile: UserProfile = {
      ...formData,
      isConfirmed: true,
    };
    onSaveProfile(finalProfile);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // silent
    }
    onClose();
  };

  const scoreCalculation = computeRiskScore({
    ageBracket: formData.ageBracket,
    incomeBracket: formData.incomeBracket,
    dependents: formData.dependents,
    monthlyObligationsValue: formData.monthlyObligationsValue,
    incomeValue: formData.incomeValue,
    quizAnswers: formData.quizAnswers,
    riskToleranceSelf: formData.riskTolerance,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">FinWise Financial Profile & Risk Engine</h2>
              <p className="text-xs text-slate-500">Required by SEBI standards before generating tailored research</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Stepper */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-white text-xs font-medium text-center">
          <button
            onClick={() => setTab('details')}
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'details'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px]">1</span>
            Financial Details
          </button>
          <button
            onClick={() => setTab('quiz')}
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'quiz'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px]">2</span>
            5-Question Risk Quiz
          </button>
          <button
            onClick={() => setTab('summary')}
            className={`py-3 border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'summary'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px]">3</span>
            Score Breakdown
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {tab === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age Bracket (15% Weight in Risk Score)
                  </label>
                  <select
                    value={formData.ageBracket}
                    onChange={(e) => setFormData({ ...formData, ageBracket: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="18-25">18–25 years (Long compounding runway)</option>
                    <option value="26-35">26–35 years (Prime earning & growth phase)</option>
                    <option value="36-45">36–45 years (Mid-career wealth acceleration)</option>
                    <option value="46-55">46–55 years (Pre-retirement consolidation)</option>
                    <option value="55+">55+ years (Capital preservation focus)</option>
                  </select>
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Income Bracket (20% Weight)
                  </label>
                  <select
                    value={formData.incomeBracket}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      let numericVal = 1200000;
                      if (val === '< 5L') numericVal = 400000;
                      else if (val === '5-10L') numericVal = 800000;
                      else if (val === '10-20L') numericVal = 1500000;
                      else if (val === '20-50L') numericVal = 3000000;
                      else if (val === '50L+') numericVal = 6000000;

                      setFormData({ 
                        ...formData, 
                        incomeBracket: val,
                        annualIncome: `₹${(numericVal / 100000).toFixed(1)} LPA`,
                        incomeValue: numericVal
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="< 5L">Under ₹5 Lakhs / year</option>
                    <option value="5-10L">₹5 – ₹10 Lakhs / year (₹5-10 LPA)</option>
                    <option value="10-20L">₹10 – ₹20 Lakhs / year (₹10-20 LPA)</option>
                    <option value="20-50L">₹20 – ₹50 Lakhs / year (₹20-50 LPA)</option>
                    <option value="50L+">Above ₹50 Lakhs / year (₹50+ LPA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dependents */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Family Size & Dependents (15% Weight)
                  </label>
                  <select
                    value={formData.dependents}
                    onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value={0}>0 Dependents (Self-reliant)</option>
                    <option value={1}>1 Dependent (Spouse or Child)</option>
                    <option value={2}>2 Dependents (Family of 3-4)</option>
                    <option value={3}>3 Dependents</option>
                    <option value={4}>4+ Dependents (Multi-generational)</option>
                  </select>
                </div>

                {/* Monthly Obligations */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Obligations (EMIs, Rent, Loans - 20% Weight)
                  </label>
                  <select
                    value={formData.monthlyObligationsValue}
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        monthlyObligationsValue: num,
                        monthlyResponsibilities: `Approx ₹${num.toLocaleString('en-IN')}/month (EMIs & rent)`
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value={15000}>Low (Under ₹20,000 / month)</option>
                    <option value={35000}>Moderate (₹20,000 – ₹45,000 / month)</option>
                    <option value={75000}>High (₹45,000 – ₹1,00,000 / month)</option>
                    <option value={150000}>Substantial (&gt; ₹1,00,000 / month)</option>
                  </select>
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Investment Goals (Select multiple)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Wealth Creation",
                    "Retirement Corpus",
                    "Children's Education",
                    "Tax Savings (80C)",
                    "Buying a House",
                    "Emergency Fund"
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalToggle(goal)}
                      className={`p-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                        formData.primaryGoals.includes(goal)
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{goal}</span>
                      {formData.primaryGoals.includes(goal) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horizon & Theme Interests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Investment Horizon
                  </label>
                  <select
                    value={formData.investmentHorizon}
                    onChange={(e) => setFormData({ ...formData, investmentHorizon: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Short-term (< 3 yrs)">Short-term (&lt; 3 years - Debt & Capital Safety)</option>
                    <option value="Medium-term (3-7 yrs)">Medium-term (3–7 years - Hybrid / Flexi Cap)</option>
                    <option value="Long-term (> 7 yrs)">Long-term (&gt; 7 years - Multi-Cap & Equity)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Theme / Sector Interests (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Clean Energy, AI Tech, EVs, Healthcare"
                    value={formData.hobbies}
                    onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <span>Proceed to Risk Quiz</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {tab === 'quiz' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Question {currentQuizIndex + 1} of {RISK_QUIZ_QUESTIONS.length}
                </span>
                <span>Weighted at 30% of your SEBI Risk Score</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuizIndex + 1) / RISK_QUIZ_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>

              {/* Current Question */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  {RISK_QUIZ_QUESTIONS[currentQuizIndex].question}
                </h3>
                <p className="text-xs text-slate-500">Select the option that most accurately reflects your instinct:</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {RISK_QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, idx) => {
                  const currentAnswer = formData.quizAnswers[currentQuizIndex];
                  const isSelected = currentAnswer === opt.points;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(opt.points)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900 text-sm">{opt.label}</div>
                        <div className="text-xs text-slate-500">{opt.explanation}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (currentQuizIndex > 0) setCurrentQuizIndex(currentQuizIndex - 1);
                    else setTab('details');
                  }}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('summary')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Skip to Summary
                </button>
              </div>
            </div>
          )}

          {tab === 'summary' && (
            <div className="space-y-5">
              {/* Score Showcase */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-2xl border border-indigo-800/50 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Calculated SEBI Risk Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black text-white tracking-tight">
                        {scoreCalculation.score}
                      </span>
                      <span className="text-indigo-300 text-sm font-medium">/ 100</span>
                      <span className="ml-3 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
                        {scoreCalculation.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-indigo-200/80 max-w-xs border-l sm:border-indigo-800/80 sm:pl-4 space-y-1">
                    <p className="font-semibold text-white">Recommended Asset Strategy:</p>
                    <p>
                      {scoreCalculation.category === 'Aggressive' || scoreCalculation.category === 'Moderately Aggressive'
                        ? '70-80% Equity (Flexi Cap/Index/Midcaps) + 15% Debt + 10% Gold'
                        : scoreCalculation.category === 'Moderate'
                        ? '55-65% Balanced & Flexi Funds + 25% Debt/FDs + 10% Gold'
                        : '30-40% Large Cap / Hybrid + 55% Fixed Income (PPF/FD) + 10% SGB'}
                    </p>
                  </div>
                </div>

                {/* Mathematical breakdown */}
                <div className="mt-4 pt-4 border-t border-indigo-800/50 grid grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-indigo-300 font-medium">Age (15%)</div>
                    <div className="text-white font-bold text-sm mt-0.5">{scoreCalculation.breakdown.ageComponent} pts</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-indigo-300 font-medium">Income (20%)</div>
                    <div className="text-white font-bold text-sm mt-0.5">{scoreCalculation.breakdown.incomeComponent} pts</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-indigo-300 font-medium">Family (15%)</div>
                    <div className="text-white font-bold text-sm mt-0.5">{scoreCalculation.breakdown.dependentsComponent} pts</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-indigo-300 font-medium">EMIs (20%)</div>
                    <div className="text-white font-bold text-sm mt-0.5">{scoreCalculation.breakdown.responsibilitiesComponent} pts</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-indigo-300 font-medium">Quiz (30%)</div>
                    <div className="text-white font-bold text-sm mt-0.5">{scoreCalculation.breakdown.quizComponent} pts</div>
                  </div>
                </div>
              </div>

              {/* Profile Confirmation Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
                <h4 className="font-semibold text-slate-800 text-sm">Profile Summary for Confirmation:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block">Age:</span>
                    <span className="font-semibold text-slate-800">{formData.ageBracket}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Annual Income:</span>
                    <span className="font-semibold text-slate-800">{formData.annualIncome}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dependents:</span>
                    <span className="font-semibold text-slate-800">{formData.dependents}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Horizon:</span>
                    <span className="font-semibold text-slate-800">{formData.investmentHorizon}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Selected Goals:</span>
                    <span className="font-semibold text-slate-800">{formData.primaryGoals.join(', ') || 'Wealth Creation'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setTab('quiz')}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Review Quiz
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Profile & Activate FinWise AI</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
