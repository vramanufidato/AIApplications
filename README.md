# AIApplications

A personal collection of **AI-powered applications, agents, and experiments** — multi-agent content pipelines, chatbots, data & analytics tools, web apps, and hardware proofs-of-concept. Each project lives in its own folder and is independently runnable.

A recurring naming convention is `<Name>AG`, where **AG** denotes an *agent* (or agent pipeline) built around a specific platform or workflow — e.g. `MediumAG`, `InstagramAG`, `YoutubeAG`, `QAAG`.

> **Note:** this README is an index. Each project may have its own `README.md` with detailed setup, architecture, and usage — follow the link in the table below for the authoritative docs.

---

## Projects at a Glance

28 projects, grouped by purpose.

### Agents & Content Pipelines

| Project | What it does | Stack |
|---|---|---|
| [MediumAG](https://github.com/vramanufidato/AIApplications/tree/main/MediumScrapingPOC) | Multi-agent pipeline turning a raw draft into publication-ready assets: formatted Medium/Substack article + infographic/mind-map, a podcast MP3 (NotebookLM / TTS + FFmpeg), and a Spotify upload checklist. | Python |
| [InstagramAG]() | 4-agent pipeline generating Instagram captions, hashtags, scene assets, Tamil voiceover (edge-tts) and a final 9:16 Reel via ffmpeg — free tools only. | Python |
| [YoutubeAG](https://github.com/vramanufidato/AIApplications/tree/main/YoutubeAG) | Automated YouTube pipeline ("Unheard Stories from Poet") turning 5 inputs into a publish-ready package: script, voiceover, visuals, music, captions, thumbnail, end card, SEO. | Python |
| [utube](https://github.com/vramanufidato/AIApplications/tree/main/utube) | "Architect Pro v2" — YouTube orchestration engine using Gemini 1.5 Flash to generate 1,500-word scripts, 60+ visual prompts, and SEO metadata. | React/Vite + Gemini |
| [MediumScrapingPOC](https://github.com/vramanufidato/AIApplications/tree/main/MediumScrapingPOC) | Proof of concept: turns any Medium article URL into a ready-to-upload viral-style short video with voiceover, cinematic AI images, and burned-in captions. | Multi-agent pipeline turning a raw draft into publication-ready assets: formatted Medium/Substack article + infographic/mind-map, a podcast MP3 (NotebookLM / TTS + FFmpeg), and a Spotify upload checklist. | Python |
| [ebook-architect-ai](https://github.com/vramanufidato/AIApplications/tree/main/ebook-architect-ai) | AI Studio app for planning and architecting ebooks. | TypeScript + Vite |
| [QAAG](https://github.com/vramanufidato/AIApplications/tree/main/QAAG) | QA automation agent: Selenium-based site recon + automated test-case generation into Excel. | Python + Selenium |

### Chatbots & Conversational Apps

| Project | What it does | Stack |
|---|---|---|
| [chatbot](https://github.com/vramanufidato/AIApplications/tree/main/chatbot) | "Research Librarian" AI chatbot — RAG over a local PDF knowledge base with topic-gap analysis and web-search fallback; every answer is cited. | Node.js |
| [ChatFin](https://github.com/vramanufidato/AIApplications/tree/main/ChatFin) | Chat-based financial research agent: turns an NSE watchlist into chart-ready Bullish/Bearish/Neutral signals delivered to team chat. | Python |
| [ChatGrocery](https://github.com/vramanufidato/AIApplications/tree/main/ChatGrocery) | Quick-commerce price monitor — snapshots grocery SKU prices across Blinkit/Zepto/Swiggy Instamart, finds the cheapest per SKU, posts a summary to a webhook. | Python |
| [TelegramBot](https://github.com/vramanufidato/AIApplications/tree/main/TelegramBot) | "AutoClaw Telegram Persona" POC — a dependency-free Telegram bot offering two guides (psychologist + astrologer), plus an offline browser demo. | Node.js |
| [meeting-agenda-generator](https://github.com/vramanufidato/AIApplications/tree/main/meeting-agenda-generator) | AI Studio app that generates structured meeting agendas. | TypeScript + Vite |
| [brand-builder-app](https://github.com/vramanufidato/AIApplications/tree/main/brand-builder-app) | AI Studio app for building and shaping brand identity. | TypeScript + Vite |

### Data, AI & Analytics

| Project | What it does | Stack |
|---|---|---|
| [interactive-data-dashboard](https://github.com/vramanufidato/AIApplications/tree/main/interactive-data-dashboard) | "InsightDash" — high-density analytics dashboard: upload CSV/XLSX, auto-profile columns, filter live across linked controls, and build interactive visualizations. | TypeScript + Vite |
| [finwise-ai](https://github.com/vramanufidato/AIApplications/tree/main/finwise-ai) | Personal finance AI assistant (AI Studio app). | TypeScript + Vite |
| [FraudDetection](https://github.com/vramanufidato/AIApplications/tree/main/FraudDetection) | "Sentinel AI" fraud detection dashboard, with model-deployment docs and design assets. | Web + docs |
| [Diagnose](https://github.com/vramanufidato/AIApplications/tree/main/Diagnose) | Unified Health Diagnosis Platform — cross-category analysis (Diabetes, Cancer, Mental Health, Vision) on a multi-cloud, HIPAA-ready, agentic-MLOps architecture. | Docs + POC notebook |
| [emotion-check](https://github.com/vramanufidato/AIApplications/tree/main/emotion-check) | Emotion / sentiment analysis app (AI Studio). | TypeScript + Vite |
| [the-tiebreaker](https://github.com/vramanufidato/AIApplications/tree/main/the-tiebreaker) | Decision Matrix & AI Analysis Studio — weighted matrices, scenario stress-testing, and AI-powered verdicts. | React + Tailwind + Gemini |
| [voxsphere](https://github.com/vramanufidato/AIApplications/tree/main/voxsphere) | "VoxSphere" — voice-first, women-only community platform MVP (30-second audio pods + voice replies) with React simulator, Express backend, Prisma schema, OpenAPI spec, and integration tests. | React + Express + Prisma |

### Web Apps & Platforms

| Project | What it does | Stack |
|---|---|---|
| [Astro](https://github.com/vramanufidato/AIApplications/tree/main/Astro) | "AstroSage AI" — desktop Vedic-astrology app with a custom themed GUI. | Python (CustomTkinter) |
| [Browser](https://github.com/vramanufidato/AIApplications/tree/main/Browser) | `nexus-prototype` — a React + Vite browser-based prototype app. | React + Vite |
| [sky](https://github.com/vramanufidato/AIApplications/tree/main/sky) | AI Podcast & Slide Generator — Flask + Gemini app that produces podcast scripts, slide outlines, TTS audio (gTTS) and PDFs (fpdf2), organized by date. | Python + Flask |
| [sky1](https://github.com/vramanufidato/AIApplications/tree/main/sky1) | Earlier iteration of the AI Podcast & Slide Generator. | Python + Flask |
| [sky2](https://github.com/vramanufidato/AIApplications/tree/main/sky2) | Iteration of the AI Podcast & Slide Generator. | Python + Flask |
| [sky-old](https://github.com/vramanufidato/AIApplications/tree/main/sky-old) | Original version / archived variant of the sky project. | Python + Flask |
| [MyBlockchain](https://github.com/vramanufidato/AIApplications/tree/main/MyBlockchain) | Educational minimal blockchain in Python: SHA-256 block linking, proof-of-work, a Flask UI to queue transactions and mine blocks, plus pytest coverage. | Python + Flask |
| [RasberryPI](https://github.com/vramanufidato/AIApplications/tree/main/RasberryPI) | Autonomous electric-car simulation PoC — computer vision (OpenCV / Google Vision) drives movement decisions, with a Flask dashboard and mocked GPIO. | Python + OpenCV + Flask |

---

## Tech Stack (repo-wide)

- **Languages:** Python, TypeScript/JavaScript, HTML/CSS
- **Python projects:** Flask, customtkinter, Google Gemini (`google-generativeai`), OpenCV, Selenium, `gTTS`, `fpdf2`, FFmpeg (external)
- **Web/TypeScript projects (AI Studio + Vite):** React, Vite, TypeScript, Tailwind, Node/Express (`server.ts`), Bun lockfiles in several apps
- **AI/ML:** Google Gemini / AI Studio, RAG over local PDFs, ML classification/detection
- **Platforms & integrations:** Telegram, Instagram/Meta, YouTube, NSE/finance APIs, multi-cloud (AWS/Azure/GCP), Raspberry Pi
- **Tooling:** Docker Compose, pytest, OpenAPI, Prisma/PostgreSQL

---

## Getting Started

Clone the whole collection:

```bash
git clone https://github.com/vramanufidato/AIApplications.git
cd AIApplications
```

Then open the folder of the project you want and follow its own README.

**Python projects** (e.g. `MediumAG`, `YoutubeAG`, `sky`, `MyBlockchain`, `chatbot` backend):

```bash
cd <project>
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

**Node / TypeScript / AI Studio projects** (e.g. `finwise-ai`, `the-tiebreaker`, `utube`, `voxsphere`):

```bash
cd <project>
npm install        # or: bun install
npm run dev
```

Several apps read API keys from a local `.env` (copy from `.env.example` or `config.example.json`). Look for `GOOGLE_API_KEY` / `GEMINI_API_KEY`, Telegram tokens, webhook URLs, etc.

---

## Notes

- A handful of folders are **iterations of the same idea** — `sky`, `sky1`, `sky2`, `sky-old`. Treat `sky` as the current version unless a project README says otherwise. `sky-old`/`sky2` contain no README.
- `FraudDetection` is documentation + assets only (PDF/PNG), so its folder is mostly non-code.
- Descriptions above are summarized from each project's own README or source files; where a project lacked a README, the description is inferred from its code and file layout.

---

_Maintained by [vramanufidato](https://github.com/vramanufidato)._
