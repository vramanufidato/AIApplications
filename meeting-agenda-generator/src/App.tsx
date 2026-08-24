import React, { useState, useEffect } from 'react';
import { GeneratedAgenda } from './types';
import { Navbar } from './components/Navbar';
import { DocUploadSection } from './components/DocUploadSection';
import { AgendaViewer } from './components/AgendaViewer';
import { LiveMeetingRunner } from './components/LiveMeetingRunner';
import { SavedAgendasDrawer } from './components/SavedAgendasDrawer';
import { CalendarScheduleModal } from './components/CalendarScheduleModal';
import { Sparkles, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'agendacraft_saved_agendas_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'runner' | 'saved'>('builder');
  const [currentAgenda, setCurrentAgenda] = useState<GeneratedAgenda | null>(null);
  const [savedAgendas, setSavedAgendas] = useState<GeneratedAgenda[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved agendas from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedAgendas(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading localStorage agendas:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveAgendasToStorage = (agendas: GeneratedAgenda[]) => {
    setSavedAgendas(agendas);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(agendas));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  const handleGenerateAgenda = async (params: {
    documentText: string;
    totalDurationMinutes: number;
    meetingGoal: string;
    meetingTitle?: string;
    participants?: string;
    sourceDocName?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (data.success && data.agenda) {
        setCurrentAgenda(data.agenda);
        setActiveTab('builder');
        showToast('Agenda successfully generated!');
      } else {
        alert(data.error || 'Failed to generate agenda.');
      }
    } catch (err: any) {
      console.error('Error generating agenda:', err);
      alert('An error occurred while generating agenda: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineWithAi = async (instruction: string) => {
    if (!currentAgenda) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/refine-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAgenda,
          refinementInstruction: instruction,
        }),
      });

      const data = await res.json();
      if (data.success && data.agenda) {
        setCurrentAgenda(data.agenda);
        showToast('Agenda updated with AI refinements!');
      } else {
        alert(data.error || 'Failed to refine agenda.');
      }
    } catch (err: any) {
      console.error('Error refining agenda:', err);
      alert('Failed to refine agenda: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentAgenda = () => {
    if (!currentAgenda) return;
    const exists = savedAgendas.some((a) => a.id === currentAgenda.id);
    let updated: GeneratedAgenda[];
    if (exists) {
      updated = savedAgendas.map((a) => (a.id === currentAgenda.id ? currentAgenda : a));
    } else {
      updated = [currentAgenda, ...savedAgendas];
    }
    saveAgendasToStorage(updated);
    showToast('Agenda saved to your library!');
  };

  const handleDeleteSavedAgenda = (agendaId: string) => {
    const updated = savedAgendas.filter((a) => a.id !== agendaId);
    saveAgendasToStorage(updated);
    showToast('Agenda removed from library.');
  };

  const handleSelectSavedAgenda = (agenda: GeneratedAgenda) => {
    setCurrentAgenda(agenda);
    setActiveTab('builder');
    showToast(`Loaded "${agenda.meetingTitle}"`);
  };

  const isCurrentSaved = currentAgenda
    ? savedAgendas.some((a) => a.id === currentAgenda.id)
    : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold border border-indigo-400/30 animate-bounce flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedAgendas.length}
        hasActiveAgenda={!!currentAgenda}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab 1: Builder Tab */}
        {activeTab === 'builder' && (
          <div className="space-y-8">
            {/* Upload & Setup Section */}
            <DocUploadSection onGenerate={handleGenerateAgenda} isLoading={isLoading} />

            {/* Generated Agenda View */}
            {currentAgenda && (
              <AgendaViewer
                agenda={currentAgenda}
                onUpdateAgenda={setCurrentAgenda}
                onRefineWithAi={handleRefineWithAi}
                onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
                onLaunchLiveRunner={() => setActiveTab('runner')}
                onSaveAgenda={handleSaveCurrentAgenda}
                isAiLoading={isLoading}
                isSaved={isCurrentSaved}
              />
            )}
          </div>
        )}

        {/* Tab 2: Live Meeting Timer Runner */}
        {activeTab === 'runner' && currentAgenda && (
          <LiveMeetingRunner
            agenda={currentAgenda}
            onExit={() => setActiveTab('builder')}
          />
        )}

        {/* Tab 3: Saved Agendas Drawer */}
        {activeTab === 'saved' && (
          <SavedAgendasDrawer
            savedAgendas={savedAgendas}
            onSelectAgenda={handleSelectSavedAgenda}
            onDeleteAgenda={handleDeleteSavedAgenda}
            activeAgendaId={currentAgenda?.id}
          />
        )}
      </main>

      {/* Calendar Scheduling Modal */}
      {currentAgenda && (
        <CalendarScheduleModal
          agenda={currentAgenda}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>AgendaCraft AI — Powered by Google Gemini 3.6 Flash</span>
          </div>
          <p>© 2026 Google AI Studio Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
