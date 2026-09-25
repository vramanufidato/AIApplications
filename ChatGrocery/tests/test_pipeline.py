"""End-to-end pipeline tests over the bundled snapshots (offline)."""

import os

import chatgrocery.pipeline as pipeline

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
REAL = os.path.join(DATA, "catalog_620001.json")
DEMO = os.path.join(DATA, "catalog_demo.json")


def test_real_snapshot_has_no_diffs(tmp_path):
    result = pipeline.run(REAL, outdir=str(tmp_path), threshold=10.0)
    assert result["diffs"] == []
    assert result["pincode"] == "620001"


def test_real_snapshot_cheapest_calls(tmp_path):
    result = pipeline.run(REAL, outdir=str(tmp_path))
    by_name = {row["sku_name"]: row for row in result["matrix"]}
    assert by_name["Tata Salt 1kg"]["cheapest"] == "Blinkit"
    assert by_name["Tata Salt 1kg"]["best_price"] == 22.0
    assert by_name["Amul Taaza Milk 1L"]["cheapest"] == "Blinkit/Swiggy Instamart"


def test_real_snapshot_zepto_unavailable(tmp_path):
    result = pipeline.run(REAL, outdir=str(tmp_path))
    assert result["availability"]["Zepto"] is False
    assert result["availability"]["Blinkit"] is True


def test_demo_snapshot_detects_diffs(tmp_path):
    result = pipeline.run(DEMO, outdir=str(tmp_path), threshold=10.0)
    names = {d["sku_name"] for d in result["diffs"]}
    assert names == {"Amul Taaza Milk 1L", "Aashirvaad Atta 5kg"}
    assert {d["sku_name"]: d["spread"] for d in result["diffs"]}["Amul Taaza Milk 1L"] == 12.0


def test_pipeline_writes_report(tmp_path):
    result = pipeline.run(REAL, outdir=str(tmp_path))
    assert os.path.exists(result["report"])
    text = open(result["report"], encoding="utf-8").read()
    assert "Price Matrix" in text and "Cheapest Platform per SKU" in text


def test_pipeline_notify_posts_summary(tmp_path, monkeypatch):
    captured = {}

    def fake_send(url, payload, **kwargs):
        captured["url"] = url
        captured["payload"] = payload
        return 200, "ok"

    monkeypatch.setattr(pipeline, "send_webhook", fake_send)
    result = pipeline.run(REAL, outdir=str(tmp_path),
                          webhook_url="https://api.pumble.com/hook/abc")
    assert result["notify"]["status"] == 200
    assert captured["payload"]["text"].startswith("Quick Commerce Prices |")
    assert "Tata Salt 1kg: Blinkit Rs.22" in captured["payload"]["text"]


def test_skip_notify_without_url(tmp_path):
    result = pipeline.run(REAL, outdir=str(tmp_path))
    assert result["notify"] is None
