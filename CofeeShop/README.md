# Copper Kettle Coffee ☕

A complete, runnable coffee-shop website with a **menu**, **address/hours**, and a **table-booking flow** that persists every request to a local ledger — plus a back-office page to inspect bookings.

Built as a **zero-dependency** Node project: no `npm install` needed, just Node 18+.

---

## Quick start

```powershell
cd C:\Users\venka\.openclaw-autoclaw\workspace\coffee-shop
node server.js
```

Then open:

| What | URL |
|------|-----|
| Website | http://localhost:3000 |
| Back office (bookings ledger) | http://localhost:3000/admin |
| Bookings API (JSON) | http://localhost:3000/api/bookings |
| CSV export | http://localhost:3000/api/bookings.csv |

> If port 3000 is busy, the server automatically tries 3001, 3002 … and prints the real URL.

## What's inside

```
coffee-shop/
├─ index.html          the site — hero, menu, address & hours, booking form
├─ styles.css          design system ("11 Build" — luxury minimalism, copper accent)
├─ app.js              booking form logic, validation, open-hours chip, slot picker
├─ server.js           zero-dependency HTTP server: static files + booking API + CSV
├─ admin.html          back office — stats, filterable bookings table
├─ admin.js            back-office rendering
├─ favicon.svg         little cup mark
├─ package.json        npm start / smoke / seed / check shortcuts
├─ data/
│  └─ bookings.json    ← THE LEDGER: every booking is saved here
├─ scripts/
│  ├─ smoke.mjs         automated end-to-end booking test (isolated, self-cleaning)
│  ├─ seed.mjs          adds 3 sample bookings to a running server
│  ├─ check-pages.mjs   HTTP smoke of every page & API endpoint
│  └─ browser-check.mjs real-browser check (Edge/Chrome): 390px mobile
│                       screenshot + one booking submitted via the actual UI
└─ docs/                verification screenshots (desktop, mobile, back office)
```

## How booking works

```
Visitor fills the form (index.html)
        │  client-side validation (app.js)
        ▼
POST /api/bookings  ──────────────►  server.js validates again
                                        │  writes atomically (tmp + rename)
                                        ▼
                              data/bookings.json  ◄── reads ──►  /admin (back office)
```

- Every booking gets a reference like `CK-20260929-3F7A`, a `status: "confirmed"` and a `createdAt` timestamp.
- Rules: name 2–80 chars, valid phone, optional email, date today → 7 days ahead, time 08:00–21:00 (hourly slots), party 1–12.
- The ledger is plain JSON — easy to back up, diff, or migrate to SQLite later.

## API reference

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/health` | status + current booking count |
| GET | `/api/slots` | bookable time slots |
| GET | `/api/bookings` | all bookings (JSON) |
| POST | `/api/bookings` | create booking → `201` with the saved record; `400` with `errors[]` |
| GET | `/api/bookings.csv` | CSV export (opens in Excel/Sheets) |

Example:

```powershell
curl.exe -X POST http://localhost:3000/api/bookings `
  -H "Content-Type: application/json" `
  -d '{"name":"Asha Rao","phone":"+91 98450 12345","date":"2026-10-02","time":"18:00","party":2}'
```

## Verification

```powershell
node scripts/check-pages.mjs   # every page/endpoint → PASS/FAIL summary
node scripts/smoke.mjs         # full booking lifecycle on an isolated port+store
node scripts/seed.mjs          # optional: add 3 sample bookings, then check /admin
node scripts/browser-check.mjs # real browser: 390px mobile screenshot + submits a test booking
```

`smoke.mjs` starts its own server on port 3178 with a throwaway store, then tests: health → empty ledger → create 2 bookings → list → disk persistence → field integrity → two rejection paths (missing name, past date) → CSV export. It cleans up after itself.

## Customization guide

| What to change | Where |
|---|---|
| Shop name | `index.html` (`.brand`, footer), `admin.html` title |
| Address / phone / hours | `index.html` — hero strip, `#visit` section, footer |
| Menu items & prices | `index.html` — `#menu` section (one `div.menu-item` per dish) |
| Colors / spacing / type | `styles.css` — `:root` tokens at the top |
| Booking rules (slots, days ahead, party size) | `server.js` — `SLOTS`, `MAX_DAYS_AHEAD`, `validateBooking()` (keep `app.js` in sync) |
| Design language | `styles.css` header comment — "11 Build": ≥70 % whitespace, weights 300–600, one copper accent |

## Design notes ("11 Build")

- Generous whitespace and a calm rhythm (`clamp()`-based spacing scales with the viewport).
- Subtle type-weight contrast: light 300 headings vs 500/600 accents; italic serif accent words.
- A single copper accent `#B4632B` used sparingly (kickers, links, focus rings).
- Soft shadows, hairline borders, no harsh edges; everything responsive down to ~360 px.

## Known limitations / next steps

- **Local only.** Data lives in `data/bookings.json` on this machine; the admin page has no authentication (fine for a local demo — don't expose it publicly as-is).
- Opening `index.html` directly from disk works as a visual preview, but bookings then go to browser storage (a banner explains this). Use `node server.js` for real persistence.
- To go live: host behind a Node-capable host (Render/Fly/VM), add auth to `/admin`, and swap the JSON ledger for SQLite/Postgres when volume grows.
- `seed.mjs` and `browser-check.mjs` write real rows into the ledger (sample bookings + one browser test). Remove them by editing `data/bookings.json` — or just clear the file back to `[]` for a fresh start.
