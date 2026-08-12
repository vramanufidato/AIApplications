import React, { useState } from "react";
import { ProductInput, PresetProduct } from "../types";
import { PRESET_PRODUCTS } from "../data/presets";
import { Sparkles, Wand2, Lightbulb, Box, Tag, Palette, ShieldAlert } from "lucide-react";

interface ProductFormProps {
  onSubmit: (input: ProductInput) => void;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProductInput>({
    productName: "Obsidian Glass Water Bottle",
    productDescription:
      "Minimalist Obsidian Glass Water Bottle. Matte black finish with a singular brushed gold band. Shot in high-contrast studio lighting. Zero environmental clutter. Focus on texture and form.",
    category: "Luxury Goods & Hydration",
    vibe: "High-Contrast Studio, Minimalist, Pure Dark Glass & Brushed Gold",
    targetAudience: "Discerning luxury aesthetic enthusiasts and collectors",
    signatureColors: "Matte Black, Obsidian Translucent Glass, Brushed Gold (#d4af37)",
    keyFeatures: "Precision glass bevels, singular gold band accent, zero plastic",
  });

  const handleSelectPreset = (preset: PresetProduct) => {
    setFormData({
      productName: preset.productName,
      productDescription: preset.productDescription,
      category: preset.category,
      vibe: preset.vibe,
      targetAudience: preset.targetAudience,
      signatureColors: preset.signatureColors,
      keyFeatures: preset.keyFeatures,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.productDescription.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Step 1: Product Definition</span>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-white uppercase font-sans">
            Product Vision & Specification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Describe your product to generate a brand blueprint and multi-medium renderings (strictly 0% humans).
          </p>
        </div>

        {/* Quick Preset Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-neutral-900 border border-white/20 px-3 py-1.5 rounded-sm">
          <Lightbulb className="h-4 w-4 text-white" />
          <span className="font-mono text-[10px] uppercase tracking-wider">Presets Available</span>
        </div>
      </div>

      {/* Preset Buttons Bar */}
      <div className="mb-6">
        <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold font-mono">
          Try a Design Preset:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESET_PRODUCTS.map((preset) => {
            const isSelected = formData.productName === preset.productName;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-sm border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-neutral-900 border-white text-white"
                    : "bg-[#070707] border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                }`}
              >
                <div>
                  <div className="text-xs font-medium truncate text-white uppercase tracking-tight">{preset.productName.split("|")[0].trim()}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.tagline}</div>
                </div>
                <div className="mt-2 text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">
                  {preset.category.split(" ")[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-bold font-mono flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5 text-slate-300" />
              <span>Product Name & Title *</span>
            </label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="e.g. Obsidian Glass Water Bottle"
              className="w-full bg-neutral-900 border border-white/10 focus:border-white/40 rounded-sm px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-bold font-mono flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-300" />
              <span>Product Category</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Luxury Goods, Hydration"
              className="w-full bg-neutral-900 border border-white/10 focus:border-white/40 rounded-sm px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans"
            />
          </div>
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-bold font-mono">
            Detailed Physical & Visual Description *
          </label>
          <textarea
            required
            rows={3}
            value={formData.productDescription}
            onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
            placeholder="Minimalist Obsidian Glass Water Bottle. Matte black finish with a singular brushed gold band. Shot in high-contrast studio lighting..."
            className="w-full bg-neutral-900 border border-white/10 focus:border-white/40 rounded-sm px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition resize-none font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aesthetic Vibe */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-bold font-mono">
              Brand Aesthetic / Vibe
            </label>
            <input
              type="text"
              value={formData.vibe}
              onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
              placeholder="e.g. Minimalist, High-Contrast Studio"
              className="w-full bg-neutral-900 border border-white/10 focus:border-white/40 rounded-sm px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans"
            />
          </div>

          {/* Signature Colors */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-bold font-mono flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-slate-300" />
              <span>Signature Colors</span>
            </label>
            <input
              type="text"
              value={formData.signatureColors}
              onChange={(e) => setFormData({ ...formData, signatureColors: e.target.value })}
              placeholder="e.g. Matte Black, Brushed Gold"
              className="w-full bg-neutral-900 border border-white/10 focus:border-white/40 rounded-sm px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans"
            />
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 font-bold font-mono">
              Key Design Details
            </label>
            <input
              type="text"
              value={formData.keyFeatures}
              onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
              placeholder="e.g. Glass bevels, singular gold band"
              className="w-full bg-neutral-900 border border-white/10 focus:border-white/40 rounded-sm px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans"
            />
          </div>
        </div>

        {/* Mandatory Constraint Notice */}
        <div className="flex items-center gap-2 bg-[#070707] border border-white/10 rounded-sm p-3 text-xs text-slate-400 font-mono">
          <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white uppercase">Consistency Guarantee:</strong> Nano-Banana prompt rules strictly enforced: NO PEOPLE, NO HUMANS, NO HANDS.
          </span>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-black px-6 py-3 text-xs font-bold rounded-sm uppercase tracking-widest transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Wand2 className="h-4 w-4 animate-spin text-black" />
                <span>Generating Blueprint & Master Hero...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 text-black" />
                <span>GENERATE BRAND BLUEPRINT & MASTER HERO</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
