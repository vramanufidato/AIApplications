import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * YoutubeArchitect Pro - Logic Engine with Gemini Integration
 */

export const generateAIBleuprint = async (topic, apiKey) => {
  if (!apiKey) {
    throw new Error("Gemini API Key is required for high-fidelity orchestration. Please enter it in the Settings.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Role: Long-Form YouTube Architect.
    Topic: ${topic}
    Objective: Create a 10-minute (1,500 words) video orchestration for a CapCut Free Tier target.

    Output the following EXPLICITLY in JSON format:
    {
      "chapters": [
        {
          "id": 1,
          "title": "...",
          "timestamp": "00:00",
          "script": "approx 300 words...",
          "imagePrompts": ["12 detailed Leonardo.ai prompts for 16:9 ratio..."],
          "videoPrompts": ["3 detailed 5s hero video clips for CapCut Veo/Seedance..."]
        },
        ... (Total 5 chapters)
      ],
      "seo": {
        "titles": ["3 options <70 chars"],
        "tags": ["20 relevant long-tail tags"],
        "summary": "500-word SEO summary"
      }
    }

    Constraints:
    - Total script word count must be ~1,500 words across 5 chapters.
    - 60 total image prompts (12 per chapter).
    - 12 total hero video prompts.
    - Maintain consistent tone and hero reference image logic.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Use regex to find JSON if Gemini adds markdown-like text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response. Try again.");
  } catch (err) {
    console.error("AI Generation Error:", err);
    throw err;
  }
};

// ... keep previous local generator for testing as fallback ...
export const generateLocalBlueprint = (topic) => {
  // (the code I had before)
  return { 
    chapters: [1,2,3,4,5].map(id => ({
      id, title: `Chapter ${id}: Building for ${topic}`, timestamp: `0${id * 2}:00`,
      script: "A narrative preview of this chapter...",
      imagePrompts: [`Prompt 1 for Ch ${id}`, `Prompt 2 for Ch ${id}`],
      videoPrompts: [`Video Hero for Ch ${id}`]
    })),
    seo: { titles: [`The Future of ${topic}`], tags: [topic], summary: "A local demo summary." }
  };
};
