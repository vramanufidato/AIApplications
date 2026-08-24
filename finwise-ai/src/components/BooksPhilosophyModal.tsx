import React, { useState } from 'react';
import { X, BookOpen, Quote, Sparkles, Search } from 'lucide-react';
import { TOP_10_INVESTING_BOOKS } from '../data/mockMarketData';

interface BooksPhilosophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrincipleToChat: (bookTitle: string, author: string) => void;
}

export const BooksPhilosophyModal: React.FC<BooksPhilosophyModalProps> = ({
  isOpen,
  onClose,
  onSelectPrincipleToChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredBooks = TOP_10_INVESTING_BOOKS.filter(
    b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.coreTheme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Top 10 Classical Investing Books Baseline</h2>
              <p className="text-xs text-slate-500">The foundational financial theories guiding every FinWise AI analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search principles, authors (Graham, Buffett, Bogle, Lynch, Kahneman)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Book Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 text-slate-700 text-xs">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {book.id}. {book.title}
                  </h3>
                  <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-[10px]">
                    {book.author}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-amber-800 bg-amber-50/70 px-2 py-1 rounded">
                  Theme: {book.coreTheme}
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-800">Core Rule: </span>
                  {book.keyRule}
                </p>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-800">FinWise Application: </span>
                  {book.practicalApplication}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                  <Quote className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate max-w-[200px]">"{book.quote}"</span>
                </div>

                <button
                  onClick={() => {
                    onSelectPrincipleToChat(book.title, book.author);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded text-[11px] font-bold border border-amber-200 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Apply in Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
