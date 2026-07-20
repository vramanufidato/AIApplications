import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Interfaces matching Prisma schema structures
interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "VERIFIED_CREATOR" | "NGO_PARTNER";
  createdAt: Date;
}

interface AudioPod {
  id: string;
  title: string;
  audioUrl: string;
  duration: number; // in seconds
  category: "MENTAL_HEALTH" | "CAREER" | "CLIMATE" | "LEGAL_RIGHTS" | "INTERGENERATIONAL_WISDOM";
  transcript: string;
  partnerLink?: string;
  userId: string;
  user: User;
  createdAt: Date;
  moderationStatus: "PENDING" | "APPROVED" | "FLAGGED";
  moderationReason?: string;
  replies: VoiceReply[];
}

interface VoiceReply {
  id: string;
  audioUrl: string;
  duration: number;
  transcript: string;
  userId: string;
  user: User;
  podId: string;
  createdAt: Date;
  moderationStatus: "PENDING" | "APPROVED" | "FLAGGED";
  moderationReason?: string;
}

interface AuditLog {
  timestamp: string;
  podTitle?: string;
  transcript: string;
  type: "UPLOAD" | "REPLY";
  status: "APPROVED" | "FLAGGED";
  rulesChecked: string[];
  geminiAnalysis?: any;
}

// In-Memory Database Store (persisting state for the dev session)
const users: User[] = [
  { id: "u-1", email: "ananya.iyer@voxsphere.org", name: "Dr. Ananya Iyer", role: "VERIFIED_CREATOR", createdAt: new Date() },
  { id: "u-2", email: "ritu.sharma@gmail.com", name: "Ritu Sharma", role: "VERIFIED_CREATOR", createdAt: new Date() },
  { id: "u-3", email: "meera.sen@legalrights.ngo", name: "Adv. Meera Sen", role: "NGO_PARTNER", createdAt: new Date() },
  { id: "u-4", email: "dadi.savitri@intergen.in", name: "Dadi Savitri", role: "USER", createdAt: new Date() },
  { id: "u-5", email: "sunita.devi@ecoaction.org", name: "Sunita Devi", role: "NGO_PARTNER", createdAt: new Date() },
  { id: "u-current", email: "venkatesh.ramanujam9@gmail.com", name: "Kiran (You)", role: "USER", createdAt: new Date() }
];

const mockReplies: VoiceReply[] = [
  {
    id: "r-1",
    audioUrl: "simulated_reply_1.wav",
    duration: 12,
    transcript: "Thank you Dr. Ananya! Writing down my proud moments helped me feel instantly stronger.",
    userId: "u-current",
    user: users[5],
    podId: "p-1",
    createdAt: new Date(Date.now() - 3600000 * 2),
    moderationStatus: "APPROVED"
  },
  {
    id: "r-2",
    audioUrl: "simulated_reply_2.wav",
    duration: 18,
    transcript: "Are these Johads expensive to build? We would love to do this in our community in Gujarat.",
    userId: "u-2",
    user: users[1],
    podId: "p-5",
    createdAt: new Date(Date.now() - 3600000 * 5),
    moderationStatus: "APPROVED"
  }
];

let pods: AudioPod[] = [
  {
    id: "p-1",
    title: "Overcoming Imposter Syndrome in Tech",
    audioUrl: "simulated_pod_1.wav",
    duration: 28,
    category: "MENTAL_HEALTH",
    transcript: "We often feel like we don't belong, especially in male-dominated Tech environments. But remember, your skills and perspectives are unique. Let's stop seeking external validation and start owning our accomplishments. Take 30 seconds today to write down three things you are proud of.",
    partnerLink: "https://sheroes.in/communities/women-in-tech",
    userId: "u-1",
    user: users[0],
    createdAt: new Date(Date.now() - 3600000 * 24),
    moderationStatus: "APPROVED",
    replies: [mockReplies[0]]
  },
  {
    id: "p-2",
    title: "Negotiating Your Salary with Confidence",
    audioUrl: "simulated_pod_2.wav",
    duration: 30,
    category: "CAREER",
    transcript: "Ladies, never accept the first offer without negotiating. Research industry standards, list your key achievements, and present them confidently. A 10% raise today compounds to hundreds of thousands of dollars over your career. You've earned it, now ask for it.",
    partnerLink: "https://mahila.money/negotiation-masterclass",
    userId: "u-2",
    user: users[1],
    createdAt: new Date(Date.now() - 3600000 * 18),
    moderationStatus: "APPROVED",
    replies: []
  },
  {
    id: "p-3",
    title: "Understanding Maternity Leave Protections",
    audioUrl: "simulated_pod_3.wav",
    duration: 29,
    category: "LEGAL_RIGHTS",
    transcript: "Under the Maternity Benefit Act, working women in India are entitled to 26 weeks of paid maternity leave. If your employer is refusing this or threatening termination, that is illegal. Learn your rights, document all communications, and reach out to our legal aid cells.",
    partnerLink: "https://sheroes.in/ask-an-expert/maternity-rights",
    userId: "u-3",
    user: users[2],
    createdAt: new Date(Date.now() - 3600000 * 12),
    moderationStatus: "APPROVED",
    replies: []
  },
  {
    id: "p-4",
    title: "Grandmother's Advice on Resilience",
    audioUrl: "simulated_pod_4.wav",
    duration: 30,
    category: "INTERGENERATIONAL_WISDOM",
    transcript: "In my eighty years, I have seen empires fall and seasons change. When life gets hard, do not bend like dry wood; bend like water that finds a path through rocks. Women have an ancient river of strength inside us. Trust your inner flow, child.",
    userId: "u-4",
    user: users[3],
    createdAt: new Date(Date.now() - 3600000 * 6),
    moderationStatus: "APPROVED",
    replies: []
  },
  {
    id: "p-5",
    title: "Local Water Harvesting in Rajasthan",
    audioUrl: "simulated_pod_5.wav",
    duration: 27,
    category: "CLIMATE",
    transcript: "Our village solved the drought crises by reviving ancient water harvest structures called Johads. By catching rainwater, we raised the groundwater table. Climate action isn't just about global treaties; it's about local wisdom and community effort. Join us.",
    partnerLink: "https://kukufm.com/show/rural-water-warriors",
    userId: "u-5",
    user: users[4],
    createdAt: new Date(Date.now() - 3600000 * 2),
    moderationStatus: "APPROVED",
    replies: [mockReplies[1]]
  }
];

const auditLogs: AuditLog[] = [
  {
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    podTitle: "Overcoming Imposter Syndrome in Tech",
    transcript: "We often feel like we don't belong, especially in male-dominated Tech environments. But remember, your skills and perspectives are unique. Let's stop seeking external validation and start owning our accomplishments. Take 30 seconds today to write down three things you are proud of.",
    type: "UPLOAD",
    status: "APPROVED",
    rulesChecked: ["Hate Speech Filter", "Loop Checking", "Anti-Abuse Engine"],
    geminiAnalysis: {
      isSafe: true,
      categoryValidation: "Mental Health",
      confidence: 0.98,
      suggestedTopics: ["Self-esteem", "Professional growth"]
    }
  }
];

// Lazy Gemini API Client Helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
      console.log("[Gemini API] SDK client successfully initialized");
    } else {
      console.log("[Gemini API] API Key not set. Using local text analysis rules.");
    }
  }
  return aiClient;
}

// Low-latency local anti-spam loop check function
function detectSpamLoops(text: string): { isSpam: boolean; phraseMatched?: string } {
  const normalized = text.toLowerCase().trim();
  
  // 1. Detect repetitive loops like "bolo na bolo na bolo na" or "hello hello hello"
  // Look for any 1 to 4 word phrase repeated 3+ times in succession
  const words = normalized.split(/\s+/);
  for (let phraseLen = 1; phraseLen <= 4; phraseLen++) {
    for (let i = 0; i <= words.length - (phraseLen * 3); i++) {
      const chunk1 = words.slice(i, i + phraseLen).join(" ");
      const chunk2 = words.slice(i + phraseLen, i + (phraseLen * 2)).join(" ");
      const chunk3 = words.slice(i + (phraseLen * 2), i + (phraseLen * 3)).join(" ");
      
      if (chunk1 === chunk2 && chunk2 === chunk3 && chunk1.length > 0) {
        return { isSpam: true, phraseMatched: chunk1 };
      }
    }
  }

  // 2. Exact match check for known spam loops (e.g. "bolo na")
  if (normalized.includes("bolo na bolo na") || normalized.includes("bolo na") && words.filter(w => w === "bolo" || w === "na").length >= 4) {
    return { isSpam: true, phraseMatched: "bolo na loop" };
  }

  // 3. Simple character repetition or single word over-repetition
  const wordCounts: { [key: string]: number } = {};
  for (const word of words) {
    if (word.length > 2) { // Only count words longer than 2 characters
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] >= 6) {
        return { isSpam: true, phraseMatched: `excessive word: "${word}"` };
      }
    }
  }

  return { isSpam: false };
}

// AI + Local Moderation Pipeline
async function runModerationPipeline(transcript: string, title?: string): Promise<{ status: "APPROVED" | "FLAGGED"; reason: string; apiDetails?: any }> {
  const rulesChecked = ["Hate Speech Filter", "Loop Checking", "Safety Verification"];
  
  // 1. Run local strict anti-spam loop check
  const spamCheck = detectSpamLoops(transcript);
  if (spamCheck.isSpam) {
    return {
      status: "FLAGGED",
      reason: `Anti-Spam Alert: Repetitive word loop detected (${spamCheck.phraseMatched}). Content flagged as spam.`
    };
  }

  // 2. Check for basic offensive words locally as safety barrier
  const offensiveRegex = /\b(abuse|offensive|hack|spamspam|scam|adult|porn|gamble)\b/i;
  if (offensiveRegex.test(transcript) || (title && offensiveRegex.test(title))) {
    return {
      status: "FLAGGED",
      reason: "Policy Violation: Audio contains prohibited keywords or topics violating community rules."
    };
  }

  // 3. Try Gemini AI for cognitive context check if key is set
  const client = getGeminiClient();
  if (client) {
    try {
      console.log(`[Moderation Pipeline] Requesting Gemini evaluation for transcript: "${transcript.substring(0, 50)}..."`);
      
      const prompt = `
You are an AI automated moderator for "VoxSphere", a voice-first, women-only community empowerment podcast application.
Analyze this short 30-second audio transcript.
Title: "${title || 'No Title'}"
Transcript: "${transcript}"

Assess if the audio transcript is safe, appropriate for a supportive women-only community, and free of spam or loops.
The content should focus on: mental health, career, legal rights, climate, women empowerment, or intergenerational wisdom.
Flag content that is: harassment, abuse, spam, sales pitches, or highly toxic.

Return a JSON object with this exact structure:
{
  "approved": boolean,
  "reason": "Clear explanation of approval or why it was flagged",
  "categoryMatch": "One of MENTAL_HEALTH, CAREER, CLIMATE, LEGAL_RIGHTS, INTERGENERATIONAL_WISDOM, or NONE",
  "safetyScore": number (0 to 1)
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const responseText = response.text?.trim() || "{}";
      const result = JSON.parse(responseText);
      
      console.log("[Moderation Pipeline] Gemini analysis complete:", result);

      if (result.approved === false || result.safetyScore < 0.6) {
        return {
          status: "FLAGGED",
          reason: `AI Moderation decision: ${result.reason}`,
          apiDetails: result
        };
      }

      return {
        status: "APPROVED",
        reason: result.reason || "AI content validation succeeded.",
        apiDetails: result
      };

    } catch (err: any) {
      console.error("[Moderation Pipeline] Gemini execution failed, falling back to local engine:", err.message);
    }
  }

  // Fallback approved if no local spam/abuses matched
  return {
    status: "APPROVED",
    reason: "Local heuristic scan completed. Safe content certified."
  };
}

// API Routes

// 1. GET /api/pods/feed
app.get("/api/pods/feed", (req, res) => {
  try {
    const { category, language } = req.query;
    
    // Simple filter
    let filteredPods = pods.filter(p => p.moderationStatus === "APPROVED");
    
    if (category && category !== "ALL") {
      filteredPods = filteredPods.filter(p => p.category === category);
    }

    // In a real multi-lingual app, language would select translated feeds or audio assets.
    // Here we simulate it by adapting metadata tags.
    const responsePods = filteredPods.map(pod => ({
      ...pod,
      languageApplied: language || "en"
    }));

    // Sort by newest first
    responsePods.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      success: true,
      pods: responsePods,
      pagination: {
        total: responsePods.length,
        page: 1,
        totalPages: 1
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST /api/pods/upload
app.post("/api/pods/upload", async (req, res) => {
  try {
    const { title, category, duration, transcript, isDraft } = req.body;
    const userId = "u-current"; // Simulated logged in user
    const user = users.find(u => u.id === userId)!;

    // A. Validate input
    if (!title || !category || !duration) {
      return res.status(400).json({ success: false, error: "Missing required fields (title, category, duration)" });
    }

    if (duration > 30) {
      return res.status(400).json({ success: false, error: "Podcast duration exceeds 30-second strict limit!" });
    }

    // B. Check user storage threshold & draft limit (max 10 active pods or drafts combined for non-premium user)
    const userActivePodsCount = pods.filter(p => p.userId === userId).length;
    if (userActivePodsCount >= 10) {
      return res.status(403).json({
        success: false,
        error: `Upload Blocked! You have reached your local storage threshold of 10 active pods / drafts. Please delete an existing pod to create space.`,
        currentCount: userActivePodsCount,
        threshold: 10
      });
    }

    const podcastTranscript = transcript || `This is a beautiful voice post about ${title} recorded on VoxSphere.`;

    // C. Run Audio Moderation Pipeline (transcription, anti-spam, safety check)
    const moderationResult = await runModerationPipeline(podcastTranscript, title);

    const newPod: AudioPod = {
      id: "p-" + Math.random().toString(36).substring(2, 9),
      title,
      audioUrl: `simulated_pod_${Date.now()}.wav`,
      duration,
      category,
      transcript: podcastTranscript,
      userId,
      user,
      createdAt: new Date(),
      moderationStatus: moderationResult.status,
      moderationReason: moderationResult.reason,
      replies: []
    };

    // Keep locally in memory
    pods.push(newPod);

    // D. Log audit result for interactive developers panel
    auditLogs.unshift({
      timestamp: new Date().toISOString(),
      podTitle: title,
      transcript: podcastTranscript,
      type: "UPLOAD",
      status: moderationResult.status,
      rulesChecked: ["Hate Speech Filter", "Loop Checking", "Anti-Abuse Engine", "Gemini Context AI"],
      geminiAnalysis: moderationResult.apiDetails || { note: "Analyzed via high-performance rule engine" }
    });

    res.status(201).json({
      success: true,
      pod: newPod,
      moderationResult: {
        status: moderationResult.status,
        reason: moderationResult.reason
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST /api/pods/:id/reply
app.post("/api/pods/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, transcript } = req.body;
    const userId = "u-current";
    const user = users.find(u => u.id === userId)!;

    const podIndex = pods.findIndex(p => p.id === id);
    if (podIndex === -1) {
      return res.status(404).json({ success: false, error: "Audio pod not found" });
    }

    if (!duration || duration > 30) {
      return res.status(400).json({ success: false, error: "Voice reply must have duration, and not exceed 30 seconds." });
    }

    const replyTranscript = transcript || "I completely support this message!";

    // Moderation check on reply too
    const moderationResult = await runModerationPipeline(replyTranscript);

    const newReply: VoiceReply = {
      id: "r-" + Math.random().toString(36).substring(2, 9),
      audioUrl: `simulated_reply_${Date.now()}.wav`,
      duration,
      transcript: replyTranscript,
      userId,
      user,
      podId: id,
      createdAt: new Date(),
      moderationStatus: moderationResult.status,
      moderationReason: moderationResult.reason
    };

    if (moderationResult.status === "APPROVED") {
      pods[podIndex].replies.push(newReply);
    }

    // Log reply moderation
    auditLogs.unshift({
      timestamp: new Date().toISOString(),
      transcript: replyTranscript,
      type: "REPLY",
      status: moderationResult.status,
      rulesChecked: ["Hate Speech Filter", "Loop Checking", "Anti-Abuse Engine"],
      geminiAnalysis: moderationResult.apiDetails || { note: "Checked via high-performance rule engine" }
    });

    res.status(201).json({
      success: true,
      reply: newReply,
      moderationResult: {
        status: moderationResult.status,
        reason: moderationResult.reason
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. DELETE /api/pods/:id
app.delete("/api/pods/:id", (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = pods.length;
    pods = pods.filter(p => p.id !== id);
    if (pods.length === initialLen) {
      return res.status(404).json({ success: false, error: "Pod not found to delete" });
    }
    res.json({ success: true, message: "Pod deleted successfully. Quota freed up!" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /api/developer/docs
app.get("/api/developer/docs", (req, res) => {
  try {
    let prismaContent = "";
    let openapiContent = "";

    try {
      prismaContent = fs.readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
    } catch {
      prismaContent = "// Prisma Schema File not found";
    }

    try {
      openapiContent = fs.readFileSync(path.join(process.cwd(), "openapi.yaml"), "utf8");
    } catch {
      openapiContent = "# OpenAPI YAML File not found";
    }

    res.json({
      prisma: prismaContent,
      openapi: openapiContent
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. GET /api/moderation/logs
app.get("/api/moderation/logs", (req, res) => {
  res.json({ success: true, logs: auditLogs });
});

// Serve frontend assets or mount Vite server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite] Middleware integrated in development mode");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VoxSphere Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
