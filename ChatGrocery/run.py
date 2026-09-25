"""ChatGrocery CLI.

Examples
--------
Compare the bundled snapshot and write a report:

    python run.py

Compare a custom snapshot and push a summary to a Pumble webhook:

    python run.py --catalog data/catalog_620001.json \
        --webhook "https://api.pumble.com/.../postMessage/xxxx"
"""

from __future__ import annotations

import argparse
import json
import os
import sys

# Make the package importable even when Python runs in isolated mode (no script
# dir / PYTHONPATH on sys.path), which is the case on some managed installs.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from chatgrocery.pipeline import run

DEFAULT_CATALOG = os.path.join("data", "catalog_620001.json")


def parse_args(argv=None):
    p = argparse.ArgumentParser(description="ChatGrocery — quick-commerce price monitor")
    p.add_argument("--catalog", default=DEFAULT_CATALOG, help="price snapshot JSON")
    p.add_argument("--outdir", default="output", help="report output directory")
    p.add_argument("--webhook", default=None, help="Pumble incoming-webhook URL")
    p.add_argument("--threshold", type=float, default=10.0, help="diff-report threshold (Rs)")
    p.add_argument("--prefix", default="Quick Commerce Prices", help="summary prefix")
    p.add_argument("--json", action="store_true", help="dump raw result JSON")
    return p.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    result = run(
        catalog_path=args.catalog,
        outdir=args.outdir,
        webhook_url=args.webhook,
        threshold=args.threshold,
        prefix=args.prefix,
    )

    if args.json:
        print(json.dumps(result, indent=2))
        return 0

    loc = result["location"] or "n/a"
    print(f"ChatGrocery — {len(result['matrix'])} SKU(s) @ {loc} ({result['pincode']})")
    for row in result["matrix"]:
        prices = "  ".join(
            f"{p}={'-' if v is None else v}" for p, v in row["prices"].items()
        )
        print(f"  {row['sku_name']:<24} {prices}  -> {row['cheapest']} "
              f"{'' if row['best_price'] is None else row['best_price']}")
    print(f"diffs > Rs.{args.threshold:g}: {len(result['diffs'])}")
    for d in result["diffs"]:
        print(f"  {d['sku_name']}: {d['cheapest']} Rs.{d['cheapest_price']} vs "
              f"{d['priciest']} Rs.{d['priciest_price']} (gap Rs.{d['spread']})")
    print(f"report: {result['report']}")
    if result["notify"]:
        print(f"notify: HTTP {result['notify']['status']} {result['notify']['body']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
