# ChatFin — Chat-Based Financial Research Agent (POC)

A small, dependency-light agent that turns a watchlist of NSE stocks into a
**chart-ready signal summary delivered straight to your team chat**.

```
RELIANCE: Bearish | TCS: Bearish | HDFCBANK: Bullish | INFY: Bearish | ICICIBANK: Bearish
```

For each symbol it:

1. **fetches** daily closes (Yahoo Finance chart API — no API key),
2. computes a **30-day SMA** and a **14-day RSI** (Wilder smoothing),
3. derives a **Bullish / Bearish / Neutral** signal,
4. writes a **Markdown report**, and
5. posts a one-line summary to a **Pumble incoming webhook**.

## Quickstart

```bash
pip install -r requirements.txt          # requests
python run.py                            # analyse the default NIFTY watchlist
python run.py --symbols RELIANCE,TCS     # custom watchlist
python run.py --webhook "https://api.pumble.com/.../postMessage/xxxx"
```

Console output:

```
ChatFin — 5 symbol(s) analysed
  RELIANCE     close=1226.0  sma30=1279.83  rsi14=37.4  -> Bearish
  TCS          close=2082.0  sma30=2240.99  rsi14=32.0  -> Bearish
  HDFCBANK     close=735.6   sma30=718.41   rsi14=56.33 -> Bullish
  INFY         close=1000.2  sma30=1087.7   rsi14=29.91 -> Bearish
  ICICIBANK    close=1326.8  sma30=1393.57  rsi14=28.61 -> Bearish
report: output\nifty_analysis_20260925.md
```

## Layout

```
ChatFin/
├── run.py                  # CLI entrypoint
├── chatfin/
│   ├── indicators.py       # sma(), rsi(), signal()  — pure, offline
│   ├── data.py             # Yahoo Finance fetch (requests)
│   ├── report.py           # Markdown report builder
│   ├── notify.py           # Pumble webhook payload + POST
│   └── pipeline.py         # fetch → analyse → report → notify
├── tests/                  # 33 offline tests (pytest)
├── scripts/gen_artifacts.py# console output -> terminal-style HTML
├── screenshots/            # captured test + run evidence
├── config.example.json
└── pytest.ini
```

Everything except `data.fetch_*` is pure and network-free, which is what makes
the suite fast and deterministic.

## Tests

```bash
pip install -r requirements-dev.txt
python -m pytest
```

**33 passed** on Python 3.13 — indicator math (including the canonical
StockCharts RSI-14 reference value of 70.53), the full 7-case signal matrix,
report formatting, webhook payload building, and end-to-end analysis on
synthetic rising/falling series. See [`screenshots/`](screenshots) for the
captured runs.

| Evidence | File |
|---|---|
| pytest console (`33 passed`) | `screenshots/01_pytest_terminal.png` |
| CLI live run | `screenshots/02_cli_run.png` |
| pytest HTML report | `screenshots/03_pytest_html_report.png` |
| Pumble delivery (HTTP 200) | `screenshots/04_pumble_delivery.png` |

## Design notes

- **Signals, not advice.** The rule set is deliberately transparent:
  *Bullish* = close above SMA30 **and** RSI ≥ 50; *Bearish* = close below SMA30
  **and** RSI < 50; anything mixed is *Neutral*.
- **Oversold ≠ buy.** INFY (RSI 29.9) and ICICIBANK (RSI 28.6) screen as
  oversold but stay *Bearish* under the rule because they are still below
  SMA30. The agent reports the state; it does not time the turn.
- **Chat as the delivery surface.** A one-line summary that fits a phone
  notification, plus a full Markdown report for the desk.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow and
[BLOG.md](BLOG.md) for the build write-up.

> Not investment advice. Automated technical screening on public data only.
