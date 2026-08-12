import React from "react";
import { X, Download, ShieldCheck } from "lucide-react";

interface ZoomModalProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ imageUrl, title, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 font-sans">
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-[#0d0d0d] border border-white/10 rounded-sm overflow-hidden shadow-2xl p-4">
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium uppercase tracking-tight text-white">{title}</h3>
            <span className="text-[10px] font-mono bg-neutral-900 text-emerald-400 border border-white/20 px-2 py-0.5 rounded-sm flex items-center gap-1 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              <span>0% HUMANS</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download={`${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-200 text-black font-bold text-xs rounded-sm transition flex items-center gap-1 cursor-pointer uppercase tracking-widest"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Asset</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-neutral-900 rounded-sm hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-sm bg-[#070707] border border-white/10 p-2">
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] w-auto object-contain rounded-sm shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};
