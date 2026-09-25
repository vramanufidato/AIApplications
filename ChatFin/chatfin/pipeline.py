"""End-to-end orchestration: fetch → analyse → report → notify."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from .data import WATCHLIST, Series, fetch_watchlist
from .indicators import rsi, signal, signal_reason, sma
from .notify import build_payload, send_webhook
from .report import build_markdown, write_report

SMA_PERIOD = 30
RSI_PERIOD = 14


@dataclass
class Row:
    name: str
    symbol: str
    price: Optional[float]
    prev_close: Optional[float]
    sma30: Optional[float]
    rsi14: Optional[float]
    signal: str
    reason: str
    last_date: Optional[str]
    high_52: Optional[float]
    low_52: Optional[float]


def analyze_series(name: str, series: Series) -> Row:
    """Compute indicators + signal for one fetched series."""
    closes = series.closes
    price = closes[-1] if closes else None
    prev_close = closes[-2] if len(closes) > 1 else None
    s30 = sma(closes, SMA_PERIOD)
    r14 = rsi(closes, RSI_PERIOD)

    if price is None:
        return Row(name, series.symbol, None, None, s30, r14, "Neutral",
                   "no data", series.last_date, series.high_52, series.low_52)

    sig = signal(price, s30, r14)
    reason = signal_reason(price, s30, r14)
    return Row(
        name=name,
        symbol=series.symbol,
        price=round(price, 2),
        prev_close=round(prev_close, 2) if prev_close is not None else None,
        sma30=round(s30, 2) if s30 is not None else None,
        rsi14=round(r14, 2) if r14 is not None else None,
        signal=sig,
        reason=reason,
        last_date=series.last_date,
        high_52=series.high_52,
        low_52=series.low_52,
    )


def run(watchlist: Optional[Dict[str, str]] = None, outdir: str = "output",
        webhook_url: Optional[str] = None, prefix: str = "NIFTY 50 Signals") -> Dict:
    """Run the full pipeline. Returns a result dict (also written to disk)."""
    watchlist = watchlist or WATCHLIST
    outpath = Path(outdir)
    outpath.mkdir(parents=True, exist_ok=True)

    series_map, errors = fetch_watchlist(watchlist)

    rows: List[Row] = []
    signals: Dict[str, str] = {}
    for name in watchlist:
        if name in series_map:
            row = analyze_series(name, series_map[name])
            rows.append(row)
            signals[name] = row.signal

    stamp = datetime.now().strftime("%Y%m%d")
    report_path = str(outpath / f"nifty_analysis_{stamp}.md")
    markdown = build_markdown([asdict(r) for r in rows])
    write_report(report_path, markdown)

    notify_status = None
    if webhook_url:
        code, body = send_webhook(webhook_url, build_payload(signals, prefix=prefix))
        notify_status = {"status": code, "body": body}

    result = {
        "generated": datetime.now().isoformat(timespec="seconds"),
        "rows": [asdict(r) for r in rows],
        "signals": signals,
        "errors": errors,
        "report": report_path,
        "notify": notify_status,
    }
    return result
