"""AGENT 1 - Content generation.

Writes the content pack (hooks, caption, hashtags, script) to markdown.
The creative text itself comes from the config (authored by the model / user);
this agent formats it into the deliverable pack and reports key metrics.
"""
from __future__ import annotations

import os


def _fmt_list(items) -> str:
    return "\n".join(f"{i}. {x}" for i, x in enumerate(items, 1))


def run(cfg: dict, base: str) -> None:
    caption = cfg.get("caption", "")
    hashtags = cfg.get("hashtags", [])
    hooks = cfg.get("hooks", [])

    lines = [
        f"# {cfg.get('title', cfg.get('slug', 'Instagram Content'))} — Content Pack",
        "",
        f"**CONTENT_TYPE:** {cfg.get('content_type', 'reel')}  ",
        f"**LANGUAGE:** {cfg.get('language', 'en-US')}  ",
        f"**TOPIC:** {cfg.get('topic', '')}  ",
        f"**THEME:** {cfg.get('theme', '')}  ",
        "",
        "## Hooks",
        _fmt_list(hooks) if hooks else "_(none)_",
        "",
        "## Caption",
        caption,
        "",
        f"_(caption length: {len(caption)} chars, limit 2200)_",
        "",
        f"## Hashtags ({len(hashtags)})",
        " ".join(hashtags),
        "",
        "## Scene prompts",
        _fmt_list([f"{s['name']}: {s['prompt']}" for s in cfg.get("scenes", [])]),
        "",
        "## Voiceover lines",
        _fmt_list([f"{v['name']}: {v['text']}" for v in cfg.get("voice_lines", [])]),
        "",
    ]

    dst = os.path.join(base, "01-reel-content-pack.md")
    os.makedirs(base, exist_ok=True)
    with open(dst, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines))
    print(f"  [content] wrote {dst}")
