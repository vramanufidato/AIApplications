"""Tests for the Markdown report builder."""

from chatgrocery.models import Snapshot
from chatgrocery.report import build_markdown, fmt_money, write_report

SNAP = Snapshot(location="Tiruchirappalli", pincode="620001", captured="t",
                platforms=["Blinkit", "Zepto"], quotes=[])


def test_fmt_money_integer_and_decimal():
    assert fmt_money(77) == "\u20b977"
    assert fmt_money(77.5) == "\u20b977.50"
    assert fmt_money(None) == "\u2014"


def test_report_contains_sku_rows():
    matrix = [{"sku_id": "s", "sku_name": "Tata Salt 1kg",
               "prices": {"Blinkit": 22, "Zepto": 31}, "cheapest": "Blinkit",
               "best_price": 22, "spread": 9.0}]
    md = build_markdown(SNAP, matrix, [])
    assert "Tata Salt 1kg" in md and "\u20b922" in md and "\u20b931" in md


def test_report_no_diff_note_when_empty():
    matrix = [{"sku_id": "s", "sku_name": "X", "prices": {"Blinkit": 22, "Zepto": 31},
               "cheapest": "Blinkit", "best_price": 22, "spread": 9.0}]
    md = build_markdown(SNAP, matrix, [], threshold=10.0)
    assert "No SKU exceeds" in md


def test_report_diff_table_when_present():
    matrix = [{"sku_id": "s", "sku_name": "X", "prices": {"Blinkit": 77, "Zepto": 89},
               "cheapest": "Blinkit", "best_price": 77, "spread": 12.0}]
    diffs = [{"sku_id": "s", "sku_name": "X", "spread": 12.0, "cheapest": "Blinkit",
              "cheapest_price": 77, "priciest": "Zepto", "priciest_price": 89}]
    md = build_markdown(SNAP, matrix, diffs, threshold=10.0)
    assert "Diff Report" in md and "gap" in md.lower()
    assert "\u20b989" in md


def test_report_availability_section():
    matrix = []
    md = build_markdown(SNAP, matrix, [], availability={"Blinkit": True, "Zepto": False})
    assert "Platform Availability" in md
    assert "| Blinkit | yes |" in md and "| Zepto | no |" in md


def test_write_report_roundtrip(tmp_path):
    path = tmp_path / "r.md"
    write_report(str(path), "# hi")
    assert path.read_text(encoding="utf-8") == "# hi"
