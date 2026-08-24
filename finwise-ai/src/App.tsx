import React, { useState, useRef } from 'react';
import { UserProfile } from './types/finance';
import { computeRiskScore } from './utils/riskCalculator';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatView, ChatViewHandle } from './components/ChatView';
import { CompanionPanel } from './components/CompanionPanel';
import { ProfileModal } from './components/ProfileModal';
import { StockResearchModal } from './components/StockResearchModal';
import { WhatIfSimulatorModal } from './components/WhatIfSimulatorModal';
import { InvestmentComparisonView } from './components/InvestmentComparisonView';
import { BooksPhilosophyModal } from './components/BooksPhilosophyModal';
import { AccountIntegrationGuideModal } from './components/AccountIntegrationGuideModal';
import { ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  // Default initialized profile based on standard middle-career Indian professional
  const initialCalculated = computeRiskScore({
    ageBracket: '26-35',
    incomeBracket: '10-20L',
    dependents: 2,
    monthlyObligationsValue: 35000,
    incomeValue: 1500000,
    quizAnswers: [3, 3, 3, 3, 3],
    riskToleranceSelf: 'Medium',
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 32,
    ageBracket: '26-35',
    annualIncome: '₹15L - ₹20L (₹15 LPA)',
    incomeBracket: '10-20L',
    incomeValue: 1500000,
    dependents: 2,
    monthlyResponsibilities: '₹35,000/month (Home loan EMI & household living expenses)',
    monthlyObligationsValue: 35000,
    hobbies: 'Technology, Clean Energy & Healthcare',
    riskTolerance: 'Medium',
    quizAnswers: [3, 3, 3, 3, 3],
    riskScore: initialCalculated.score,
    riskCategory: initialCalculated.category,
    primaryGoals: ['Wealth Creation', "Children's Education", 'Tax Savings (80C)'],
    investmentHorizon: 'Long-term (> 7 yrs)',
    isConfirmed: true,
  });

  // Sidebar toggle state for mobile/tablet screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal visibility states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false);

  // Injected external prompt to chat
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);

  // Ref to chat component for report export
  const chatRef = useRef<ChatViewHandle>(null);

  const handleTriggerChatPrompt = (prompt: string) => {
    setExternalPrompt(prompt);
  };

  const handleExportReport = () => {
    chatRef.current?.exportReport();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-slate-800 bg-slate-50 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Left Sidebar Navigation & Market Pulse */}
      <Sidebar
        userProfile={userProfile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenStockModal={() => setStockModalOpen(true)}
        onOpenSimulatorModal={() => setSimulatorModalOpen(true)}
        onOpenComparisonModal={() => setComparisonModalOpen(true)}
        onOpenBooksModal={() => setBooksModalOpen(true)}
        onOpenIntegrationModal={() => setIntegrationModalOpen(true)}
      />

      {/* 2. Main Center Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        {/* Top Header */}
        <Header
          userProfile={userProfile}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onOpenStockModal={() => setStockModalOpen(true)}
          onOpenSimulatorModal={() => setSimulatorModalOpen(true)}
          onOpenComparisonModal={() => setComparisonModalOpen(true)}
          onExportReport={handleExportReport}
        />

        {/* Dynamic Multi-Pane Content Area */}
        <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-5 lg:p-6 gap-5 overflow-hidden min-h-0">
          {/* Main Chat Interface Card */}
          <ChatView
            ref={chatRef}
            userProfile={userProfile}
            onOpenProfileModal={() => setProfileModalOpen(true)}
            onOpenStockModal={() => setStockModalOpen(true)}
            onOpenSimulatorModal={() => setSimulatorModalOpen(true)}
            onOpenComparisonModal={() => setComparisonModalOpen(true)}
            onOpenBooksModal={() => setBooksModalOpen(true)}
            externalPrompt={externalPrompt}
            onClearExternalPrompt={() => setExternalPrompt(null)}
          />

          {/* Right Companion Panel: Red-Flag Sentinel & Fundamental Health */}
          <CompanionPanel
            userProfile={userProfile}
            onOpenStockModal={() => setStockModalOpen(true)}
            onOpenSimulatorModal={() => setSimulatorModalOpen(true)}
            onOpenBooksModal={() => setBooksModalOpen(true)}
            onOpenComparisonModal={() => setComparisonModalOpen(true)}
            onTriggerPrompt={handleTriggerChatPrompt}
          />
        </main>

        {/* Sleek Bottom Status Bar */}
        <footer className="h-9 bg-slate-100/90 border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-700">Data Sources:</span>
            <span className="truncate">NSE India, SEBI Disclosures, Reuters, Moneycontrol, Reddit r/IndiaInvestments</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-slate-600">
              <Lock className="w-3 h-3 text-emerald-600" />
              RBI Account Aggregator & DigiLocker
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-medium">SSL 256-bit Encrypted</span>
          </div>
        </footer>
      </div>

      {/* Interactive Modal Dialogs */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={userProfile}
        onSaveProfile={(updated) => setUserProfile(updated)}
      />

      <StockResearchModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        userProfile={userProfile}
        onAskAiAboutStock={handleTriggerChatPrompt}
      />

      <WhatIfSimulatorModal
        isOpen={simulatorModalOpen}
        onClose={() => setSimulatorModalOpen(false)}
        onSendScenarioToChat={handleTriggerChatPrompt}
      />

      <InvestmentComparisonView
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        userProfile={userProfile}
        onAskAi={handleTriggerChatPrompt}
      />

      <BooksPhilosophyModal
        isOpen={booksModalOpen}
        onClose={() => setBooksModalOpen(false)}
        onSelectPrincipleToChat={(title, author) => {
          handleTriggerChatPrompt(`How do we apply the core principles of "${title}" by ${author} to our current portfolio in the August 2026 market context?`);
        }}
      />

      <AccountIntegrationGuideModal
        isOpen={integrationModalOpen}
        onClose={() => setIntegrationModalOpen(false)}
        onAskAi={handleTriggerChatPrompt}
      />
    </div>
  );
}
