import React from 'react';
import { 
  ShieldCheck, 
  Menu, 
  Download, 
  RefreshCw, 
  Layers, 
  Calculator, 
  Search, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types/finance';

interface HeaderProps {
  userProfile: UserProfile;
  onToggleSidebar: () => void;
  onOpenProfileModal: () => void;
  onOpenStockModal: () => void;
  onOpenSimulatorModal: () => void;
  onOpenComparisonModal: () => void;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onToggleSidebar,
  onOpenProfileModal,
  onOpenStockModal,
  onOpenSimulatorModal,
  onOpenComparisonModal,
  onExportReport,
}) => {
  return (
    <header id="sleek-app-header" className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
      {/* Left: Mobile Toggle & Active Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-400 font-medium hidden sm:inline">Researching:</span>
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">Active Indian Portfolio & SEBI Grounding</span>
          </div>
          <span className="hidden md:inline bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded font-medium">
            Aug 2026 Baseline
          </span>
        </div>
      </div>

      {/* Right: Sleek Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onExportReport}
          className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          title="Export Research Transcript"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Report</span>
        </button>

        <button
          onClick={onOpenComparisonModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Compare Assets</span>
        </button>

        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">
            {userProfile.isConfirmed ? `${userProfile.riskCategory} (${userProfile.riskScore}/100)` : 'Setup Profile'}
          </span>
          <span className="xs:hidden">Profile</span>
        </button>
      </div>
    </header>
  );
};
