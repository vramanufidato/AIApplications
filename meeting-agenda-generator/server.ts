import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';

const app = express();
const PORT = 3000;

// Increase body parser limit for large document uploads / base64 content
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy initializer helper for Gemini AI client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: Parse uploaded document file content (.docx, .md, .txt, etc.)
app.post('/api/parse-document', async (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const buffer = Buffer.from(fileData, 'base64');
    let extractedText = '';

    if (fileName?.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      // For .txt, .md, .csv, .json, or standard text content
      extractedText = buffer.toString('utf-8');
    }

    return res.json({
      success: true,
      fileName,
      extractedText: extractedText.trim(),
      wordCount: extractedText.trim().split(/\s+/).filter(Boolean).length,
    });
  } catch (err: any) {
    console.error('Error parsing document:', err);
    return res.status(500).json({
      error: 'Failed to parse document: ' + (err.message || 'Unknown error'),
    });
  }
});

// Endpoint: Generate Smart Agenda using Gemini 3.6 Flash
app.post('/api/generate-agenda', async (req, res) => {
  try {
    const { documentText, totalDurationMinutes = 60, meetingGoal, meetingTitle, participants, sourceDocName } = req.body;

    if (!documentText || typeof documentText !== 'string' || !documentText.trim()) {
      return res.status(400).json({ error: 'Document content is required to generate an agenda.' });
    }

    const ai = getGeminiClient();

    const prompt = `Analyze the provided document and craft a structured, highly actionable meeting agenda.

TARGET MEETING DURATION: ${totalDurationMinutes} minutes (CRITICAL: The sum of durationMinutes across ALL agenda sections MUST EXACTLY equal ${totalDurationMinutes} minutes!).
MEETING GOAL/FORMAT: ${meetingGoal || 'Collaborative alignment & decision making'}
${meetingTitle ? `PREFERRED MEETING TITLE: ${meetingTitle}` : ''}
${participants ? `KNOWN PARTICIPANTS/STAKEHOLDERS: ${participants}` : ''}

DOCUMENT CONTENT:
"""
${documentText.slice(0, 30000)}
"""

REQUIREMENTS:
1. Meeting Title: Create a professional, clear title reflecting the core objective.
2. Executive Summary: 2-3 sentence overview explaining why this meeting is being held and the main outcomes expected.
3. Pre-Meeting Prep: 2-4 concrete reading or preparation steps required before attending.
4. Timed Sections:
   - Break down the document into distinct, logical discussion sections.
   - Assign integer durationMinutes to each section such that SUM(durationMinutes) = EXACTLY ${totalDurationMinutes}.
   - Identify the primary Lead/Stakeholder for each section.
   - Summarize what will be covered in each section.
   - Provide 2-4 key discussion points per section.
   - Provide 1-3 critical questions to prompt discussion.
5. Key Stakeholders: Identify key individuals or roles mentioned or relevant, their responsibility, and why they matter for this agenda.
6. Action Items: Extract actionable tasks or next steps explicitly found or logically implied in the text, assigning owners and priority levels.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meetingTitle: { type: Type.STRING, description: 'Concise meeting title' },
            executiveSummary: { type: Type.STRING, description: 'High-level meeting summary' },
            preMeetingPrep: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Required preparation steps',
            },
            sections: {
              type: Type.ARRAY,
              description: `Ordered array of timed agenda sections. Total sum of durationMinutes must equal ${totalDurationMinutes}.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Topic title' },
                  durationMinutes: { type: Type.INTEGER, description: 'Minutes allocated to this topic' },
                  leadRole: { type: Type.STRING, description: 'Speaker or stakeholder leading this topic' },
                  summary: { type: Type.STRING, description: 'Topic objective summary' },
                  keyDiscussionPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Bullet points to discuss',
                  },
                  suggestedQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Discussion prompts or questions',
                  },
                },
                required: ['title', 'durationMinutes', 'leadRole', 'summary', 'keyDiscussionPoints', 'suggestedQuestions'],
              },
            },
            stakeholders: {
              type: Type.ARRAY,
              description: 'Identified stakeholders and roles',
              items: {
                type: Type.OBJECT,
                properties: {
                  nameOrRole: { type: Type.STRING },
                  responsibility: { type: Type.STRING },
                  relevance: { type: Type.STRING },
                },
                required: ['nameOrRole', 'responsibility', 'relevance'],
              },
            },
            actionItems: {
              type: Type.ARRAY,
              description: 'Key action items or follow-ups',
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  priority: { type: Type.STRING, description: 'High, Medium, or Low' },
                  deadlineSuggestion: { type: Type.STRING },
                },
                required: ['task', 'owner', 'priority'],
              },
            },
          },
          required: ['meetingTitle', 'executiveSummary', 'preMeetingPrep', 'sections', 'stakeholders', 'actionItems'],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsedData = JSON.parse(jsonText);

    // Verify and adjust total duration mathematically if needed to ensure exact match
    if (parsedData.sections && Array.isArray(parsedData.sections) && parsedData.sections.length > 0) {
      let currentTotal = parsedData.sections.reduce((acc: number, sec: any) => acc + (Number(sec.durationMinutes) || 0), 0);
      const diff = Number(totalDurationMinutes) - currentTotal;
      if (diff !== 0) {
        // Adjust the last section or main discussion section to make exact sum
        const lastIdx = parsedData.sections.length - 1;
        parsedData.sections[lastIdx].durationMinutes = Math.max(1, (parsedData.sections[lastIdx].durationMinutes || 5) + diff);
      }
    }

    const agenda = {
      id: 'agenda-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      meetingTitle: parsedData.meetingTitle || meetingTitle || 'Strategy & Alignment Meeting',
      totalDurationMinutes: Number(totalDurationMinutes),
      meetingGoal: meetingGoal || 'Strategic Alignment & Decision Making',
      executiveSummary: parsedData.executiveSummary || 'Discussion based on uploaded documentation.',
      preMeetingPrep: parsedData.preMeetingPrep || [],
      sections: (parsedData.sections || []).map((s: any, idx: number) => ({
        id: `sec-${idx + 1}-${Date.now()}`,
        title: s.title || `Topic ${idx + 1}`,
        durationMinutes: Number(s.durationMinutes) || 10,
        leadRole: s.leadRole || 'Meeting Lead',
        summary: s.summary || '',
        keyDiscussionPoints: s.keyDiscussionPoints || [],
        suggestedQuestions: s.suggestedQuestions || [],
      })),
      stakeholders: parsedData.stakeholders || [],
      actionItems: (parsedData.actionItems || []).map((a: any, idx: number) => ({
        id: `ai-${idx + 1}-${Date.now()}`,
        task: a.task || '',
        owner: a.owner || 'Unassigned',
        priority: (['High', 'Medium', 'Low'].includes(a.priority) ? a.priority : 'Medium') as 'High' | 'Medium' | 'Low',
        deadlineSuggestion: a.deadlineSuggestion || 'TBD',
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      sourceDocName: sourceDocName || 'Uploaded Document',
    };

    return res.json({ success: true, agenda });
  } catch (err: any) {
    console.error('Error generating agenda with Gemini:', err);
    return res.status(500).json({
      error: 'Failed to generate agenda: ' + (err.message || 'Check GEMINI_API_KEY'),
    });
  }
});

// Endpoint: AI Refine Agenda (Iterative modification via Gemini)
app.post('/api/refine-agenda', async (req, res) => {
  try {
    const { currentAgenda, refinementInstruction } = req.body;

    if (!currentAgenda || !refinementInstruction) {
      return res.status(400).json({ error: 'Current agenda and refinement instruction are required.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert executive meeting facilitator. Modify the provided meeting agenda based on the user's refinement instruction.

CURRENT AGENDA JSON:
${JSON.stringify(currentAgenda, null, 2)}

USER REFINEMENT INSTRUCTION:
"${refinementInstruction}"

CRITICAL RULE:
- If the user specifies a new duration or instructs to shorten/lengthen topics, ensure the SUM of durationMinutes across ALL sections equals the totalDurationMinutes.
- Return the updated full agenda JSON matching the exact schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meetingTitle: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            totalDurationMinutes: { type: Type.INTEGER },
            preMeetingPrep: { type: Type.ARRAY, items: { type: Type.STRING } },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  leadRole: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  keyDiscussionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'durationMinutes', 'leadRole', 'summary', 'keyDiscussionPoints', 'suggestedQuestions'],
              },
            },
            stakeholders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nameOrRole: { type: Type.STRING },
                  responsibility: { type: Type.STRING },
                  relevance: { type: Type.STRING },
                },
                required: ['nameOrRole', 'responsibility', 'relevance'],
              },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  deadlineSuggestion: { type: Type.STRING },
                },
                required: ['task', 'owner', 'priority'],
              },
            },
          },
          required: ['meetingTitle', 'executiveSummary', 'totalDurationMinutes', 'preMeetingPrep', 'sections', 'stakeholders', 'actionItems'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Fix IDs and calculate total
    const updatedAgenda = {
      ...currentAgenda,
      meetingTitle: parsed.meetingTitle || currentAgenda.meetingTitle,
      totalDurationMinutes: parsed.totalDurationMinutes || currentAgenda.totalDurationMinutes,
      executiveSummary: parsed.executiveSummary || currentAgenda.executiveSummary,
      preMeetingPrep: parsed.preMeetingPrep || currentAgenda.preMeetingPrep,
      sections: (parsed.sections || currentAgenda.sections).map((s: any, idx: number) => ({
        id: s.id || `sec-${idx + 1}-${Date.now()}`,
        title: s.title || `Topic ${idx + 1}`,
        durationMinutes: Number(s.durationMinutes) || 10,
        leadRole: s.leadRole || 'Lead',
        summary: s.summary || '',
        keyDiscussionPoints: s.keyDiscussionPoints || [],
        suggestedQuestions: s.suggestedQuestions || [],
      })),
      stakeholders: parsed.stakeholders || currentAgenda.stakeholders,
      actionItems: (parsed.actionItems || currentAgenda.actionItems).map((a: any, idx: number) => ({
        id: a.id || `ai-${idx + 1}-${Date.now()}`,
        task: a.task || '',
        owner: a.owner || 'Unassigned',
        priority: (['High', 'Medium', 'Low'].includes(a.priority) ? a.priority : 'Medium') as 'High' | 'Medium' | 'Low',
        deadlineSuggestion: a.deadlineSuggestion || 'TBD',
        completed: a.completed || false,
      })),
    };

    return res.json({ success: true, agenda: updatedAgenda });
  } catch (err: any) {
    console.error('Error refining agenda:', err);
    return res.status(500).json({ error: 'Failed to refine agenda: ' + (err.message || 'Unknown error') });
  }
});

// Vite Middleware & Static Server Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
