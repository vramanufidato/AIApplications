"""Tests for the analysis orchestration (offline, synthetic data)."""

from chatfin.data import Series
from chatfin.pipeline import analyze_series

# 40 steadily rising closes -> price above SMA30, RSI high -> Bullish.
RISING = [float(x) for x in range(1000, 1040)]
# 40 steadily falling closes -> price below SMA30, RSI 0 -> Bearish.
FALLING = [float(x) for x in range(1040, 1000, -1)]


def test_analyze_rising_is_bullish():
    row = analyze_series("TEST", Series("TEST.NS", closes=RISING, last_date="2026-09-25"))
    assert row.signal == "Bullish"
    assert row.price == RISING[-1]
    assert row.sma30 is not None and row.sma30 < row.price
    assert row.rsi14 == 100.0


def test_analyze_falling_is_bearish():
    row = analyze_series("TEST", Series("TEST.NS", closes=FALLING, last_date="2026-09-25"))
    assert row.signal == "Bearish"
    assert row.sma30 is not None and row.sma30 > row.price
    assert row.rsi14 == 0.0


def test_analyze_handles_short_series():
    row = analyze_series("TEST", Series("TEST.NS", closes=[10.0, 11.0]))
    assert row.price == 11.0
    assert row.sma30 is None and row.rsi14 is None
    assert row.signal == "Neutral"


def test_analyze_handles_empty_series():
    row = analyze_series("TEST", Series("TEST.NS", closes=[]))
    assert row.price is None
    assert row.signal == "Neutral"
