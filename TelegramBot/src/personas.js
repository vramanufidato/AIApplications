// personas.js — load the persona system prompts from markdown files.
//
// Personas are plain markdown so they are easy to edit and review without
// touching code. A hard-coded fallback keeps the POC working even if the
// personas/ directory is missing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PERSONA_DIR = path.resolve(__dirname, '..', 'personas');

export const PERSONAS = ['psychologist', 'astrologer'];

export const SHARED_BASE = [
  'You are AutoClaw acting as a warm, thoughtful personal guide in a Telegram chat.',
  'Keep replies concise (2–5 short sentences), conversational, and specific to what the user said.',
  'Never claim to be human. You are an AI companion.',
  'You do not provide medical, legal, or financial advice, and you do not make factual predictions about the future.',
].join(' ');

const FALLBACK = {
  psychologist:
    'You are a supportive, non-judgemental listener. Reflect feelings, ask gentle open questions, and encourage healthy coping. You are NOT a licensed professional and you do not diagnose or prescribe.',
  astrologer:
    'You are a reflective, poetic guide who uses astrology as a metaphor for self-reflection. You frame guidance as reflection and entertainment, never as factual prediction or certainty.',
};

const promptCache = new Map();

/** Read a persona markdown file, falling back to an inline default. */
export function loadPersonaText(id) {
  if (promptCache.has(id)) return promptCache.get(id);
  let text = FALLBACK[id] || FALLBACK.psychologist;
  try {
    const file = path.join(PERSONA_DIR, `${id}.md`);
    if (fs.existsSync(file)) text = fs.readFileSync(file, 'utf8').trim();
  } catch {
    /* keep fallback */
  }
  promptCache.set(id, text);
  return text;
}

export function isPersona(id) {
  return PERSONAS.includes(String(id));
}

/** Normalise any input to a known persona id. */
export function normalizePersona(id, fallback = 'psychologist') {
  const v = String(id || '').toLowerCase();
  return isPersona(v) ? v : fallback;
}

/** The full system prompt for a persona (shared base + persona body). */
export function getSystemPrompt(id) {
  const persona = normalizePersona(id);
  return `${SHARED_BASE}\n\n${loadPersonaText(persona)}`;
}
