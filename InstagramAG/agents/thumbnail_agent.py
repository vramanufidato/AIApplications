"""AGENT 2d - Thumbnail generation.

Renders Reel covers/thumbnails with ffmpeg (harfbuzz shaping, so Tamil renders
correctly). For every video it outputs two sizes:

  * `<name>-cover-1080x1920.png`  -> Reel cover (9:16, feed)
  * `<name>-grid-1080x1080.png`   -> profile-grid-safe square (key text kept
                                     inside the centre crop)

Design follows common thumbnail best practice:
  - one strong focal visual, darkened for text contrast
  - <=5 words of huge text, high contrast, outlined/shadowed
  - a consistent brand mark + accent colour (series recognition)
  - a single benefit badge ("first episode free")
  - text kept inside the safe zone (away from IG UI at top/bottom)
"""
from __future__ import annotations

import os
import subprocess

TAMIL = "C:/Windows/Fonts/Nirmala.ttc"
LATIN = "C:/Windows/Fonts/arialbd.ttf"
ACCENT = "0x2FA8FF"
INK = "0x04121F"

LAYOUT = {
    "cover-1080x1920": {
        "size": (1080, 1920),
        "scrims": [(0, 980, 1080, 940, 0.45), (0, 1200, 1080, 720, 0.30)],
        "brand": (64, 70, 36),
        "tag": (64, 78, 30),
        "title": (1120, 170),
        "bar": (1330, 320, 10),
        "kicker": (1370, 46),
        "badge": (1480, 46),
    },
    "grid-1080x1080": {
        "size": (1080, 1080),
        "scrims": [(0, 470, 1080, 610, 0.45)],
        "brand": (54, 54, 34),
        "tag": (54, 60, 28),
        "title": (600, 150),
        "bar": (790, 260, 9),
        "kicker": (825, 42),
        "badge": (920, 40),
    },
}


def _esc(path: str) -> str:
    return path.replace("\\", "/").replace(":", "\\:")


def _write(texts: dict, tdir: str) -> dict:
    os.makedirs(tdir, exist_ok=True)
    out = {}
    for k, v in texts.items():
        p = os.path.join(tdir, f"{k}.txt")
        with open(p, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(v)
        out[k] = os.path.basename(p)
    return out


def render(base_img: str, out_png: str, kind: str, tf: dict, tdir: str) -> None:
    L = LAYOUT[kind]
    W, H = L["size"]
    filters = [
        f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1",
        "eq=brightness=-0.05:contrast=1.06:saturation=1.06",
        "vignette=PI/6",
    ]
    for (x, y, w, h, a) in L["scrims"]:
        filters.append(f"drawbox=x={x}:y={y}:w={w}:h={h}:color=black@{a}:t=fill")

    bx, by, bs = L["brand"]
    filters.append(
        f"drawtext=fontfile='{_esc(LATIN)}':textfile='{tf['brand']}':fontcolor=white:"
        f"fontsize={bs}:box=1:boxcolor=black@0.5:boxborderw=18:x={bx}:y={by}")

    tx, ty, ts = L["tag"]
    filters.append(
        f"drawtext=fontfile='{_esc(LATIN)}':textfile='{tf['tag']}':fontcolor={ACCENT}:"
        f"fontsize={ts}:x=w-text_w-{tx}:y={ty}")

    cy, cs = L["title"]
    filters.append(
        f"drawtext=fontfile='{_esc(TAMIL)}':textfile='{tf['title']}':fontcolor=white:"
        f"fontsize={cs}:borderw=4:bordercolor=black@0.5:"
        f"shadowcolor=black@0.9:shadowx=6:shadowy=6:x=(w-text_w)/2:y={cy}")

    by_, bw, bh = L["bar"]
    filters.append(f"drawbox=x=(w-{bw})/2:y={by_}:w={bw}:h={bh}:color={ACCENT}@1:t=fill")

    ky, ks = L["kicker"]
    filters.append(
        f"drawtext=fontfile='{_esc(TAMIL)}':textfile='{tf['kicker']}':fontcolor=0xD8E8FA:"
        f"fontsize={ks}:shadowcolor=black@0.8:shadowx=3:shadowy=3:x=(w-text_w)/2:y={ky}")

    gy, gs = L["badge"]
    filters.append(
        f"drawtext=fontfile='{_esc(TAMIL)}':textfile='{tf['badge']}':fontcolor={INK}:"
        f"fontsize={gs}:box=1:boxcolor={ACCENT}@0.92:boxborderw=24:x=(w-text_w)/2:y={gy}")

    cmd = ["ffmpeg", "-y", "-i", base_img,
           "-vf", ",".join(filters), "-frames:v", "1", out_png]
    p = subprocess.run(cmd, cwd=tdir, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if p.returncode != 0:
        raise RuntimeError("thumbnail ffmpeg failed:\n" + (p.stderr or "")[-2500:])
    print(f"  [thumbnail] {os.path.basename(out_png)}")


def _frame_from_video(video: str, t: float, dst: str) -> None:
    subprocess.run(["ffmpeg", "-y", "-ss", str(t), "-i", video, "-frames:v", "1", dst],
                   check=True, capture_output=True)


def run(cfg: dict, base: str) -> list[str]:
    tdir = os.path.join(base, "_thumb_txt")
    outdir = os.path.join(base, "thumbnails")
    os.makedirs(outdir, exist_ok=True)
    produced = []

    for item in cfg.get("thumbnails", []):
        name = item["name"]
        # resolve a base still
        if item.get("video"):
            src = os.path.join(base, "_thumb_base.png")
            _frame_from_video(os.path.join(base, item["video"]), item.get("time", 1), src)
            base_img = src
        else:
            base_img = os.path.join(base, item["base"])

        texts = {
            "brand": item.get("brand", "POCKET FM"),
            "tag": item.get("tag", "AUDIO SERIES"),
            "title": item["title"],
            "kicker": item.get("kicker", ""),
            "badge": item.get("badge", ""),
        }
        tf = _write(texts, tdir)

        for kind in LAYOUT:
            out_png = os.path.join(outdir, f"{name}-{kind}.png")
            render(base_img, out_png, kind, tf, tdir)
            produced.append(out_png)
    return produced
