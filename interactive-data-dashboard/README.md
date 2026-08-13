# InsightDash — Interactive Data Analytics & Visualization

InsightDash (OmniSight Data Visualizer) is a high-density, web-based analytics dashboard and automated data profiling applet. Upload structured dataset files (.csv, .xlsx, .xls) to instantly inspect column statistics, filter data dynamically across linked controls, and generate interactive visualization dashboards.

---

## 🌟 Key Features

- **File Import Engine**: Supports `.csv`, `.xlsx`, and `.xls` files with automatic delimiter detection (comma, tab, semicolon) and multi-sheet Excel workbook selection.
- **Automated Data Profiling**: Instantly computes data health metrics including row counts, column counts, missing value ratios, unique values, min/max bounds, mean/median values, and date ranges.
- **Interactive Linked Live Filtering**:
  - Global cross-field keyword search
  - Categorical multi-select filters with value counts
  - Numeric min-max range sliders & precise inputs
  - Datetime date-range pickers
  - Real-time active row counter & percentage indicators
- **9 Interactive Visualization Types**:
  - **Bar Chart**: Grouped & stacked comparison modes
  - **Line Chart**: Trend analysis across continuous axes
  - **Pie / Donut Chart**: Composition breakdowns
  - **Scatter Plot**: Dual-variable numeric correlation distribution
  - **Histogram**: Frequency distribution binning
  - **Box Plot**: Statistical quartiles, median, and outlier detection
  - **Heatmap Matrix**: Cross-tabulation co-occurrence intensity
  - **Treemap**: Hierarchical category sizing
  - **Data Grid Table**: Paginated raw records viewer with column sorting
- **Customizable Dashboard Layouts**: Expand or collapse chart cards across responsive 1, 2, or 3 column spans, change chart titles, swap axes, and toggle color themes.
- **Export & Reporting**:
  - **Export Filtered CSV**: Download filtered dataset subset containing active filter rows
  - **PDF Dashboard Report**: Generate crisp PDF dashboard summaries with automated OKLCH-to-RGB color sanitization
- **Built-in Demo Datasets**: Test features immediately using pre-loaded SaaS Sales, Retail Logistics, or Tech HR sample data.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (High-Density UI Theme)
- **Charts**: Recharts
- **Icons**: Lucide React
- **File Parsing**: SheetJS (`xlsx`), PapaParse (`papaparse`)
- **PDF & Canvas Export**: `html2canvas`, `jspdf`

---

## 🚀 Getting Started

### Prerequisites

Ensure Node.js (v18+) and `npm` are installed.

### Installation

```bash
npm install
```

### Development Server

Run the development server on port 3000:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build

Compile and bundle the production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run start
```

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── Header.tsx              # Top bar with export & dataset controls
│   ├── FilterSidebar.tsx        # Linked filter controls (categorical, numeric, date, search)
│   ├── DataProfileTable.tsx    # Column profiling summary & data type override selector
│   ├── ChartCard.tsx           # Configurable visualization grid card container
│   ├── FileUploadModal.tsx     # File drag-and-drop & sheet selector modal
│   ├── HowToUseModal.tsx       # User guide & walkthrough modal
│   └── charts/                 # Individual Recharts & Data Table components
│       ├── BarChartComp.tsx
│       ├── LineChartComp.tsx
│       ├── PieChartComp.tsx
│       ├── ScatterChartComp.tsx
│       ├── HistogramChartComp.tsx
│       ├── BoxPlotComp.tsx
│       ├── HeatmapComp.tsx
│       ├── TreemapComp.tsx
│       └── DataTableComp.tsx
├── utils/
│   ├── csvParser.ts            # Delimiter detection & XLSX/CSV file parsing
│   ├── exportUtils.ts          # CSV download & PDF screenshot report generator with OKLCH converter
│   ├── filterEngine.ts         # Dynamic multi-filter evaluation logic
│   ├── profiler.ts             # Data type classification & statistics computation
│   └── sampleData.ts           # Demo datasets (SaaS, Retail, HR)
├── types.ts                    # Global TypeScript interfaces
├── App.tsx                     # Main application layout & state coordinator
└── main.tsx                    # React entry point
```

---

## 📄 License

MIT License. Free for personal and commercial use.
