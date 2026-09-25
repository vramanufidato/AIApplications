"""Tests for the Markdown report builder."""

from chatfin.report import build_markdown, write_report


def _row(name, price, sma30, rsi14, sig):
    prev = None if price is None else price - 1
    return {
        "name": name, "symbol": f"{name}.NS", "price": price, "prev_close": prev,
        "sma30": sma30, "rsi14": rsi14, "signal": sig,
        "reason": "test", "last_date": "2026-09-25",
        "high_52": None if price is None else price + 100,
        "low_52": None if price is None else price - 100,
    }


def test_build_markdown_has_header_and_table():
    rows = [_row("RELIANCE", 1226.0, 1279.83, 37.4, "Bearish")]
    md = build_markdown(rows, generated_at="2026-09-25 16:33")
    assert "# NIFTY 50 Stock Analysis" in md
    assert "| Stock | Close" in md
    assert "RELIANCE" in md
    assert "**Bearish**" in md
    assert "2026-09-25" in md  # data date


def test_build_markdown_row_count():
    rows = [_row(n, 100.0, 99.0, 55.0, "Bullish")
            for n in ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"]]
    md = build_markdown(rows)
    for n in ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"]:
        assert f"### {n}" in md


def test_build_markdown_handles_missing_numbers():
    rows = [_row("X", None, None, None, "Neutral")]
    md = build_markdown(rows)
    assert "—" in md  # em-dash placeholder for missing values


def test_write_report_roundtrip(tmp_path):
    p = tmp_path / "r.md"
    write_report(str(p), "# hello")
    assert p.read_text(encoding="utf-8") == "# hello"
