import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing from environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Main AI Decision Analysis Route
app.post("/api/analyze-decision", async (req, res) => {
  try {
    const { dilemma, title, category, customOptions, customFactors, focusMode } = req.body;

    if (!dilemma || typeof dilemma !== "string" || !dilemma.trim()) {
      return res.status(400).json({ error: "Please provide a valid decision prompt or dilemma description." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are "The Tiebreaker", an expert decision scientist, behavioral strategist, and executive coach.
Your job is to take a user's decision dilemma, identify the realistic options (or use their custom options), 
and perform a rigorous multi-framework decision analysis.

You MUST produce:
1. Structured Options (2 to 4 distinct options).
2. Key Evaluation Factors (4 to 6 criteria like Cost/Financial, Time/Speed, Career Growth, Risk, Quality of Life, etc.) with suggested importance weights (0-100) and scores for each option (0-10).
3. Detailed Pros and Cons for each option (tagged with impact: high/medium/low and category).
4. Feature Comparison Table Criteria (4 to 6 detailed comparison dimensions with 0-10 scores and concise note per option).
5. SWOT Analysis for each option (Strengths, Weaknesses, Opportunities, Threats).
6. Scenario Planning for each option (Best-case outcome, Most likely outcome, Worst-case outcome with probability, key triggers, key consequences, and strategic actions).
7. AI Tiebreaker Verdict (recommended option, confidence score, executive summary, key decisive factor, sensitivity insights, and actionable risk mitigation steps).

Focus Mode preference requested by user: ${focusMode || 'balanced'}.
If custom options are provided: ${JSON.stringify(customOptions || [])}.
If custom factors are provided: ${JSON.stringify(customFactors || [])}.
Be precise, empathetic, objective, and clear. Avoid fluffy SaaS buzzwords.
`;

    const prompt = `
User Decision Dilemma: "${dilemma.trim()}"
Title / Label: "${title || 'My Decision'}"
Category: "${category || 'General'}"
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A concise 3-6 word title for this decision" },
        category: { type: Type.STRING, description: "Category of decision, e.g., Career, Finance, Product, Lifestyle, Tech" },
        options: {
          type: Type.ARRAY,
          description: "2 to 4 options to choose between",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING, description: "Brief summary of what choosing this entails" },
              badge: { type: Type.STRING, description: "Short 1-2 word tag e.g. 'High Growth', 'Safe Pick', 'Low Cost'" }
            },
            required: ["id", "title", "description"]
          }
        },
        factors: {
          type: Type.ARRAY,
          description: "4 to 6 core evaluation criteria / decision drivers",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Name of the factor, e.g. Compensation, Work-Life Balance" },
              description: { type: Type.STRING, description: "Why this factor matters for this dilemma" },
              weight: { type: Type.INTEGER, description: "Default weight from 10 to 100 representing importance" },
              scores: {
                type: Type.OBJECT,
                description: "Map of optionId -> score integer 0 to 10"
              }
            },
            required: ["id", "name", "description", "weight", "scores"]
          }
        },
        prosCons: {
          type: Type.ARRAY,
          description: "Comprehensive list of pros and cons across all options",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              optionId: { type: Type.STRING, description: "Matching option id" },
              type: { type: Type.STRING, description: "'pro' or 'con'" },
              text: { type: Type.STRING, description: "Clear specific benefit or drawback" },
              impact: { type: Type.STRING, description: "'high', 'medium', or 'low'" },
              category: { type: Type.STRING, description: "'financial', 'time', 'risk', 'growth', 'quality', 'emotional', 'effort', or 'other'" }
            },
            required: ["id", "optionId", "type", "text", "impact", "category"]
          }
        },
        comparisonCriteria: {
          type: Type.ARRAY,
          description: "Side-by-side comparison matrix dimensions",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Dimension name, e.g. Upfront Cost, Scalability, Execution Speed" },
              description: { type: Type.STRING },
              scores: { type: Type.OBJECT, description: "Map of optionId -> score integer 0 to 10" },
              notes: { type: Type.OBJECT, description: "Map of optionId -> short 3-8 word explanatory note" }
            },
            required: ["id", "name", "scores", "notes"]
          }
        },
        swotAnalysis: {
          type: Type.ARRAY,
          description: "SWOT analysis per option",
          items: {
            type: Type.OBJECT,
            properties: {
              optionId: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["optionId", "strengths", "weaknesses", "opportunities", "threats"]
          }
        },
        scenarios: {
          type: Type.ARRAY,
          description: "Scenario planning for each option including best, most likely, and worst case outcomes",
          items: {
            type: Type.OBJECT,
            properties: {
              optionId: { type: Type.STRING },
              bestCase: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "'best'" },
                  title: { type: Type.STRING },
                  probability: { type: Type.STRING, description: "e.g., '20%'" },
                  description: { type: Type.STRING },
                  keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mitigationOrAction: { type: Type.STRING }
                },
                required: ["type", "title", "probability", "description", "keyTriggers", "keyConsequences", "mitigationOrAction"]
              },
              mostLikely: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "'most_likely'" },
                  title: { type: Type.STRING },
                  probability: { type: Type.STRING, description: "e.g., '60%'" },
                  description: { type: Type.STRING },
                  keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mitigationOrAction: { type: Type.STRING }
                },
                required: ["type", "title", "probability", "description", "keyTriggers", "keyConsequences", "mitigationOrAction"]
              },
              worstCase: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "'worst'" },
                  title: { type: Type.STRING },
                  probability: { type: Type.STRING, description: "e.g., '20%'" },
                  description: { type: Type.STRING },
                  keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mitigationOrAction: { type: Type.STRING }
                },
                required: ["type", "title", "probability", "description", "keyTriggers", "keyConsequences", "mitigationOrAction"]
              }
            },
            required: ["optionId", "bestCase", "mostLikely", "worstCase"]
          }
        },
        aiVerdict: {
          type: Type.OBJECT,
          properties: {
            recommendedOptionId: { type: Type.STRING, description: "ID of option recommended by AI" },
            confidencePercentage: { type: Type.INTEGER, description: "Confidence 50-98%" },
            executiveSummary: { type: Type.STRING, description: "Clear 2-3 sentence executive synthesis explaining why this choice breaks the tie" },
            keyDecisiveFactor: { type: Type.STRING, description: "The single most influential factor that swings the decision" },
            sensitivityInsight: { type: Type.STRING, description: "When would the second-place option become better? (e.g. 'If speed is prioritized over budget by >20%, Option B becomes optimal')" },
            riskMitigationAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable tips to de-risk the chosen option" }
          },
          required: ["recommendedOptionId", "confidencePercentage", "executiveSummary", "keyDecisiveFactor", "sensitivityInsight", "riskMitigationAdvice"]
        }
      },
      required: ["title", "category", "options", "factors", "prosCons", "comparisonCriteria", "swotAnalysis", "scenarios", "aiVerdict"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);

    // Format final structure with generated IDs and timestamp
    const decisionAnalysis = {
      id: "dec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: data.title || title || "Decision Analysis",
      dilemma: dilemma.trim(),
      category: data.category || category || "General",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: data.options || [],
      factors: data.factors || [],
      prosCons: data.prosCons || [],
      comparisonCriteria: data.comparisonCriteria || [],
      swotAnalysis: data.swotAnalysis || [],
      scenarios: data.scenarios || [],
      aiVerdict: data.aiVerdict || {
        recommendedOptionId: data.options?.[0]?.id || "opt_1",
        confidencePercentage: 85,
        executiveSummary: "Based on the balanced factors, Option 1 offers the strongest trade-off.",
        keyDecisiveFactor: "Long-term value",
        sensitivityInsight: "Adjusting weights will dynamically recalculate your best option.",
        riskMitigationAdvice: ["Set clear milestones.", "Monitor early metrics."]
      }
    };

    return res.json(decisionAnalysis);
  } catch (err: any) {
    console.error("Error analyzing decision with Gemini:", err);
    return res.status(500).json({
      error: "Failed to generate decision analysis. " + (err?.message || "Please check your network and GEMINI_API_KEY."),
    });
  }
});

// Devil's Advocate Challenge Route
app.post("/api/devils-advocate", async (req, res) => {
  try {
    const { decision, currentTopOptionId } = req.body;
    if (!decision || !decision.options) {
      return res.status(400).json({ error: "Invalid decision payload" });
    }

    const topOption = decision.options.find((o: any) => o.id === currentTopOptionId) || decision.options[0];
    const ai = getGeminiClient();

    const systemInstruction = `
You are the "Devil's Advocate" module of The Tiebreaker decision app.
Your job is to actively generate potential counterarguments, risks, and alternative perspectives that the user may not have considered.
You must fiercely, constructively, and rigorously question the user's preferred option ("${topOption.title}") and highlight potential downsides and hidden traps.
Expose hidden assumption biases, unconsidered edge cases, second-order consequences, and worst-case risks.
Be sharp, provocative yet helpful, empathetic, and objective.
`;

    const prompt = `
Dilemma: "${decision.dilemma}"
Target Option Being Challenged: "${topOption.title}" (${topOption.description})
All Options Available: ${decision.options.map((o: any) => o.title).join(", ")}
Evaluation Factors: ${decision.factors.map((f: any) => f.name).join(", ")}
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        topOptionTitle: { type: Type.STRING },
        counterArguments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 compelling, tough counter-arguments directly questioning this option" },
        blindSpots: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 cognitive or structural blind spots the user might be overlooking" },
        hiddenCostsOrRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 hidden costs, time sinks, or emotional tolls" },
        probingQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 tough diagnostic questions the user must answer before deciding" },
        alternativePerspectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 fresh alternative angles or framings" },
        riskRatings: {
          type: Type.ARRAY,
          description: "Specific risks with severity ratings and mitigation actions",
          items: {
            type: Type.OBJECT,
            properties: {
              risk: { type: Type.STRING },
              severity: { type: Type.STRING, description: "'high', 'medium', or 'low'" },
              mitigation: { type: Type.STRING }
            },
            required: ["risk", "severity", "mitigation"]
          }
        },
        verdictRebuttal: { type: Type.STRING, description: "A witty, insightful 2-sentence reality check summary" }
      },
      required: ["topOptionTitle", "counterArguments", "blindSpots", "hiddenCostsOrRisks", "probingQuestions", "alternativePerspectives", "riskRatings", "verdictRebuttal"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.8,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (err: any) {
    console.error("Error generating Devil's Advocate rebuttal:", err);
    return res.status(500).json({ error: "Failed to generate challenge. " + (err?.message || "") });
  }
});

// Dedicated Scenario Planning Simulation Route
app.post("/api/scenario-planning", async (req, res) => {
  try {
    const { decision, targetOptionId, customTrigger } = req.body;
    if (!decision || !decision.options) {
      return res.status(400).json({ error: "Invalid decision payload" });
    }

    const selectedOption = decision.options.find((o: any) => o.id === targetOptionId) || decision.options[0];
    const ai = getGeminiClient();

    const systemInstruction = `
You are the "Scenario Planning" engine of The Tiebreaker app.
Help the user outline three distinct, realistic potential scenarios for choosing option "${selectedOption.title}":
1. Best-Case Outcome (Ideal upside scenario)
2. Most Likely Outcome (Realistic baseline scenario)
3. Worst-Case Outcome (Nightmare/downside scenario)

Brainstorm the key factors, triggering events, probabilities, consequences, and strategic actions that lead to or address each scenario.
${customTrigger ? `A custom scenario trigger condition was specified: "${customTrigger}". Incorporate or stress-test against this condition!` : ''}
`;

    const prompt = `
Dilemma: "${decision.dilemma}"
Option Analyzed: "${selectedOption.title}" (${selectedOption.description})
All Options: ${decision.options.map((o: any) => o.title).join(", ")}
Factors: ${decision.factors.map((f: any) => f.name).join(", ")}
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        optionId: { type: Type.STRING },
        optionTitle: { type: Type.STRING },
        bestCase: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "'best'" },
            title: { type: Type.STRING },
            probability: { type: Type.STRING },
            description: { type: Type.STRING },
            keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
            mitigationOrAction: { type: Type.STRING }
          },
          required: ["type", "title", "probability", "description", "keyTriggers", "keyConsequences", "mitigationOrAction"]
        },
        mostLikely: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "'most_likely'" },
            title: { type: Type.STRING },
            probability: { type: Type.STRING },
            description: { type: Type.STRING },
            keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
            mitigationOrAction: { type: Type.STRING }
          },
          required: ["type", "title", "probability", "description", "keyTriggers", "keyConsequences", "mitigationOrAction"]
        },
        worstCase: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: "'worst'" },
            title: { type: Type.STRING },
            probability: { type: Type.STRING },
            description: { type: Type.STRING },
            keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyConsequences: { type: Type.ARRAY, items: { type: Type.STRING } },
            mitigationOrAction: { type: Type.STRING }
          },
          required: ["type", "title", "probability", "description", "keyTriggers", "keyConsequences", "mitigationOrAction"]
        }
      },
      required: ["optionId", "optionTitle", "bestCase", "mostLikely", "worstCase"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.75,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (err: any) {
    console.error("Error generating scenario planning:", err);
    return res.status(500).json({ error: "Failed to generate scenario simulation. " + (err?.message || "") });
  }
});

// Start Express + Vite Integration
async function startServer() {
  // Vite middleware for development
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
    console.log(`[The Tiebreaker] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
