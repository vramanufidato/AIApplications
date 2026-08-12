import React, { useState } from 'react';
import { FileSpreadsheet, Download, Upload, X, Check, AlertCircle, Copy } from 'lucide-react';
import { Storage } from '../utils/storage';

interface CSVSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSVSyncModal: React.FC<CSVSyncModalProps> = ({ isOpen, onClose }) => {
  const [csvText, setCsvText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export current mood & habit logs to CSV string
  const handleExportCSV = () => {
    const logs = Storage.getMoodLogs();
    const headers = "id,date,mood,intensity,notes\n";
    const rows = logs.map(l => `"${l.id}","${l.date}","${l.mood}",${l.intensity},"${l.notes.replace(/"/g, '""')}"`).join("\n");
    const fullCsv = headers + rows;

    // Create blob and download file
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `emotion_check_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatusMessage("CSV file downloaded! You can import this into Google Sheets.");
  };

  const handleCopyCSV = () => {
    const logs = Storage.getMoodLogs();
    const headers = "id,date,mood,intensity,notes\n";
    const rows = logs.map(l => `"${l.id}","${l.date}","${l.mood}",${l.intensity},"${l.notes.replace(/"/g, '""')}"`).join("\n");
    const fullCsv = headers + rows;

    navigator.clipboard.writeText(fullCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleImportCSV = () => {
    if (!csvText.trim()) {
      setStatusMessage("Please paste CSV content to import.");
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error("CSV content must contain headers and at least one data row.");
      }

      const existingLogs = Storage.getMoodLogs();
      const importedLogs: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse line (simple split considering quotes)
        const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 4) {
          importedLogs.push({
            id: parts[0] || `m_imp_${Date.now()}_${i}`,
            date: parts[1] || new Date().toISOString().split('T')[0],
            mood: parts[2] || 'Calm',
            intensity: parseInt(parts[3]) || 5,
            notes: parts[4] || 'Imported via CSV',
            timestamp: Date.now()
          });
        }
      }

      if (importedLogs.length > 0) {
        Storage.saveMoodLogs([...importedLogs, ...existingLogs]);
        setStatusMessage(`Successfully imported ${importedLogs.length} entries into Emotion Check!`);
        setCsvText('');
      } else {
        throw new Error("No valid log entries found in CSV.");
      }
    } catch (err: any) {
      setStatusMessage(`Import failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-[#E8E4DB] natural-shadow space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8A908A] hover:text-[#2D312D] p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7D8F7D]/15 flex items-center justify-center text-[#7D8F7D]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#2D312D]">Google Sheet CSV Sync</h3>
            <p className="text-xs text-[#686E68]">Export your mood data or import entries directly from a spreadsheet</p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-[#F0EDE4] border border-[#E8E4DB] text-xs text-[#2D312D] flex items-center space-x-2">
            <Check className="w-4 h-4 text-[#7D8F7D] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Export Options */}
        <div className="p-5 rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] space-y-3">
          <span className="text-xs font-bold text-[#8A908A] uppercase tracking-wider block">1. Export to CSV / Google Sheets</span>
          <p className="text-xs text-[#686E68]">Download your complete reflection history as a CSV file compatible with Google Sheets, Excel, or Notion.</p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#7D8F7D] hover:bg-[#6A7C6A] text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV File</span>
            </button>

            <button
              onClick={handleCopyCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F0EDE4] text-[#2D312D] border border-[#E8E4DB] font-semibold text-xs transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4 text-[#7D8F7D]" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw CSV Text'}</span>
            </button>
          </div>
        </div>

        {/* Import Options */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[#8A908A] uppercase tracking-wider block">2. Import from CSV</span>
          <p className="text-xs text-[#686E68]">Paste raw CSV data (Format: <code>id,date,mood,intensity,notes</code>):</p>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`id,date,mood,intensity,notes\nm_101,"2026-08-12","Calm",8,"Morning reflection in nature"`}
            rows={4}
            className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E8E4DB] p-3 text-xs text-[#2D312D] font-mono focus:outline-none focus:ring-2 focus:ring-[#7D8F7D]"
          />

          <div className="flex justify-end pt-1">
            <button
              onClick={handleImportCSV}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#2D312D] hover:bg-[#1A1C1A] text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data into App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
