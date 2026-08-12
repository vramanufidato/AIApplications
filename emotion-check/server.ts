import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client with server-side API Key
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Emotion Check" });
  });

  // Main Emotion Analysis Endpoint powered by Gemini API
  app.post("/api/analyze-emotion", async (req, res) => {
    try {
      const { mood, negativeThought, habitLog, activity, trigger, context } = req.body || {};

      if (!mood && !negativeThought && !habitLog && !activity && !context) {
        return res.status(400).json({ 
          error: "Please provide at least a mood, thought, or habit trigger for analysis." 
        });
      }

      const promptInput = `
USER ENTRY TO ANALYZE:
- Mood: ${mood || 'Not explicitly stated'}
- Negative/Anxious Thought: ${negativeThought || 'None stated'}
- Habit Log / Activity: ${activity || habitLog || 'None'}
- Trigger / Cue: ${trigger || 'Not specified'}
- Context / Description: ${context || 'None'}
`.trim();

      const systemInstruction = `
You are the core intelligence engine for the "Emotion Check" wellness app. Your goal is to analyze user entries, provide empathetic feedback, and recommend specific mental health exercises based on a "Self Therapy" framework.

CRITICAL REQUIREMENTS FOR RESPONSE:
1. EMPATHETIC REFLECTION: Briefly and warmly validate their feeling in 1-2 sentences (e.g. "It sounds like you're carrying a lot of weight today", "It's completely understandable to feel overwhelmed when deadlines pile up").
2. COGNITIVE REFRAME: Use the "Challenging Thoughts" technique to offer a rational perspective. Ask reframing questions like "What would a friend think about this?" or "Will this matter in a year?" or evaluate evidence for/against.
3. SPECIFIC ACTIONABLE RECOMMENDATION: Choose ONE specific relevant tool category:
   - "Grounding": Suggest "The 5-4-3-2-1 technique" or "Left Nostril Breathing". (toolId: "54321" or "breathing")
   - "Daily Affirmations": Provide an affirmation for Self-Empowerment, Mental Clarity, or Success. (toolId: "affirmations")
   - "Mindfulness": Suggest the "Mind Wandering Log" to gently guide attention back. (toolId: "mindwandering")
   - "Boundaries": If they mention exhaustion or resentment, recommend "8 Steps to Setting Healthy Boundaries". (toolId: "boundaries")
   - "Positivity Bias": Ask them to name 3 things they are grateful for or what went well today. (toolId: "gratitude")

RESPONSE STYLE & TONE:
- "Digital Body Language": Use clear, scannable bullet points and **bolding** for key concepts to reduce cognitive load.
- "The Human Edge": Authentic, warm, supportive, acting as a compassionate "Connection Catalyst".
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: promptInput,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              empatheticReflection: { 
                type: Type.STRING, 
                description: "Warm validation of user feeling" 
              },
              cognitiveReframe: {
                type: Type.OBJECT,
                properties: {
                  reframeText: { type: Type.STRING, description: "Rational perspective on the negative thought" },
                  evidenceQuestions: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "1-2 reflection questions like 'Will this matter in a year?'" 
                  },
                  perspectiveShift: { type: Type.STRING, description: "Summary shift in viewpoint" }
                },
                required: ["reframeText", "evidenceQuestions", "perspectiveShift"]
              },
              actionableRecommendation: {
                type: Type.OBJECT,
                properties: {
                  category: { 
                    type: Type.STRING, 
                    description: "One of: Grounding, Daily Affirmations, Mindfulness, Boundaries, Positivity Bias" 
                  },
                  title: { type: Type.STRING, description: "Title of suggested tool" },
                  description: { type: Type.STRING, description: "Brief explanation of how to practice it" },
                  actionSteps: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "3-4 concise step-by-step bullet points"
                  },
                  toolId: { 
                    type: Type.STRING, 
                    description: "One of: 54321, breathing, affirmations, mindwandering, boundaries, gratitude" 
                  }
                },
                required: ["category", "title", "description", "actionSteps", "toolId"]
              },
              recommendedAffirmation: { type: Type.STRING, description: "Optional relevant affirmation phrase" },
              formattedMarkdown: { type: Type.STRING, description: "Complete scannable formatted response using Markdown bolding and bullet points" }
            },
            required: ["empatheticReflection", "cognitiveReframe", "actionableRecommendation", "formattedMarkdown"]
          }
        }
      });

      const jsonText = response.text ? response.text.trim() : "";
      let parsedResult;
      try {
        parsedResult = JSON.parse(jsonText);
      } catch (parseErr) {
        // Fallback parse if Gemini returns raw formatting
        parsedResult = {
          empatheticReflection: "I hear you, and it's valid to feel this way right now.",
          cognitiveReframe: {
            reframeText: "Let's take a step back and examine this thought with curiosity.",
            evidenceQuestions: ["What would you say to a friend in this exact situation?", "Will this hold the same weight in 6 months?"],
            perspectiveShift: "Shift focus from total outcome control to what you can do right now."
          },
          actionableRecommendation: {
            category: "Grounding",
            title: "5-4-3-2-1 Grounding Technique",
            description: "Bring your awareness back to the present physical moment.",
            actionSteps: [
              "Acknowledge 5 things you can see around you.",
              "Acknowledge 4 things you can physically touch.",
              "Acknowledge 3 things you can hear.",
              "Acknowledge 2 things you can smell.",
              "Acknowledge 1 thing you can taste."
            ],
            toolId: "54321"
          },
          formattedMarkdown: jsonText || "Thank you for sharing your thought."
        };
      }

      res.json({ success: true, analysis: parsedResult });
    } catch (error: any) {
      console.error("Error in /api/analyze-emotion:", error);
      res.status(500).json({ 
        error: "Failed to generate emotional analysis.",
        details: error.message || String(error)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Emotion Check Server running on http://localhost:${PORT}`);
  });
}

startServer();
