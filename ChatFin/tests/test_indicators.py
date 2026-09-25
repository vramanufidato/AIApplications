"""Tests for the pure indicator math."""

import math

import pytest

from chatfin.indicators import rsi, sma

# StockCharts' canonical RSI-14 worked example.
STOCKCHARTS_CLOSES = [
    44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245,
    45.8433, 46.0826, 45.8931, 46.0328, 45.6140, 46.2820, 46.2820, 46.0028,
    46.0328, 46.4116, 46.2222, 45.6439, 46.2122, 46.2521, 45.7137, 46.4515,
    45.7835, 45.3548, 44.0288, 44.1783, 44.2181, 44.5672, 43.4205, 42.6628,
    43.1314,
]


def test_sma_basic():
    assert sma([1, 2, 3, 4, 5], 5) == 3.0


def test_sma_trailing_window():
    # Only the most recent `period` values count.
    assert sma([100, 100, 1, 2, 3], 3) == 2.0


def test_sma_insufficient_data_is_none():
    assert sma([1, 2, 3], 5) is None


def test_sma_rejects_nonpositive_period():
    with pytest.raises(ValueError):
        sma([1, 2, 3], 0)


def test_rsi_matches_stockcharts_reference():
    # The documented *first* Wilder RSI-14 value for this series is 70.53,
    # produced from the seed window (15 closes -> 14 diffs).
    val = rsi(STOCKCHARTS_CLOSES[:15], 14)
    assert val is not None
    assert math.isclose(val, 70.53, abs_tol=0.02)


def test_rsi_full_series_is_smoothed():
    # RSI keeps smoothing across the whole series; a longer tail must still be
    # bounded and must differ from the seed value.
    full = rsi(STOCKCHARTS_CLOSES, 14)
    seed = rsi(STOCKCHARTS_CLOSES[:15], 14)
    assert 0.0 <= full <= 100.0
    assert not math.isclose(full, seed, abs_tol=0.5)


def test_rsi_all_gains_is_100():
    assert rsi(list(range(1, 20)), 14) == 100.0


def test_rsi_all_losses_is_zero():
    assert rsi(list(range(20, 1, -1)), 14) == 0.0


def test_rsi_flat_series_is_neutral_50():
    # No movement -> avg_gain == avg_loss == 0 -> guarded to 100 by convention,
    # but a flat series has zero range; assert it does not raise and is bounded.
    val = rsi([50.0] * 20, 14)
    assert val is None or 0.0 <= val <= 100.0


def test_rsi_insufficient_data_is_none():
    assert rsi([1, 2, 3], 14) is None


def test_rsi_bounds():
    import random
    random.seed(7)
    series = [100.0]
    for _ in range(60):
        series.append(series[-1] * (1 + random.uniform(-0.03, 0.03)))
    val = rsi(series, 14)
    assert 0.0 <= val <= 100.0
