import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart2, 
  Calendar, 
  TrendingUp, 
  Smile, 
  Filter, 
  Activity, 
  Sparkles,
  Award
} from 'lucide-react';
import { MoodLogEntry, MoodType } from '../types';
import { Storage } from '../utils/storage';

type Timeframe = 'day' | 'week' | 'month' | 'year';

const MOOD_COLOR_MAP: Record<string, string> = {
  'Calm': '#7D8F7D',      // Sage Green
  'Happy': '#B4C4B4',     // Light Sage
  'Hopeful': '#9BB09B',   // Muted Green
  'Energetic': '#8F9E8F',  // Soft Forest
  'Anxious': '#D6A692',    // Soft Clay
  'Overwhelmed': '#C47A6A',// Terracotta
  'Sad': '#E3C18E',       // Soft Sand/Warm Gold
  'Frustrated': '#B88272'  // Deep Clay
};

export const MoodAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [moodLogs] = useState<MoodLogEntry[]>(() => Storage.getMoodLogs());

  // Filter logs by timeframe
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return moodLogs.filter((log) => {
      const logTime = log.timestamp || new Date(log.date).getTime();
      const diff = now - logTime;

      if (timeframe === 'day') return diff <= oneDay;
      if (timeframe === 'week') return diff <= 7 * oneDay;
      if (timeframe === 'month') return diff <= 30 * oneDay;
      if (timeframe === 'year') return diff <= 365 * oneDay;
      return true;
    });
  }, [moodLogs, timeframe]);

  // Aggregate mood distribution for Pie Chart
  const moodDistributionData = useMemo(() => {
    if (filteredLogs.length === 0) return [];

    const counts: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      counts[log.mood] = (counts[log.mood] || 0) + 1;
    });

    const total = filteredLogs.length;
    return Object.keys(counts).map((m) => ({
      name: m,
      value: counts[m],
      percentage: Math.round((counts[m] / total) * 100)
    }));
  }, [filteredLogs]);

  // Primary dominant mood and stability metric
  const stats = useMemo(() => {
    if (filteredLogs.length === 0) {
      return {
        total: 0,
        dominantMood: 'N/A',
        dominantPercent: 0,
        avgIntensity: 0,
        positiveRatio: 0
      };
    }

    const total = filteredLogs.length;
    let sumIntensity = 0;
    let positiveCount = 0;
    const counts: Record<string, number> = {};

    filteredLogs.forEach((l) => {
      sumIntensity += l.intensity;
      counts[l.mood] = (counts[l.mood] || 0) + 1;
      if (['Calm', 'Happy', 'Hopeful', 'Energetic'].includes(l.mood)) {
        positiveCount++;
      }
    });

    let topMood = 'Calm';
    let maxCount = 0;
    Object.entries(counts).forEach(([m, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMood = m;
      }
    });

    return {
      total,
      dominantMood: topMood,
      dominantPercent: Math.round((maxCount / total) * 100),
      avgIntensity: (sumIntensity / total).toFixed(1),
      positiveRatio: Math.round((positiveCount / total) * 100)
    };
  }, [filteredLogs]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Analytics Header with Timeframe Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E4DB] natural-shadow">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7D8F7D] tracking-wider block mb-1">
            Data Insights & Distribution
          </span>
          <h2 className="font-serif text-2xl font-semibold text-[#2D312D]">Mood Analytics & Trends</h2>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex space-x-1.5 bg-[#F9F7F2] p-1.5 rounded-2xl border border-[#E8E4DB]">
          {(['day', 'week', 'month', 'year'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#7D8F7D] text-white shadow-sm'
                  : 'text-[#686E68] hover:text-[#2D312D]'
              }`}
            >
              {tf === 'day' ? 'Today' : tf === 'week' ? '7 Days' : tf === 'month' ? '30 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Donut Chart & Stat Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Donut Chart Visualization */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-[#E8E4DB] natural-shadow flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#2D312D]">Mood Distribution</h3>
              <p className="text-xs text-[#686E68]">Proportion of emotional states in the selected timeframe</p>
            </div>
            <span className="text-[10px] bg-[#F0EDE4] text-[#7D8F7D] px-3 py-1 rounded-full uppercase tracking-wider font-bold border border-[#E8E4DB]">
              {timeframe.toUpperCase()} VIEW
            </span>
          </div>

          {/* Recharts Pie Chart Canvas */}
          <div className="h-64 relative flex items-center justify-center">
            {moodDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {moodDistributionData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={MOOD_COLOR_MAP[entry.name] || '#7D8F7D'}
                        stroke="#F9F7F2"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${value} logs (${item.payload.percentage}%)`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E8E4DB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-[#8A908A]">
                No mood entries recorded for this timeframe yet.
              </div>
            )}

            {/* Center Donut Overlay */}
            {moodDistributionData.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="font-serif text-3xl font-light text-[#2D312D]">
                  {stats.dominantPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-[#7D8F7D] tracking-wider">
                  {stats.dominantMood}
                </span>
              </div>
            )}
          </div>

          {/* Mood Color Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E8E4DB]">
            {moodDistributionData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2 text-xs text-[#2D312D]">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: MOOD_COLOR_MAP[item.name] || '#7D8F7D' }}
                />
                <span className="font-medium truncate">{item.name}</span>
                <span className="text-[#8A908A] font-mono text-[11px]">({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: High Level Key Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DB] natural-shadow space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#2D312D]">Summary Metrics</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8A908A] tracking-wider block">Total Logs</span>
                <span className="font-serif text-2xl font-semibold text-[#2D312D]">{stats.total}</span>
                <span className="text-[10px] text-[#686E68] block">Reflections Recorded</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8A908A] tracking-wider block">Avg Intensity</span>
                <span className="font-serif text-2xl font-semibold text-[#7D8F7D]">{stats.avgIntensity} / 10</span>
                <span className="text-[10px] text-[#686E68] block">Emotional Energy</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#8A908A] tracking-wider">Grounded & Calm Index</span>
                <span className="text-xs font-bold text-[#7D8F7D]">{stats.positiveRatio}%</span>
              </div>
              <div className="w-full bg-[#E8E4DB] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#7D8F7D] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${stats.positiveRatio}%` }}
                />
              </div>
              <p className="text-[11px] text-[#686E68] pt-1">
                Percentage of reflections logged as Calm, Happy, Hopeful, or Energetic.
              </p>
            </div>
          </div>

          {/* Actionable Insight Box */}
          <div className="bg-[#7D8F7D] p-6 rounded-3xl text-white space-y-3 shadow-md">
            <div className="flex items-center space-x-2 text-white/90 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Therapeutic Observation</span>
            </div>
            <h4 className="font-serif text-lg font-bold">
              {stats.dominantMood === 'Anxious' || stats.dominantMood === 'Overwhelmed'
                ? 'High Emotional Charge Detected'
                : 'Balanced Emotional Baseline'}
            </h4>
            <p className="text-xs text-white/90 leading-relaxed">
              {stats.dominantMood === 'Anxious' || stats.dominantMood === 'Overwhelmed'
                ? 'Your recent logs show elevated stress. Practicing 5 minutes of Left Nostril Breathing or Box Breathing can quickly activate your parasympathetic nervous system.'
                : 'Your logs show a strong steady baseline. Continue capturing small daily wins in your "Better Day" planner to sustain momentum.'}
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-[#2D312D]">
            Filtered Log Details ({filteredLogs.length})
          </h3>
          <span className="text-xs text-[#8A908A]">Chronological Order</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E4DB] text-[#8A908A] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mood State</th>
                <th className="py-3 px-4">Intensity</th>
                <th className="py-3 px-4">Reflection Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DB]/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F9F7F2] transition-colors">
                  <td className="py-3.5 px-4 text-[#8A908A] font-mono">{log.date}</td>
                  <td className="py-3.5 px-4 font-bold text-[#2D312D]">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-white inline-block"
                      style={{ backgroundColor: MOOD_COLOR_MAP[log.mood] || '#7D8F7D' }}
                    >
                      {log.mood}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#7D8F7D]">{log.intensity}/10</td>
                  <td className="py-3.5 px-4 text-[#686E68] max-w-md truncate">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
