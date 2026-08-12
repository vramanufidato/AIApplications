import React, { useState } from "react";
import { MediumShotState } from "../types";
import {
  RefreshCw,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  SlidersHorizontal,
  Split,
  Maximize2,
} from "lucide-react";

interface MediumCardProps {
  shot: MediumShotState;
  onGenerate: (id: string, customPrompt?: string) => void;
  onInspectConsistency: (shot: MediumShotState) => void;
  onOpenZoom: (url: string, title: string) => void;
  isMasterAvailable: boolean;
}

export const MediumCard: React.FC<MediumCardProps> = ({
  shot,
  onGenerate,
  onInspectConsistency,
  onOpenZoom,
  isMasterAvailable,
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(shot.config.prompt);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(shot.promptUsed || shot.config.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleRegenerateWithPrompt = () => {
    setIsEditingPrompt(false);
    onGenerate(shot.id, editedPrompt);
  };

  const getAspectRatioClass = (ar: string) => {
    switch (ar) {
      case "16:9":
        return "aspect-video";
      case "3:4":
        return "aspect-[3/4]";
      case "9:16":
        return "aspect-[9/16]";
      case "4:3":
        return "aspect-[4/3]";
      case "1:1":
      default:
        return "aspect-square";
    }
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/10 hover:border-white/20 rounded-sm p-4 transition-all shadow-xl flex flex-col justify-between group font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium uppercase tracking-tight text-white group-hover:text-slate-200 transition-colors">
            {shot.config.name}
          </h4>

          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-900 text-slate-300 border border-white/20 uppercase">
            {shot.config.aspectRatio}
          </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-1 mb-3 font-sans">
          {shot.config.description}
        </p>

        {/* Media Frame */}
        <div
          className={`relative w-full ${getAspectRatioClass(
            shot.config.aspectRatio
          )} rounded-sm bg-[#070707] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner`}
        >
          {shot.status === "generating" ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2" />
              <div className="text-xs font-mono uppercase tracking-widest text-white">
                Rendering Medium...
              </div>
            </div>
          ) : shot.status === "error" ? (
            <div className="p-4 text-center text-rose-400 font-mono">
              <AlertCircle className="h-6 w-6 mx-auto mb-1 text-rose-500" />
              <div className="text-xs font-bold uppercase tracking-wider">Render Error</div>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                {shot.errorMessage || "Generation failed"}
              </p>
              <button
                onClick={() => onGenerate(shot.id)}
                className="mt-2 text-[10px] bg-neutral-900 hover:bg-neutral-800 text-slate-200 border border-white/20 px-2.5 py-1 rounded-sm transition cursor-pointer uppercase"
              >
                Retry Shot
              </button>
            </div>
          ) : shot.imageUrl ? (
            <>
              <img
                src={shot.imageUrl}
                alt={shot.config.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Actions Bar */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  onClick={() => onOpenZoom(shot.imageUrl!, shot.config.name)}
                  className="p-2 rounded-sm bg-black border border-white/20 text-white hover:bg-white hover:text-black transition cursor-pointer"
                  title="Fullscreen Preview"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {isMasterAvailable && (
                  <button
                    onClick={() => onInspectConsistency(shot)}
                    className="p-2 rounded-sm bg-black border border-white/20 text-white hover:bg-white hover:text-black transition cursor-pointer"
                    title="Inspect Product Consistency"
                  >
                    <Split className="h-4 w-4" />
                  </button>
                )}

                <a
                  href={shot.imageUrl}
                  download={`brand-medium-${shot.id}.png`}
                  className="p-2 rounded-sm bg-black border border-white/20 text-white hover:bg-white hover:text-black transition cursor-pointer"
                  title="Download Image"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>

              <div className="absolute bottom-1.5 left-1.5 flex flex-wrap gap-1">
                <div className="bg-black/80 text-[8px] font-mono text-emerald-400 px-1.5 py-0.5 rounded-sm border border-white/20 uppercase tracking-widest">
                  {shot.isFallback ? "ELEGANT VECTOR" : "0% HUMANS"}
                </div>
                {shot.wasModelFallback && shot.modelUsed && (
                  <div className="bg-amber-950/90 text-[8px] font-mono text-amber-300 px-1.5 py-0.5 rounded-sm border border-amber-500/40 uppercase tracking-widest" title={`Fell back to ${shot.modelUsed} due to quota limit`}>
                    FALLBACK: {shot.modelUsed.replace("gemini-", "").replace("-image", "")}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <span className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-widest">Ready to Render</span>
              <button
                onClick={() => onGenerate(shot.id)}
                disabled={!isMasterAvailable}
                className="text-xs font-bold bg-white text-black hover:bg-slate-200 px-3 py-1.5 rounded-sm transition cursor-pointer disabled:opacity-40 uppercase tracking-wider"
              >
                Render Shot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
        {/* Toggle Prompt Editor */}
        {isEditingPrompt ? (
          <div className="space-y-1.5 bg-[#070707] p-2 rounded-sm border border-white/10">
            <textarea
              rows={3}
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full bg-neutral-900 border border-white/20 focus:border-white rounded-sm p-1.5 text-[10px] text-slate-200 focus:outline-none font-mono"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsEditingPrompt(false)}
                className="text-[10px] px-2 py-1 bg-neutral-900 text-slate-300 rounded-sm cursor-pointer font-mono uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateWithPrompt}
                className="text-[10px] font-bold px-2 py-1 bg-white text-black rounded-sm hover:bg-slate-200 cursor-pointer uppercase tracking-wider"
              >
                Render Custom
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 font-mono">
            <button
              onClick={() => setIsEditingPrompt(true)}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
            >
              <SlidersHorizontal className="h-3 w-3 text-slate-300" />
              <span>Edit Prompt</span>
            </button>

            <button
              onClick={handleCopyPrompt}
              className="hover:text-white flex items-center gap-1 cursor-pointer"
              title="Copy Prompt"
            >
              {copiedPrompt ? (
                <CheckCircle className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={() => onGenerate(shot.id)}
            disabled={shot.status === "generating" || !isMasterAvailable}
            className={`w-full py-2 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-40 ${
              shot.status === "completed"
                ? "bg-neutral-900 hover:bg-neutral-800 text-slate-200 border border-white/20"
                : "bg-white hover:bg-slate-200 text-black"
            }`}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                shot.status === "generating" ? "animate-spin" : ""
              }`}
            />
            <span>
              {shot.status === "completed"
                ? "Regenerate"
                : shot.status === "generating"
                ? "Rendering..."
                : "Render Medium"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
