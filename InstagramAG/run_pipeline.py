"""InstagramAG - pipeline orchestrator.

Runs the 4-agent flow: content -> assets/voice/assembly -> validation -> scheduling.

Default video provider is Meta AI animation ("meta_ai"), producing a 30s Reel.
Switch to "stills" for the Ken-Burns still-image Reel.

Usage:
    python run_pipeline.py --config config.json
    python run_pipeline.py --config config.json --provider stills
    python run_pipeline.py --config config.json --skip-assets
    python run_pipeline.py --config config.json --skip-render
"""
from __future__ import annotations

import argparse
import json
import os
import sys

from agents import (assembly_agent, asset_agent, clip_agent, content_agent,
                    scheduling_agent, thumbnail_agent, validation_agent, voice_agent)


def main() -> int:
    ap = argparse.ArgumentParser(description="InstagramAG pipeline")
    ap.add_argument("--config", required=True)
    ap.add_argument("--provider", choices=["meta_ai", "stills"],
                    help="video source (default: config value or meta_ai)")
    ap.add_argument("--skip-assets", action="store_true", help="reuse existing images/clips")
    ap.add_argument("--skip-voice", action="store_true", help="reuse existing voiceover")
    ap.add_argument("--skip-render", action="store_true", help="skip ffmpeg assembly")
    args = ap.parse_args()

    with open(args.config, encoding="utf-8") as fh:
        cfg = json.load(fh)

    cfg.setdefault("video", {})
    if args.provider:
        cfg["video"]["provider"] = args.provider
    provider = cfg["video"].setdefault("provider", "meta_ai")
    cfg["video"].setdefault("duration", 30)

    base = cfg.get("output_dir", os.path.join("data", cfg.get("slug", "content")))
    os.makedirs(base, exist_ok=True)
    print(f"== InstagramAG :: {cfg.get('slug', '')} -> {base} (provider={provider}, "
          f"{cfg['video']['duration']}s)")

    print("[1/4] content")
    content_agent.run(cfg, base)

    print("[2/4] assets")
    if not args.skip_assets:
        asset_agent.run(cfg, base, scenes=(provider == "stills"))
    if provider == "meta_ai" and not args.skip_render:
        clip_agent.resolve_clips(cfg, base)  # fail fast if clips are missing
    if not args.skip_voice:
        voice_agent.run(cfg, base)

    print("[3/4] assembly")
    if not args.skip_render:
        assembly_agent.run(cfg, base)
        if cfg.get("thumbnails"):
            thumbnail_agent.run(cfg, base)

    print("[4/4] validation + scheduling")
    validation_agent.run(cfg, base)
    scheduling_agent.run(cfg, base)

    print("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
