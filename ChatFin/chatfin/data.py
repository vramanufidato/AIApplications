"""Market data access — NSE daily closes via the public Yahoo Finance chart API.

Isolated here so the rest of the agent (indicators, report, notify) stays pure
and offline-testable. ``requests`` is the only third-party dependency.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

import requests

YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
IST = timezone(timedelta(hours=5, minutes=30))

# Default NIFTY 50 watchlist (NSE tickers carry the .NS suffix on Yahoo).
WATCHLIST: Dict[str, str] = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "ICICIBANK": "ICICIBANK.NS",
}


@dataclass
class Series:
    """A daily close series plus a little metadata from the provider."""

    symbol: str
    closes: List[float] = field(default_factory=list)
    last_date: Optional[str] = None
    high_52: Optional[float] = None
    low_52: Optional[float] = None


def fetch_series(symbol: str, rng: str = "6mo", interval: str = "1d",
                 timeout: int = 30) -> Series:
    """Fetch a daily close series for ``symbol`` (e.g. ``RELIANCE.NS``)."""
    url = YAHOO_CHART.format(symbol=symbol)
    resp = requests.get(
        url,
        params={"range": rng, "interval": interval},
        headers={"User-Agent": USER_AGENT},
        timeout=timeout,
    )
    resp.raise_for_status()
    payload = resp.json()
    result = payload["chart"]["result"][0]
    timestamps = result["timestamp"]
    quote = result["indicators"]["quote"][0]
    raw_closes = quote["close"]

    closes: List[float] = []
    last_ts = None
    for ts, close in zip(timestamps, raw_closes):
        if close is None:  # Yahoo emits nulls for halted/absent sessions
            continue
        closes.append(float(close))
        last_ts = ts

    meta = result.get("meta", {})
    last_date = None
    if last_ts is not None:
        last_date = datetime.fromtimestamp(last_ts, tz=IST).strftime("%Y-%m-%d")

    return Series(
        symbol=symbol,
        closes=closes,
        last_date=last_date,
        high_52=meta.get("fiftyTwoWeekHigh"),
        low_52=meta.get("fiftyTwoWeekLow"),
    )


def fetch_watchlist(watchlist: Optional[Dict[str, str]] = None,
                    rng: str = "6mo") -> Tuple[Dict[str, Series], Dict[str, str]]:
    """Fetch every symbol in ``watchlist``; return (series, errors)."""
    watchlist = watchlist or WATCHLIST
    out: Dict[str, Series] = {}
    errors: Dict[str, str] = {}
    for name, ticker in watchlist.items():
        try:
            out[name] = fetch_series(ticker, rng=rng)
        except Exception as exc:  # noqa: BLE001 - report per-symbol failures
            errors[name] = f"{type(exc).__name__}: {exc}"
    return out, errors
