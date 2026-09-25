"""Tests for the pure comparison logic."""

from chatgrocery.compare import (
    build_matrix,
    cheapest,
    cheapest_label,
    find_diffs,
    group_by_sku,
    platform_availability,
    priced,
    sku_spread,
)
from chatgrocery.models import Quote


def _q(platform, price, sku="s1", name="Thing", available=True):
    return Quote(sku_id=sku, sku_name=name, platform=platform,
                 price=price, available=available)


def test_group_by_sku():
    quotes = [_q("Blinkit", 10), _q("Zepto", 12), _q("Blinkit", 9, sku="s2", name="Other")]
    grouped = group_by_sku(quotes)
    assert set(grouped) == {"s1", "s2"} and len(grouped["s1"]) == 2


def test_priced_filters_unavailable():
    quotes = [_q("Blinkit", 10), _q("Zepto", None, available=False)]
    assert len(priced(quotes)) == 1


def test_cheapest_picks_minimum():
    quotes = [_q("Blinkit", 31), _q("Zepto", 22), _q("Instamart", 40)]
    assert cheapest(quotes).platform == "Zepto"


def test_cheapest_none_when_all_unavailable():
    quotes = [_q("Blinkit", None, available=False), _q("Zepto", None, available=False)]
    assert cheapest(quotes) is None


def test_cheapest_label_single():
    assert cheapest_label([_q("Blinkit", 22), _q("Zepto", 31)]) == ("Blinkit", 22.0)


def test_cheapest_label_tie_is_sorted_and_joined():
    label, price = cheapest_label([_q("Swiggy Instamart", 77), _q("Blinkit", 77)])
    assert label == "Blinkit/Swiggy Instamart"
    assert price == 77.0


def test_cheapest_label_na_when_empty():
    assert cheapest_label([]) == ("n/a", None)


def test_spread_two_values():
    assert sku_spread([_q("A", 22), _q("B", 31)]) == 9.0


def test_spread_single_value_is_none():
    assert sku_spread([_q("A", 22)]) is None


def test_find_diffs_above_threshold():
    quotes = [_q("Blinkit", 77), _q("Zepto", 82), _q("Instamart", 89)]
    diffs = find_diffs(quotes, threshold=10)
    assert len(diffs) == 1 and diffs[0]["spread"] == 12.0
    assert diffs[0]["cheapest"] == "Blinkit" and diffs[0]["priciest"] == "Instamart"


def test_find_diffs_boundary_equal_threshold_excluded():
    # spread exactly 10.0 must NOT qualify (strictly greater than)
    quotes = [_q("A", 20), _q("B", 30)]
    assert find_diffs(quotes, threshold=10.0) == []


def test_find_diffs_ignores_unavailable():
    quotes = [_q("A", 20), _q("B", 40, available=False)]
    assert find_diffs(quotes, threshold=5) == []


def test_platform_availability():
    quotes = [_q("Blinkit", 10), _q("Zepto", None, available=False)]
    avail = platform_availability(quotes, ["Blinkit", "Zepto", "Swiggy Instamart"])
    assert avail["Blinkit"] is True and avail["Zepto"] is False
    assert avail["Swiggy Instamart"] is False


def test_build_matrix_shape():
    quotes = [_q("Blinkit", 22), _q("Zepto", 31)]
    matrix = build_matrix(quotes)
    assert matrix[0]["prices"]["Blinkit"] == 22
    assert matrix[0]["cheapest"] == "Blinkit" and matrix[0]["spread"] == 9.0
