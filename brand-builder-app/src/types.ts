export type NanoBananaModel =
  | "gemini-3.1-flash-lite-image"
  | "gemini-3.1-flash-image"
  | "imagen-3.0-generate-002";

export interface VisualIdentity {
  materials: string;
  colorPalette: string[];
  packagingFormFactor: string;
  signatureMark: string;
}

export interface MediumConfig {
  id: string;
  name: string;
  aspectRatio: "1:1" | "16:9" | "3:4" | "9:16" | "4:3";
  description: string;
  prompt: string;
}

export interface BrandBlueprint {
  brandConcept: string;
  tagline: string;
  visualIdentity: VisualIdentity;
  masterPrompt: string;
  mediums: MediumConfig[];
  modelUsed?: string;
  wasModelFallback?: boolean;
  modelWarning?: string;
}

export interface MediumShotState {
  id: string;
  config: MediumConfig;
  imageUrl?: string;
  promptUsed?: string;
  status: "idle" | "generating" | "completed" | "error";
  errorMessage?: string;
  isFallback?: boolean;
  modelUsed?: string;
  wasModelFallback?: boolean;
  warning?: string;
}

export interface ProductInput {
  productName: string;
  productDescription: string;
  category: string;
  vibe: string;
  targetAudience: string;
  signatureColors: string;
  keyFeatures: string;
}

export interface PresetProduct extends ProductInput {
  id: string;
  iconName: string;
  tagline: string;
}
