import React, { useState } from "react";
import { MediumConfig } from "../types";
import { X, Plus, Sparkles } from "lucide-react";

interface CustomMediumModalProps {
  onAdd: (config: MediumConfig) => void;
  onClose: () => void;
}

export const CustomMediumModal: React.FC<CustomMediumModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "3:4" | "9:16" | "4:3">("16:9");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;

    const id = `custom-${Date.now()}`;
    onAdd({
      id,
      name,
      aspectRatio,
      description: description || `Custom medium: ${name}`,
      prompt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-sm max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-neutral-900 rounded-sm hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-white" />
          <h3 className="text-lg font-medium uppercase tracking-tight text-white">Add Custom Medium</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Imagine your product in any custom setting or advertising channel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-1">Medium Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Airport Arrival Canopy, Taxi Roof Box"
              className="w-full bg-neutral-900 border border-white/10 focus:border-white rounded-sm px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/10 focus:border-white rounded-sm px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono cursor-pointer uppercase"
              >
                <option value="16:9">16:9 Widescreen</option>
                <option value="3:4">3:4 Vertical</option>
                <option value="1:1">1:1 Square</option>
                <option value="9:16">9:16 Fullscreen</option>
                <option value="4:3">4:3 Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High traffic terminal display"
                className="w-full bg-neutral-900 border border-white/10 focus:border-white rounded-sm px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-1">Medium Scenario Prompt *</label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe placing the product into this custom setting. Reminder: 'NO PEOPLE' rule is automatically attached."
              className="w-full bg-neutral-900 border border-white/10 focus:border-white rounded-sm px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase text-slate-300 bg-neutral-900 hover:bg-neutral-800 rounded-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-white hover:bg-slate-200 text-black rounded-sm transition cursor-pointer flex items-center gap-1.5 uppercase tracking-widest"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medium</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
