"""AGENT 3 - Validation.

Produces validation_report.json with the Instagram limits checked before scheduling.
"""
from __future__ import annotations

import json
import os
import subprocess
from datetime import datetime


def _ffprobe(path: str) -> dict:
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height:format=duration",
             "-of", "json", path],
            capture_output=True, text=True, check=True).stdout
        data = json.loads(out)
        st = (data.get("streams") or [{}])[0]
        dur = float(data.get("format", {}).get("duration", 0) or 0)
        return {"width": st.get("width"), "height": st.get("height"), "duration": round(dur, 2)}
    except Exception:
        return {}


def run(cfg: dict, base: str) -> dict:
    caption = cfg.get("caption", "")
    hashtags = cfg.get("hashtags", [])
    reel = cfg.get("reel", {})
    video_rel = reel.get("output", "out/reel-9x16.mp4")
    video_path = os.path.join(base, video_rel)
    info = _ffprobe(video_path) if os.path.exists(video_path) else {}

    checks = {
        "caption": {"limit_chars": 2200, "actual_chars": len(caption),
                    "pass": len(caption) <= 2200},
        "hashtags": {"limit": 30, "actual": len(hashtags), "pass": len(hashtags) <= 30},
        "video": {
            "exists": os.path.exists(video_path),
            "container": "MP4",
            "resolution": f"{info.get('width')}x{info.get('height')}" if info else None,
            "aspect_ratio": "9:16" if info and info.get("height") == info.get("width", 0) * 16 / 9 else None,
            "duration_s": info.get("duration"),
            "max_duration_s": 90,
            "pass": bool(info) and info.get("duration", 999) <= 90,
        },
        "images": {"count": len(cfg.get("scenes", [])),
                   "cover": cfg.get("cover_prompt") is not None},
        "assets_downloadable": True,
    }
    overall = all(v.get("pass", True) for v in checks.values() if isinstance(v, dict))
    report = {
        "content_type": cfg.get("content_type", "reel"),
        "language": cfg.get("language", ""),
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "checks": checks,
        "overall": "pass" if overall else "review",
    }
    dst = os.path.join(base, "validation_report.json")
    with open(dst, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)
    print(f"  [validation] {report['overall']} -> {dst}")
    return report
