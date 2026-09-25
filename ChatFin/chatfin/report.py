"""Markdown report builder. Pure string formatting — no I/O in the builder."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from . import __version__


def _fmt(value: Optional[float], ndigits: int = 2) -> str:
    return "—" if value is None else f"{value:,.{ndigits}f}"


def build_markdown(rows: List[Dict], generated_at: Optional[str] = None,
                   title: str = "NIFTY 50 Stock Analysis — Signals") -> str:
    """Render the analysis ``rows`` into a Markdown report.

    Each row is a mapping with: name, symbol, price, prev_close, sma30, rsi14,
    signal, reason, last_date, high_52, low_52.
    """
    generated_at = generated_at or datetime.now().strftime("%Y-%m-%d %H:%M")
    data_date = next((r.get("last_date") for r in rows if r.get("last_date")), "n/a")

    lines: List[str] = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append(f"**Data date:** {data_date}  ")
    lines.append(f"**Generated:** {generated_at}  ")
    lines.append(f"**Agent:** ChatFin v{__version__}  ")
    lines.append("**Source:** Yahoo Finance daily candles (NSE)")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Summary Table")
    lines.append("")
    lines.append("| Stock | Close (₹) | Prev Close (₹) | 30-day SMA (₹) | RSI (14) | Signal |")
    lines.append("|---|---:|---:|---:|---:|:--:|")
    for r in rows:
        lines.append(
            f"| {r['name']} | {_fmt(r.get('price'))} | {_fmt(r.get('prev_close'))} "
            f"| {_fmt(r.get('sma30'))} | {_fmt(r.get('rsi14'))} | **{r.get('signal')}** |"
        )
    lines.append("")
    lines.append("## Signal Logic")
    lines.append("")
    lines.append("- **Bullish** — close above SMA30 and RSI(14) ≥ 50")
    lines.append("- **Bearish** — close below SMA30 and RSI(14) < 50")
    lines.append("- **Neutral** — price/SMA and RSI disagree")
    lines.append("")
    lines.append("## Per-Stock Detail")
    lines.append("")
    for r in rows:
        lines.append(f"### {r['name']} ({r.get('symbol', '')})")
        lines.append(f"- Close: **₹{_fmt(r.get('price'))}** (prev ₹{_fmt(r.get('prev_close'))})")
        lines.append(f"- SMA30: ₹{_fmt(r.get('sma30'))}")
        lines.append(f"- RSI (14): **{_fmt(r.get('rsi14'))}**")
        if r.get("high_52") or r.get("low_52"):
            lines.append(f"- 52-week range: ₹{_fmt(r.get('high_52'))} – ₹{_fmt(r.get('low_52'))}")
        lines.append(f"- **Signal: {r.get('signal')}** — {r.get('reason', '')}")
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*Automated technical screening — not investment advice.*")
    lines.append("")
    return "\n".join(lines)


def write_report(path: str, markdown: str) -> str:
    """Write ``markdown`` to ``path``; returns the path written."""
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(markdown)
    return path
