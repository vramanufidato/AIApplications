# Decision Matrix & AI Analysis Studio

A full-stack, interactive decision analysis application designed to evaluate complex choices, weigh competing priorities, stress-test scenarios, and synthesize AI-powered verdicts.

![Decision Matrix Studio](https://img.shields.sh/badge/React-18-blue) ![TypeScript](https://img.shields.sh/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.sh/badge/Tailwind-CSS-38bdf8) ![Gemini AI](https://img.shields.sh/badge/Gemini-AI-8e44ad)

---

## 🌟 Key Features

- **Weighted Decision Matrix**: Define multiple options and evaluation factors with custom importance weights (1–10). Calculate normalized weighted scores dynamically.
- **AI Verdict & Synthesis Engine**: Powered by Google Gemini AI, providing deep executive summaries, key tradeoffs, recommended action paths, and blindspot warnings.
- **Side-by-Side Comparison Matrix**: Multi-dimensional scoring table with custom dimensions, row highlights for top performers, editable rating cells, and explanatory notes.
- **Scenario Planning & Stress Testing**: Model optimistic, realistic, and pessimistic market outcomes with custom probabilities and score drift simulations.
- **Devil's Advocate Simulator**: Stress-test top-ranking options against critical counter-arguments, failure modes, and mitigation strategies.
- **SWOT Analysis Generator**: Structured Strengths, Weaknesses, Opportunities, and Threats breakdown tailored to each decision path.
- **Pros, Cons & Deal-Breakers**: Categorized qualitative analysis with impact ratings and instant deal-breaker flags.
- **Gut Check Intuition Timer**: 10-second rapid-fire intuition test to compare raw gut instinct against structured analytical results.
- **Preset Decision Templates**: Includes built-in templates like SaaS Freemium vs Flat $20/mo Pricing, Career Options, Tech Stack Selection, and Vendor Purchasing.
- **Local Storage Persistence**: Save, export, and load decision histories locally without requiring account setup.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Express custom server (`server.ts`) bundled with `esbuild` for CJS production builds
- **AI Integration**: Google Gemini AI (`@google/genai` SDK) running strictly server-side for safe API key handling
- **Build System**: Vite (frontend) + esbuild (server)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Development

Start the development server (runs Express and Vite on port `3000`):
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the client assets and compile the backend server:
```bash
npm run build
```

Run the production server:
```bash
npm start
```

---

## 📁 Project Structure

```text
├── server.ts               # Express backend & Gemini API integration endpoint
├── src/
│   ├── App.tsx             # Main application layout and view tabs
│   ├── types.ts            # TypeScript interface declarations
│   ├── components/         # React UI views & components
│   │   ├── WeightedScoreMatrix.tsx
│   │   ├── ComparisonTableView.tsx
│   │   ├── ScenarioPlanningView.tsx
│   │   ├── DevilsAdvocateView.tsx
│   │   ├── AiVerdictCard.tsx
│   │   ├── ProsConsView.tsx
│   │   ├── SwotAnalysisView.tsx
│   │   ├── GutCheckModal.tsx
│   │   └── ...
│   ├── data/               # Preset templates & default datasets
│   └── utils/              # Decision engine scoring & storage helpers
├── package.json
└── README.md
```

---

## 📄 License

MIT License.
