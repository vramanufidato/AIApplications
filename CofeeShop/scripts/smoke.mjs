/**
 * Copper Kettle Coffee — end-to-end smoke test.
 * Starts an isolated server (port 3178, throwaway store), exercises the
 * full booking lifecycle, then cleans up. Run:  node scripts/smoke.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = 3178;
const STORE = path.join(ROOT, "data", "bookings.smoke.json");
const BASE = `http://127.0.0.1:${PORT}`;

let pass = 0, fail = 0;
const results = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; results.push(`PASS  ${name}${detail ? "  — " + detail : ""}`); }
  else { fail++; results.push(`FAIL  ${name}${detail ? "  — " + detail : ""}`); }
}
function pad(n) { return (n < 10 ? "0" : "") + n; }
function plusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

// clean any leftovers from a previous run
for (const f of [STORE, STORE + ".tmp"]) { try { fs.rmSync(f, { force: true }); } catch {} }

const proc = spawn(process.execPath, [path.join(ROOT, "server.js")], {
  env: { ...process.env, PORT: String(PORT), STORE_PATH: STORE },
  stdio: ["ignore", "pipe", "pipe"]
});
proc.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
proc.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {}
    await sleep(200);
  }
  return false;
}

const mk = (over = {}) => ({
  name: "Asha Rao",
  phone: "+91 98450 12345",
  email: "asha@example.com",
  date: plusDays(1),
  time: "18:00",
  party: 2,
  seating: "Terrace",
  notes: "Window seat if possible",
  ...over
});
const postBooking = (payload) =>
  fetch(`${BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

try {
  const up = await waitForServer();
  check("server starts and /api/health responds", up);
  if (!up) throw new Error("server did not come up on port " + PORT);

  const health = await (await fetch(`${BASE}/api/health`)).json();
  check("health payload is ok", health.ok === true, `service=${health.service} bookings=${health.bookings}`);

  const empty = await (await fetch(`${BASE}/api/bookings`)).json();
  check("ledger starts empty", empty.count === 0, `count=${empty.count}`);

  const r1 = await postBooking(mk());
  const j1 = await r1.json();
  const idOk = /^CK-\d{8}-[0-9A-F]{4}$/.test(j1.booking?.id || "");
  check("POST valid booking → 201 with formatted ref", r1.status === 201 && idOk, `status=${r1.status} id=${j1.booking?.id}`);

  const r2 = await postBooking(mk({ name: "Vikram Mehta", date: plusDays(3), time: "09:00", party: 4, seating: "Indoor" }));
  check("second booking saved", r2.status === 201, `status=${r2.status}`);

  const list = await (await fetch(`${BASE}/api/bookings`)).json();
  check("GET /api/bookings returns both", list.count === 2, `count=${list.count}`);

  const raw = JSON.parse(fs.readFileSync(STORE, "utf8"));
  check("ledger file persisted to disk", Array.isArray(raw) && raw.length === 2, `file=${path.relative(ROOT, STORE)} entries=${raw.length}`);

  const f = raw[0] || {};
  const fields = ["id", "name", "phone", "date", "time", "party", "seating", "createdAt"];
  const missing = fields.filter((k) => !(k in f));
  check("records carry all key fields", missing.length === 0,
    missing.length ? `missing: ${missing.join(",")}` : `sample: ${f.id} · ${f.name} · ${f.date} ${f.time} ×${f.party}`);

  const bad = await postBooking(mk({ name: "" }));
  const badj = await bad.json();
  check("missing name rejected with 400 + field error", bad.status === 400 && Array.isArray(badj.errors) && badj.errors.some((e) => e.startsWith("name")),
    `status=${bad.status} errors=${JSON.stringify(badj.errors)}`);

  const past = await postBooking(mk({ date: "2020-01-01" }));
  const pastj = await past.json();
  check("past date rejected with 400", past.status === 400 && pastj.errors.some((e) => e.startsWith("date")),
    `status=${past.status} errors=${JSON.stringify(pastj.errors)}`);

  const csvRes = await fetch(`${BASE}/api/bookings.csv`);
  const csv = await csvRes.text();
  const lines = csv.trim().split(/\r?\n/);
  check("CSV export: header + 2 rows", csvRes.ok && lines.length === 3 && lines[0].startsWith("id,name,phone"),
    `lines=${lines.length}`);
} catch (e) {
  check("test run completed without exception", false, e.message);
} finally {
  proc.kill();
  await sleep(400);
  for (const f of [STORE, STORE + ".tmp"]) { try { fs.rmSync(f, { force: true }); } catch {} }

  console.log("\n=== Copper Kettle — booking smoke test ===");
  console.log(results.join("\n"));
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
