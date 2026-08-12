import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * High quality SVG product mockup generator used as a fallback when API quota is exceeded.
 */
function generateFallbackSvgImage(
  title: string,
  mediumName: string = "Hero Product",
  aspectRatio: string = "1:1",
  promptText: string = ""
): string {
  let width = 800;
  let height = 800;

  if (aspectRatio === "16:9") {
    width = 1280;
    height = 720;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  }

  const cleanTitle = (title || "OBSIDIAN").toUpperCase().slice(0, 28);
  const isNewspaper = mediumName.toLowerCase().includes("newspaper");
  const isBillboard = mediumName.toLowerCase().includes("billboard");
  const isSubway = mediumName.toLowerCase().includes("subway");

  let svgContent = "";

  if (isNewspaper) {
    // Newspaper aesthetic (Editorial parchment background)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <linearGradient id="newsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4f1ea"/>
          <stop offset="100%" stop-color="#e8e3d8"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#newsGrad)"/>
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#111" stroke-width="2"/>
      <text x="${width / 2}" y="70" font-family="serif" font-size="28" font-weight="900" text-anchor="middle" fill="#111" letter-spacing="2">THE DAILY CHRONICLE</text>
      <line x1="40" y1="85" x2="${width - 40}" y2="85" stroke="#111" stroke-width="3"/>
      <text x="40" y="110" font-family="serif" font-size="12" font-style="italic" fill="#333">SPECIAL LUXURY EDITION — PRODUCT SHOWCASE</text>
      
      <!-- Product Bottle/Obelisk in Newspaper photo frame -->
      <rect x="${width / 4}" y="140" width="${width / 2}" height="${height * 0.45}" fill="#0a0a0a" rx="4"/>
      <!-- Bottle silhouette -->
      <rect x="${width / 2 - 35}" y="180" width="70" height="${height * 0.3}" fill="#1a1a1a" stroke="#ffffff" stroke-width="1.5" rx="4"/>
      <rect x="${width / 2 - 35}" y="220" width="70" height="6" fill="#d4af37"/>
      <text x="${width / 2}" y="320" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">${cleanTitle}</text>

      <!-- Headline and article lines -->
      <text x="40" y="${height * 0.68}" font-family="serif" font-size="20" font-weight="bold" fill="#111">${cleanTitle}: REDEFINING ELEGANCE</text>
      <rect x="40" y="${height * 0.72}" width="${width - 80}" height="2" fill="#111"/>
      
      <g fill="#444">
        <rect x="40" y="${height * 0.76}" width="${(width - 100) / 2}" height="6" rx="2"/>
        <rect x="40" y="${height * 0.76 + 12}" width="${(width - 100) / 2}" height="6" rx="2"/>
        <rect x="40" y="${height * 0.76 + 24}" width="${(width - 100) / 2 - 40}" height="6" rx="2"/>
        
        <rect x="${width / 2 + 10}" y="${height * 0.76}" width="${(width - 100) / 2}" height="6" rx="2"/>
        <rect x="${width / 2 + 10}" y="${height * 0.76 + 12}" width="${(width - 100) / 2}" height="6" rx="2"/>
        <rect x="${width / 2 + 10}" y="${height * 0.76 + 24}" width="${(width - 100) / 2 - 20}" height="6" rx="2"/>
      </g>
      <text x="${width - 40}" y="${height - 30}" font-family="monospace" font-size="10" fill="#666" text-anchor="end">VECTOR MOCKUP (QUOTA SAFE)</text>
    </svg>`;
  } else if (isBillboard) {
    // Widescreen dark urban billboard
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050505"/>
          <stop offset="50%" stop-color="#121212"/>
          <stop offset="100%" stop-color="#070707"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#d4af37"/>
          <stop offset="50%" stop-color="#f3e5ab"/>
          <stop offset="100%" stop-color="#aa820a"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      <rect width="${width}" height="${height}" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.1"/>
      
      <!-- Spotlight effects -->
      <polygon points="100,0 200,${height} 0,${height}" fill="#ffffff" opacity="0.03"/>
      <polygon points="${width - 100},0 ${width},${height} ${width - 300},${height}" fill="#ffffff" opacity="0.03"/>

      <!-- Center Product Vessel -->
      <g transform="translate(${width * 0.28}, ${height * 0.15})">
        <rect x="0" y="0" width="${width * 0.18}" height="${height * 0.7}" fill="#0f0f0f" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2" rx="12"/>
        <rect x="0" y="${height * 0.25}" width="${width * 0.18}" height="8" fill="url(#goldGrad)"/>
        <circle cx="${width * 0.09}" cy="${height * 0.45}" r="24" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.8"/>
      </g>

      <!-- Typography -->
      <text x="${width * 0.55}" y="${height * 0.42}" font-family="sans-serif" font-size="42" font-weight="200" fill="#ffffff" letter-spacing="8">${cleanTitle}</text>
      <text x="${width * 0.55}" y="${height * 0.54}" font-family="sans-serif" font-size="16" font-weight="600" fill="#d4af37" letter-spacing="6">PURE. UNFILTERED. ELEGANCE.</text>
      <rect x="${width * 0.55}" y="${height * 0.60}" width="160" height="1" fill="#ffffff" opacity="0.3"/>
      <text x="${width * 0.55}" y="${height * 0.68}" font-family="monospace" font-size="11" fill="#888888" letter-spacing="3">AVAILABLE AUTUMN 2026</text>

      <rect x="30" y="${height - 40}" width="140" height="20" fill="#151515" rx="4" stroke="#ffffff" stroke-opacity="0.1"/>
      <text x="40" y="${height - 26}" font-family="monospace" font-size="9" fill="#d4af37">HIGHWAY BILLBOARD</text>
    </svg>`;
  } else {
    // Default Elegant Dark Studio Asset (1:1 / Square / Vertical)
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <radialGradient id="studioGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#1f1f1f"/>
          <stop offset="60%" stop-color="#0a0a0a"/>
          <stop offset="100%" stop-color="#040404"/>
        </radialGradient>
        <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f3e5ab"/>
          <stop offset="50%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#8a6d10"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#studioGlow)"/>
      <rect x="16" y="16" width="${width - 32}" height="${height - 32}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" rx="8"/>

      <!-- Pedestal Platform -->
      <ellipse cx="${width / 2}" cy="${height * 0.78}" rx="${width * 0.3}" ry="${height * 0.08}" fill="#111111" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5"/>
      <ellipse cx="${width / 2}" cy="${height * 0.78}" rx="${width * 0.22}" ry="${height * 0.05}" fill="#1a1a1a" stroke="#d4af37" stroke-dasharray="4 4" stroke-opacity="0.4"/>

      <!-- Minimalist Sculptural Product Object -->
      <g transform="translate(${width / 2 - width * 0.12}, ${height * 0.22})">
        <!-- Main Form -->
        <rect x="0" y="0" width="${width * 0.24}" height="${height * 0.52}" fill="#0d0d0d" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2" rx="12"/>
        <!-- Gold Band Accent -->
        <rect x="0" y="${height * 0.18}" width="${width * 0.24}" height="10" fill="url(#goldAccent)"/>
        <!-- Glass Cap / Top -->
        <rect x="${width * 0.06}" y="-20" width="${width * 0.12}" height="20" fill="#1e1e1e" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5" rx="4"/>
        <!-- Monogram -->
        <circle cx="${width * 0.12}" cy="${height * 0.33}" r="18" fill="none" stroke="#d4af37" stroke-width="1.5"/>
        <text x="${width * 0.12}" y="${height * 0.33 + 4}" font-family="serif" font-size="12" font-weight="bold" fill="#d4af37" text-anchor="middle">A</text>
      </g>

      <!-- Overlay Text -->
      <text x="${width / 2}" y="${height * 0.88}" font-family="sans-serif" font-size="18" font-weight="300" fill="#ffffff" text-anchor="middle" letter-spacing="6">${cleanTitle}</text>
      <text x="${width / 2}" y="${height * 0.93}" font-family="monospace" font-size="10" fill="#d4af37" text-anchor="middle" letter-spacing="2">${mediumName.toUpperCase()} • ELEGANT DARK MOCKUP</text>
    </svg>`;
  }

  const base64 = Buffer.from(svgContent).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

const app = express();
app.use(express.json({ limit: "50mb" }));

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiKeyConfigured: !!process.env.GEMINI_API_KEY });
});

/**
 * Text blueprint generator with automatic model fallback on quota / rate limit errors.
 */
async function generateBlueprintWithFallback(ai: GoogleGenAI, userPrompt: string, systemInstruction: string) {
  const candidateTextModels = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  for (const model of candidateTextModels) {
    try {
      console.log(`[Blueprint Generation] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandConcept: { type: Type.STRING, description: "Core brand vision and visual identity concept" },
              tagline: { type: Type.STRING, description: "Memorable tagline" },
              visualIdentity: {
                type: Type.OBJECT,
                properties: {
                  materials: { type: Type.STRING, description: "Primary materials, textures and surface finishes" },
                  colorPalette: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of 3-5 color hex codes or exact color names",
                  },
                  packagingFormFactor: { type: Type.STRING, description: "Geometric shape, silhouette and structure" },
                  signatureMark: { type: Type.STRING, description: "Emblem, typography or logo mark description" },
                },
                required: ["materials", "colorPalette", "packagingFormFactor", "signatureMark"],
              },
              masterPrompt: {
                type: Type.STRING,
                description: "Detailed prompt for generating the core Studio Master Hero Product shot (1:1). Must state NO PEOPLE.",
              },
              mediums: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique string key like billboard, newspaper, social, magazine, subway, storefront, packaging" },
                    name: { type: Type.STRING, description: "Display name of medium" },
                    aspectRatio: { type: Type.STRING, description: "Aspect ratio string: '16:9', '3:4', '1:1', '9:16'" },
                    description: { type: Type.STRING, description: "Brief medium context explanation" },
                    prompt: { type: Type.STRING, description: "Specific prompt placing the exact product in this medium. MUST specify NO PEOPLE." },
                  },
                  required: ["id", "name", "aspectRatio", "description", "prompt"],
                },
              },
            },
            required: ["brandConcept", "tagline", "visualIdentity", "masterPrompt", "mediums"],
          },
        },
      });

      if (response.text) {
        const blueprint = JSON.parse(response.text);
        const wasFallback = model !== "gemini-3.6-flash";
        blueprint.modelUsed = model;
        blueprint.wasModelFallback = wasFallback;
        if (wasFallback) {
          blueprint.modelWarning = `Primary model gemini-3.6-flash quota exceeded. Successfully generated blueprint using fallback model ${model}.`;
        }
        return blueprint;
      }
    } catch (err: any) {
      console.warn(`[Blueprint Generation] Model ${model} failed:`, err.message || err);
    }
  }

  throw new Error("Failed to generate brand blueprint across all text models. Please check API key quota.");
}

interface ImageFallbackOptions {
  ai: GoogleGenAI;
  requestedModel: string;
  prompt: string;
  parts?: any[];
  aspectRatio: string;
  productName?: string;
  mediumName?: string;
}

/**
 * Image generator with automatic model fallback (trying requested model -> alternative Gemini/Imagen models -> vector SVG fallback).
 */
async function generateImageWithModelFallback({
  ai,
  requestedModel,
  prompt,
  parts,
  aspectRatio,
  productName = "Product",
  mediumName = "Hero Product",
}: ImageFallbackOptions) {
  const allModels = [
    requestedModel,
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
    "imagen-3.0-generate-002",
    "gemini-2.5-flash",
  ];
  const candidateModels = Array.from(new Set(allModels));

  for (const model of candidateModels) {
    try {
      console.log(`[Image Generation] Trying model: ${model}`);
      let imageUrl = "";

      if (model.startsWith("imagen-")) {
        const response = await ai.models.generateImages({
          model: model,
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/png",
            aspectRatio: aspectRatio as any,
          },
        });
        if (response.generatedImages?.[0]?.image?.imageBytes) {
          imageUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
        }
      } else {
        const contentsPayload = parts && parts.length > 0 ? { parts } : { parts: [{ text: prompt }] };
        const response = await ai.models.generateContent({
          model: model,
          contents: contentsPayload,
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || "image/png";
              imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      }

      if (imageUrl) {
        const wasModelFallback = model !== requestedModel;
        return {
          imageUrl,
          modelUsed: model,
          wasModelFallback,
          warning: wasModelFallback
            ? `Quota or limit exceeded on requested model (${requestedModel}). Successfully generated image using fallback model (${model}).`
            : undefined,
          isFallback: false,
        };
      }
    } catch (err: any) {
      console.warn(`[Image Generation] Model ${model} failed:`, err.message || err);
    }
  }

  console.warn(`[Image Generation] All candidate models (${candidateModels.join(", ")}) failed. Using SVG vector fallback.`);
  const fallbackUrl = generateFallbackSvgImage(productName, mediumName, aspectRatio, prompt);
  return {
    imageUrl: fallbackUrl,
    modelUsed: "vector-svg-fallback",
    wasModelFallback: true,
    isFallback: true,
    warning: `Quota exceeded across all AI image models (${candidateModels.join(", ")}). Generated an Elegant Dark vector mockup.`,
  };
}

// Generate Brand Blueprint and Prompts for Mediums
app.post("/api/brand/blueprint", async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      category,
      vibe,
      targetAudience,
      signatureColors,
      keyFeatures,
    } = req.body;

    if (!productName || !productDescription) {
      return res.status(400).json({ error: "Product name and description are required." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a world-class creative brand director and industrial product designer.
Your goal is to generate a comprehensive visual brand strategy and tailored prompts for imaging a product across diverse mediums.
CRITICAL MANDATE:
1. NO PEOPLE or human bodies/hands/faces are allowed in ANY shot or prompt.
2. The product must be the sole visual hero.
3. Every prompt MUST include explicit instructions: "NO PEOPLE, NO HUMANS, NO HANDS, NO FACES, object photography only".
4. Ensure extreme product consistency (color palette, materials, geometry, typography/logo placement, aesthetic vibe) across all medium prompts.`;

    const userPrompt = `Product Name: ${productName}
Description: ${productDescription}
Category: ${category || "Consumer Product"}
Brand Vibe/Aesthetic: ${vibe || "Modern, Sleek, Premium"}
Target Audience: ${targetAudience || "General discerning consumers"}
Signature Colors: ${signatureColors || "Clean neutral palette with bold accents"}
Key Features: ${keyFeatures || "High quality design, signature silhouette"}

Generate a full brand blueprint including a Master Hero Product Shot prompt and prompts for 7 distinct mediums:
1. Billboard (High impact urban highway / city skyline display, 16:9)
2. Newspaper (Retro or modern editorial black/white print advertisement in a realistic newspaper, 3:4)
3. Social Post (Clean Instagram/Pinterest square aesthetic lifestyle showcase on a styled pedestal/flatlay, 1:1)
4. Magazine Ad (Glossy luxury print spread with elegant typography frame, 3:4)
5. Subway Poster (Transit station backlit poster frame on sleek tile wall, 9:16)
6. Storefront Window (High-end boutique display window with ambient glass reflections and spotlighting, 16:9)
7. Minimal Product Box / Packaging (Unboxing setup with minimal matte packaging craft box and foam insert, 1:1)

Remember: STRICTLY NO PEOPLE IN ANY PROMPT.`;

    const blueprint = await generateBlueprintWithFallback(ai, userPrompt, systemInstruction);
    res.json(blueprint);
  } catch (error: any) {
    console.error("Error generating brand blueprint:", error);
    res.status(500).json({ error: error.message || "Failed to generate brand blueprint." });
  }
});

// Generate Master Hero Product Image using Nano-Banana with Model Fallback
app.post("/api/brand/generate-master", async (req, res) => {
  const { prompt, model = "gemini-3.1-flash-lite-image", productName = "Product" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const strictPrompt = `${prompt}. Commercial studio product photography, pristine lighting, crisp details, hyper-realistic, strictly NO PEOPLE, NO HUMANS, NO FACES, NO HANDS.`;

  try {
    const ai = getGenAI();
    const result = await generateImageWithModelFallback({
      ai,
      requestedModel: model,
      prompt: strictPrompt,
      aspectRatio: "1:1",
      productName,
      mediumName: "Master Hero Product",
    });

    res.json({
      imageUrl: result.imageUrl,
      promptUsed: strictPrompt,
      modelUsed: result.modelUsed,
      wasModelFallback: result.wasModelFallback,
      isFallback: result.isFallback,
      warning: result.warning,
    });
  } catch (error: any) {
    console.error("Error generating master product image:", error);
    res.status(500).json({ error: error.message || "Failed to generate master product image." });
  }
});

// Generate Medium Shot using Nano-Banana image-to-image with Model Fallback
app.post("/api/brand/generate-medium", async (req, res) => {
  const {
    prompt,
    aspectRatio = "1:1",
    masterImageData,
    model = "gemini-3.1-flash-lite-image",
    productName = "Product",
    mediumName = "Medium Shot",
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const parts: any[] = [];

  if (masterImageData && !masterImageData.startsWith("data:image/svg+xml")) {
    const cleanBase64 = masterImageData.replace(/^data:image\/[a-z]+;base64,/, "");
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: "image/png",
      },
    });
  }

  const strictPrompt = masterImageData
    ? `Maintain the exact product design, silhouette, color scheme, materials, and branding from the provided reference image. Place this exact product into the following medium setting: ${prompt}. Professional advertisement photography, perfect perspective, NO PEOPLE, NO HUMANS, NO FACES, NO HANDS.`
    : `${prompt}. Commercial advertisement photography, NO PEOPLE, NO HUMANS, NO FACES, NO HANDS.`;

  parts.push({ text: strictPrompt });

  try {
    const ai = getGenAI();
    const result = await generateImageWithModelFallback({
      ai,
      requestedModel: model,
      prompt: strictPrompt,
      parts,
      aspectRatio,
      productName,
      mediumName,
    });

    res.json({
      imageUrl: result.imageUrl,
      promptUsed: strictPrompt,
      modelUsed: result.modelUsed,
      wasModelFallback: result.wasModelFallback,
      isFallback: result.isFallback,
      warning: result.warning,
    });
  } catch (error: any) {
    console.error("Error generating medium shot:", error);
    res.status(500).json({ error: error.message || "Failed to generate medium shot." });
  }
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Brand Builder Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
