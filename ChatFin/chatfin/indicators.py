"""Technical indicators: SMA and RSI (Wilder smoothing). Pure, offline, testable."""

from __future__ import annotations

from typing import Optional, Sequence

BULLISH = "Bullish"
BEARISH = "Bearish"
NEUTRAL = "Neutral"


def sma(values: Sequence[float], period: int) -> Optional[float]:
    """Simple moving average of the last ``period`` values.

    Returns ``None`` when there is not enough data. Uses only the most recent
    ``period`` observations (a trailing SMA), which is what a signal needs.
    """
    if period <= 0:
        raise ValueError("period must be positive")
    if len(values) < period:
        return None
    return sum(values[-period:]) / period


def rsi(values: Sequence[float], period: int = 14) -> Optional[float]:
    """Wilder's Relative Strength Index over ``period`` sessions.

    Returns ``None`` when there are fewer than ``period + 1`` closes (one close
    is consumed by the first diff). Follows the standard Wilder seed
    (simple average of the first ``period`` gains/losses) and then smoothing.
    """
    if period <= 0:
        raise ValueError("period must be positive")
    if len(values) < period + 1:
        return None

    diffs = [values[i] - values[i - 1] for i in range(1, len(values))]
    gains = [d if d > 0 else 0.0 for d in diffs]
    losses = [-d if d < 0 else 0.0 for d in diffs]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(diffs)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def signal(price: float, sma30: Optional[float], rsi14: Optional[float]) -> str:
    """Combine price-vs-SMA and RSI into a Bullish / Bearish / Neutral call.

    Rules:
      * Bullish  — price above SMA30 and RSI(14) >= 50.
      * Bearish  — price below SMA30 and RSI(14) < 50.
      * Neutral  — anything else (mixed signals or missing inputs).
    """
    if sma30 is None or rsi14 is None:
        return NEUTRAL
    above = price > sma30
    if above and rsi14 >= 50:
        return BULLISH
    if (not above) and rsi14 < 50:
        return BEARISH
    return NEUTRAL


def signal_reason(price: float, sma30: Optional[float], rsi14: Optional[float]) -> str:
    """Human-readable justification for :func:`signal`."""
    if sma30 is None or rsi14 is None:
        return "insufficient data"
    above = price > sma30
    if above and rsi14 >= 50:
        return "price above SMA30 with RSI>=50"
    if (not above) and rsi14 < 50:
        return "price below SMA30 with RSI<50"
    return "mixed signals (price/SMA and RSI disagree)"
