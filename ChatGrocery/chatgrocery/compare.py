"""Pure price-comparison logic — no I/O, fully deterministic.

Everything the agent decides (cheapest platform, per-SKU spread, which SKUs
cross the diff threshold, which platforms serve the location) lives here so it
can be verified offline.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

from .models import Quote


def group_by_sku(quotes: List[Quote]) -> Dict[str, List[Quote]]:
    """Group quotes by SKU id, preserving first-seen order."""
    grouped: Dict[str, List[Quote]] = {}
    for q in quotes:
        grouped.setdefault(q.sku_id, []).append(q)
    return grouped


def priced(quotes: List[Quote]) -> List[Quote]:
    """Only the quotes that carry a usable price."""
    return [q for q in quotes if q.is_priced()]


def cheapest(quotes_for_sku: List[Quote]) -> Optional[Quote]:
    """Lowest-priced available quote for one SKU (ties broken by platform name)."""
    rows = priced(quotes_for_sku)
    if not rows:
        return None
    return min(rows, key=lambda q: (q.price, q.platform))


def cheapest_label(quotes_for_sku: List[Quote]) -> Tuple[str, Optional[float]]:
    """Return (platform-label, best-price) for a SKU.

    Ties are joined with ``/`` and sorted, e.g. ``("Blinkit/Instamart", 77.0)``.
    With no priced row the label is ``"n/a"`` and the price ``None``.
    """
    rows = priced(quotes_for_sku)
    if not rows:
        return "n/a", None
    best = min(q.price for q in rows)
    names = sorted({q.platform for q in rows if q.price == best})
    return "/".join(names), best


def sku_spread(quotes_for_sku: List[Quote]) -> Optional[float]:
    """Max-minus-min among available prices; ``None`` when fewer than two."""
    rows = priced(quotes_for_sku)
    if len(rows) < 2:
        return None
    return round(max(q.price for q in rows) - min(q.price for q in rows), 2)


def find_diffs(quotes: List[Quote], threshold: float = 10.0) -> List[Dict]:
    """SKUs whose cross-platform spread **exceeds** ``threshold`` (strict ``>``)."""
    diffs: List[Dict] = []
    for sku_id, rows in group_by_sku(quotes).items():
        spread = sku_spread(rows)
        if spread is None or spread <= threshold:
            continue
        ordered = sorted(priced(rows), key=lambda q: q.price)
        diffs.append(
            {
                "sku_id": sku_id,
                "sku_name": rows[0].sku_name,
                "spread": spread,
                "cheapest": ordered[0].platform,
                "cheapest_price": ordered[0].price,
                "priciest": ordered[-1].platform,
                "priciest_price": ordered[-1].price,
            }
        )
    return diffs


def platform_availability(
    quotes: List[Quote], platforms: Optional[List[str]] = None
) -> Dict[str, bool]:
    """Map each platform to whether it has any priced row in this snapshot."""
    names = list(platforms) if platforms else sorted({q.platform for q in quotes})
    served = {q.platform for q in priced(quotes)}
    return {name: (name in served) for name in names}


def build_matrix(quotes: List[Quote]) -> List[Dict]:
    """One row per SKU: platform -> price, plus cheapest label and spread."""
    rows: List[Dict] = []
    for sku_id, group in group_by_sku(quotes).items():
        label, best = cheapest_label(group)
        rows.append(
            {
                "sku_id": sku_id,
                "sku_name": group[0].sku_name,
                "prices": {q.platform: (q.price if q.is_priced() else None) for q in group},
                "cheapest": label,
                "best_price": best,
                "spread": sku_spread(group),
            }
        )
    return rows
