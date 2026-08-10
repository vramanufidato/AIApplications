import React, { useState } from 'react';
import { Sparkles, X, RotateCcw, HeartHandshake, Smile, Frown, Meh } from 'lucide-react';
import { DecisionAnalysis } from '../types';

interface GutCheckModalProps {
  decision: DecisionAnalysis;
  onClose: () => void;
}

export const GutCheckModal: React.FC<GutCheckModalProps> = ({ decision, onClose }) => {
  const [flipping, setFlipping] = useState(false);
  const [flippedResult, setFlippedResult] = useState<string | null>(null);
  const [gutFeedback, setGutFeedback] = useState<'relieved' | 'disappointed' | 'neutral' | null>(null);

  const handleFlipCoin = () => {
    if (flipping || decision.options.length < 2) return;
    setFlipping(true);
    setFlippedResult(null);

    setTimeout(() => {
      // Pick random option
      const randomOpt = decision.options[Math.floor(Math.random() * decision.options.length)];
      setFlippedResult(randomOpt.title);
      setFlipping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-slate-900 bg-white text-slate-900 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-xl border-2 border-slate-900 bg-slate-100 p-2 text-slate-900 hover:bg-slate-200 transition-colors"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <HeartHandshake className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-slate-900">Gut Check & Virtual Coin Flip</h2>
            <p className="text-xs font-bold text-slate-600">
              Pay attention to how you feel <em className="text-indigo-700 not-italic uppercase font-black">while the coin is in mid-air</em>.
            </p>
          </div>
        </div>

        {/* Coin Flip Section */}
        <div className="rounded-2xl border-2 border-slate-900 bg-slate-50 p-6 text-center space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          
          {/* Animated Coin */}
          <div className="flex justify-center py-4">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-900 bg-yellow-400 text-slate-900 font-black text-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-transform ${
                flipping ? 'animate-spin' : 'hover:scale-105'
              }`}
            >
              {flipping ? (
                <span className="text-xs font-black uppercase text-slate-900">Spins...</span>
              ) : flippedResult ? (
                <span className="text-xs font-black uppercase p-2 leading-tight text-slate-900">{flippedResult}</span>
              ) : (
                <span className="text-2xl font-black uppercase">TOSS</span>
              )}
            </div>
          </div>

          {!flippedResult && !flipping && (
            <p className="text-xs font-semibold text-slate-700">
              Click below to toss the decision coin. As it spins, notice which option you are secretly hoping it lands on.
            </p>
          )}

          {flippedResult && !flipping && (
            <div className="rounded-xl bg-yellow-300 border-2 border-slate-900 p-3 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <span className="text-xs font-black uppercase text-slate-900">The Coin Landed On:</span>
              <div className="text-lg font-black uppercase text-slate-900 mt-0.5">{flippedResult}</div>
            </div>
          )}

          <button
            onClick={handleFlipCoin}
            disabled={flipping}
            className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase px-5 py-2.5 text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 stroke-[2.5] ${flipping ? 'animate-spin' : ''}`} />
            <span>{flipping ? 'Flipping Coin...' : 'Flip Virtual Coin'}</span>
          </button>

        </div>

        {/* Gut Alignment Reflection */}
        <div className="mt-6 space-y-3">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
            How do you feel about the AI recommendation?
          </label>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setGutFeedback('relieved')}
              className={`flex flex-col items-center justify-center rounded-xl p-3 border-2 border-slate-900 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                gutFeedback === 'relieved'
                  ? 'bg-emerald-300 text-slate-900'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smile className="h-5 w-5 mb-1 stroke-[2.5]" />
              <span>Relieved</span>
            </button>

            <button
              onClick={() => setGutFeedback('neutral')}
              className={`flex flex-col items-center justify-center rounded-xl p-3 border-2 border-slate-900 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                gutFeedback === 'neutral'
                  ? 'bg-blue-300 text-slate-900'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Meh className="h-5 w-5 mb-1 stroke-[2.5]" />
              <span>Neutral</span>
            </button>

            <button
              onClick={() => setGutFeedback('disappointed')}
              className={`flex flex-col items-center justify-center rounded-xl p-3 border-2 border-slate-900 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                gutFeedback === 'disappointed'
                  ? 'bg-rose-300 text-slate-900'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Frown className="h-5 w-5 mb-1 stroke-[2.5]" />
              <span>Disappointed</span>
            </button>
          </div>

          {gutFeedback === 'disappointed' && (
            <div className="rounded-xl bg-rose-100 border-2 border-slate-900 p-3 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              💡 <strong>Insight:</strong> Feeling disappointed proves your gut prefers another choice! Go back to the factor sliders and increase the weight of personal preference or gut alignment until your true choice leads.
            </div>
          )}

          {gutFeedback === 'relieved' && (
            <div className="rounded-xl bg-emerald-100 border-2 border-slate-900 p-3 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              🎉 <strong>Insight:</strong> Your intuition and mathematical criteria are in complete agreement! Proceed with high conviction.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2 text-xs font-black uppercase text-white hover:bg-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
