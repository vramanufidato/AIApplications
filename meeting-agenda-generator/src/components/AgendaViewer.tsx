import React, { useState } from 'react';
import { GeneratedAgenda, AgendaSection, ActionItem } from '../types';
import { TimelineBar } from './TimelineBar';
import { RefineAiBar } from './RefineAiBar';
import { formatAgendaToMarkdown } from '../utils/calendarUtils';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  ListTodo,
  FileText,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Play,
  Save,
  Edit3,
  Bookmark,
  Share2,
} from 'lucide-react';

interface AgendaViewerProps {
  agenda: GeneratedAgenda;
  onUpdateAgenda: (updatedAgenda: GeneratedAgenda) => void;
  onRefineWithAi: (instruction: string) => Promise<void>;
  onOpenScheduleModal: () => void;
  onLaunchLiveRunner: () => void;
  onSaveAgenda: () => void;
  isAiLoading: boolean;
  isSaved?: boolean;
}

export const AgendaViewer: React.FC<AgendaViewerProps> = ({
  agenda,
  onUpdateAgenda,
  onRefineWithAi,
  onOpenScheduleModal,
  onLaunchLiveRunner,
  onSaveAgenda,
  isAiLoading,
  isSaved = false,
}) => {
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(agenda.meetingTitle);

  // Toggle Action item completion state
  const handleToggleActionItem = (id: string) => {
    const updatedItems = agenda.actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateAgenda({ ...agenda, actionItems: updatedItems });
  };

  // Add new Action item
  const [newTask, setNewTask] = useState<string>('');
  const [newOwner, setNewOwner] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const newItem: ActionItem = {
      id: 'ai-custom-' + Date.now(),
      task: newTask.trim(),
      owner: newOwner.trim() || 'Unassigned',
      priority: newPriority,
      completed: false,
    };
    onUpdateAgenda({ ...agenda, actionItems: [...agenda.actionItems, newItem] });
    setNewTask('');
    setNewOwner('');
  };

  const handleDeleteActionItem = (id: string) => {
    onUpdateAgenda({
      ...agenda,
      actionItems: agenda.actionItems.filter((a) => a.id !== id),
    });
  };

  // Update duration of a section
  const handleUpdateSectionDuration = (sectionId: string, newDuration: number) => {
    const updatedSections = agenda.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, durationMinutes: Math.max(1, newDuration) } : sec
    );
    onUpdateAgenda({ ...agenda, sections: updatedSections });
  };

  // Move section up / down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= agenda.sections.length) return;
    const newSections = [...agenda.sections];
    const temp = newSections[index];
    newSections[index] = newSections[newIdx];
    newSections[newIdx] = temp;
    onUpdateAgenda({ ...agenda, sections: newSections });
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    if (agenda.sections.length <= 1) return;
    onUpdateAgenda({
      ...agenda,
      sections: agenda.sections.filter((s) => s.id !== sectionId),
    });
  };

  // Add new manual section
  const handleAddSection = () => {
    const newSec: AgendaSection = {
      id: 'sec-manual-' + Date.now(),
      title: 'New Discussion Topic',
      durationMinutes: 10,
      leadRole: 'Meeting Facilitator',
      summary: 'Summary of the discussion topic.',
      keyDiscussionPoints: ['Key point 1', 'Key point 2'],
      suggestedQuestions: ['What are the key priorities?'],
    };
    onUpdateAgenda({ ...agenda, sections: [...agenda.sections, newSec] });
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    const md = formatAgendaToMarkdown(agenda);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    const md = formatAgendaToMarkdown(agenda);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${agenda.meetingTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-agenda.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onUpdateAgenda({ ...agenda, meetingTitle: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                {agenda.meetingGoal}
              </span>
              {agenda.sourceDocName && (
                <span className="text-xs text-slate-400 truncate flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{agenda.sourceDocName}</span>
                </span>
              )}
            </div>

            {editingTitle ? (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="bg-slate-950 border border-indigo-500 rounded-xl px-3 py-1.5 text-lg font-bold text-white focus:outline-none w-full"
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 group">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {agenda.meetingTitle}
                </h2>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="p-1 text-slate-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Rename Title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="schedule-calendar-btn"
              onClick={onOpenScheduleModal}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule / Calendar Integration</span>
            </button>

            <button
              id="launch-live-runner-btn"
              onClick={onLaunchLiveRunner}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Play className="w-4 h-4 ml-0.5" />
              <span>Live Meeting Runner</span>
            </button>

            <button
              id="save-agenda-btn"
              onClick={onSaveAgenda}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                isSaved
                  ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-400 text-indigo-400' : ''}`} />
              <span>{isSaved ? 'Saved in History' : 'Save Agenda'}</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handleCopyMarkdown}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Copy Markdown Agenda"
              >
                {copiedMd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Download .MD File"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Executive Meeting Summary</span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{agenda.executiveSummary}</p>
        </div>

        {/* Pre-Meeting Prep List */}
        {agenda.preMeetingPrep && agenda.preMeetingPrep.length > 0 && (
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Pre-Meeting Preparation</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agenda.preMeetingPrep.map((prep, idx) => (
                <li
                  key={idx}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start space-x-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>{prep}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Interactive Timeline Proportion Bar */}
      <TimelineBar
        sections={agenda.sections}
        totalDurationMinutes={agenda.totalDurationMinutes}
        onUpdateSectionDuration={handleUpdateSectionDuration}
      />

      {/* AI Refinement Prompt Bar */}
      <RefineAiBar onRefine={onRefineWithAi} isLoading={isAiLoading} />

      {/* Timed Agenda Sections Card List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Timed Agenda Sections</h3>
          </div>
          <button
            onClick={handleAddSection}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Section</span>
          </button>
        </div>

        <div className="space-y-4">
          {agenda.sections.map((sec, idx) => (
            <div
              key={sec.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">{sec.title}</h4>
                    <span className="text-xs text-indigo-300 font-medium flex items-center space-x-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lead / Speaker: <strong>{sec.leadRole}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Duration & Rearrange Controls */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <div className="flex items-center space-x-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-mono font-bold text-white mr-1">
                      {sec.durationMinutes} min
                    </span>
                    <button
                      onClick={() => handleUpdateSectionDuration(sec.id, sec.durationMinutes - 5)}
                      className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
                      title="Subtract 5 min"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateSectionDuration(sec.id, sec.durationMinutes + 5)}
                      className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
                      title="Add 5 min"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded bg-slate-900 border border-slate-800"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === agenda.sections.length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded bg-slate-900 border border-slate-800"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded bg-slate-900 border border-slate-800"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Summary */}
              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/50 p-3 rounded-xl border border-slate-800/40">
                "{sec.summary}"
              </p>

              {/* Key Points & Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
                    Key Discussion Points:
                  </span>
                  <ul className="space-y-1">
                    {sec.keyDiscussionPoints.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-1.5">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-indigo-300 block mb-1.5">
                    Suggested Discussion Prompts:
                  </span>
                  <ul className="space-y-1">
                    {sec.suggestedQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-indigo-200/90 italic">
                        "{q}"
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stakeholders & Action Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stakeholders Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Key Stakeholders & Roles</h3>
          </div>

          <div className="space-y-3">
            {agenda.stakeholders.map((stk, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{stk.nameOrRole}</span>
                  <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full font-medium">
                    {stk.relevance}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{stk.responsibility}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items Checklist Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ListTodo className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Identified Action Items</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {agenda.actionItems.filter((a) => a.completed).length}/{agenda.actionItems.length} Done
            </span>
          </div>

          {/* Add Custom Action Item */}
          <form onSubmit={handleAddActionItem} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Add new action item..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 flex-1"
            />
            <input
              type="text"
              placeholder="Owner"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-28"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Action Items List */}
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {agenda.actionItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => handleToggleActionItem(item.id)}
                  className="flex items-start space-x-3 cursor-pointer flex-1"
                >
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 font-bold" />}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item.task}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Owner: <strong className="text-slate-300">{item.owner}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : item.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <button
                    onClick={() => handleDeleteActionItem(item.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
