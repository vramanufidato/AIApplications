import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Clock,
  Target,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';
import { SampleDoc } from '../types';

interface DocUploadSectionProps {
  onGenerate: (params: {
    documentText: string;
    totalDurationMinutes: number;
    meetingGoal: string;
    meetingTitle?: string;
    participants?: string;
    sourceDocName?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

const GOAL_OPTIONS = [
  'Decision Making & Sign-off',
  'Strategic Alignment & Roadmap',
  'Action-Oriented Planning',
  'Problem Solving & Brainstorming',
  'Status Sync & Progress Update',
  'Executive Briefing & Q&A',
];

export const DocUploadSection: React.FC<DocUploadSectionProps> = ({
  onGenerate,
  isLoading,
}) => {
  const [documentText, setDocumentText] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [meetingGoal, setMeetingGoal] = useState<string>('Decision Making & Sign-off');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [participants, setParticipants] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showDirectTextInput, setShowDirectTextInput] = useState<boolean>(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Analyzing document with Gemini AI...');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDuration = customDuration ? parseInt(customDuration) || 60 : selectedDuration;
  const activeGoal = meetingGoal === 'Custom' ? customGoal : meetingGoal;

  const handleFileUpload = async (file: File) => {
    setParsingError(null);
    setSelectedFileName(file.name);

    try {
      if (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.type.startsWith('text/')) {
        const text = await file.text();
        setDocumentText(text);
      } else {
        // Send to backend endpoint for mammoth docx or general parsing
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            const res = await fetch('/api/parse-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileData: base64Data,
                fileName: file.name,
                mimeType: file.type,
              }),
            });
            const data = await res.json();
            if (data.success && data.extractedText) {
              setDocumentText(data.extractedText);
            } else {
              setParsingError(data.error || 'Could not parse document content');
            }
          } catch (err: any) {
            setParsingError('Failed to parse document: ' + err.message);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setParsingError('Error reading file: ' + err.message);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const loadSampleDocument = (sample: SampleDoc) => {
    setSelectedFileName(sample.name);
    setDocumentText(sample.content);
    setParsingError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) {
      setParsingError('Please upload a document or paste document text first.');
      return;
    }

    setLoadingStep('Extracting key discussion topics & stakeholders...');
    setTimeout(() => {
      setLoadingStep('Calculating optimal timing & action items...');
    }, 1500);

    await onGenerate({
      documentText,
      totalDurationMinutes: activeDuration,
      meetingGoal: activeGoal || 'Alignment & Planning',
      meetingTitle: meetingTitle.trim() || undefined,
      participants: participants.trim() || undefined,
      sourceDocName: selectedFileName || 'Document Input',
    });
  };

  const wordCount = documentText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Upload Document & Configure Meeting</h2>
            <p className="text-sm text-slate-400">
              Upload a .docx, .md, or .txt file to automatically extract summaries, timed sections, action items, and stakeholders.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Sample Documents Quick Pickers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Try with a Sample Document:</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSampleDocument(sample)}
                className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  selectedFileName === sample.name
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-200 mb-1 flex items-center space-x-1.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{sample.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{sample.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Upload Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : selectedFileName
              ? 'border-indigo-500/60 bg-indigo-950/20'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.md,.txt,.csv,.json"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            {selectedFileName ? (
              <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2.5 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-200">{selectedFileName}</p>
                  <p className="text-xs text-slate-400">{wordCount} words loaded</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to upload or drag & drop document
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports <span className="text-indigo-300 font-mono">.docx</span>,{' '}
                    <span className="text-indigo-300 font-mono">.md</span>,{' '}
                    <span className="text-indigo-300 font-mono">.txt</span>, or raw text
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Collapsible Manual Text Editor / Preview */}
        <div>
          <button
            type="button"
            onClick={() => setShowDirectTextInput(!showDirectTextInput)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium focus:outline-none"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showDirectTextInput ? 'Hide' : 'View or edit'} document raw text ({wordCount} words)</span>
            {showDirectTextInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDirectTextInput && (
            <div className="mt-2">
              <textarea
                id="document-raw-text-area"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="Paste or edit document text here..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {parsingError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{parsingError}</span>
          </div>
        )}

        {/* Meeting Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/80">
          {/* Total Duration Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Total Meeting Duration</span>
              </span>
              <span className="text-indigo-400 font-bold">{activeDuration} min</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelectedDuration(m);
                    setCustomDuration('');
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDuration === m && !customDuration
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <input
              id="custom-duration-input"
              type="number"
              min={5}
              max={480}
              placeholder="Or enter custom minutes (e.g. 75)"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Meeting Format / Goal Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Meeting Primary Goal & Format</span>
            </label>
            <select
              id="meeting-goal-select"
              value={meetingGoal}
              onChange={(e) => setMeetingGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
            >
              {GOAL_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="Custom">Custom Goal...</option>
            </select>
            {meetingGoal === 'Custom' && (
              <input
                id="custom-goal-input"
                type="text"
                placeholder="Describe meeting objective..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>
        </div>

        {/* Optional Title & Participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">
              Meeting Title (Optional Override)
            </label>
            <input
              id="meeting-title-override-input"
              type="text"
              placeholder="e.g. Q3 Architecture Review"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">
              Key Attendees / Stakeholders (Optional)
            </label>
            <input
              id="meeting-participants-input"
              type="text"
              placeholder="e.g. Lead Architect, PM, Security Lead"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini 3.6 Flash structured timing engine ready</span>
          </div>

          <button
            id="generate-agenda-btn"
            type="submit"
            disabled={isLoading || !documentText.trim()}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 transition-all shadow-lg ${
              isLoading || !documentText.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-500/25 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Agenda ({activeDuration} min)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
