import React, { useState } from 'react';
import { GeneratedAgenda, CalendarEventDetails } from '../types';
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadIcsFile,
  generateCalendarDescription,
} from '../utils/calendarUtils';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface CalendarScheduleModalProps {
  agenda: GeneratedAgenda;
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarScheduleModal: React.FC<CalendarScheduleModalProps> = ({
  agenda,
  isOpen,
  onClose,
}) => {
  // Get tomorrow's date formatted YYYY-MM-DD as default
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState<string>(getDefaultDate());
  const [startTime, setStartTime] = useState<string>('10:00');
  const [location, setLocation] = useState<string>('Google Meet / Online Video');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen) return null;

  const eventDescription = generateCalendarDescription(agenda);

  const eventDetails: CalendarEventDetails = {
    title: agenda.meetingTitle,
    startDate,
    startTime,
    durationMinutes: agenda.totalDurationMinutes,
    location,
    description: eventDescription,
  };

  const googleCalUrl = getGoogleCalendarUrl(eventDetails);
  const outlookCalUrl = getOutlookCalendarUrl(eventDetails);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(`SUBJECT: ${agenda.meetingTitle}\n\n${eventDescription}`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Schedule & Calendar Sync</h3>
              <p className="text-xs text-slate-400">Instantly schedule "{agenda.meetingTitle}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Scheduling Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Location / Link</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Google Meet, Zoom, or Room"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Direct One-Click Calendar Buttons */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Integration Action</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Google Calendar Link */}
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center justify-between transition-all shadow-md shadow-indigo-600/20 group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Add to Google Calendar</p>
                    <p className="text-[10px] text-indigo-200">Opens pre-filled web calendar</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Download .ICS File */}
              <button
                type="button"
                onClick={() => downloadIcsFile(eventDetails)}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center justify-between transition-all shadow-md shadow-emerald-600/20 group text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Download .ICS File</p>
                    <p className="text-[10px] text-emerald-200">Apple, Outlook & Mobile cal</p>
                  </div>
                </div>
                <Download className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Outlook Web */}
              <a
                href={outlookCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-between transition-all border border-slate-700 group"
              >
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>Add to Outlook Web Calendar</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </a>

              {/* Copy Invite Text */}
              <button
                type="button"
                onClick={handleCopyDescription}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-between transition-all border border-slate-700"
              >
                <div className="flex items-center space-x-2.5">
                  {copiedText ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{copiedText ? 'Copied Invitation!' : 'Copy Meeting Invite Text'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Invitation Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">Generated Calendar Invite Details</span>
              <span className="text-[11px] text-slate-500 font-mono">{agenda.totalDurationMinutes} min duration</span>
            </div>
            <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
              {eventDescription}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
