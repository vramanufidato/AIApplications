"""Markdown report builder. Pure string formatting — no I/O in the builder."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from . import __version__
from .models import Snapshot

RUPEE = "\u20b9"


def fmt_money(value: Optional[float]) -> str:
    """Format a rupee amount: ``77`` -> ``₹77``, ``77.5`` -> ``₹77.50``, None -> ``—``."""
    if value is None:
        return "\u2014"
    if float(value).is_integer():
        return f"{RUPEE}{int(value)}"
    return f"{RUPEE}{value:.2f}"


def _columns(snapshot: Snapshot, matrix: List[Dict]) -> List[str]:
    if snapshot.platforms:
        return list(snapshot.platforms)
    seen: List[str] = []
    for row in matrix:
        for platform in row["prices"]:
            if platform not in seen:
                seen.append(platform)
    return seen


def build_markdown(
    snapshot: Snapshot,
    matrix: List[Dict],
    diffs: List[Dict],
    availability: Optional[Dict[str, bool]] = None,
    threshold: float = 10.0,
    generated_at: Optional[str] = None,
    title: str = "Quick Commerce Price Report",
) -> str:
    """Render the comparison into a Markdown report."""
    generated_at = generated_at or datetime.now().strftime("%Y-%m-%d %H:%M")
    columns = _columns(snapshot, matrix)

    lines: List[str] = []
    lines.append(f"# {title}")
    lines.append("")
    loc = snapshot.location or "n/a"
    pin = f" (pincode {snapshot.pincode})" if snapshot.pincode else ""
    lines.append(f"**Location:** {loc}{pin}  ")
    lines.append(f"**Captured:** {snapshot.captured or 'n/a'}  ")
    lines.append(f"**Generated:** {generated_at}  ")
    lines.append(f"**Agent:** ChatGrocery v{__version__}  ")
    lines.append(f"**Diff threshold:** {fmt_money(threshold)}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Price Matrix")
    lines.append("")
    header = "| SKU | " + " | ".join(columns) + " | Cheapest | Spread |"
    sep = "|---|" + "---:|" * len(columns) + ":--:|---:|"
    lines.append(header)
    lines.append(sep)
    for row in matrix:
        cells = [fmt_money(row["prices"].get(c)) for c in columns]
        spread = fmt_money(row["spread"]) if row["spread"] is not None else "\u2014"
        lines.append(
            f"| {row['sku_name']} | " + " | ".join(cells)
            + f" | **{row['cheapest']}** | {spread} |"
        )
    lines.append("")

    lines.append("## Cheapest Platform per SKU")
    lines.append("")
    lines.append("| SKU | Cheapest | Price |")
    lines.append("|---|---|---:|")
    for row in matrix:
        best = fmt_money(row["best_price"]) if row["best_price"] is not None else "n/a"
        lines.append(f"| {row['sku_name']} | {row['cheapest']} | {best} |")
    lines.append("")

    lines.append(f"## Diff Report (gap > {fmt_money(threshold)})")
    lines.append("")
    if diffs:
        lines.append("| SKU | Cheapest | Price | Priciest | Price | Gap |")
        lines.append("|---|---|---:|---|---:|---:|")
        for d in diffs:
            lines.append(
                f"| {d['sku_name']} | {d['cheapest']} | {fmt_money(d['cheapest_price'])} "
                f"| {d['priciest']} | {fmt_money(d['priciest_price'])} | {fmt_money(d['spread'])} |"
            )
    else:
        lines.append(f"_No SKU exceeds the {fmt_money(threshold)} threshold._")
    lines.append("")

    if availability:
        lines.append("## Platform Availability")
        lines.append("")
        lines.append("| Platform | Serviceable |")
        lines.append("|---|:--:|")
        for name, ok in availability.items():
            lines.append(f"| {name} | {'yes' if ok else 'no'} |")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("*Point-in-time quick-commerce prices — dark-store specific, not an offer.*")
    lines.append("")
    return "\n".join(lines)


def write_report(path: str, markdown: str) -> str:
    """Write ``markdown`` to ``path``; returns the path written."""
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(markdown)
    return path
