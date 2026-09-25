"""Tests for the Bullish / Bearish / Neutral signal rules."""

import pytest

from chatfin.indicators import BEARISH, BULLISH, NEUTRAL, signal, signal_reason


@pytest.mark.parametrize(
    "price,sma30,rsi14,expected",
    [
        (110, 100, 60, BULLISH),    # above SMA, RSI >= 50
        (110, 100, 50, BULLISH),    # boundary: RSI exactly 50
        (110, 100, 72, BULLISH),    # overbought but still above SMA
        (90, 100, 40, BEARISH),     # below SMA, RSI < 50
        (90, 100, 29, BEARISH),     # oversold, below SMA
        (110, 100, 45, NEUTRAL),    # above SMA but weak RSI -> mixed
        (90, 100, 55, NEUTRAL),     # below SMA but strong RSI -> mixed
    ],
)
def test_signal_matrix(price, sma30, rsi14, expected):
    assert signal(price, sma30, rsi14) == expected


def test_signal_missing_inputs_is_neutral():
    assert signal(100, None, 60) == NEUTRAL
    assert signal(100, 100, None) == NEUTRAL
    assert signal(100, None, None) == NEUTRAL


def test_signal_reason_is_descriptive():
    assert "above" in signal_reason(110, 100, 60)
    assert "below" in signal_reason(90, 100, 40)
    assert signal_reason(100, None, None) == "insufficient data"
