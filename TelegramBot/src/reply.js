// reply.js — the persona "brain": turn a user message into a reply.
//
// Two providers:
//   • mock   — offline, deterministic, no network. Used for demos/verification.
//   • openai — any OpenAI-compatible /v1/chat/completions endpoint.
//
// Everything here is import-safe: importing this module does NOT touch the
// network or Telegram, which is what makes the smoke test possible offline.

import { getSystemPrompt, normalizePersona } from './personas.js';
import { crisisDetected, CRISIS_REPLY } from './safety.js';

/** Deterministic pick so identical inputs give identical output. */
function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function mockReply(persona, userText, history) {
  const t = String(userText || '').trim();
  const seed = t.length + (history?.length || 0);
  const named = (t.match(/\b(?:i'?m|i am|my name is)\s+([A-Za-z][A-Za-z'-]{1,20})/i) || [])[1];

  if (persona === 'astrologer') {
    return [
      `Let's read this more as a mirror than a forecast${named ? `, ${named}` : ''}.`,
      pick(
        [
          'The energy you describe suggests a season of noticing what you keep postponing — what small step feels both honest and doable this week?',
          'There is a quiet theme of transition here. If the sky were asking you one question, it would be: what are you ready to release?',
          'Rather than a fixed answer, the stars point to patience. Which part of this is genuinely within your control right now?',
        ],
        seed,
      ),
      '(Astrology in this demo is for reflection and fun — not prediction.)',
    ].join(' ');
  }

  // psychologist (default)
  return [
    `Thank you for sharing that${named ? `, ${named}` : ''} — it sounds like it matters to you.`,
    'I can listen and reflect, but I am a demo and not a licensed professional.',
    pick(
      [
        'What feels heaviest about this right now?',
        'When did you first start noticing this feeling?',
        'If a close friend described the same thing, what would you gently say to them?',
        'What would a slightly better next hour look like for you?',
      ],
      seed,
    ),
  ].join(' ');
}

async function callLLM({ persona, history, userText, env, fetchImpl }) {
  const base = String(env.LLM_BASE_URL || 'http://127.0.0.1:11434/v1').replace(/\/+$/, '');
  const model = env.LLM_MODEL || 'gpt-4o-mini';
  const doFetch = fetchImpl || globalThis.fetch;

  const messages = [
    { role: 'system', content: getSystemPrompt(persona) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ];

  const headers = { 'Content-Type': 'application/json' };
  if (env.LLM_API_KEY) headers.Authorization = `Bearer ${env.LLM_API_KEY}`;

  const res = await doFetch(`${base}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LLM request failed: HTTP ${res.status} ${body}`.trim());
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  return (content && String(content).trim()) || '(no response)';
}

/**
 * Produce a reply for one incoming message.
 *
 * @param {object} opts
 * @param {string} [opts.persona]   "psychologist" | "astrologer"
 * @param {Array}  [opts.history]   prior turns: [{role:'user'|'assistant', content}]
 * @param {string} [opts.userText]  the new user message
 * @param {string} [opts.provider]  "mock" | "openai" (default: env or mock)
 * @param {object} [opts.env]       environment map (default: process.env)
 * @returns {Promise<string>}
 */
export async function generateReply(opts = {}) {
  const persona = normalizePersona(opts.persona);
  const history = Array.isArray(opts.history) ? opts.history : [];
  const userText = String(opts.userText || '');
  const env = opts.env || process.env;

  // Safety first, regardless of provider or persona.
  if (crisisDetected(userText)) return CRISIS_REPLY;

  const provider = String(opts.provider || env.LLM_PROVIDER || 'mock').toLowerCase();
  if (provider === 'openai') {
    return callLLM({ persona, history, userText, env, fetchImpl: opts.fetchImpl });
  }
  return mockReply(persona, userText, history);
}

export { mockReply, callLLM };
