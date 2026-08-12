import React from "react";
import { NanoBananaModel } from "../types";
import { ShieldCheck, Cpu, Download, RefreshCw } from "lucide-react";

interface HeaderProps {
  selectedModel: NanoBananaModel;
  onModelChange: (model: NanoBananaModel) => void;
  onOpenExport: () => void;
  onReset: () => void;
  hasBlueprint: boolean;
  isGeneratingAny: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onModelChange,
  onOpenExport,
  onReset,
  hasBlueprint,
  isGeneratingAny,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f] border-b border-white/10 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm shrink-0">
            <div className="w-4 h-4 bg-black rotate-45"></div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-medium tracking-tight text-white uppercase font-sans">
                BRAND BUILDER
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-900 text-slate-300 border border-white/20 uppercase tracking-widest">
                ELEGANT DARK
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Medium Product Visualization & Consistency Engine
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* No People Guarantee Badge */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-sm font-mono uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>0% Humans Guard</span>
          </div>

          {/* Nano-Banana / Imagen Model Selector */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/20 rounded-sm px-3 py-1.5 text-xs text-white">
            <Cpu className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value as NanoBananaModel)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1 font-mono uppercase"
              title="Select Image Generation Model (Auto-Fallback Enabled)"
            >
              <option value="gemini-3.1-flash-lite-image" className="bg-[#0f0f0f] text-white">
                Nano-Banana Lite (Fast)
              </option>
              <option value="gemini-3.1-flash-image" className="bg-[#0f0f0f] text-white">
                Nano-Banana Pro (Hi-Res)
              </option>
              <option value="imagen-3.0-generate-002" className="bg-[#0f0f0f] text-white">
                Imagen 3.0 Studio
              </option>
            </select>
          </div>

          {/* Actions */}
          {hasBlueprint && (
            <>
              <button
                onClick={onOpenExport}
                className="bg-white hover:bg-slate-200 text-black px-4 py-2 text-xs font-bold rounded-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Brand Kit</span>
              </button>

              <button
                onClick={onReset}
                disabled={isGeneratingAny}
                className="bg-neutral-900 hover:bg-neutral-800 text-slate-300 border border-white/20 px-3 py-2 text-xs font-semibold rounded-sm uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                title="Start a new product session"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Product</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
