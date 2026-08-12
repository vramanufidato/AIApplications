import React, { useState } from "react";
import { BrandBlueprint, MediumShotState, ProductInput } from "../types";
import { X, Download, FileText, CheckCircle2, Copy } from "lucide-react";

interface ExportModalProps {
  blueprint?: BrandBlueprint;
  productInput?: ProductInput;
  masterImageUrl?: string;
  shots: MediumShotState[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  blueprint,
  productInput,
  masterImageUrl,
  shots,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const completedShots = shots.filter((s) => s.status === "completed");

  const generateMarkdownReport = () => {
    if (!blueprint || !productInput) return "";

    return `# BRAND BOOK & MULTI-MEDIUM CAMPAIGN SPECIFICATION
## ${productInput.productName}
Tagline: "${blueprint.tagline}"

---

### 1. BRAND IDENTITY & VISUAL DNA
- **Brand Concept**: ${blueprint.brandConcept}
- **Category**: ${productInput.category}
- **Aesthetic Vibe**: ${productInput.vibe}
- **Materials & Finishes**: ${blueprint.visualIdentity.materials}
- **Color Palette**: ${blueprint.visualIdentity.colorPalette.join(", ")}
- **Form Factor & Geometry**: ${blueprint.visualIdentity.packagingFormFactor}
- **Emblem / Signature Mark**: ${blueprint.visualIdentity.signatureMark}

---

### 2. CONSISTENCY & PROMPT RULES
- **Nano-Banana Model Constraint**: Strictly 0% Humans / No People in any images.
- **Master Hero Product Shot Prompt**:
> ${blueprint.masterPrompt}

---

### 3. RENDERED MEDIUM SHOTS (${completedShots.length} Completed)
${completedShots
  .map(
    (shot) => `#### ${shot.config.name} (${shot.config.aspectRatio})
- **Description**: ${shot.config.description}
- **Prompt**: ${shot.promptUsed || shot.config.prompt}
`
  )
  .join("\n")}
`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const markdown = generateMarkdownReport();
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${productInput?.productName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-brand-book.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-sm max-w-3xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-neutral-900 rounded-sm hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-white/10">
          <div className="p-2.5 rounded-sm bg-neutral-900 border border-white/20 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium uppercase tracking-tight text-white">Export Brand Kit & Campaign Spec</h3>
            <p className="text-xs text-slate-400">
              Download the complete Markdown brand spec or copy prompts for production usage.
            </p>
          </div>
        </div>

        {/* Report Overview Card */}
        <div className="bg-[#070707] border border-white/10 rounded-sm p-4 mb-5 font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Brand Book Markdown Preview
            </span>
            <button
              onClick={handleCopyReport}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </button>
          </div>

          <pre className="text-xs text-slate-300 font-mono bg-neutral-900 p-3 rounded-sm border border-white/10 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {generateMarkdownReport()}
          </pre>
        </div>

        {/* Download Action */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono uppercase text-slate-300 bg-neutral-900 hover:bg-neutral-800 rounded-sm transition cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-6 py-2.5 text-xs font-bold bg-white hover:bg-slate-200 text-black rounded-sm transition flex items-center gap-2 cursor-pointer uppercase tracking-widest"
          >
            <Download className="h-4 w-4" />
            <span>Download Brand Book (.md)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
