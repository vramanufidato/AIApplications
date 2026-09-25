"""Tests for the chat notification layer (no real network)."""

import pytest

from chatgrocery.notify import build_payload, build_summary, fmt_price, send_webhook

ROWS = [
    {"name": "Amul Milk", "platform": "Blinkit/Swiggy Instamart", "price": 77.0},
    {"name": "Tata Salt", "platform": "Blinkit", "price": 22.0},
    {"name": "Aashirvaad Atta", "platform": "Blinkit", "price": 327.0},
]


def test_fmt_price():
    assert fmt_price(77.0) == "Rs.77"
    assert fmt_price(77.5) == "Rs.77.50"
    assert fmt_price(None) == "Rs.n/a"


def test_build_summary_format():
    assert build_summary(ROWS) == (
        "Quick Commerce Prices | Amul Milk: Blinkit/Swiggy Instamart Rs.77 | "
        "Tata Salt: Blinkit Rs.22 | Aashirvaad Atta: Blinkit Rs.327"
    )


def test_build_summary_custom_prefix():
    assert build_summary(ROWS, prefix="Prices").startswith("Prices | Amul Milk:")


def test_build_payload_shape():
    payload = build_payload(ROWS)
    assert set(payload.keys()) == {"text"}
    assert payload["text"].startswith("Quick Commerce Prices |")


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
    code, body = send_webhook("https://api.pumble.com/hook/abc", build_payload(ROWS),
                              session=fake)
    assert code == 200 and body == "ok"
    assert fake.calls[0]["json"]["text"].startswith("Quick Commerce Prices |")


def test_send_webhook_rejects_placeholder_url():
    with pytest.raises(ValueError):
        send_webhook("YOUR_PUMBLE_WEBHOOK_URL", build_payload(ROWS))
    with pytest.raises(ValueError):
        send_webhook("", build_payload(ROWS))
