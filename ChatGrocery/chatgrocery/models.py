"""Domain models for a quick-commerce price snapshot."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Quote:
    """A single platform price for a single SKU.

    ``available`` is False when the platform does not serve the location or the
    item is out of stock; in that case ``price`` is normally ``None``.
    """

    sku_id: str
    sku_name: str
    platform: str
    price: Optional[float] = None
    available: bool = True
    note: str = ""

    def is_priced(self) -> bool:
        """True only when the row carries a usable numeric price."""
        return self.available and self.price is not None


@dataclass
class Snapshot:
    """A point-in-time price snapshot for one delivery location."""

    location: str = ""
    pincode: str = ""
    captured: str = ""
    platforms: Optional[List[str]] = None
    quotes: Optional[List[Quote]] = None

    def __post_init__(self) -> None:
        if self.platforms is None:
            self.platforms = []
        if self.quotes is None:
            self.quotes = []
