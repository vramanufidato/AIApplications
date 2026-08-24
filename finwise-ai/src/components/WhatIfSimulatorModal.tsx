import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw,
  Coins
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { calculateSipProjection, formatINR } from '../utils/simulator';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendScenarioToChat: (prompt: string) => void;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSendScenarioToChat,
}) => {
  const [monthlySip, setMonthlySip] = useState<number>(15000);
  const [expectedReturn, setExpectedReturn] = useState<number>(13.5);
  const [years, setYears] = useState<number>(15);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [activeChart, setActiveChart] = useState<'compounding' | 'costOfDelay'>('compounding');

  if (!isOpen) return null;

  const simulation = calculateSipProjection(
    monthlySip,
    expectedReturn,
    years,
    stepUpPercent,
    inflationRate
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">"What-If" Wealth & Cost of Delay Simulator</h2>
              <p className="text-xs text-slate-500">Mathematical Compound Growth • Step-up SIP • Inflation Purchasing Power • Cost of Delay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulator Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Controls */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Monthly SIP */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Monthly Investment:</span>
                <span className="text-emerald-700 font-bold">₹{monthlySip.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={150000}
                step={1000}
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹1k</span>
                <span>₹50k</span>
                <span>₹1.5L</span>
              </div>
            </div>

            {/* Expected Return */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Expected CAGR:</span>
                <span className="text-blue-700 font-bold">{expectedReturn}%</span>
              </div>
              <input
                type="range"
                min={6}
                max={20}
                step={0.5}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>6% (FD)</span>
                <span>12% (Index)</span>
                <span>20% (Alpha)</span>
              </div>
            </div>

            {/* Time Period */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Investment Horizon:</span>
                <span className="text-indigo-700 font-bold">{years} Years</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3 Yrs</span>
                <span>15 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>

            {/* Step-up % */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Annual Step-up:</span>
                <span className="text-purple-700 font-bold">{stepUpPercent}% / yr</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={5}
                value={stepUpPercent}
                onChange={(e) => setStepUpPercent(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Flat)</span>
                <span>10% (Avg)</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          {/* KPI Output Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <span className="text-emerald-700 block font-medium">Estimated Total Corpus</span>
              <span className="text-xl font-bold text-emerald-950 block mt-1">
                {formatINR(simulation.totalCorpus)}
              </span>
              <span className="text-[11px] text-emerald-800/80 block mt-0.5">
                Invested: {formatINR(simulation.totalInvested)}
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
              <span className="text-blue-700 block font-medium">Estimated Wealth Gain</span>
              <span className="text-xl font-bold text-blue-950 block mt-1">
                +{formatINR(simulation.totalWealthGain)}
              </span>
              <span className="text-[11px] text-blue-800/80 block mt-0.5">
                {((simulation.totalCorpus / simulation.totalInvested) || 1).toFixed(1)}x Wealth Multiplier
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
              <span className="text-amber-800 block font-medium">Real Purchasing Power</span>
              <span className="text-xl font-bold text-amber-950 block mt-1">
                {formatINR(simulation.realPurchasingPower)}
              </span>
              <span className="text-[11px] text-amber-800/80 block mt-0.5">
                Adjusted for {inflationRate}% annual inflation
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
              <span className="text-rose-700 block font-medium">Cost of 2-Year Delay</span>
              <span className="text-xl font-bold text-rose-950 block mt-1">
                -{formatINR(simulation.costOfDelay2Years)}
              </span>
              <span className="text-[11px] text-rose-800/80 block mt-0.5">
                Loss if starting 2 yrs late
              </span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveChart('compounding')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeChart === 'compounding'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Wealth Compounding Growth
                </button>
                <button
                  onClick={() => setActiveChart('costOfDelay')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeChart === 'costOfDelay'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Cost of Delay Comparison
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Values in ₹ Lakhs / Crores</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'compounding' ? (
                  <AreaChart data={simulation.yearlyData}>
                    <defs>
                      <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => formatINR(val)} tick={{ fontSize: 11 }} width={80} />
                    <Tooltip 
                      formatter={(val: any) => [formatINR(Number(val)), '']}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="futureValue" 
                      name="Total Future Corpus" 
                      stroke="#059669" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCorpus)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalInvested" 
                      name="Your Total Invested" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorInvested)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inflationAdjustedValue" 
                      name="Real Purchasing Value (6% Inf)" 
                      stroke="#d97706" 
                      strokeDasharray="4 4"
                      fill="none" 
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={simulation.yearlyData.filter(d => d.year % 2 === 0 || d.year === years)}>
                    <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => formatINR(val)} tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(val: any) => [formatINR(Number(val)), '']} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="futureValue" name="Start Today Corpus" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delayedFutureValue" name="Delayed by 2 Yrs Corpus" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Scenario Triggers to Chat */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Ask FinWise AI to evaluate this scenario:</span>
            <button
              onClick={() => {
                onSendScenarioToChat(
                  `What if I invest ₹${monthlySip.toLocaleString('en-IN')}/month with ${stepUpPercent}% step-up for ${years} years at ${expectedReturn}% return vs delaying by 2 years? What is the mathematical and behavioural breakdown?`
                );
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discuss this Simulation in Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
