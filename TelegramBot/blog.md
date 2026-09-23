# Building a Personal "Psychologist + Astrologer" Telegram Bot with AutoClaw and Gemini

*A dependency-free proof of concept that turns Telegram into a front door for two AI personas — with an offline demo, a safety guardrail, and a clean path to your own model.*

---

## What we are building

Two guides in one Telegram bot:

- a **psychologist** persona — a warm, non-judgemental listener that reflects feelings and asks gentle questions;
- an **astrologer** persona — a reflective, poetic companion that uses "the stars" as a metaphor for self-reflection.

Both are powered by AutoClaw (OpenClaw) as the brain and Telegram as the interface. You create the bot with **@BotFather**, and the persona is just a system prompt.

> ⚠️ **Not therapy, not real astrology.** The psychologist is not a licensed professional and does not diagnose; the astrologer is reflective entertainment, not prediction. In a mental-health emergency, contact your local emergency number or a crisis line.

## TL;DR

1. `/newbot` in @BotFather → copy the token.
2. Clone the POC, `npm run demo` to see it offline with **no token and no key**.
3. Set `TELEGRAM_BOT_TOKEN` in `.env` and `npm start`.
4. Optionally point `LLM_PROVIDER=openai` at Gemini (or any OpenAI-compatible endpoint) for real answers.

No third-party npm packages. Node 22 built-ins only.

## Architecture

```
Telegram user  ->  @BotFather bot  ->  src/bot.js  ->  src/reply.js  ->  LLM / AutoClaw gateway
                   (Bot API token)     (long polling)   (persona prompt)    (OpenAI-compatible)
```

- `src/bot.js` receives updates, keeps a small per-chat history, and calls `generateReply()`.
- `src/reply.js` selects the persona system prompt, applies a crisis guard, then answers from either a deterministic **mock** brain or an **OpenAI-compatible** `/chat/completions` endpoint.
- `src/safety.js` runs a keyword crisis check **before any model call**, so safety never depends on the model.
- `demo/index.html` mirrors the mock brain so the whole thing can be shown offline.

## Prerequisites

- Node.js 20+ (verified on 22) and npm.
- A Telegram account.
- Optional: an API key for an OpenAI-compatible model (Gemini, a local gateway, etc.).

## Step 1 — Create the bot with BotFather

1. In Telegram, open **@BotFather** (check the handle is exactly `@BotFather`).
2. Send `/newbot`, then choose a display name and a username ending in `bot` (e.g. `my_autoclaw_guide_bot`).
3. Copy the **token** (looks like `123456789:ABC-DEF...`). Keep it secret.
4. Optional:
   - `/setprivacy` — to let the bot read all group messages, disable privacy mode, then **remove and re-add** it to each group.
   - `/setjoingroups` — allow or deny being added to groups.

If a token ever leaks, run `/revoke` in BotFather to rotate it.

## Step 2 — Project layout

```
autoclaw-telegram-persona-poc/
  src/
    bot.js          Telegram front end (long polling, commands, per-chat memory)
    reply.js        The "brain": mock or OpenAI-compatible provider
    personas.js     Loads persona prompts + shared base instructions
    safety.js       Crisis keyword check + safety response
    env.js          Tiny .env loader (no dependencies)
  personas/
    psychologist.md Editable persona prompt
    astrologer.md   Editable persona prompt
  demo/
    index.html      Self-contained offline chat demo
  test/
    smoke.mjs       Offline verification of the persona brain
    provider.test.mjs  Verifies the OpenAI provider with a fake fetch
  scripts/
    check.mjs       Syntax-checks every JS file
    open-demo.mjs   Opens the offline demo
  package.json
  env.example
  readme.md
```

## Step 3 — The persona brain

Personas are plain markdown, so non-engineers can edit the voice without touching code. A shared base keeps both personas on-brand.

```js
// src/personas.js (excerpt)
export const SHARED_BASE = [
  'You are AutoClaw acting as a warm, thoughtful personal guide in a Telegram chat.',
  'Keep replies concise (2-5 short sentences), conversational, and specific to what the user said.',
  'Never claim to be human. You are an AI companion.',
  'You do not provide medical, legal, or financial advice, and you do not make factual predictions about the future.',
].join(' ');

export function getSystemPrompt(id) {
  const persona = normalizePersona(id);
  return `${SHARED_BASE}\n\n${loadPersonaText(persona)}`;
}
```

The safety guard runs first, so a crisis message never reaches the model:

```js
// src/reply.js (excerpt)
if (crisisDetected(userText)) return CRISIS_REPLY;

const provider = String(opts.provider || env.LLM_PROVIDER || 'mock').toLowerCase();
if (provider === 'openai') return callLLM({ persona, history, userText, env, fetchImpl: opts.fetchImpl });
return mockReply(persona, userText, history);
```

`mockReply()` is deterministic and takes no network — that is what makes the offline demo and tests possible.

## Step 4 — The Telegram front end

`src/bot.js` uses long polling and the global `fetch`, with no SDK:

```js
// src/bot.js (excerpt)
const API = `https://api.telegram.org/bot${TOKEN}`;

async function tg(method, payload) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  return data.result;
}
```

Commands: `/start`, `/help`, and `/mode psychologist|astrologer`.

## Step 5 — Run it offline

```powershell
npm run demo     # opens demo/index.html (no token, no key)
npm run verify   # check + smoke + provider tests, all offline
```

The browser demo reproduces the mock brain so you can show the two voices without touching Telegram.

## Step 6 — Plug in a real model (Gemini example)

Gemini exposes an OpenAI-compatible endpoint, so no code changes are needed — only `.env`:

```ini
LLM_PROVIDER=openai
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
LLM_API_KEY=your_gemini_key
LLM_MODEL=gemini-2.5-flash
```

Two gotchas we hit:

- `gemini-2.0-flash` is **retired**; the API returns 404 and recommends a newer model.
- The newest 3.x models did not respond within our timeout on the OpenAI-compat path, so we used the stable **`gemini-2.5-flash`**.

Quick end-to-end check without Telegram:

```powershell
node scripts/gemini-e2e.mjs
# === psychologist === It sounds like you are experiencing some real frustration...
# === astrologer   === Ah, feeling stuck can be a quiet signal from your own inner landscape...
```

## Step 7 — Go live on Telegram

```powershell
copy env.example .env
# set TELEGRAM_BOT_TOKEN=... (and the LLM_* values above)
npm start
```

Then DM your bot:

```
[bot] <- chat 1501402099: /start
[bot] <- chat 1501402099: /mode astrologer
[bot] <- chat 1501402099: I feel stuck in life
[bot] -> chat 1501402099: Ah, feeling stuck can indeed be a heavy sensation. Sometimes,
         when the current path feels a little hazy, it is a gentle nudge...
```

The full path works: **Telegram -> bot -> persona prompt -> Gemini -> reply delivered.**

## Step 8 — Verify

| Command | What it proves |
|---|---|
| `npm run check` | Every `.js`/`.mjs` file parses |
| `npm run smoke` | Both personas reply offline; crisis guard fires; prompts load |
| `npm run provider` | The OpenAI provider builds the right URL/body (fake fetch, no network) |

All three run with **no network, no token, and no API key**.

## Bonus — or skip the code entirely with AutoClaw's native Telegram channel

OpenClaw ships a production-ready Telegram channel. If you only want the assistant on Telegram, set the token in gateway config and skip the custom bot:

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } },
    },
  },
}
```

Then start the gateway and approve your first DM:

```bash
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

The persona comes from your agent's workspace instructions (for example, paste these persona prompts into the agent persona). Env fallback `TELEGRAM_BOT_TOKEN` also works for the default account. Use the native channel when you want a real assistant with tools and memory; use the custom POC when you want a teaching/demo grade bot that mixes personas with `/mode`.

## More things a Telegram bot + AutoClaw can do

- Journaling & mood coach - memory + scheduled prompts.
- Habit & streak tracker - cron reminders + a small store.
- Study / flashcard tutor - file tools + spaced repetition.
- Mobile code reviewer - code tools + a review persona.
- Calendar & inbox triage - connector tools.
- Language-practice partner - persona + memory of your level.
- Meal & grocery planner - tools + structured output.
- On-call runbook helper - exec/runbook tools.
- Home-automation notifier - webhooks + tools.
- Daily news / digest briefer - search tools + a scheduled job.

## Limitations and safety

- Sessions are in-memory; restarting clears history.
- The crisis check is a simple keyword list, not a safety model.
- The mock replies are canned and for demos only.
- This is a POC: no persistence, no auth beyond the token, no rate limiting. Harden before any real deployment.
- Keep the token secret; never commit `.env`.

## Conclusion

The interesting part is not the model — it is the shape: **Telegram as the front door, AutoClaw as the brain, personas as data, and safety in front of the model.** Swap one prompt file and the same bot becomes a tutor, a coach, or a runbook helper. Start offline, verify deterministically, then point it at any OpenAI-compatible endpoint when you are ready.

*Built as an AutoClaw (OpenClaw) proof of concept. Code is dependency-free Node.js; see `readme.md` in the project for the full setup.*