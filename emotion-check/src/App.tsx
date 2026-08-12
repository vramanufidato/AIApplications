import React, { useState } from 'react';
import { Header } from './components/Header';
import { EmotionCheckAI } from './components/EmotionCheckAI';
import { ThoughtManagement } from './components/ThoughtManagement';
import { TrackingAndHabits } from './components/TrackingAndHabits';
import { WellnessExercises } from './components/WellnessExercises';
import { MoodAnalytics } from './components/MoodAnalytics';
import { CSVSyncModal } from './components/CSVSyncModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('ai-checkin');
  const [wellnessSubTab, setWellnessSubTab] = useState<string>('breathing');
  const [isCSVModalOpen, setIsCSVModalOpen] = useState<boolean>(false);

  const handleNavigateToTool = (toolId: string) => {
    if (toolId === 'breathing' || toolId === '54321' || toolId === 'connection' || toolId === 'betterday' || toolId === 'boundaries') {
      setWellnessSubTab(toolId);
      setActiveTab('wellness');
    } else if (toolId === 'thought-mgmt') {
      setActiveTab('thought-mgmt');
    } else if (toolId === 'habits') {
      setActiveTab('habits');
    } else {
      setActiveTab('wellness');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D312D] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCSVModal={() => setIsCSVModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ai-checkin' && (
          <EmotionCheckAI
            onNavigateToTool={handleNavigateToTool}
            onMoodLogged={() => {}}
          />
        )}

        {activeTab === 'thought-mgmt' && <ThoughtManagement />}

        {activeTab === 'habits' && <TrackingAndHabits />}

        {activeTab === 'wellness' && (
          <WellnessExercises initialSubTab={wellnessSubTab} />
        )}

        {activeTab === 'analytics' && <MoodAnalytics />}
      </main>

      {/* Footer matching Natural Tones Theme */}
      <footer className="h-12 bg-[#E8E4DB] border-t border-[#DED8CB] px-6 sm:px-10 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#686E68] font-bold mt-auto">
        <span>Last Sync: Just Now</span>
        <span className="hidden sm:inline">Self Therapy Framework v2.4</span>
        <span>User: Alex Thorne</span>
      </footer>

      {/* CSV Sync Modal */}
      <CSVSyncModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
      />
    </div>
  );
}
