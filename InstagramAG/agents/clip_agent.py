"""Video source providers.

`resolve_clips` returns the ordered list of animation clips for the
`meta_ai` (animation) provider.

Meta AI (app / web "Animate" / Vibes) has no free public API, so clips are
produced in the Meta AI app and dropped into `assets/clips/` (or listed in
config `video.clips`). This agent locates and validates them; assembly_agent
does the normalising, captioning and audio mix.
"""
from __future__ import annotations

import os

VIDEO_EXTS = (".mp4", ".mov", ".m4v", ".webm")


def resolve_clips(cfg: dict, base: str) -> list[str]:
    video = cfg.get("video", {})
    explicit = video.get("clips") or []
    clips: list[str] = []

    if explicit:
        for c in explicit:
            path = c if os.path.isabs(c) else os.path.join(base, c)
            clips.append(path)
    else:
        clips_dir = video.get("clips_dir", "assets/clips")
        d = clips_dir if os.path.isabs(clips_dir) else os.path.join(base, clips_dir)
        if os.path.isdir(d):
            clips = [os.path.join(d, f) for f in sorted(os.listdir(d))
                     if f.lower().endswith(VIDEO_EXTS)]

    if not clips:
        raise RuntimeError(
            "No Meta AI animation clips found. Generate 3-6 clips in the Meta AI app "
            f"and place them in '{(video.get('clips_dir', 'assets/clips'))}' "
            "(or list them in config -> video.clips). See docs/meta-ai-animation.md."
        )

    missing = [c for c in clips if not os.path.exists(c)]
    if missing:
        raise RuntimeError("Missing clip files: " + ", ".join(missing))

    print(f"  [clip] {len(clips)} Meta AI clip(s): " +
          ", ".join(os.path.basename(c) for c in clips))
    return clips
