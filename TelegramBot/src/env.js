// env.js — minimal, dependency-free .env loader.
//
// Loads KEY=VALUE pairs from a project-root ".env" file into process.env
// WITHOUT overwriting variables that are already set. This keeps the POC
// runnable with zero configuration while still supporting a real bot token.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** Parse a .env file body into a plain object. */
export function parseEnv(text) {
  const out = {};
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip a single pair of surrounding quotes, if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

/** Load .env from the project root into process.env (non-destructive). */
export function loadEnv(file = path.join(ROOT, '.env')) {
  try {
    if (!fs.existsSync(file)) return {};
    const parsed = parseEnv(fs.readFileSync(file, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (!(key in process.env)) process.env[key] = value;
    }
    return parsed;
  } catch {
    // A missing/unreadable .env must never crash the app.
    return {};
  }
}
