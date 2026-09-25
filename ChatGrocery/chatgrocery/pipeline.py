"""End-to-end orchestration: load snapshot -> compare -> report -> notify."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

from .catalog import load_snapshot
from .compare import build_matrix, find_diffs, platform_availability
from .notify import build_payload, send_webhook
from .report import build_markdown, write_report


def notify_rows(matrix) -> list:
    """Turn the comparison matrix into the flat rows the chat summary needs."""
    return [
        {"name": row["sku_name"], "platform": row["cheapest"], "price": row["best_price"]}
        for row in matrix
    ]


def run(
    catalog_path: str,
    outdir: str = "output",
    webhook_url: Optional[str] = None,
    threshold: float = 10.0,
    prefix: str = "Quick Commerce Prices",
    title: str = "Quick Commerce Price Report",
) -> Dict:
    """Run the full pipeline. Returns a result dict (also writes a report)."""
    snapshot = load_snapshot(catalog_path)
    matrix = build_matrix(snapshot.quotes)
    diffs = find_diffs(snapshot.quotes, threshold=threshold)
    availability = platform_availability(snapshot.quotes, snapshot.platforms)

    markdown = build_markdown(
        snapshot, matrix, diffs, availability=availability, threshold=threshold, title=title
    )
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d")
    pin = snapshot.pincode or "na"
    report_path = str(out / f"price_report_{pin}_{stamp}.md")
    write_report(report_path, markdown)

    notify_status = None
    if webhook_url:
        payload = build_payload(notify_rows(matrix), prefix=prefix)
        code, body = send_webhook(webhook_url, payload)
        notify_status = {"status": code, "body": body, "text": payload["text"]}

    return {
        "generated": datetime.now().isoformat(timespec="seconds"),
        "location": snapshot.location,
        "pincode": snapshot.pincode,
        "captured": snapshot.captured,
        "matrix": matrix,
        "diffs": diffs,
        "availability": availability,
        "report": report_path,
        "notify": notify_status,
    }
