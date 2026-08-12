import React, { useState } from "react";
import { NanoBananaModel } from "../types";
import { RefreshCw, Eye, Edit3, CheckCircle, ShieldCheck, Download, Copy, AlertCircle } from "lucide-react";

interface MasterHeroCardProps {
  imageUrl?: string;
  masterPrompt: string;
  status: "idle" | "generating" | "completed" | "error";
  errorMessage?: string;
  selectedModel: NanoBananaModel;
  modelUsed?: string;
  wasModelFallback?: boolean;
  onRegenerate: (customPrompt?: string) => void;
  onOpenZoom: (url: string, title: string) => void;
  isFallback?: boolean;
  warning?: string;
}

export const MasterHeroCard: React.FC<MasterHeroCardProps> = ({
  imageUrl,
  masterPrompt,
  status,
  errorMessage,
  selectedModel,
  modelUsed,
  wasModelFallback,
  onRegenerate,
  onOpenZoom,
  isFallback,
  warning,
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(masterPrompt);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSavePromptAndRegenerate = () => {
    setIsEditingPrompt(false);
    onRegenerate(editedPrompt);
  };

  const displayModelName = (m?: string) => {
    if (!m) return selectedModel;
    if (m.includes("lite")) return "Nano-Banana Lite";
    if (m.includes("flash-image")) return "Nano-Banana Pro";
    if (m.includes("imagen")) return "Imagen 3.0";
    if (m.includes("vector")) return "Vector SVG";
    return m;
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
              Step 2: Foundational Hero Product Shot (1:1)
            </span>
          </div>
          <h3 className="text-lg font-medium tracking-tight text-white uppercase mt-0.5">
            Master Reference Asset
          </h3>
          <p className="text-xs text-slate-400">
            Anchors product visual identity, silhouette, and materials across all medium shots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {wasModelFallback ? (
            <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1">
              <span>Quota Fallback Model: {displayModelName(modelUsed)}</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono bg-neutral-900 text-slate-300 border border-white/20 px-2.5 py-1 rounded-sm uppercase tracking-widest">
              Model: {displayModelName(modelUsed || selectedModel)}
            </span>
          )}
          <span className="text-[10px] font-mono bg-neutral-900 text-slate-300 border border-white/20 px-2.5 py-1 rounded-sm flex items-center gap-1 uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>0% Humans Guard</span>
          </span>
        </div>
      </div>

      {warning && (
        <div className="mb-4 bg-neutral-900 border border-amber-500/40 p-3 rounded-sm text-xs text-amber-200 font-mono flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Master Image Display Frame (1:1) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[380px] rounded-sm bg-[#070707] border border-white/10 overflow-hidden group shadow-2xl flex items-center justify-center">
            {status === "generating" ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                  Rendering Master Hero Asset...
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Applying material textures, lighting & 0% human guard...
                </p>
              </div>
            ) : status === "error" ? (
              <div className="p-6 text-center text-rose-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-500" />
                <div className="text-xs font-bold uppercase tracking-wider font-mono">Master Generation Error</div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{errorMessage || "Failed to render image."}</p>
                <button
                  onClick={() => onRegenerate()}
                  className="mt-4 text-xs bg-neutral-900 hover:bg-neutral-800 text-slate-200 border border-white/20 px-3 py-1.5 rounded-sm transition cursor-pointer font-mono uppercase"
                >
                  Retry Master Shot
                </button>
              </div>
            ) : imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Master Hero Product Shot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => onOpenZoom(imageUrl, "Master Hero Product Asset")}
                    className="p-2.5 rounded-sm bg-black border border-white/20 text-white hover:bg-white hover:text-black transition cursor-pointer"
                    title="Zoom & Inspect Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <a
                    href={imageUrl}
                    download="master-hero-product.png"
                    className="p-2.5 rounded-sm bg-black border border-white/20 text-white hover:bg-white hover:text-black transition cursor-pointer"
                    title="Download Master Image"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>

                <div className="absolute bottom-2 left-2 bg-black/80 text-[9px] text-white font-mono px-2 py-0.5 rounded-sm border border-white/20 uppercase tracking-widest">
                  {isFallback ? "ELEGANT VECTOR MOCKUP" : "MASTER HERO REF (1:1)"}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-600 font-mono uppercase">No master shot generated yet</div>
            )}
          </div>
        </div>

        {/* Right: Master Prompt Details & Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div className="bg-[#070707] border border-white/10 rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Master Prompt Specification
              </span>
              <button
                onClick={handleCopyPrompt}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
              >
                {copiedPrompt ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedPrompt ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {isEditingPrompt ? (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/20 focus:border-white rounded-sm p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingPrompt(false)}
                    className="text-xs px-3 py-1.5 rounded-sm bg-neutral-900 hover:bg-neutral-800 text-slate-300 cursor-pointer font-mono uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePromptAndRegenerate}
                    className="text-xs px-3 py-1.5 rounded-sm bg-white text-black font-bold hover:bg-slate-200 cursor-pointer uppercase tracking-wider"
                  >
                    Save & Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-neutral-900 p-3 rounded-sm border border-white/10">
                {masterPrompt}
              </p>
            )}
          </div>

          {/* Prompt Edit & Regenerate Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setEditedPrompt(masterPrompt);
                setIsEditingPrompt(!isEditingPrompt);
              }}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 px-3 py-2 rounded-sm border border-white/10 transition cursor-pointer font-mono uppercase"
            >
              <Edit3 className="h-3.5 w-3.5 text-white" />
              <span>{isEditingPrompt ? "Hide Prompt Editor" : "Tweak Master Prompt"}</span>
            </button>

            <button
              onClick={() => onRegenerate()}
              disabled={status === "generating"}
              className="text-xs font-bold bg-white hover:bg-slate-200 disabled:opacity-50 text-black px-4 py-2 rounded-sm transition flex items-center gap-1.5 cursor-pointer uppercase tracking-widest"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${status === "generating" ? "animate-spin" : ""}`} />
              <span>Regenerate Master Asset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
