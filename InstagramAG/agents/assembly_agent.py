"""AGENT 2c - Reel assembly.

Builds the final 9:16 Reel with ffmpeg. Two providers:

  * video.provider = "meta_ai"  (DEFAULT) -> normalise Meta AI animation clips
        (scale/crop 1080x1920, 30fps, each clip looped/trimmed to its slot so the
        total is exactly `video.duration`, default 30s)
  * video.provider = "stills"              -> Ken-Burns zoompan over scene stills

Both then share: Tamil (or any) on-screen text via drawtext, ambient drone bed,
and time-placed voiceover.
"""
from __future__ import annotations

import os
import subprocess

from . import clip_agent


def _font(font: str) -> str:
    return font.replace("\\", "/").replace(":", "\\:")


def _starts(segments, fps):
    acc, out = 0, []
    for s in segments:
        out.append(acc / fps)
        acc += s["frames"]
    return out


def _write_textfiles(segments, base) -> dict:
    ids = {}
    for i, seg in enumerate(segments):
        if seg.get("text"):
            tf = f"txt{i}.txt"
            with open(os.path.join(base, tf), "w", encoding="utf-8", newline="\n") as fh:
                fh.write(seg["text"])
            ids[i] = tf
    return ids


def _overlay_lines(base_label, segments, starts, fps, text_ids, font):
    lines, prev = [], base_label
    ids = [i for i in range(len(segments)) if i in text_ids]
    for n, i in enumerate(ids):
        seg = segments[i]
        end = starts[i] + seg["frames"] / fps
        en = seg.get("enable", f"between(t,{starts[i]:.3f},{end:.3f})")
        out = f"t{n}" if n < len(ids) - 1 else "vout"
        tail = ",format=yuv420p" if n == len(ids) - 1 else ""
        lines.append(
            f"[{prev}]drawtext=fontfile='{font}':textfile='{text_ids[i]}':fontcolor=white:"
            f"fontsize={seg.get('fontsize', 60)}:line_spacing=14:text_align=center:box=1:"
            f"boxcolor=black@0.45:boxborderw=26:x=(w-text_w)/2:y=h*{seg.get('y', '0.70')}:"
            f"enable='{en}'{tail}[{out}]"
        )
        prev = out
    if not ids:
        lines.append(f"[{base_label}]format=yuv420p[vout]")
    return lines


def _audio(cmd, lines, n_used, beds, voices, duration):
    for b, bed in enumerate(beds):
        cmd += ["-f", "lavfi", "-t", str(duration),
                "-i", f"sine=frequency={bed['freq']}:sample_rate=44100"]
    for v in voices:
        cmd += ["-i", v["file"]]

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
        lines.append(f"[{idx}:a]adelay={v['delay_ms']}[a{k}]")
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


def _render_from_clips(cfg, base):
    reel = cfg["reel"]
    video = cfg.get("video", {})
    fps = reel.get("fps", 30)
    width, height = reel.get("width", 1080), reel.get("height", 1920)
    duration = float(video.get("duration", 30))
    segments = reel.get("segments", [])
    beds = reel.get("bed", [])
    voices = reel.get("voice", [])
    font = _font(reel["font"])

    clips = clip_agent.resolve_clips(cfg, base)
    slot = duration / len(clips)

    os.makedirs(os.path.join(base, "out"), exist_ok=True)
    text_ids = _write_textfiles(segments, base)

    cmd = ["ffmpeg", "-y"]
    for clip in clips:
        cmd += ["-stream_loop", "-1", "-t", f"{slot:.3f}", "-i", clip]

    lines = []
    for i in range(len(clips)):
        lines.append(
            f"[{i}:v]scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height},setsar=1,fps={fps},trim=duration={slot:.3f},"
            f"setpts=PTS-STARTPTS[v{i}]"
        )
    lines.append("".join(f"[v{i}]" for i in range(len(clips))) +
                 f"concat=n={len(clips)}:v=1:a=0[vbase]")

    # scale caption windows to the exact target duration
    total = sum(s["frames"] for s in segments) or 1
    factor = (duration * fps) / total
    scaled = [dict(s, frames=max(1, round(s["frames"] * factor))) for s in segments]
    lines += _overlay_lines("vbase", scaled, _starts(scaled, fps), fps, text_ids, font)

    _audio(cmd, lines, len(clips), beds, voices, duration)
    return _emit(cmd, lines, base, reel)


def _render_from_stills(cfg, base):
    reel = cfg["reel"]
    fps = reel.get("fps", 30)
    width, height = reel.get("width", 1080), reel.get("height", 1920)
    segments = reel["segments"]
    beds = reel.get("bed", [])
    voices = reel.get("voice", [])
    font = _font(reel["font"])
    duration = sum(s["frames"] for s in segments) / fps

    os.makedirs(os.path.join(base, "out"), exist_ok=True)
    text_ids = _write_textfiles(segments, base)

    cmd = ["ffmpeg", "-y"]
    for seg in segments:
        cmd += ["-i", seg["image"]]

    lines = []
    for i, seg in enumerate(segments):
        z = "max(1.25-0.0018*on,1.0)" if seg.get("zoom", "in") == "out" \
            else "min(1.0+0.0018*on,1.25)"
        lines.append(
            f"[{i}:v]scale={width}:{height}:force_original_aspect_ratio=increase,"
            f"crop={width}:{height},setsar=1,"
            f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={seg['frames']}:s={width}x{height}:fps={fps},setsar=1[v{i}]"
        )
    lines.append("".join(f"[v{i}]" for i in range(len(segments))) +
                 f"concat=n={len(segments)}:v=1:a=0[vcat]")
    lines += _overlay_lines("vcat", segments, _starts(segments, fps), fps, text_ids, font)

    _audio(cmd, lines, len(segments), beds, voices, duration)
    return _emit(cmd, lines, base, reel)


def run(cfg: dict, base: str) -> str:
    provider = cfg.get("video", {}).get("provider", "meta_ai")
    if provider in ("meta_ai", "animation", "clips"):
        return _render_from_clips(cfg, base)
    return _render_from_stills(cfg, base)
