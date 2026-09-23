# AutoClaw Telegram Persona POC

A small, dependency-free proof of concept: **AutoClaw as two personal guides â€” a
psychologist and an astrologer â€” delivered through a Telegram bot created with
[BotFather](https://t.me/BotFather).**

It ships as a runnable Node.js bot (Telegram long polling) plus a fully offline
browser demo, so you can show it off with **no bot token and no API key**.

> âš ï¸ **Not therapy, not real astrology.** The psychologist persona is a
> supportive listener, not a licensed professional, and it does not diagnose. The
> astrologer persona is reflective entertainment, not prediction. In a real
> mental-health emergency, contact your local emergency number or a crisis line.

---

## 1. What's here

| Path | Purpose |
|---|---|
| `src/bot.js` | Telegram front end (long polling, commands, per-chat memory) |
| `src/reply.js` | The "brain": builds a reply via `mock` or `openai` provider |
| `src/personas.js` | Loads persona prompts, shared base instructions |
| `src/safety.js` | Crisis keyword check + safety response |
| `src/env.js` | Tiny `.env` loader (no dependencies) |
| `personas/*.md` | Editable persona prompts (psychologist, astrologer) |
| `demo/index.html` | Self-contained offline chat demo (open in any browser) |
| `test/smoke.mjs` | Offline verification of the persona brain |
| `scripts/check.mjs` | Syntax-checks every JS file |
| `scripts/open-demo.mjs` | Opens the offline demo in your browser |

## 2. Architecture

```
Telegram user  â”€â”€â–º  @BotFather bot  â”€â”€â–º  src/bot.js  â”€â”€â–º  src/reply.js  â”€â”€â–º  LLM / AutoClaw gateway
                    (Bot API token)      (long polling)     (persona prompt)      (OpenAI-compatible)
```

- `src/bot.js` receives updates, keeps a small per-chat history, and calls
  `generateReply()`.
- `src/reply.js` chooses the persona system prompt, applies the crisis guard,
  and either answers from the deterministic **mock** brain or calls an
  **OpenAI-compatible** `/chat/completions` endpoint (e.g. a local gateway).
- The browser demo mirrors the mock brain so it works with zero setup.

## 3. Quick start (no secrets needed)

```powershell
cd autoclaw-telegram-persona-poc

# 1) Offline browser demo â€” no token, no key:
npm run demo
#    ...or just open demo/index.html in a browser.

# 2) Verify the persona brain offline:
npm run smoke     # runs test/smoke.mjs
npm run check     # syntax-checks every JS file
```

## 4. Create the bot with BotFather

1. In Telegram, open **@BotFather** (confirm the handle is exactly `@BotFather`).
2. Send `/newbot`, choose a display name and a username ending in `bot`
   (e.g. `my_autoclaw_guide_bot`).
3. Copy the **token** (looks like `123456789:ABC-DEF...`). Keep it secret.
4. Optional but useful:
   - `/setprivacy` â€” if the bot should read all group messages, disable privacy
     mode (then **remove and re-add** the bot to each group so Telegram applies it).
   - `/setjoingroups` â€” allow or deny adding the bot to groups.
5. Provide the token to this POC:

```powershell
copy env.example .env
# edit .env and set:
#   TELEGRAM_BOT_TOKEN=123456789:ABC-DEF...
#   LLM_PROVIDER=mock   (start offline) or openai (real answers)
npm start
```

Now DM your bot on Telegram â€” `/start`, `/help`, `/mode astrologer`.

### Commands the bot understands

| Command | Effect |
|---|---|
| `/start` | Greeting + resets the chat history |
| `/help` | Show available commands |
| `/mode psychologist` | Supportive, reflective listener (default) |
| `/mode astrologer` | Poetic, reflective life guidance |

## 5. Two ways to connect this to AutoClaw / OpenClaw

### Path A â€” Native Telegram channel (simplest, no custom code)

OpenClaw ships a production-ready Telegram channel. You only supply the
BotFather token; the "personality" comes from your agent's workspace
instructions (e.g. this repo's persona files pasted into the agent's persona /
`AGENTS.md`).

Config shape (from the OpenClaw Telegram docs):

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

- Env fallback exists: `TELEGRAM_BOT_TOKEN` (applies to the default account only).
- Telegram does **not** use `openclaw channels login telegram`; set the token in
  config/env, then start the gateway.
- Approve your first DM: `openclaw pairing list telegram` then
  `openclaw pairing approve telegram <CODE>` (pairing codes expire after ~1 hour).

**When to choose A:** you want a real assistant with tools, memory, and channels
with minimal code. The two personas become two different agents or two persona
files.

### Path B â€” This standalone POC bot (what this repo is)

A small custom process forwards messages to an OpenAI-compatible endpoint. Two
reasons to prefer it: you want a demo you fully control, or you want to learn the
plumbing.

**When to choose B:** teaching/demo, custom routing, or mixing personas in one
bot with `/mode`.

> Note on config keys: the Telegram config fields above
> (`enabled`, `botToken`, `dmPolicy`, `groups`) come from the OpenClaw Telegram
> docs. If your OpenClaw build differs, confirm the exact keys with
> `openclaw doctor` / the configuration reference before relying on them.

## 6. Configuration (`env.example`)

| Variable | Meaning | Default |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather token | *(blank â†’ demo only)* |
| `LLM_PROVIDER` | `mock` or `openai` | `mock` |
| `LLM_BASE_URL` | OpenAI-compatible base URL | `http://127.0.0.1:11434/v1` |
| `LLM_API_KEY` | Bearer key for the endpoint | *(blank)* |
| `LLM_MODEL` | Model name | `gpt-4o-mini` |
| `DEFAULT_PERSONA` | `psychologist` or `astrologer` | `psychologist` |

## 7. Verification

| Command | What it proves |
|---|---|
| `npm run check` | Every `.js`/`.mjs` file parses |
| `npm run smoke` | Both personas reply offline; crisis guard fires; prompts load |
| `npm run demo` | Offline browser demo opens |

All three run with **no network, no token, and no API key**.

## 8. Designing a good persona

- **Give it a job and a boundary.** "Supportive listener, never diagnoses" beats
  "be helpful".
- **Write one clear voice.** Short rules about tone and length keep replies
  consistent; long rule lists make them bland.
- **Make limits explicit.** The psychologist prompt states it is not licensed;
  the astrologer prompt states it never predicts.
- **Keep an escape hatch.** The crisis guard in `src/safety.js` runs before any
  model call, so safety never depends on the model.
- **Iterate on the markdown, not the code.** `personas/*.md` is data; editing it
  needs no rebuild.

## 9. Limitations

- Sessions are **in-memory** â€” restarting the bot clears history.
- The crisis check is a simple keyword list, not a safety model.
- `mock` replies are canned and deterministic; they are for demos only.
- This is a POC: no persistence, no auth beyond the BotFather token, no rate
  limiting. Harden before any real deployment.

See [`notes.md`](./notes.md) for more ideas of what a Telegram bot + AutoClaw can do.

