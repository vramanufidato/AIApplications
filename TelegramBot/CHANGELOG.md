# Changelog

All notable changes to this project are documented here.
Format based on Keep a Changelog; this project adheres to Semantic Versioning.

## [1.0.0] - 2026-09-21

### Added
- Telegram long-polling bot with two personas (psychologist, astrologer), commands
  `/start`, `/help`, `/mode`, and per-chat in-memory history.
- Editable persona prompts in markdown (`personas/*.md`) plus a shared base instruction.
- Crisis safety guard (`src/safety.js`) that runs before any model call.
- Offline deterministic `mock` provider and an OpenAI-compatible `openai` provider.
- Self-contained offline browser demo (`demo/index.html`).
- Zero-dependency `.env` loader (`src/env.js`).
- Verification: `scripts/check.mjs`, `test/smoke.mjs`, `test/provider.test.mjs`,
  and the one-shot `npm run verify`.
- Documentation: `readme.md` (setup + AutoClaw integration paths), `notes.md`
  (use cases), `blog.md` (step-by-step article).

### Notes
- Verified against Google Gemini through its OpenAI-compatible endpoint using
  `gemini-2.5-flash`. `gemini-2.0-flash` is retired, and the 3.x models did not
  respond within timeout on that endpoint.