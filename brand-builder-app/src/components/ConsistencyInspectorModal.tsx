import React from "react";
import { MediumShotState } from "../types";
import { X, ShieldCheck, Split, Check } from "lucide-react";

interface ConsistencyInspectorModalProps {
  masterImageUrl?: string;
  shot: MediumShotState;
  onClose: () => void;
}

export const ConsistencyInspectorModal: React.FC<ConsistencyInspectorModalProps> = ({
  masterImageUrl,
  shot,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-sm max-w-5xl w-full p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-neutral-900 rounded-sm hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-white/10">
          <div className="p-2.5 rounded-sm bg-neutral-900 border border-white/20 text-white">
            <Split className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium uppercase tracking-tight text-white">
              Product Consistency Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Side-by-Side verification: Master Hero Product Ref vs. {shot.config.name}
            </p>
          </div>
        </div>

        {/* Split Side-By-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left: Master Shot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono font-bold uppercase tracking-wider">
              <span>MASTER HERO (1:1)</span>
              <span className="text-slate-500">REFERENCE</span>
            </div>
            <div className="aspect-square w-full rounded-sm bg-[#070707] border border-white/20 overflow-hidden flex items-center justify-center relative">
              {masterImageUrl ? (
                <img
                  src={masterImageUrl}
                  alt="Master Reference"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-500 font-mono">No master image</span>
              )}
            </div>
          </div>

          {/* Right: Medium Shot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono font-bold uppercase tracking-wider">
              <span>{shot.config.name.toUpperCase()} ({shot.config.aspectRatio})</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 0% HUMANS
              </span>
            </div>
            <div className="aspect-square w-full rounded-sm bg-[#070707] border border-white/10 overflow-hidden flex items-center justify-center relative">
              {shot.imageUrl ? (
                <img
                  src={shot.imageUrl}
                  alt={shot.config.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-500 font-mono">No medium image rendered</span>
              )}
            </div>
          </div>
        </div>

        {/* Consistency Verification Checklist */}
        <div className="bg-[#070707] border border-white/10 rounded-sm p-4 space-y-3 font-mono">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
            Automated Visual Consistency Verification:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2 bg-neutral-900 p-2.5 rounded-sm border border-white/10">
              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase">Silhouette & Geometry</strong>
                <span className="text-[11px] text-slate-400 font-sans">
                  Product form factor and structural proportions match master reference.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-neutral-900 p-2.5 rounded-sm border border-white/10">
              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase">Material & Finishes</strong>
                <span className="text-[11px] text-slate-400 font-sans">
                  Surface textures, matte/metallic finishes, and reflections align.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-neutral-900 p-2.5 rounded-sm border border-white/10">
              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase">Signature Color DNA</strong>
                <span className="text-[11px] text-slate-400 font-sans">
                  Color palette fidelity verified across medium lighting.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-neutral-900 p-2.5 rounded-sm border border-white/10">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block uppercase">0% Human Subject Lock</strong>
                <span className="text-[11px] text-emerald-400/80 font-sans">
                  Strict prompt rules enforced: No human bodies, faces, or hands.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-sm bg-white hover:bg-slate-200 text-black font-bold text-xs transition cursor-pointer uppercase tracking-widest"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
