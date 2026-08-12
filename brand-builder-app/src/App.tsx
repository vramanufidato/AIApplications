import React, { useState } from "react";
import {
  BrandBlueprint,
  MediumShotState,
  NanoBananaModel,
  ProductInput,
  MediumConfig,
} from "./types";
import { Header } from "./components/Header";
import { ProductForm } from "./components/ProductForm";
import { BrandBlueprintCard } from "./components/BrandBlueprintCard";
import { MasterHeroCard } from "./components/MasterHeroCard";
import { MediumsGallery } from "./components/MediumsGallery";
import { ConsistencyInspectorModal } from "./components/ConsistencyInspectorModal";
import { CustomMediumModal } from "./components/CustomMediumModal";
import { ZoomModal } from "./components/ZoomModal";
import { ExportModal } from "./components/ExportModal";

export default function App() {
  const [selectedModel, setSelectedModel] = useState<NanoBananaModel>(
    "gemini-3.1-flash-lite-image"
  );
  const [productInput, setProductInput] = useState<ProductInput | null>(null);
  const [blueprint, setBlueprint] = useState<BrandBlueprint | null>(null);

  const [masterHero, setMasterHero] = useState<{
    imageUrl?: string;
    prompt: string;
    status: "idle" | "generating" | "completed" | "error";
    errorMessage?: string;
    isFallback?: boolean;
    modelUsed?: string;
    wasModelFallback?: boolean;
    warning?: string;
  }>({
    prompt: "",
    status: "idle",
  });

  const [mediumShots, setMediumShots] = useState<MediumShotState[]>([]);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

  // Modals
  const [zoomTarget, setZoomTarget] = useState<{ url: string; title: string } | null>(null);
  const [consistencyTarget, setConsistencyTarget] = useState<MediumShotState | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Step 1: Submit Product Form & Generate Brand Blueprint + Master Shot
  const handleProductSubmit = async (input: ProductInput) => {
    setProductInput(input);
    setIsGeneratingBlueprint(true);
    setBlueprint(null);
    setMasterHero({ prompt: "", status: "idle" });
    setMediumShots([]);

    try {
      const res = await fetch("/api/brand/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate brand blueprint.");
      }

      const data: BrandBlueprint = await res.json();
      setBlueprint(data);

      // Initialize medium shots
      const initialShots: MediumShotState[] = data.mediums.map((m) => ({
        id: m.id,
        config: m,
        status: "idle",
      }));
      setMediumShots(initialShots);

      // Trigger Master Hero Shot generation
      generateMasterHero(data.masterPrompt);
    } catch (err: any) {
      console.error("Blueprint generation error:", err);
      alert(err.message || "Failed to generate brand blueprint. Please verify API key configuration.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Generate Master Hero Product Image
  const generateMasterHero = async (promptToUse?: string) => {
    const prompt = promptToUse || masterHero.prompt || blueprint?.masterPrompt;
    if (!prompt) return;

    setMasterHero({ prompt, status: "generating" });

    try {
      const res = await fetch("/api/brand/generate-master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Master image generation failed.");
      }

      const data = await res.json();
      setMasterHero({
        prompt: data.promptUsed || prompt,
        imageUrl: data.imageUrl,
        status: "completed",
        isFallback: data.isFallback,
        modelUsed: data.modelUsed,
        wasModelFallback: data.wasModelFallback,
        warning: data.warning,
      });
    } catch (err: any) {
      console.error("Master Hero error:", err);
      setMasterHero({
        prompt,
        status: "error",
        errorMessage: err.message || "Failed to render Master Hero shot.",
      });
    }
  };

  // Generate Individual Medium Shot
  const handleGenerateSingleMedium = async (id: string, customPrompt?: string) => {
    setMediumShots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "generating", errorMessage: undefined } : s))
    );

    const shot = mediumShots.find((s) => s.id === id);
    if (!shot) return;

    const prompt = customPrompt || shot.config.prompt;

    try {
      const res = await fetch("/api/brand/generate-medium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio: shot.config.aspectRatio,
          masterImageData: masterHero.imageUrl,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Medium shot generation failed.");
      }

      const data = await res.json();
      setMediumShots((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "completed",
                imageUrl: data.imageUrl,
                promptUsed: data.promptUsed || prompt,
                isFallback: data.isFallback,
                modelUsed: data.modelUsed,
                wasModelFallback: data.wasModelFallback,
                warning: data.warning,
              }
            : s
        )
      );
    } catch (err: any) {
      console.error(`Error generating medium ${id}:`, err);
      setMediumShots((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "error", errorMessage: err.message || "Failed to render shot." }
            : s
        )
      );
    }
  };

  // Batch Generate All Medium Shots
  const handleGenerateAllMediums = async () => {
    if (isBatchGenerating || !masterHero.imageUrl) return;
    setIsBatchGenerating(true);

    for (const shot of mediumShots) {
      await handleGenerateSingleMedium(shot.id);
    }

    setIsBatchGenerating(false);
  };

  // Add Custom Medium
  const handleAddCustomMedium = (config: MediumConfig) => {
    const newShot: MediumShotState = {
      id: config.id,
      config,
      status: "idle",
    };
    setMediumShots((prev) => [newShot, ...prev]);
    setIsCustomModalOpen(false);

    // If master hero is ready, auto generate the new custom medium
    if (masterHero.imageUrl) {
      setTimeout(() => {
        handleGenerateSingleMedium(config.id);
      }, 300);
    }
  };

  const handleResetSession = () => {
    if (confirm("Start a new product session? Current generated assets will be cleared.")) {
      setProductInput(null);
      setBlueprint(null);
      setMasterHero({ prompt: "", status: "idle" });
      setMediumShots([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-white selection:text-black">
      {/* Navigation Header */}
      <Header
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onOpenExport={() => setIsExportModalOpen(true)}
        onReset={handleResetSession}
        hasBlueprint={!!blueprint}
        isGeneratingAny={
          isGeneratingBlueprint ||
          masterHero.status === "generating" ||
          isBatchGenerating ||
          mediumShots.some((s) => s.status === "generating")
        }
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Step 1: Product Definition Form */}
        <ProductForm onSubmit={handleProductSubmit} isLoading={isGeneratingBlueprint} />

        {/* Brand Blueprint Section */}
        {blueprint && productInput && (
          <div className="space-y-8">
            <BrandBlueprintCard blueprint={blueprint} productInput={productInput} />

            {/* Step 2: Foundational Master Shot */}
            <MasterHeroCard
              imageUrl={masterHero.imageUrl}
              masterPrompt={masterHero.prompt || blueprint.masterPrompt}
              status={masterHero.status}
              errorMessage={masterHero.errorMessage}
              selectedModel={selectedModel}
              modelUsed={masterHero.modelUsed}
              wasModelFallback={masterHero.wasModelFallback}
              onRegenerate={generateMasterHero}
              onOpenZoom={(url, title) => setZoomTarget({ url, title })}
              isFallback={masterHero.isFallback}
              warning={masterHero.warning}
            />

            {/* Step 3: Mediums Showcase Gallery */}
            <MediumsGallery
              shots={mediumShots}
              onGenerateSingle={handleGenerateSingleMedium}
              onGenerateAll={handleGenerateAllMediums}
              onOpenAddCustom={() => setIsCustomModalOpen(true)}
              onInspectConsistency={(shot) => setConsistencyTarget(shot)}
              onOpenZoom={(url, title) => setZoomTarget({ url, title })}
              isMasterAvailable={masterHero.status === "completed" && !!masterHero.imageUrl}
              isBatchGenerating={isBatchGenerating}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {zoomTarget && (
        <ZoomModal
          imageUrl={zoomTarget.url}
          title={zoomTarget.title}
          onClose={() => setZoomTarget(null)}
        />
      )}

      {consistencyTarget && (
        <ConsistencyInspectorModal
          masterImageUrl={masterHero.imageUrl}
          shot={consistencyTarget}
          onClose={() => setConsistencyTarget(null)}
        />
      )}

      {isCustomModalOpen && (
        <CustomMediumModal
          onAdd={handleAddCustomMedium}
          onClose={() => setIsCustomModalOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          blueprint={blueprint || undefined}
          productInput={productInput || undefined}
          masterImageUrl={masterHero.imageUrl}
          shots={mediumShots}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
