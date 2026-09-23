// bot.js — Telegram long-polling front end.
//
// Bridges Telegram messages to the persona brain in reply.js. Uses only the
// Node built-in global fetch and the Telegram Bot API — no npm dependencies.
//
// Run:  npm start        (needs TELEGRAM_BOT_TOKEN; LLM_PROVIDER may stay "mock")

import { loadEnv } from './env.js';
import { generateReply } from './reply.js';
import { normalizePersona, PERSONAS } from './personas.js';

loadEnv();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PROVIDER = (process.env.LLM_PROVIDER || 'mock').toLowerCase();
const DEFAULT_PERSONA = normalizePersona(process.env.DEFAULT_PERSONA || 'psychologist');

if (!TOKEN) {
  console.error(
    [
      'No TELEGRAM_BOT_TOKEN found.',
      '',
      'To talk to a real Telegram bot:',
      '  1. Open Telegram and chat with @BotFather',
      '  2. Send /newbot and follow the prompts; copy the token',
      '  3. Put it in .env as:  TELEGRAM_BOT_TOKEN=123456:ABC...',
      '  4. Re-run:  npm start',
      '',
      'Want a demo with no Telegram at all? Open demo/index.html in a browser.',
    ].join('\n'),
  );
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

/** Per-chat session state (in-memory; resets on restart). */
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { persona: DEFAULT_PERSONA, history: [] });
  }
  return sessions.get(chatId);
}

async function tg(method, payload) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  }
  return data.result;
}

function send(chatId, text, extra = {}) {
  return tg('sendMessage', { chat_id: chatId, text, ...extra });
}

const HELP = [
  'AutoClaw persona demo — two guides in one bot.',
  '',
  '/mode psychologist — supportive, reflective listener (default)',
  '/mode astrologer  — poetic, reflective life guidance',
  '/help — show this',
  '',
  'This is a POC, not professional care or real astrology.',
].join('\n');

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  if (!text) return;
  console.log(`[bot] <- chat ${chatId}: ${text.slice(0, 120)}`);
  const session = getSession(chatId);

  // Commands
  if (text.startsWith('/')) {
    const [cmd, arg] = text.split(/\s+/, 2);
    const c = cmd.toLowerCase().split('@')[0];
    if (c === '/start') {
      session.history = [];
      await send(chatId, `Hi — I'm your AutoClaw demo guide.\n\n${HELP}`);
      return;
    }
    if (c === '/help') {
      await send(chatId, HELP);
      return;
    }
    if (c === '/mode') {
      const next = normalizePersona(arg, '');
      if (!next) {
        await send(chatId, `Pick a mode: ${PERSONAS.join(' | ')}\nExample: /mode astrologer`);
      } else {
        session.persona = next;
        session.history = [];
        await send(chatId, `Switched to *${next}* mode.`, { parse_mode: 'Markdown' });
      }
      return;
    }
    await send(chatId, `Unknown command. Try /help`);
    return;
  }

  // Normal message → generate a persona reply.
  try {
    const reply = await generateReply({
      persona: session.persona,
      history: session.history,
      userText: text,
      provider: PROVIDER,
    });
    session.history.push({ role: 'user', content: text });
    session.history.push({ role: 'assistant', content: reply });
    console.log(`[bot] -> chat ${chatId}: ${reply.slice(0, 120)}`);
    // Keep the rolling window small.
    if (session.history.length > 20) session.history.splice(0, session.history.length - 20);
    await send(chatId, reply);
  } catch (err) {
    console.error('reply error:', err);
    await send(chatId, "Sorry — I couldn't answer just now. Check the server logs.");
  }
}

async function poll() {
  let offset = 0;
  console.log(`Bot running (provider=${PROVIDER}). Press Ctrl+C to stop.`);
  for (;;) {
    try {
      const updates = await tg('getUpdates', { offset, timeout: 30, allowed_updates: ['message'] });
      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) {
          handleMessage(update.message).catch((e) => console.error('handler error:', e));
        }
      }
    } catch (err) {
      console.error('poll error:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

poll();
