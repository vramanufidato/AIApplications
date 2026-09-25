"""Chat notification — build a summary and POST it to a Pumble incoming webhook."""

from __future__ import annotations

from typing import Dict, Optional, Tuple

import requests

USER_AGENT = "ChatFin/0.1 (+https://github.com/vramanufidato/AIApplications)"


def build_summary(signals: Dict[str, str], prefix: str = "NIFTY 50 Signals") -> str:
    """Build the one-line chat summary, e.g. ``NIFTY 50 Signals | RELIANCE: Bearish | ...``."""
    parts = [f"{name}: {sig}" for name, sig in signals.items()]
    return " | ".join([prefix] + parts)


def build_payload(signals: Dict[str, str], prefix: str = "NIFTY 50 Signals") -> Dict:
    """Pumble incoming-webhook payload (``{"text": "..."}``)."""
    return {"text": build_summary(signals, prefix=prefix)}


def send_webhook(url: str, payload: Dict, timeout: int = 20,
                 session: Optional[requests.Session] = None) -> Tuple[int, str]:
    """POST ``payload`` as JSON to ``url``. Returns (status_code, body)."""
    if not url or "YOUR_" in url:
        raise ValueError("webhook URL is missing or still a placeholder")
    http = session or requests
    resp = http.post(url, json=payload, timeout=timeout,
                     headers={"User-Agent": USER_AGENT})
    return resp.status_code, (resp.text or "").strip()
