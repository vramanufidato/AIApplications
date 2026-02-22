import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("fraud_detection.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount REAL,
    merchant TEXT,
    category TEXT,
    location TEXT,
    risk_score REAL,
    is_fraud INTEGER,
    features TEXT -- JSON string of PCA features
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 100").all() as any[];
    res.json(transactions.map(t => ({
      ...t,
      features: JSON.parse(t.features)
    })));
  });

  app.post("/api/transactions", (req, res) => {
    const { id, amount, merchant, category, location, risk_score, is_fraud, features } = req.body;
    const stmt = db.prepare(`
      INSERT INTO transactions (id, amount, merchant, category, location, risk_score, is_fraud, features)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, amount, merchant, category, location, risk_score, is_fraud, JSON.stringify(features));
    res.status(201).json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
    const fraud = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE is_fraud = 1").get() as { count: number };
    res.json({
      total: total.count,
      fraud: fraud.count,
      accuracy: 0.998, // Simulated
      precision: 0.92,
      recall: 0.88
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
