# ChatGrocery — Quick-Commerce Price Monitor (POC)

A small, dependency-light agent that snapshots grocery prices for a set of SKUs
across **Blinkit / Zepto / Swiggy Instamart** for one delivery pincode, finds the
**cheapest platform per SKU**, flags any cross-platform gap above a threshold,
writes a Markdown report, and posts a one-line summary to a **Pumble incoming
webhook**.

```
ChatGrocery — 3 SKU(s) @ Tiruchirappalli, Tamil Nadu (620001)
  Amul Taaza Milk 1L       Blinkit=77.0  Zepto=-  Swiggy Instamart=77.0  -> Blinkit/Swiggy Instamart 77.0
  Tata Salt 1kg            Blinkit=22.0  Zepto=-  Swiggy Instamart=31.0  -> Blinkit 22.0
  Aashirvaad Atta 5kg      Blinkit=327.0  Zepto=-  Swiggy Instamart=327.0  -> Blinkit/Swiggy Instamart 327.0
diffs > Rs.10: 0
report: output\price_report_620001_20260925.md
notify: HTTP 200 ok
```

## Quickstart

```bash
pip install -r requirements.txt          # requests
python run.py                            # compare the bundled 620001 snapshot
python run.py --catalog data/catalog_demo.json   # a feed that trips the diff rule
python run.py --webhook "https://api.pumble.com/.../postMessage/xxxx"
python run.py --threshold 10             # change the diff-report threshold (Rs)
```

## Layout

```
ChatGrocery/
├── run.py                  # CLI entrypoint
├── chatgrocery/
│   ├── models.py            # Quote, Snapshot  (pure data)
│   ├── catalog.py           # load + validate a price snapshot (the only file read)
│   ├── compare.py           # cheapest / spread / diff  — pure, offline
│   ├── report.py            # Markdown report builder  — pure
│   ├── notify.py            # Pumble webhook payload + POST
│   └── pipeline.py          # load -> compare -> report -> notify
├── data/
│   ├── catalog_620001.json  # real capture: Tiruchirappalli, 2026-09-25
│   └── catalog_demo.json    # synthetic feed that triggers the >₹10 rule
├── tests/                   # 41 offline tests (pytest)
├── scripts/gen_artifacts.py # console capture -> terminal-style HTML
├── screenshots/             # captured test + run + live-browser evidence
├── config.example.json
└── pytest.ini
```

Everything except `catalog.load_snapshot` (file read) and `notify.send_webhook`
(POST) is pure and network-free, which is what makes the suite fast and
deterministic.

## How the snapshot is collected

Quick-commerce sites have no public price API and are location gated, so the
"collector" is a **browser session** (this POC was produced with the AutoGLM
browser agent) that reads the live catalogue for a pincode and writes a JSON
snapshot. `catalog.py` is the single place that reads that file back.

## Tests

```bash
pip install -r requirements-dev.txt
python -m pytest
```

**41 passed** on Python 3.13 — price coercion, the cheapest/tie logic, the
diff threshold (including the strict `>` boundary), report rendering, webhook
payload building with a stubbed session, and end-to-end runs over both the real
and demo snapshots. See [`screenshots/`](screenshots) for the captured runs.

| Evidence | File |
|---|---|
| pytest console (`41 passed`) | `screenshots/01_pytest_terminal.png` |
| CLI live run (620001) | `screenshots/02_cli_run.png` |
| pytest HTML report | `screenshots/03_pytest_html_report.png` |
| Pumble delivery (HTTP 200) | `screenshots/04_pumble_delivery.png` |
| Diff report (demo feed) | `screenshots/05_diff_report.png` |
| Live pull: Blinkit | `screenshots/06_live_blinkit_620001.jpg` |
| Live pull: Zepto (unserviceable) | `screenshots/07_live_zepto_unserviced.jpg` |
| Live pull: Swiggy Instamart | `screenshots/08_live_instamart_620001.jpg` |

## Design notes

- **Cheapest = lowest available price.** Unavailable rows (platform does not
  serve the pincode, or out of stock) carry `price = null` and are excluded.
  Ties are reported as `A/B` (e.g. `Blinkit/Swiggy Instamart`).
- **Diff rule is strict.** A SKU is flagged only when the spread is **>** the
  threshold (default ₹10) — a ₹9 gap does not qualify. Tested at the boundary.
- **Chat as the delivery surface.** One line that fits a phone notification,
  plus a full Markdown report for the desk.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow and
[BLOG.md](BLOG.md) for the build write-up.

> Point-in-time prices — dark-store specific, not an offer.
