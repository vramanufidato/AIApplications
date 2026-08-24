import React, { useState } from 'react';
import { GeneratedAgenda } from '../types';
import { History, Calendar, Clock, Trash2, ExternalLink, Search, Bookmark, FileText } from 'lucide-react';

interface SavedAgendasDrawerProps {
  savedAgendas: GeneratedAgenda[];
  onSelectAgenda: (agenda: GeneratedAgenda) => void;
  onDeleteAgenda: (agendaId: string) => void;
  activeAgendaId?: string;
}

export const SavedAgendasDrawer: React.FC<SavedAgendasDrawerProps> = ({
  savedAgendas,
  onSelectAgenda,
  onDeleteAgenda,
  activeAgendaId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = savedAgendas.filter(
    (a) =>
      a.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.meetingGoal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.sourceDocName && a.sourceDocName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Saved Agendas Library</h2>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
            {savedAgendas.length} Saved
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search saved agendas by title or goal..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-3">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-400">No saved agendas found.</p>
          <p className="text-xs text-slate-500">
            {searchTerm ? 'Try a different search term' : 'Generate an agenda and click "Save Agenda" to keep it here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agenda) => {
            const isActive = agenda.id === activeAgendaId;
            return (
              <div
                key={agenda.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{agenda.totalDurationMinutes} min</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(agenda.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2">{agenda.meetingTitle}</h3>
                  <p className="text-xs text-indigo-300 font-medium">{agenda.meetingGoal}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{agenda.executiveSummary}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectAgenda(agenda)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all flex-1 justify-center"
                  >
                    <span>Open Agenda</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteAgenda(agenda.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-800"
                    title="Delete Saved Agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
