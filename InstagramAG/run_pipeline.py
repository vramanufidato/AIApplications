"""InstagramAG - pipeline orchestrator.

Runs the 4-agent flow: content -> asset/voice/assembly -> validation -> scheduling.

Usage:
    python run_pipeline.py --config config.json
    python run_pipeline.py --config config.json --skip-assets   # reuse existing images
    python run_pipeline.py --config config.json --skip-render   # docs + validation only
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from agents import (asset_agent, assembly_agent, content_agent, scheduling_agent,
                    validation_agent, voice_agent)


def main() -> int:
    ap = argparse.ArgumentParser(description="InstagramAG pipeline")
    ap.add_argument("--config", required=True)
    ap.add_argument("--skip-assets", action="store_true", help="reuse existing scene images")
    ap.add_argument("--skip-voice", action="store_true", help="reuse existing voiceover")
    ap.add_argument("--skip-render", action="store_true", help="skip ffmpeg assembly")
    args = ap.parse_args()

    with open(args.config, encoding="utf-8") as fh:
        cfg = json.load(fh)

    base = cfg.get("output_dir", os.path.join("data", cfg.get("slug", "content")))
    os.makedirs(base, exist_ok=True)
    print(f"== InstagramAG :: {cfg.get('slug', '')} -> {base}")

    print("[1/4] content")
    content_agent.run(cfg, base)

    print("[2/4] assets")
    if not args.skip_assets:
        asset_agent.run(cfg, base)
    if not args.skip_voice:
        voice_agent.run(cfg, base)

    print("[3/4] assembly")
    if not args.skip_render:
        assembly_agent.run(cfg, base)

    print("[4/4] validation + scheduling")
    validation_agent.run(cfg, base)
    scheduling_agent.run(cfg, base)

    print("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
