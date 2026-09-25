"""Chat notification — build a summary and POST it to a Pumble incoming webhook."""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

import requests

USER_AGENT = "ChatGrocery/0.1 (+https://github.com/vramanufidato/AIApplications)"


def fmt_price(value: Optional[float]) -> str:
    """``77.0`` -> ``Rs.77``, ``77.5`` -> ``Rs.77.50``, None -> ``Rs.n/a``."""
    if value is None:
        return "Rs.n/a"
    if float(value).is_integer():
        return f"Rs.{int(value)}"
    return f"Rs.{value:.2f}"


def build_summary(rows: List[Dict], prefix: str = "Quick Commerce Prices") -> str:
    """Build the one-line chat summary.

    Each row is ``{"name": ..., "platform": ..., "price": ...}``. Output example::

        Quick Commerce Prices | Amul Milk: Blinkit/Instamart Rs.77 | Tata Salt: Blinkit Rs.22
    """
    parts = [f"{r['name']}: {r['platform']} {fmt_price(r.get('price'))}" for r in rows]
    return " | ".join([prefix] + parts)


def build_payload(rows: List[Dict], prefix: str = "Quick Commerce Prices") -> Dict:
    """Pumble incoming-webhook payload (``{"text": "..."}``)."""
    return {"text": build_summary(rows, prefix=prefix)}


def send_webhook(
    url: str,
    payload: Dict,
    timeout: int = 20,
    session: Optional[requests.Session] = None,
) -> Tuple[int, str]:
    """POST ``payload`` as JSON to ``url``. Returns (status_code, body)."""
    if not url or "YOUR_" in url:
        raise ValueError("webhook URL is missing or still a placeholder")
    http = session or requests
    resp = http.post(
        url, json=payload, timeout=timeout, headers={"User-Agent": USER_AGENT}
    )
    return resp.status_code, (resp.text or "").strip()
