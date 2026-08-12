import React from "react";
import { BrandBlueprint, ProductInput } from "../types";
import { Sparkles, Palette, Layers, Bookmark, CheckCircle2, FileText } from "lucide-react";

interface BrandBlueprintCardProps {
  blueprint: BrandBlueprint;
  productInput: ProductInput;
}

export const BrandBlueprintCard: React.FC<BrandBlueprintCardProps> = ({ blueprint, productInput }) => {
  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-sm p-6 shadow-xl relative overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>AI Brand Identity Blueprint</span>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-white uppercase flex items-center gap-2">
            <span>{productInput.productName}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {blueprint.wasModelFallback ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>Quota Fallback Model ({blueprint.modelUsed})</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-neutral-900 border border-white/20 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Brand DNA Active ({blueprint.modelUsed || "gemini-3.6-flash"})</span>
            </div>
          )}
        </div>
      </div>

      {blueprint.modelWarning && (
        <div className="mb-4 bg-neutral-900 border border-amber-500/40 p-3 rounded-sm text-xs text-amber-200 font-mono flex items-center gap-2">
          <span>⚠️ {blueprint.modelWarning}</span>
        </div>
      )}

      {/* Tagline & Concept Banner */}
      <div className="mb-6 bg-[#070707] border border-white/10 rounded-sm p-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono font-bold mb-1">
          Brand Tagline
        </div>
        <div className="text-xl font-light tracking-tight text-white italic">
          "{blueprint.tagline}"
        </div>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
          {blueprint.brandConcept}
        </p>
      </div>

      {/* Visual Identity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Materials & Texture */}
        <div className="bg-neutral-900 border border-white/10 rounded-sm p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-200" />
            <span>Materials & Finishes</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {blueprint.visualIdentity.materials}
          </p>
        </div>

        {/* Color Palette Swatches */}
        <div className="bg-neutral-900 border border-white/10 rounded-sm p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-2">
            <Palette className="h-3.5 w-3.5 text-slate-200" />
            <span>Color Palette</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {blueprint.visualIdentity.colorPalette.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-[#070707] border border-white/10 px-2 py-1 rounded-sm text-[10px] text-slate-200 font-mono"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                  style={{ backgroundColor: color.startsWith("#") ? color : "#d4af37" }}
                />
                <span>{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging Form Factor */}
        <div className="bg-neutral-900 border border-white/10 rounded-sm p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            <Bookmark className="h-3.5 w-3.5 text-slate-200" />
            <span>Silhouette & Form</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {blueprint.visualIdentity.packagingFormFactor}
          </p>
        </div>

        {/* Signature Mark */}
        <div className="bg-neutral-900 border border-white/10 rounded-sm p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-200" />
            <span>Emblem & Mark</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {blueprint.visualIdentity.signatureMark}
          </p>
        </div>
      </div>
    </div>
  );
};
