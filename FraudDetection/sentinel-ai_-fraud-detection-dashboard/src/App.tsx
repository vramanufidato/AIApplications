/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw,
  Info,
  BarChart3,
  Layers,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn, type Transaction } from './lib/utils';
import { explainRisk } from './services/geminiService';

// --- Mock Data Generators ---

const generateTransaction = (): Transaction => {
  const isFraud = Math.random() < 0.05; // 5% fraud for demo visibility
  return {
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    amount: parseFloat((Math.random() * 5000).toFixed(2)),
    merchant: ['Amazon', 'Apple Store', 'Shell Gas', 'Starbucks', 'Unknown Vendor', 'Crypto Exchange', 'Luxury Boutique'][Math.floor(Math.random() * 7)],
    category: ['Retail', 'Tech', 'Fuel', 'Food', 'Finance', 'Luxury'][Math.floor(Math.random() * 6)],
    location: ['New York, NY', 'London, UK', 'Remote IP', 'Paris, FR', 'Tokyo, JP'][Math.floor(Math.random() * 5)],
    risk_score: isFraud ? 0.8 + Math.random() * 0.2 : Math.random() * 0.4,
    is_fraud: isFraud ? 1 : 0,
    features: Array.from({ length: 5 }, () => Math.random() * 2 - 1)
  };
};

const PR_CURVE_DATA = [
  { recall: 0, precision: 1 },
  { recall: 0.2, precision: 0.98 },
  { recall: 0.4, precision: 0.95 },
  { recall: 0.6, precision: 0.92 },
  { recall: 0.8, precision: 0.85 },
  { recall: 0.9, precision: 0.7 },
  { recall: 1, precision: 0.1 },
];

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-[#151619] border border-[#2A2B2F] p-5 rounded-xl flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <span className="text-[#8E9299] text-xs font-mono uppercase tracking-wider">{title}</span>
      <Icon className="w-4 h-4 text-[#8E9299]" />
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-medium text-white">{value}</span>
      {trend && (
        <span className={cn("text-[10px] font-mono", trend > 0 ? "text-emerald-400" : "text-rose-400")}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <span className="text-[10px] text-[#5C5F66] font-mono">{subValue}</span>
  </div>
);

const ConfusionMatrix = () => (
  <div className="grid grid-cols-2 gap-1 p-4 bg-[#0A0B0D] rounded-lg border border-[#2A2B2F]">
    <div className="flex flex-col items-center justify-center p-4 bg-[#1A1B1E] rounded">
      <span className="text-[10px] text-[#8E9299] uppercase">True Negative</span>
      <span className="text-lg font-mono text-white">28,431</span>
    </div>
    <div className="flex flex-col items-center justify-center p-4 bg-[#2A1B1E] rounded border border-rose-900/30">
      <span className="text-[10px] text-rose-400 uppercase">False Positive</span>
      <span className="text-lg font-mono text-rose-400">42</span>
    </div>
    <div className="flex flex-col items-center justify-center p-4 bg-[#1A2B1E] rounded border border-emerald-900/30">
      <span className="text-[10px] text-emerald-400 uppercase">False Negative</span>
      <span className="text-lg font-mono text-emerald-400">12</span>
    </div>
    <div className="flex flex-col items-center justify-center p-4 bg-[#1A1B1E] rounded">
      <span className="text-[10px] text-[#8E9299] uppercase">True Positive</span>
      <span className="text-lg font-mono text-white">492</span>
    </div>
  </div>
);

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'analytics'>('monitor');

  useEffect(() => {
    // Initial data
    const initial = Array.from({ length: 20 }, generateTransaction);
    setTransactions(initial);

    // Stream simulation
    const interval = setInterval(() => {
      setTransactions(prev => [generateTransaction(), ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (tx: Transaction) => {
    setSelectedTx(tx);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const analysis = await explainRisk(tx);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const stats = useMemo(() => {
    const total = transactions.length;
    const fraud = transactions.filter(t => t.is_fraud).length;
    return {
      total,
      fraud,
      precision: 0.92,
      recall: 0.88
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E6E6E6] font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-[#2A2B2F] bg-[#0A0B0D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white leading-none">SENTINEL AI</h1>
              <span className="text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest">Fraud Detection Engine v2.4</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-[#151619] p-1 rounded-lg border border-[#2A2B2F]">
            <button 
              onClick={() => setActiveTab('monitor')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === 'monitor' ? "bg-[#2A2B2F] text-white shadow-sm" : "text-[#8E9299] hover:text-white"
              )}
            >
              Real-time Monitor
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === 'analytics' ? "bg-[#2A2B2F] text-white shadow-sm" : "text-[#8E9299] hover:text-white"
              )}
            >
              Analytics Hub
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#151619] border border-[#2A2B2F] rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-[#8E9299] uppercase">System Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Throughput" value="1.2k" subValue="Transactions / min" icon={Activity} trend={12} />
          <StatCard title="Fraud Rate" value={`${((stats.fraud / stats.total) * 100).toFixed(1)}%`} subValue="Detected in current batch" icon={AlertTriangle} trend={-4} />
          <StatCard title="Model Precision" value="92.4%" subValue="False Positive Rate: 0.14%" icon={ShieldCheck} />
          <StatCard title="Recall (Sensitivity)" value="88.1%" subValue="Fraud capture efficiency" icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'monitor' ? (
              <section className="bg-[#151619] border border-[#2A2B2F] rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-[#2A2B2F] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-medium text-white uppercase tracking-wider">Live Transaction Stream</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5F66]" />
                      <input 
                        type="text" 
                        placeholder="Search ID, Merchant..." 
                        className="bg-[#0A0B0D] border border-[#2A2B2F] rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors w-64"
                      />
                    </div>
                    <button className="p-1.5 hover:bg-[#2A2B2F] rounded-lg transition-colors">
                      <Filter className="w-4 h-4 text-[#8E9299]" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0A0B0D]/50 border-b border-[#2A2B2F]">
                        <th className="px-6 py-3 text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-3 text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest">Transaction ID</th>
                        <th className="px-6 py-3 text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest">Merchant</th>
                        <th className="px-6 py-3 text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest text-right">Amount</th>
                        <th className="px-6 py-3 text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest text-center">Risk Score</th>
                        <th className="px-6 py-3 text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2B2F]">
                      <AnimatePresence mode="popLayout">
                        {transactions.map((tx) => (
                          <motion.tr 
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={() => handleAnalyze(tx)}
                            className={cn(
                              "group cursor-pointer transition-colors hover:bg-[#1A1B1E]",
                              selectedTx?.id === tx.id && "bg-[#1A1B1E]"
                            )}
                          >
                            <td className="px-6 py-4 text-[11px] font-mono text-[#8E9299]">
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 text-[11px] font-mono text-white">
                              {tx.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-white">{tx.merchant}</span>
                                <span className="text-[10px] text-[#5C5F66]">{tx.category} • {tx.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-right text-white">
                              ${tx.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-[#0A0B0D] rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${tx.risk_score * 100}%` }}
                                    className={cn(
                                      "h-full transition-all",
                                      tx.risk_score > 0.7 ? "bg-rose-500" : tx.risk_score > 0.4 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                  />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-mono w-8",
                                  tx.risk_score > 0.7 ? "text-rose-400" : tx.risk_score > 0.4 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {(tx.risk_score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider",
                                tx.is_fraud 
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              )}>
                                {tx.is_fraud ? 'Flagged' : 'Verified'}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-medium text-white uppercase tracking-wider">Precision-Recall Curve</h2>
                      </div>
                      <Info className="w-4 h-4 text-[#5C5F66] cursor-help" />
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={PR_CURVE_DATA}>
                          <defs>
                            <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" vertical={false} />
                          <XAxis 
                            dataKey="recall" 
                            stroke="#5C5F66" 
                            fontSize={10} 
                            tickFormatter={(v) => `R:${v}`}
                          />
                          <YAxis 
                            stroke="#5C5F66" 
                            fontSize={10} 
                            tickFormatter={(v) => `P:${v}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#151619', border: '1px solid #2A2B2F', fontSize: '10px' }}
                            itemStyle={{ color: '#10b981' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="precision" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#colorPr)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-medium text-white uppercase tracking-wider">Confusion Matrix</h2>
                      </div>
                    </div>
                    <ConfusionMatrix />
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-[#8E9299]">F1-SCORE</span>
                        <span className="text-white">0.902</span>
                      </div>
                      <div className="w-full h-1 bg-[#0A0B0D] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[90%]" />
                      </div>
                      <p className="text-[10px] text-[#5C5F66] leading-relaxed">
                        The model shows high precision (low False Positives), ensuring minimal customer friction while maintaining robust fraud capture.
                      </p>
                    </div>
                  </section>
                </div>

                <section className="bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-medium text-white uppercase tracking-wider">Anomaly Distribution (PCA Space)</h2>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" />
                        <XAxis type="number" dataKey="x" name="PCA 1" stroke="#5C5F66" fontSize={10} />
                        <YAxis type="number" dataKey="y" name="PCA 2" stroke="#5C5F66" fontSize={10} />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Risk" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#151619', border: '1px solid #2A2B2F', fontSize: '10px' }} />
                        <Scatter name="Transactions" data={transactions.map(t => ({ x: t.features[0], y: t.features[1], z: t.risk_score * 100, isFraud: t.is_fraud }))}>
                          {transactions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.is_fraud ? '#f43f5e' : '#10b981'} fillOpacity={0.6} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Sidebar / Detail View */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">Risk Analysis</h2>
              </div>

              {selectedTx ? (
                <div className="space-y-6">
                  <div className="p-4 bg-[#0A0B0D] rounded-xl border border-[#2A2B2F]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#5C5F66] uppercase">Transaction ID</span>
                        <h3 className="text-sm font-mono text-white">{selectedTx.id}</h3>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-[10px] font-mono",
                        selectedTx.is_fraud ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {selectedTx.is_fraud ? 'HIGH RISK' : 'NORMAL'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-[#5C5F66] uppercase">Amount</span>
                        <p className="text-sm text-white">${selectedTx.amount}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#5C5F66] uppercase">Location</span>
                        <p className="text-sm text-white">{selectedTx.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">AI Reasoning</span>
                      {isAnalyzing && <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />}
                    </div>
                    
                    <div className="min-h-[150px] p-4 bg-[#0A0B0D] rounded-xl border border-[#2A2B2F] relative overflow-hidden">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                          <div className="flex gap-1">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-emerald-500 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-emerald-500 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-emerald-500 rounded-full" />
                          </div>
                          <span className="text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest">Consulting Gemini Engine...</span>
                        </div>
                      ) : aiAnalysis ? (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-[#8E9299] leading-relaxed italic"
                        >
                          "{aiAnalysis}"
                        </motion.p>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30">
                          <Zap className="w-6 h-6" />
                          <span className="text-[10px] font-mono uppercase">Select a transaction to analyze</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2A2B2F] space-y-3">
                    <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Approve Transaction
                    </button>
                    <button className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-lg transition-colors">
                      Decline & Block Card
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-30">
                  <Activity className="w-12 h-12" />
                  <p className="text-xs font-mono uppercase tracking-widest">No Selection<br/>Awaiting Input</p>
                </div>
              )}
            </div>

            <div className="bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6">
              <h2 className="text-[10px] font-mono text-[#5C5F66] uppercase tracking-widest mb-4">System Health</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8E9299]">API Latency</span>
                  <span className="text-xs font-mono text-emerald-400">14ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8E9299]">Model Drift</span>
                  <span className="text-xs font-mono text-emerald-400">0.02%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8E9299]">Uptime</span>
                  <span className="text-xs font-mono text-white">99.998%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto px-6 py-8 border-t border-[#2A2B2F] mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-[#5C5F66]">© 2026 SENTINEL AI SYSTEMS</span>
            <span className="text-[10px] font-mono text-[#5C5F66]">|</span>
            <span className="text-[10px] font-mono text-[#5C5F66]">ENCRYPTION: AES-256</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-mono text-[#5C5F66] hover:text-white transition-colors">DOCUMENTATION</a>
            <a href="#" className="text-[10px] font-mono text-[#5C5F66] hover:text-white transition-colors">API STATUS</a>
            <a href="#" className="text-[10px] font-mono text-[#5C5F66] hover:text-white transition-colors">SECURITY POLICY</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
