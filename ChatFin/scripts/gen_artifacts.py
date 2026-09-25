"""Render captured console output into terminal-styled HTML for screenshots.

Usage (from the project root):

    python scripts/gen_artifacts.py

Reads ``output/test-output.txt`` and ``output/cli-output.txt`` and writes
``output/term_tests.html`` and ``output/term_cli.html``. Screenshot them with a
headless browser, e.g.:

    chrome --headless=new --screenshot=screenshots/01_pytest.png ^
           --window-size=1100,760 output/term_tests.html
"""

from __future__ import annotations

import html
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "output")

TEMPLATE = """<!doctype html>
<html><head><meta charset="utf-8"><title>{title}</title>
<style>
  html,body{{margin:0;background:#0d1117;}}
  .win{{font-family:'Cascadia Mono','Consolas',monospace;color:#c9d1d9;
        background:#0d1117;padding:0;}}
  .bar{{background:#161b22;padding:10px 14px;display:flex;align-items:center;gap:8px;}}
  .dot{{width:12px;height:12px;border-radius:50%;display:inline-block;}}
  .r{{background:#ff5f56}}.y{{background:#ffbd2e}}.g{{background:#27c93f}}
  .title{{color:#8b949e;margin-left:10px;font-size:13px;font-family:Segoe UI,sans-serif;}}
  pre{{margin:0;padding:18px 20px;font-size:13.5px;line-height:1.5;
       white-space:pre-wrap;word-break:break-word;}}
  .pass{{color:#3fb950;font-weight:600}}
  .fail{{color:#f85149;font-weight:600}}
  .hi{{color:#58a6ff}}
  .dim{{color:#8b949e}}
</style></head>
<body><div class="win">
  <div class="bar"><span class="dot r"></span><span class="dot y"></span>
    <span class="dot g"></span><span class="title">{title}</span></div>
  <pre>{body}</pre>
</div></body></html>
"""


def colorize(text: str) -> str:
    out = html.escape(text)
    out = out.replace("PASSED", '<span class="pass">PASSED</span>')
    out = out.replace("FAILED", '<span class="fail">FAILED</span>')
    out = out.replace("passed", '<span class="pass">passed</span>')
    out = out.replace("failed", '<span class="fail">failed</span>')
    return out


def render(src: str, dst: str, title: str) -> None:
    if not os.path.exists(src):
        print(f"skip (missing): {src}")
        return
    with open(src, "r", encoding="utf-8", errors="replace") as fh:
        body = colorize(fh.read())
    with open(dst, "w", encoding="utf-8") as fh:
        fh.write(TEMPLATE.format(title=html.escape(title), body=body))
    print(f"wrote {dst}")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    render(os.path.join(OUT, "test-output.txt"),
           os.path.join(OUT, "term_tests.html"),
           "pytest -v  —  ChatFin test suite")
    render(os.path.join(OUT, "cli-output.txt"),
           os.path.join(OUT, "term_cli.html"),
           "python run.py  —  ChatFin live run")
