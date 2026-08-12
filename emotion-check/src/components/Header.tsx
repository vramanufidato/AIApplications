import React from 'react';
import { HeartPulse, Sparkles, FileSpreadsheet, RefreshCw, BarChart2, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCSVModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCSVModal }) => {
  const tabs = [
    { id: 'ai-checkin', label: 'Emotion Check AI', icon: Sparkles },
    { id: 'thought-mgmt', label: 'Thought Challenger', icon: HeartPulse },
    { id: 'habits', label: 'Tracking & Habits', icon: RefreshCw },
    { id: 'wellness', label: 'Wellness Exercises', icon: BookOpen },
    { id: 'analytics', label: 'Mood Analytics', icon: BarChart2 },
  ];

  return (
    <header className="bg-white border-b border-[#E8E4DB] sticky top-0 z-30 natural-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & App Info */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-[#7D8F7D] flex items-center justify-center text-white shadow-md shadow-[#7D8F7D]/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"></path>
                <path d="M12 7v5l3 3"></path>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="font-serif text-2xl font-semibold text-[#2D312D] tracking-tight">
                  Emotion Check
                </h1>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0EDE4] text-[#7D8F7D] font-bold border border-[#E8E4DB]">
                  Self Therapy Framework
                </span>
              </div>
              <p className="text-xs text-[#686E68]">
                Empathetic AI reflection, cognitive reframing & mood tracking
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center space-x-3 self-end md:self-auto">
            <button
              onClick={onOpenCSVModal}
              className="inline-flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-full bg-[#F9F7F2] hover:bg-[#F0EDE4] text-[#2D312D] border border-[#E8E4DB] transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#7D8F7D]" />
              <span>Google Sheet CSV Sync</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2.5 pt-1 no-scrollbar border-t border-[#E8E4DB]/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7D8F7D] text-white shadow-sm'
                    : 'text-[#686E68] hover:text-[#2D312D] hover:bg-[#F0EDE4]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8A908A]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
