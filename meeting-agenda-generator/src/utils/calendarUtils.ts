import { CalendarEventDetails, GeneratedAgenda } from '../types';

/**
 * Formats a date (YYYY-MM-DD) and time (HH:MM) string into ISO 8601 string without separators for ICS/Google Cal format: YYYYMMDDTHHMMSSZ
 */
export function formatToUtcCompact(dateStr: string, timeStr: string, addMinutes = 0): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes);
  if (addMinutes > 0) {
    localDate.setMinutes(localDate.getMinutes() + addMinutes);
  }

  // Format as UTC string YYYYMMDDTHHMMSSZ
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const y = localDate.getUTCFullYear();
  const m = pad(localDate.getUTCMonth() + 1);
  const d = pad(localDate.getUTCDate());
  const hh = pad(localDate.getUTCHours());
  const mm = pad(localDate.getUTCMinutes());
  const ss = pad(localDate.getUTCSeconds());

  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

/**
 * Builds Google Calendar web scheduling URL
 */
export function getGoogleCalendarUrl(details: CalendarEventDetails): string {
  const startCompact = formatToUtcCompact(details.startDate, details.startTime, 0);
  const endCompact = formatToUtcCompact(details.startDate, details.startTime, details.durationMinutes);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: details.title,
    dates: `${startCompact}/${endCompact}`,
    details: details.description,
    location: details.location || 'Google Meet / Online',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Builds Outlook Web Calendar link
 */
export function getOutlookCalendarUrl(details: CalendarEventDetails): string {
  const startIso = new Date(`${details.startDate}T${details.startTime}:00`).toISOString();
  const endDate = new Date(`${details.startDate}T${details.startTime}:00`);
  endDate.setMinutes(endDate.getMinutes() + details.durationMinutes);
  const endIso = endDate.toISOString();

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: details.title,
    startdt: startIso,
    enddt: endIso,
    body: details.description,
    location: details.location || 'Online Meeting',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates and triggers download of a standard .ics iCalendar file
 */
export function downloadIcsFile(details: CalendarEventDetails): void {
  const startCompact = formatToUtcCompact(details.startDate, details.startTime, 0);
  const endCompact = formatToUtcCompact(details.startDate, details.startTime, details.durationMinutes);
  const nowCompact = formatToUtcCompact(new Date().toISOString().split('T')[0], '12:00', 0);

  // Clean description for ICS multi-line escaping
  const escapedDesc = details.description
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

  const escapedTitle = details.title.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meeting Agenda Generator//AI Studio//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@meeting-agenda-generator`,
    `DTSTAMP:${nowCompact}`,
    `DTSTART:${startCompact}`,
    `DTEND:${endCompact}`,
    `SUMMARY:${escapedTitle}`,
    `DESCRIPTION:${escapedDesc}`,
    `LOCATION:${details.location || 'Online Meeting'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const sanitizedFilename = details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  link.download = `${sanitizedFilename || 'meeting'}-agenda.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats a full GeneratedAgenda into clean Markdown string
 */
export function formatAgendaToMarkdown(agenda: GeneratedAgenda): string {
  let md = `# Meeting Agenda: ${agenda.meetingTitle}\n\n`;
  md += `**Total Duration:** ${agenda.totalDurationMinutes} minutes  \n`;
  md += `**Meeting Goal:** ${agenda.meetingGoal}  \n`;
  if (agenda.sourceDocName) {
    md += `**Source Document:** ${agenda.sourceDocName}  \n`;
  }
  md += `\n---\n\n## Executive Summary\n${agenda.executiveSummary}\n\n`;

  if (agenda.preMeetingPrep && agenda.preMeetingPrep.length > 0) {
    md += `## 📋 Pre-Meeting Preparation\n`;
    agenda.preMeetingPrep.forEach((prep) => {
      md += `- [ ] ${prep}\n`;
    });
    md += `\n`;
  }

  md += `## ⏱️ Timed Agenda Sections (${agenda.totalDurationMinutes}m Total)\n\n`;
  let currentOffset = 0;
  agenda.sections.forEach((sec, idx) => {
    const endOffset = currentOffset + sec.durationMinutes;
    md += `### ${idx + 1}. ${sec.title} (${sec.durationMinutes} min) [${currentOffset}m - ${endOffset}m]\n`;
    md += `* **Lead / Focus:** ${sec.leadRole}\n`;
    md += `* **Summary:** ${sec.summary}\n`;
    if (sec.keyDiscussionPoints && sec.keyDiscussionPoints.length > 0) {
      md += `* **Key Discussion Points:**\n`;
      sec.keyDiscussionPoints.forEach((pt) => {
        md += `  - ${pt}\n`;
      });
    }
    if (sec.suggestedQuestions && sec.suggestedQuestions.length > 0) {
      md += `* **Suggested Discussion Prompts:**\n`;
      sec.suggestedQuestions.forEach((q) => {
        md += `  - "${q}"\n`;
      });
    }
    md += `\n`;
    currentOffset = endOffset;
  });

  if (agenda.stakeholders && agenda.stakeholders.length > 0) {
    md += `## 👥 Key Stakeholders & Roles\n\n`;
    agenda.stakeholders.forEach((s) => {
      md += `- **${s.nameOrRole}**: ${s.responsibility} *(Relevance: ${s.relevance})*\n`;
    });
    md += `\n`;
  }

  if (agenda.actionItems && agenda.actionItems.length > 0) {
    md += `## 🎯 Identified Action Items\n\n`;
    agenda.actionItems.forEach((ai) => {
      const priorityTag = `[${ai.priority.toUpperCase()}]`;
      md += `- [ ] **${ai.task}** — Owner: *${ai.owner}* ${priorityTag}\n`;
    });
    md += `\n`;
  }

  return md;
}

/**
 * Creates plain formatted text for calendar event descriptions
 */
export function generateCalendarDescription(agenda: GeneratedAgenda): string {
  let desc = `MEETING AGENDA: ${agenda.meetingTitle}\n`;
  desc += `Goal: ${agenda.meetingGoal}\n`;
  desc += `Total Duration: ${agenda.totalDurationMinutes} minutes\n\n`;

  desc += `EXECUTIVE SUMMARY:\n${agenda.executiveSummary}\n\n`;

  desc += `TIMED SECTIONS:\n`;
  let offset = 0;
  agenda.sections.forEach((sec, i) => {
    desc += `${i + 1}. ${sec.title} (${sec.durationMinutes}m) [${offset}m-${offset + sec.durationMinutes}m] - Lead: ${sec.leadRole}\n`;
    desc += `   ${sec.summary}\n`;
    offset += sec.durationMinutes;
  });

  if (agenda.actionItems && agenda.actionItems.length > 0) {
    desc += `\nACTION ITEMS:\n`;
    agenda.actionItems.forEach((item) => {
      desc += `• [${item.priority}] ${item.task} (Owner: ${item.owner})\n`;
    });
  }

  return desc;
}
