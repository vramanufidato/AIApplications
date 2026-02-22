
import React, { useState } from 'react';
import { EbookConfig } from '../types';

interface Props {
  onStart: (config: EbookConfig) => void;
  isLoading: boolean;
}

const InputForm: React.FC<Props> = ({ onStart, isLoading }) => {
  const [config, setConfig] = useState<EbookConfig>({
    topic: '',
    pageCount: 35,
    tone: 'Professional & Educational',
    authorName: '',
    generateImages: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.topic || !config.authorName) return;
    onStart(config);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 serif">Architect Your Masterpiece</h2>
        <p className="text-slate-500 mt-2">Provide the blueprint for your high-quality eBook.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Topic / Niche</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Passive Income with AI, Modern Interior Design, Vegan Keto for Athletes"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Page Count (Approx)</label>
            <input
              type="number"
              min="10"
              max="100"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.pageCount}
              onChange={(e) => setConfig({ ...config, pageCount: parseInt(e.target.value) || 30 })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Author Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. John Doe"
              value={config.authorName}
              onChange={(e) => setConfig({ ...config, authorName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tone & Style</label>
          <select
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={config.tone}
            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
          >
            <option>Professional & Educational</option>
            <option>Conversational & Relatable</option>
            <option>Technical & Exhaustive</option>
            <option>Inspirational & Motivational</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <p className="font-semibold text-slate-900">Include AI-Generated Visuals</p>
            <p className="text-xs text-slate-500">Generate realistic photos for each chapter.</p>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, generateImages: !config.generateImages })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.generateImages ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.generateImages ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Architecting...
            </>
          ) : 'Generate Ebook'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
