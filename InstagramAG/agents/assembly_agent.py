"""AGENT 2c - Reel assembly.

Builds the final 9:16 Reel with ffmpeg:
  - Ken-Burns zoompan on each scene still
  - Tamil (or any) on-screen text via drawtext + a shaping-capable font
  - ambient drone bed + time-placed voiceover lines
"""
from __future__ import annotations

import os
import subprocess


def _filter_file_path(font: str) -> str:
    # Escape the drive-letter colon for use inside the filtergraph.
    return font.replace("\\", "/").replace(":", "\\:")


def run(cfg: dict, base: str) -> str:
    reel = cfg["reel"]
    fps = reel.get("fps", 30)
    width = reel.get("width", 1080)
    height = reel.get("height", 1920)
    segments = reel["segments"]
    beds = reel.get("bed", [])
    voices = reel.get("voice", [])

    total_frames = sum(s["frames"] for s in segments)
    duration = total_frames / fps

    os.makedirs(os.path.join(base, "out"), exist_ok=True)

    # --- text files (UTF-8) for drawtext: one per segment that has text
    text_ids = {}
    for i, seg in enumerate(segments):
        if seg.get("text"):
            tf = f"txt{i}.txt"
            with open(os.path.join(base, tf), "w", encoding="utf-8", newline="\n") as fh:
                fh.write(seg["text"])
            text_ids[i] = tf

    # --- inputs
    cmd = ["ffmpeg", "-y"]
    for seg in segments:
        cmd += ["-i", seg["image"]]
    n_img = len(segments)
    for bed in beds:
        cmd += ["-f", "lavfi", "-t", str(duration),
                "-i", f"sine=frequency={bed['freq']}:sample_rate=44100"]
    for v in voices:
        cmd += ["-i", v["file"]]

    # --- video filter
    lines = []
    for i, seg in enumerate(segments):
        if seg.get("zoom", "in") == "out":
            z = "max(1.25-0.0018*on,1.0)"
        else:
            z = "min(1.0+0.0018*on,1.25)"
        lines.append(
            f"[{i}:v]scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height},setsar=1,"
            f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={seg['frames']}:s={width}x{height}:fps={fps},setsar=1[v{i}]"
        )
    lines.append("".join(f"[v{i}]" for i in range(len(segments))) +
                 f"concat=n={len(segments)}:v=1:a=0[vcat]")

    font = _filter_file_path(reel["font"])
    overlay_segs = [i for i in range(len(segments)) if i in text_ids]
    prev = "vcat"
    acc = 0
    starts = []
    for s in segments:
        starts.append(acc / fps)
        acc += s["frames"]

    for n, i in enumerate(overlay_segs):
        seg = segments[i]
        end = starts[i] + seg["frames"] / fps
        enable = seg.get("enable", f"between(t,{starts[i]:.2f},{end:.2f})")
        out = f"t{n}" if n < len(overlay_segs) - 1 else "vout"
        tail = ",format=yuv420p" if n == len(overlay_segs) - 1 else ""
        lines.append(
            f"[{prev}]drawtext=fontfile='{font}':textfile='{text_ids[i]}':"
            f"fontcolor=white:fontsize={seg.get('fontsize', 60)}:line_spacing=14:"
            f"text_align=center:box=1:boxcolor=black@0.45:boxborderw=26:"
            f"x=(w-text_w)/2:y=h*{seg.get('y', '0.70')}:enable='{enable}'{tail}[{out}]"
        )
        prev = out

    # --- audio filter
    bed_labels = []
    for b, bed in enumerate(beds):
        lines.append(f"[{n_img + b}:a]volume={bed['volume']},tremolo=f={bed['tremolo']}:d=0.5[bed{b}]")
        bed_labels.append(f"[bed{b}]")
    if beds:
        lines.append("".join(bed_labels) + f"amix=inputs={len(beds)}:normalize=0[bed]")
        mixed = ["[bed]"]
    else:
        mixed = []

    for k, v in enumerate(voices):
        idx = n_img + len(beds) + k
        lines.append(f"[{idx}:a]adelay={v['delay_ms']}[a{k}]")
        mixed.append(f"[a{k}]")

    lines.append("".join(mixed) +
                 f"amix=inputs={len(mixed)}:normalize=0,alimiter=limit=0.95,aresample=48000[aout]")

    cmd += ["-filter_complex", ";\n".join(lines) + "\n",
            "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(fps),
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
