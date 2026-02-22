
import { GoogleGenAI, Type } from "@google/genai";
import { EbookConfig, EbookData } from "../types";

// Service to interact with Google Gemini API for ebook generation
export const generateEbookOutline = async (config: EbookConfig): Promise<EbookData> => {
  // Always use direct process.env.API_KEY when initializing GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

  const systemInstruction = `You are the "Ebook Architect AI," a world-class book designer. 
  Create a detailed structure for an eBook based on the topic: "${config.topic}".
  The book should be targeted for approximately ${config.pageCount} pages.
  Tone: ${config.tone}.
  Author: ${config.authorName}.
  Return the response in a structured JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: "Generate a professional title, a formal disclaimer, and a list of 5-8 chapter titles with short descriptions of what each should cover.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          disclaimer: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "title", "description"]
            }
          },
          aboutAuthor: { type: Type.STRING }
        },
        required: ["title", "disclaimer", "chapters", "aboutAuthor"]
      }
    }
  });

  // Extract text output directly from the response object
  if (!response.text) throw new Error("Failed to generate outline.");
  return JSON.parse(response.text.trim());
};

export const generateChapterContent = async (
  config: EbookConfig,
  chapterTitle: string,
  chapterDescription: string,
  bookTitle: string
): Promise<{ content: string; imagePrompt: string; imageCaption: string; proTips: string[] }> => {
  // Always use direct process.env.API_KEY when initializing GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

  const prompt = `Write a deep-dive chapter for the eBook "${bookTitle}".
  Chapter Title: "${chapterTitle}"
  Context: ${chapterDescription}
  Target: High-quality, practical, sellable content.
  Tone: ${config.tone}.
  Include: 
  1. Detailed body text in Markdown.
  2. 2-3 "Pro Tips".
  3. A detailed image generation prompt for a realistic high-resolution photo relevant to this chapter. Format: [IMAGE PROMPT: Realistic, high-resolution, [Subject] related to [Chapter], cinematic lighting, 8k, professional photography style].
  4. A short, professional, reader-friendly caption or title for this image (e.g., "Figure 1: The Essential Tools of [Topic]"). DO NOT include any technical prompt engineering keywords in the caption.
  
  Format your response strictly as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The full chapter content in Markdown" },
          imagePrompt: { type: Type.STRING, description: "The technical AI generation prompt" },
          imageCaption: { type: Type.STRING, description: "A reader-friendly title or description for the image" },
          proTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["content", "imagePrompt", "imageCaption", "proTips"]
      }
    }
  });

  // Extract text output directly from the response object
  if (!response.text) throw new Error("Failed to generate chapter content.");
  return JSON.parse(response.text.trim());
};

export const generateImage = async (prompt: string): Promise<string | undefined> => {
  // Always use direct process.env.API_KEY when initializing GoogleGenAI
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
      }
    });

    // Iterate through all parts to find the image part as per guidelines
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return undefined;
};
