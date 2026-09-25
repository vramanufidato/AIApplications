"""ChatFin CLI.

Examples
--------
Analyse the default NIFTY watchlist and write a report:

    python run.py

Analyse a custom watchlist and push a summary to a Pumble webhook:

    python run.py --webhook "https://api.pumble.com/.../postMessage/xxxx"
"""

from __future__ import annotations

import argparse
import json
import sys

from chatfin.data import WATCHLIST
from chatfin.pipeline import run


def parse_args(argv=None):
    p = argparse.ArgumentParser(description="ChatFin — NSE technical signal agent")
    p.add_argument("--symbols", default=",".join(WATCHLIST.keys()),
                   help="comma-separated watchlist (default: NIFTY 50 sample)")
    p.add_argument("--outdir", default="output", help="report output directory")
    p.add_argument("--webhook", default=None, help="Pumble incoming-webhook URL")
    p.add_argument("--prefix", default="NIFTY 50 Signals", help="summary prefix")
    p.add_argument("--json", action="store_true", help="dump raw result JSON")
    return p.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    names = [s.strip().upper() for s in args.symbols.split(",") if s.strip()]
    watchlist = {n: WATCHLIST.get(n, f"{n}.NS") for n in names}

    result = run(watchlist=watchlist, outdir=args.outdir,
                 webhook_url=args.webhook, prefix=args.prefix)

    if args.json:
        print(json.dumps(result, indent=2))
        return 0

    print(f"ChatFin — {len(result['rows'])} symbol(s) analysed")
    for row in result["rows"]:
        print(f"  {row['name']:<12} close={row['price']}  "
              f"sma30={row['sma30']}  rsi14={row['rsi14']}  -> {row['signal']}")
    if result["errors"]:
        print("  errors:", result["errors"])
    print(f"report: {result['report']}")
    if result["notify"]:
        print(f"notify: HTTP {result['notify']['status']} {result['notify']['body']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
