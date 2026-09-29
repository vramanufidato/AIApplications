#!/usr/bin/env node
/**
 * Copper Kettle Coffee — booking server (zero dependencies).
 *
 *   node server.js                 → http://localhost:3000
 *   PORT=4000 node server.js      → custom port
 *   STORE_PATH=./data/x.json …    → custom ledger file
 *
 * Routes
 *   GET  /                    site (index.html)
 *   GET  /admin               back office (admin.html)
 *   GET  /api/health          service status + booking count
 *   GET  /api/slots           bookable time slots
 *   GET  /api/bookings        all bookings (JSON, newest first)
 *   POST /api/bookings        create a booking (validated → persisted)
 *   GET  /api/bookings.csv    bookings export (CSV)
 *
 * Storage: data/bookings.json — written atomically (temp file + rename).
 */
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var ROOT = __dirname;
var STORE_PATH = process.env.STORE_PATH
  ? path.resolve(process.env.STORE_PATH)
  : path.join(ROOT, "data", "bookings.json");
var BASE_PORT = Number(process.env.PORT || 3000);
var MAX_BODY = 64 * 1024; // 64 KB is plenty for a booking
var MAX_DAYS_AHEAD = 7;

var SLOTS = (function () {
  var out = [];
  for (var h = 8; h <= 21; h++) out.push((h < 10 ? "0" : "") + h + ":00");
  return out;
})();

var MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

var STATIC = {
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/app.js": "app.js",
  "/admin": "admin.html",
  "/admin.html": "admin.html",
  "/admin.js": "admin.js",
  "/favicon.svg": "favicon.svg"
};

/* ── Storage ────────────────────────────────────────────────── */
function ensureStore() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, "[]\n", "utf8");
}
function readBookings() {
  try {
    var raw = fs.readFileSync(STORE_PATH, "utf8");
    var data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}
function writeBookings(list) {
  var tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, STORE_PATH);
}

/* ── Helpers ────────────────────────────────────────────────── */
function pad(n) { return (n < 10 ? "0" : "") + n; }
function todayISO() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function plusDaysISO(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

function makeId(dateStr, existing) {
  var d = dateStr.replace(/-/g, "");
  for (var i = 0; i < 8; i++) {
    var id = "CK-" + d + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
    if (!existing.some(function (b) { return b.id === id; })) return id;
  }
  return "CK-" + d + "-" + Date.now().toString(36).toUpperCase();
}

function validateBooking(input) {
  var errors = [];
  var v = {
    name: String(input.name || "").trim(),
    phone: String(input.phone || "").trim(),
    email: String(input.email || "").trim(),
    date: String(input.date || "").trim(),
    time: String(input.time || "").trim(),
    party: Number(input.party),
    seating: String(input.seating || "No preference").trim(),
    notes: String(input.notes || "").trim().slice(0, 500)
  };
  if (v.name.length < 2 || v.name.length > 80) errors.push("name: enter 2–80 characters");
  if (!/^[+]?[\d][\d\s-]{7,17}$/.test(v.phone)) errors.push("phone: enter a valid phone number");
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.push("email: enter a valid email or leave it blank");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) errors.push("date: pick a date");
  else if (v.date < todayISO()) errors.push("date: pick today or a later date");
  else if (v.date > plusDaysISO(MAX_DAYS_AHEAD)) errors.push("date: we take bookings up to " + MAX_DAYS_AHEAD + " days ahead");
  if (SLOTS.indexOf(v.time) === -1) errors.push("time: pick a time between 08:00 and 21:00");
  if (!Number.isInteger(v.party) || v.party < 1 || v.party > 12) errors.push("party: choose 1–12 guests");
  if (v.seating.length > 40) errors.push("seating: keep it short");
  return { errors: errors, value: v };
}

/* ── HTTP plumbing ──────────────────────────────────────────── */
function json(res, code, obj) {
  var body = JSON.stringify(obj, null, 2);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function serveStatic(res, file) {
  var full = path.join(ROOT, file);
  fs.readFile(full, function (err, buf) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    var ext = path.extname(full).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(buf);
  });
}

var server = http.createServer(function (req, res) {
  var url;
  try { url = new URL(req.url, "http://localhost"); } catch (e) { res.writeHead(400); res.end(); return; }
  var p = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (p === "/api/health" && req.method === "GET") {
    var list = readBookings();
    return json(res, 200, {
      ok: true,
      service: "copper-kettle-bookings",
      bookings: list.length,
      uptimeSeconds: Math.round(process.uptime()),
      store: path.relative(ROOT, STORE_PATH) || STORE_PATH
    });
  }

  if (p === "/api/slots" && req.method === "GET") {
    return json(res, 200, { ok: true, slots: SLOTS, first: SLOTS[0], last: SLOTS[SLOTS.length - 1] });
  }

  if (p === "/api/bookings" && req.method === "GET") {
    var all = readBookings().sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
    return json(res, 200, { ok: true, count: all.length, bookings: all });
  }

  if (p === "/api/bookings.csv" && req.method === "GET") {
    var rows = readBookings().sort(function (a, b) {
      return String(a.date + " " + a.time).localeCompare(String(b.date + " " + b.time));
    });
    var cols = ["id", "name", "phone", "email", "date", "time", "party", "seating", "notes", "status", "createdAt"];
    var esc = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; };
    var csv = [cols.join(",")]
      .concat(rows.map(function (b) { return cols.map(function (c) { return esc(b[c]); }).join(","); }))
      .join("\r\n") + "\r\n";
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="copper-kettle-bookings.csv"',
      "Cache-Control": "no-store"
    });
    return res.end(csv);
  }

  if (p === "/api/bookings" && req.method === "POST") {
    var chunks = "";
    var tooBig = false;
    req.on("data", function (c) {
      chunks += c;
      if (chunks.length > MAX_BODY) { tooBig = true; req.destroy(); }
    });
    req.on("error", function () { /* socket teardown after destroy() */ });
    req.on("end", function () {
      if (tooBig) return;
      var parsed;
      try { parsed = JSON.parse(chunks || "{}"); }
      catch (e) { return json(res, 400, { ok: false, errors: ["body: invalid JSON"] }); }

      var result = validateBooking(parsed);
      if (result.errors.length) return json(res, 400, { ok: false, errors: result.errors });

      var list = readBookings();
      var booking = {
        id: makeId(result.value.date, list),
        name: result.value.name,
        phone: result.value.phone,
        email: result.value.email,
        date: result.value.date,
        time: result.value.time,
        party: result.value.party,
        seating: result.value.seating,
        notes: result.value.notes,
        status: "confirmed",
        createdAt: new Date().toISOString()
      };
      list.push(booking);
      writeBookings(list);
      return json(res, 201, { ok: true, booking: booking });
    });
    return;
  }

  if (req.method === "GET" && STATIC[p]) return serveStatic(res, STATIC[p]);

  if (p.indexOf("/api/") === 0) return json(res, 404, { ok: false, error: "Unknown API route" });

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

/* ── Start (with port fallback if 3000 is taken) ────────────── */
ensureStore();

var port = BASE_PORT;

function start(p) {
  server.listen(p, function () {
    console.log("[copper-kettle] booking server listening at http://localhost:" + p);
    console.log("[copper-kettle] store file: " + STORE_PATH);
  });
}

server.on("error", function (err) {
  if (err.code === "EADDRINUSE" && port - BASE_PORT < 10) {
    port += 1;
    setTimeout(function () { start(port); }, 60);
  } else {
    console.error("[copper-kettle] failed to start:", err.message);
    process.exit(1);
  }
});

start(port);
