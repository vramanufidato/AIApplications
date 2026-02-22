
import React from 'react';
import { EbookData, Chapter } from '../types';

interface Props {
  data: EbookData;
  author: string;
}

const EbookViewer: React.FC<Props> = ({ data, author }) => {
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      alert("Print blocked. If you are using an AI Preview, try opening the app in a new tab or deploying it to Netlify.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="no-print sticky top-4 mb-8 flex justify-end z-10">
        <button
          onClick={handlePrint}
          className="bg-slate-900 text-white px-6 py-2 rounded-full shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export as PDF
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-sm p-12 md:p-24 min-h-[11in]">
        {/* Title Page */}
        <div className="text-center h-full flex flex-col justify-center py-20 border-b border-slate-100">
          <h1 className="text-6xl font-bold serif mb-6 text-slate-900 leading-tight uppercase tracking-widest">{data.title}</h1>
          <div className="h-1 w-24 bg-slate-900 mx-auto mb-8"></div>
          <p className="text-2xl text-slate-600 mb-12 italic">By</p>
          <p className="text-3xl font-semibold tracking-wide text-slate-800 uppercase">{author}</p>
          <div className="mt-32 text-slate-400 text-sm">
            Ebook Architect AI | © {new Date().getFullYear()}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="page-break py-20 min-h-[50vh]">
          <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest text-slate-800">Legal Disclaimer</h2>
          <div className="text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-6">
            {data.disclaimer}
          </div>
        </div>

        {/* Table of Contents */}
        <div className="page-break py-20">
          <h2 className="text-3xl font-bold mb-12 text-slate-900 serif">Table of Contents</h2>
          <nav className="space-y-4">
            {data.chapters.map((chapter, idx) => (
              <a 
                key={chapter.id} 
                href={`#chapter-${chapter.id}`}
                className="flex items-center group"
              >
                <span className="text-slate-400 font-mono text-sm mr-4">0{idx + 1}</span>
                <span className="text-lg text-slate-800 font-medium group-hover:text-blue-600 transition-colors">{chapter.title}</span>
                <div className="flex-grow border-b border-dotted border-slate-200 mx-4"></div>
                <span className="text-slate-400 font-mono text-sm">Page {idx * 5 + 4}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Chapters */}
        {data.chapters.map((chapter, idx) => (
          <div key={chapter.id} id={`chapter-${chapter.id}`} className="page-break py-20">
            <div className="mb-12">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-sm">Chapter 0{idx + 1}</span>
              <h2 className="text-4xl font-bold text-slate-900 serif mt-2">{chapter.title}</h2>
            </div>

            {chapter.imageUrl && (
              <div className="mb-12">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img src={chapter.imageUrl} alt={chapter.imageCaption || chapter.title} className="w-full h-auto object-cover" />
                </div>
                {chapter.imageCaption && (
                  <div className="mt-4 text-center text-sm text-slate-500 italic font-medium">
                    {chapter.imageCaption}
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-slate max-w-none text-slate-700 leading-loose text-lg whitespace-pre-wrap">
              {chapter.content}
            </div>

            {chapter.proTips && chapter.proTips.length > 0 && (
              <div className="mt-12 space-y-4">
                {chapter.proTips.map((tip, tIdx) => (
                  <div key={tIdx} className="pro-tip">
                    <span className="font-bold text-blue-700 uppercase text-xs block mb-1">PRO TIP</span>
                    <p className="text-slate-800">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* About the Author */}
        <div className="page-break py-20 border-t border-slate-100">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 serif">About the Author</h2>
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-32 h-32 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center text-4xl text-slate-400 font-bold">
              {author.charAt(0)}
            </div>
            <div className="text-slate-600 leading-loose text-lg italic">
              {data.aboutAuthor}
            </div>
          </div>
          <div className="mt-20 text-center text-slate-400 text-sm italic">
            This eBook was architected with precision using Ebook Architect AI.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookViewer;
