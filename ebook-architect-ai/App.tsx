
import React, { useState } from 'react';
import InputForm from './components/InputForm';
import EbookViewer from './components/EbookViewer';
import { EbookConfig, EbookData, AppStatus, Chapter } from './types';
import { generateEbookOutline, generateChapterContent, generateImage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.CONFIGURING);
  const [config, setConfig] = useState<EbookConfig | null>(null);
  const [ebook, setEbook] = useState<EbookData | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleStart = async (newConfig: EbookConfig) => {
    setConfig(newConfig);
    setStatus(AppStatus.GENERATING_OUTLINE);
    
    try {
      // 1. Generate Outline
      const outline = await generateEbookOutline(newConfig);
      setEbook(outline);
      setProgress({ current: 0, total: outline.chapters.length });
      setStatus(AppStatus.GENERATING_CHAPTERS);

      // 2. Generate Chapters iteratively
      const fullChapters: Chapter[] = [];
      for (let i = 0; i < outline.chapters.length; i++) {
        // Increment progress at the start of chapter generation for accurate UI reporting
        setProgress({ current: i + 1, total: outline.chapters.length });
        
        const c = outline.chapters[i];
        
        // Generate Content
        const contentData = await generateChapterContent(
          newConfig, 
          c.title, 
          c.description || "", 
          outline.title
        );

        // Generate Image if enabled
        let imageUrl: string | undefined;
        if (newConfig.generateImages) {
          imageUrl = await generateImage(contentData.imagePrompt);
        }

        fullChapters.push({
          ...c,
          content: contentData.content,
          imagePrompt: contentData.imagePrompt,
          imageCaption: contentData.imageCaption,
          imageUrl,
          proTips: contentData.proTips
        });
        
        // Update local state to reflect partially completed eBook
        setEbook(prev => prev ? { ...prev, chapters: [...fullChapters] } : null);
      }

      setStatus(AppStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  };

  const renderContent = () => {
    switch (status) {
      case AppStatus.CONFIGURING:
        return <InputForm onStart={handleStart} isLoading={false} />;
      
      case AppStatus.GENERATING_OUTLINE:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-pulse mb-8">
              <div className="w-24 h-24 bg-slate-900 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 serif mb-2">Laying the Foundations</h2>
            <p className="text-slate-500">The Architect AI is structuring your chapters and defining the roadmap...</p>
          </div>
        );

      case AppStatus.GENERATING_CHAPTERS:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
              <div 
                className="bg-slate-900 h-full transition-all duration-500" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 serif mb-2">Building Content</h2>
            <p className="text-slate-500 mb-8">
              Writing Chapter {progress.current} of {progress.total}: {ebook?.chapters[progress.current - 1]?.title}
            </p>
            <div className="flex gap-2">
              {[...Array(progress.total)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < progress.current ? 'bg-slate-900' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        );

      case AppStatus.COMPLETED:
        return ebook && config ? <EbookViewer data={ebook} author={config.authorName} /> : null;

      case AppStatus.ERROR:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Construction Interrupted</h2>
            <p className="text-slate-600 mb-8">An error occurred while building your eBook. Please try again.</p>
            <button 
              onClick={() => setStatus(AppStatus.CONFIGURING)}
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold"
            >
              Restart Blueprint
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 pb-20">
      {/* Navbar */}
      <nav className="no-print bg-white border-b border-slate-200 py-4 px-6 mb-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-white font-bold">EA</div>
          <span className="text-xl font-bold text-slate-900 serif tracking-tight">Ebook Architect AI</span>
        </div>
        {status === AppStatus.COMPLETED && (
          <button 
            onClick={() => setStatus(AppStatus.CONFIGURING)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Start New Project
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 mt-20 pt-10 pb-20 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} Ebook Architect AI. Professional Book Design Engine.
      </footer>
    </div>
  );
};

export default App;
