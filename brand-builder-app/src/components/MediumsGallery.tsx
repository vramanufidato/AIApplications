import React, { useState } from "react";
import { MediumShotState } from "../types";
import { MediumCard } from "./MediumCard";
import { Wand2, Plus, ShieldCheck } from "lucide-react";

interface MediumsGalleryProps {
  shots: MediumShotState[];
  onGenerateSingle: (id: string, customPrompt?: string) => void;
  onGenerateAll: () => void;
  onOpenAddCustom: () => void;
  onInspectConsistency: (shot: MediumShotState) => void;
  onOpenZoom: (url: string, title: string) => void;
  isMasterAvailable: boolean;
  isBatchGenerating: boolean;
}

export const MediumsGallery: React.FC<MediumsGalleryProps> = ({
  shots,
  onGenerateSingle,
  onGenerateAll,
  onOpenAddCustom,
  onInspectConsistency,
  onOpenZoom,
  isMasterAvailable,
  isBatchGenerating,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const completedCount = shots.filter((s) => s.status === "completed").length;
  const totalCount = shots.length;

  const filteredShots = shots.filter((shot) => {
    if (filterCategory === "all") return true;
    const id = shot.id.toLowerCase();
    if (filterCategory === "outdoor") return id.includes("billboard") || id.includes("subway") || id.includes("storefront");
    if (filterCategory === "print") return id.includes("newspaper") || id.includes("magazine") || id.includes("packaging");
    if (filterCategory === "digital") return id.includes("social") || id.includes("web");
    if (filterCategory === "custom") return !["billboard", "newspaper", "social", "magazine", "subway", "storefront", "packaging"].includes(id);
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls Bar */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-sm p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
              Step 3: Multi-Medium Campaign Showcase
            </span>
          </div>
          <h3 className="text-lg font-medium tracking-tight text-white uppercase mt-0.5">
            Multi-Medium Product Renderings
          </h3>
          <p className="text-xs text-slate-400">
            Render your product across billboards, newspaper print ads, subway transit frames, and social feeds with guaranteed 0% humans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Progress Pill */}
          <div className="text-xs bg-neutral-900 border border-white/20 px-3 py-2 rounded-sm flex items-center gap-2 font-mono uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-slate-300">
              Rendered: <strong className="text-white">{completedCount}</strong>/{totalCount} Shots
            </span>
          </div>

          {/* Add Custom Medium */}
          <button
            onClick={onOpenAddCustom}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 text-slate-200 border border-white/20 px-3.5 py-2 rounded-sm transition flex items-center gap-1.5 cursor-pointer uppercase font-mono tracking-wider"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Add Custom Medium</span>
          </button>

          {/* Batch Generate Button */}
          <button
            onClick={onGenerateAll}
            disabled={isBatchGenerating || !isMasterAvailable}
            className="text-xs font-bold bg-white hover:bg-slate-200 text-black px-5 py-2.5 rounded-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-widest"
          >
            <Wand2 className={`h-4 w-4 ${isBatchGenerating ? "animate-spin" : ""}`} />
            <span>
              {isBatchGenerating ? "Batch Rendering..." : "GENERATE ALL MEDIUMS"}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 bg-[#0d0d0d] p-1 rounded-sm border border-white/10">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
              filterCategory === "all"
                ? "bg-white text-black font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({shots.length})
          </button>
          <button
            onClick={() => setFilterCategory("outdoor")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
              filterCategory === "outdoor"
                ? "bg-white text-black font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Urban & Outdoor
          </button>
          <button
            onClick={() => setFilterCategory("print")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
              filterCategory === "print"
                ? "bg-white text-black font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Print & Editorial
          </button>
          <button
            onClick={() => setFilterCategory("digital")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
              filterCategory === "digital"
                ? "bg-white text-black font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Digital & Social
          </button>
          <button
            onClick={() => setFilterCategory("custom")}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
              filterCategory === "custom"
                ? "bg-white text-black font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Custom
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>0% Human Constraint Active</span>
        </div>
      </div>

      {/* Medium Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredShots.map((shot) => (
          <MediumCard
            key={shot.id}
            shot={shot}
            onGenerate={onGenerateSingle}
            onInspectConsistency={onInspectConsistency}
            onOpenZoom={onOpenZoom}
            isMasterAvailable={isMasterAvailable}
          />
        ))}
      </div>
    </div>
  );
};
