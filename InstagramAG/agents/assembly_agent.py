"""AGENT 2c - Reel assembly.

Builds the final 9:16 Reel with ffmpeg from a unified timeline:

    [ intro card ]  [ main body (Meta AI clips OR stills) ]  [ outro card ]

  * intro card  - uses the cover/thumbnail image, so the key image is IN the reel
  * outro card  - a "Follow / Subscribe" end page
  * main body   - video.provider = "meta_ai" (default) normalises animation clips;
                  "stills" uses Ken-Burns zoompan over scene stills.

On-screen text (Tamil/Latin via harfbuzz drawtext), an ambient drone bed and the
voiceover are laid over the whole timeline. Caption windows and voiceover are
shifted automatically by the intro card's length.
"""
from __future__ import annotations

import os
import subprocess

from . import clip_agent

MIN_TITLE_SEC = 2.0  # every on-screen title/caption is held for at least this long

FONTS = {
    "tamil": "C:/Windows/Fonts/Nirmala.ttc",
    "latin": "C:/Windows/Fonts/ariblk.ttf",
    "latinsub": "C:/Windows/Fonts/arialbd.ttf",
}


def _esc(p: str) -> str:
    return p.replace("\\", "/").replace(":", "\\:")


def _font(kind: str) -> str:
    return _esc(FONTS.get(kind, FONTS["tamil"]))


def _timeline(cfg, base):
    """Return (visuals, overlays, body_start, total).

    visuals : [{"src": path, "sec": float}]
    overlays: [{"start","end","title","title_font","fontsize","sub","sub_font",
                "cta","cta_font","y"}]
    """
    reel = cfg["reel"]
    video = cfg.get("video", {})
    fps = reel.get("fps", 30)
    provider = video.get("provider", "meta_ai")
    visuals, overlays = [], []
    t = 0.0

    def overlay(src, start, dur, default_font="tamil"):
        if not src.get("text"):
            return
        overlays.append({
            "start": start + 0.25, "end": start + dur - 0.15,
            "title": src["text"], "title_font": src.get("text_font", default_font),
            "fontsize": src.get("fontsize", 120),
            "sub": src.get("sub"), "sub_font": src.get("sub_font", "tamil"),
            "cta": src.get("cta"), "cta_font": src.get("cta_font", "tamil"),
            "y": src.get("y", 0.62),
        })

    intro = reel.get("intro")
    if intro:
        sec = intro.get("frames", 90) / fps
        visuals.append({"src": intro.get("image", "cover.jpeg"), "sec": sec})
        overlay(intro, t, sec, default_font="tamil")
        t += sec
    body_start = t

    segs = reel.get("segments", [])
    if provider in ("meta_ai", "animation", "clips"):
        clips = clip_agent.resolve_clips(cfg, base)
        body = float(video.get("duration", 30))
        slot = body / len(clips)
        for c in clips:
            visuals.append({"src": c, "sec": slot})
            t += slot
        total_f = sum(s["frames"] for s in segs) or 1
        raw = [(s["frames"] / total_f) * body for s in segs]
        min_d = MIN_TITLE_SEC + 0.6
        durs = [max(r, min_d) if s.get("text") else r for s, r in zip(segs, raw)]
        over = sum(durs) - body
        if over > 0:
            slack = sum(d - min_d for s, d in zip(segs, durs) if d - min_d > 0)
            if slack > 0:
                durs = [d - over * ((d - min_d) / slack) if d - min_d > 0 else d
                        for s, d in zip(segs, durs)]
        acc = body_start
        for s, dur in zip(segs, durs):
            if s.get("text"):
                overlays.append({
                    "start": acc + 0.15, "end": acc + dur - 0.15,
                    "title": s["text"], "title_font": s.get("text_font", "tamil"),
                    "fontsize": s.get("fontsize", 60), "sub": None, "sub_font": "latinsub",
                    "cta": None, "cta_font": "tamil", "y": s.get("y", 0.70)})
            acc += dur
    else:
        for s in segs:
            sec = s["frames"] / fps
            if s.get("text"):
                sec = max(sec, MIN_TITLE_SEC + 0.5)
            visuals.append({"src": s["image"], "sec": sec})
            overlay({**s, "fontsize": s.get("fontsize", 60)}, t, sec)
            t += sec

    outro = reel.get("outro")
    if outro:
        sec = outro.get("frames", 150) / fps
        visuals.append({"src": outro.get("image", "scenes/s5_wave.jpeg"), "sec": sec})
        overlay(outro, t, sec, default_font="latin")
        t += sec

    # enforce a minimum on-screen time for every title/caption
    for i, ov in enumerate(overlays):
        nxt = overlays[i + 1]["start"] if i + 1 < len(overlays) else t
        cap = nxt - 0.1
        want = ov["start"] + MIN_TITLE_SEC
        if ov["end"] < want and cap > ov["start"] + 0.5:
            ov["end"] = min(want, cap)

    return visuals, overlays, body_start, t


def _overlay_filters(overlays, tdir, base_label):
    os.makedirs(tdir, exist_ok=True)
    lines, prev, counter = [], base_label, 0

    def nxt():
        nonlocal counter
        counter += 1
        return f"x{counter}"

    def write(name, text):
        with open(os.path.join(tdir, name), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        return f"{os.path.basename(tdir)}/{name}"

    for j, ov in enumerate(overlays):
        fs = ov["fontsize"]
        en = f"enable='between(t,{ov['start']:.2f},{ov['end']:.2f})'"

        tf = write(f"o{j}t.txt", ov["title"])
        o = nxt()
        lines.append(
            f"[{prev}]drawtext=fontfile='{_font(ov['title_font'])}':textfile='{tf}':"
            f"fontcolor=white:fontsize={fs}:borderw=4:bordercolor=black@0.5:"
            f"shadowcolor=black@0.9:shadowx=5:shadowy=5:x=(w-text_w)/2:y=h*{ov['y']}:{en}[{o}]")
        prev = o

        if ov.get("sub"):
            sf = write(f"o{j}s.txt", ov["sub"])
            o = nxt()
            lines.append(
                f"[{prev}]drawtext=fontfile='{_font(ov['sub_font'])}':textfile='{sf}':"
                f"fontcolor=0xD8E8FA:fontsize={int(fs * 0.30)}:"
                f"shadowcolor=black@0.8:shadowx=3:shadowy=3:x=(w-text_w)/2:"
                f"y=h*{ov['y']}+{int(fs * 1.05)}:{en}[{o}]")
            prev = o

        if ov.get("cta"):
            cf = write(f"o{j}c.txt", ov["cta"])
            o = nxt()
            lines.append(
                f"[{prev}]drawtext=fontfile='{_font(ov['cta_font'])}':textfile='{cf}':"
                f"fontcolor=0x04121F:fontsize={int(fs * 0.34)}:box=1:"
                f"boxcolor=0x2FA8FF@0.92:boxborderw=24:x=(w-text_w)/2:y=h*0.84:{en}[{o}]")
            prev = o

    lines.append(f"[{prev}]format=yuv420p[vout]")
    return lines


def _audio(cmd, lines, n_used, beds, voices, total, body_start):
    for bed in beds:
        cmd += ["-f", "lavfi", "-t", str(total),
                "-i", f"sine=frequency={bed['freq']}:sample_rate=44100"]
    for v in voices:
        cmd += ["-i", v["file"]]

    shift = int(body_start * 1000)
    mixed = []
    for b, bed in enumerate(beds):
        lines.append(f"[{n_used + b}:a]volume={bed['volume']},"
                     f"tremolo=f={bed['tremolo']}:d=0.5[bed{b}]")
        mixed.append(f"[bed{b}]")
    if len(beds) > 1:
        lines.append("".join(mixed) + f"amix=inputs={len(beds)}:normalize=0[bed]")
        mixed = ["[bed]"]
    for k, v in enumerate(voices):
        idx = n_used + len(beds) + k
        lines.append(f"[{idx}:a]adelay={int(v['delay_ms']) + shift}[a{k}]")
        mixed.append(f"[a{k}]")
    lines.append("".join(mixed) +
                 f"amix=inputs={len(mixed)}:normalize=0,alimiter=limit=0.95,aresample=48000[aout]")


def _emit(cmd, lines, base, reel):
    cmd += ["-filter_complex", ";\n".join(lines) + "\n",
            "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(reel.get("fps", 30)),
            "-crf", "20", "-preset", "medium",
            "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-shortest",
            reel.get("output", "out/reel-9x16.mp4")]
    print("  [assembly] rendering ...")
    p = subprocess.run(cmd, cwd=base, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if p.returncode != 0:
        raise RuntimeError("ffmpeg failed:\n" + (p.stderr or "")[-3000:])
    out = os.path.join(base, reel.get("output", "out/reel-9x16.mp4"))
    print(f"  [assembly] wrote {out}")
    return out


def run(cfg: dict, base: str) -> str:
    reel = cfg["reel"]
    fps = reel.get("fps", 30)
    width, height = reel.get("width", 1080), reel.get("height", 1920)
    beds = reel.get("bed", [])
    voices = reel.get("voice", [])

    visuals, overlays, body_start, total = _timeline(cfg, base)
    print(f"  [assembly] {len(visuals)} visual unit(s), {len(overlays)} caption(s), "
          f"body@{body_start:.1f}s, total {total:.1f}s")
    for ov in overlays:
        print(f"     title {ov['start']:5.2f}-{ov['end']:5.2f}s  ({ov['end'] - ov['start']:.2f}s)")

    os.makedirs(os.path.join(base, "out"), exist_ok=True)
    cmd = ["ffmpeg", "-y"]
    for v in visuals:
        if v["src"].lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            cmd += ["-loop", "1", "-t", f"{v['sec']:.3f}", "-i", v["src"]]
        else:
            cmd += ["-stream_loop", "-1", "-t", f"{v['sec']:.3f}", "-i", v["src"]]

    lines = []
    for i, v in enumerate(visuals):
        lines.append(
            f"[{i}:v]scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height},setsar=1,fps={fps},trim=duration={v['sec']:.3f},"
            f"setpts=PTS-STARTPTS[v{i}]")
    lines.append("".join(f"[v{i}]" for i in range(len(visuals))) +
                 f"concat=n={len(visuals)}:v=1:a=0[vbase]")

    lines += _overlay_filters(overlays, os.path.join(base, "_reel_txt"), "vbase")
    _audio(cmd, lines, len(visuals), beds, voices, total, body_start)
    return _emit(cmd, lines, base, reel)
