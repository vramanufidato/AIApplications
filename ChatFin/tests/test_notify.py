"""Tests for the chat notification layer (no real network)."""

import pytest

from chatfin.notify import build_payload, build_summary, send_webhook

SIGNALS = {"RELIANCE": "Bearish", "TCS": "Bearish", "HDFCBANK": "Bullish",
           "INFY": "Bearish", "ICICIBANK": "Bearish"}


def test_build_summary_format():
    assert build_summary(SIGNALS) == (
        "NIFTY 50 Signals | RELIANCE: Bearish | TCS: Bearish | "
        "HDFCBANK: Bullish | INFY: Bearish | ICICIBANK: Bearish"
    )


def test_build_summary_custom_prefix():
    assert build_summary({"A": "Bullish"}, prefix="Signals").startswith("Signals | A:")


def test_build_payload_shape():
    payload = build_payload(SIGNALS)
    assert set(payload.keys()) == {"text"}
    assert payload["text"].startswith("NIFTY 50 Signals |")


class _FakeResp:
    def __init__(self, status, text):
        self.status_code = status
        self.text = text


class _FakeSession:
    def __init__(self, status, text):
        self.status, self.text, self.calls = status, text, []

    def post(self, url, json=None, timeout=None, headers=None):
        self.calls.append({"url": url, "json": json})
        return _FakeResp(self.status, self.text)


def test_send_webhook_posts_json():
    fake = _FakeSession(200, "ok")
    code, body = send_webhook("https://api.pumble.com/hook/abc", build_payload(SIGNALS),
                              session=fake)
    assert code == 200 and body == "ok"
    assert fake.calls[0]["json"]["text"].startswith("NIFTY 50 Signals |")


def test_send_webhook_rejects_placeholder_url():
    with pytest.raises(ValueError):
        send_webhook("YOUR_PUMBLE_WEBHOOK_URL", build_payload(SIGNALS))
    with pytest.raises(ValueError):
        send_webhook("", build_payload(SIGNALS))
