"""Tests for the snapshot loader (no network, no real feed)."""

import json
import os

import pytest

from chatgrocery.catalog import coerce_price, load_snapshot, parse_snapshot

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def test_coerce_price_accepts_numeric_strings():
    assert coerce_price("77") == 77.0
    assert coerce_price(22) == 22.0
    assert coerce_price(12.5) == 12.5


def test_coerce_price_rejects_junk():
    assert coerce_price(None) is None
    assert coerce_price("abc") is None
    assert coerce_price("") is None
    assert coerce_price(True) is None  # bool is not a price


def test_coerce_price_rejects_negative():
    assert coerce_price(-5) is None


def test_parse_snapshot_basic():
    snap = parse_snapshot(
        {
            "location": "X",
            "pincode": 620001,
            "captured": "t",
            "platforms": ["Blinkit"],
            "skus": [
                {
                    "id": "s1",
                    "name": "Thing",
                    "quotes": [{"platform": "Blinkit", "price": 10, "available": True}],
                }
            ],
        }
    )
    assert snap.pincode == "620001"
    assert len(snap.quotes) == 1
    q = snap.quotes[0]
    assert q.sku_id == "s1" and q.price == 10.0 and q.is_priced()


def test_parse_available_defaults_from_price():
    snap = parse_snapshot({"skus": [{"id": "s", "name": "n",
                                     "quotes": [{"platform": "P", "price": 5}]}]})
    assert snap.quotes[0].available is True


def test_parse_unavailable_row_has_no_price():
    snap = parse_snapshot({"skus": [{"id": "s", "name": "n",
                                     "quotes": [{"platform": "Zepto", "price": None,
                                                 "available": False}]}]})
    assert snap.quotes[0].is_priced() is False


def test_parse_handles_missing_sections():
    snap = parse_snapshot({})
    assert snap.quotes == [] and snap.platforms == []


def test_load_snapshot_real_file():
    snap = load_snapshot(os.path.join(DATA, "catalog_620001.json"))
    assert snap.pincode == "620001"
    assert set(snap.platforms) == {"Blinkit", "Zepto", "Swiggy Instamart"}
    assert len(snap.quotes) == 9  # 3 SKUs x 3 platforms
