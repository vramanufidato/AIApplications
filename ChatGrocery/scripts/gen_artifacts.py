"""Render captured console output into terminal-styled HTML for screenshots.

Usage (from the project root):

    python scripts/gen_artifacts.py

Reads text captures from ``output/`` and writes terminal-styled HTML files.
Screenshot them with a headless browser, e.g.:

    chrome --headless=new --screenshot=screenshots/01_pytest_terminal.png ^
           --window-size=1100,820 output/term_tests.html
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
  pre{{margin:0;padding:18px 20px;font-size:13.5px;line-height:1.55;
       white-space:pre-wrap;word-break:break-word;}}
  .pass{{color:#3fb950;font-weight:600}}
  .fail{{color:#f85149;font-weight:600}}
  .hi{{color:#58a6ff}}
  .warn{{color:#d29922}}
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
    out = out.replace("HTTP 200", '<span class="pass">HTTP 200</span>')
    out = out.replace("diffs >", '<span class="warn">diffs &gt;</span>')
    return out


def read_text(path: str) -> str:
    """Read a capture file, tolerating PowerShell's UTF-16 default and UTF-8."""
    data = open(path, "rb").read()
    for enc in ("utf-8-sig", "utf-16", "utf-16-le", "utf-8"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def render(src: str, dst: str, title: str) -> None:
    if not os.path.exists(src):
        print(f"skip (missing): {src}")
        return
    body = colorize(read_text(src))
    with open(dst, "w", encoding="utf-8") as fh:
        fh.write(TEMPLATE.format(title=html.escape(title), body=body))
    print(f"wrote {dst}")


ARTIFACTS = [
    ("test-output.txt", "term_tests.html", "pytest  —  ChatGrocery test suite"),
    ("cli-output.txt", "term_cli.html", "python run.py  —  live 620001 snapshot"),
    ("demo-output.txt", "term_demo.html", "python run.py --catalog data/catalog_demo.json  —  diff detected"),
    ("notify-output.txt", "term_pumble.html", "Pumble incoming webhook  —  delivery"),
]


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for src, dst, title in ARTIFACTS:
        render(os.path.join(OUT, src), os.path.join(OUT, dst), title)
