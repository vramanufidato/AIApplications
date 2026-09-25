"""Load price snapshots.

The collector (a browser session, a partner feed, or a scheduled scraper) writes
a JSON snapshot per run. This module is the only file-touching layer that reads
it back, and it is deliberately strict: malformed numbers become ``None`` and
missing fields get sane defaults, so downstream code never sees a bad price.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional, Union

from .models import Quote, Snapshot


def coerce_price(value: Any) -> Optional[float]:
    """Best-effort conversion to a non-negative float, else ``None``."""
    if value is None or isinstance(value, bool):
        return None
    try:
        price = float(value)
    except (TypeError, ValueError):
        return None
    if price < 0:
        return None
    return price


def parse_snapshot(data: Dict[str, Any]) -> Snapshot:
    """Validate + normalise a raw snapshot dict into a :class:`Snapshot`."""
    quotes = []
    for sku in data.get("skus", []) or []:
        sku_id = sku.get("id") or sku.get("name") or ""
        sku_name = sku.get("name") or sku_id
        unit = sku.get("unit", "")
        for row in sku.get("quotes", []) or []:
            price = coerce_price(row.get("price"))
            available = row.get("available")
            if available is None:
                available = price is not None
            quotes.append(
                Quote(
                    sku_id=sku_id,
                    sku_name=sku_name,
                    platform=row.get("platform", ""),
                    price=price,
                    available=bool(available),
                    note=row.get("note", "") or (unit and f"unit: {unit}" or ""),
                )
            )
    return Snapshot(
        location=data.get("location", ""),
        pincode=str(data.get("pincode", "")),
        captured=data.get("captured", ""),
        platforms=list(data.get("platforms", []) or []),
        quotes=quotes,
    )


def load_snapshot(path: Union[str, Path]) -> Snapshot:
    """Read a snapshot JSON file and return a normalised :class:`Snapshot`."""
    with Path(path).open("r", encoding="utf-8") as fh:
        return parse_snapshot(json.load(fh))
