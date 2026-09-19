#!/usr/bin/env python3
"""
Medium article -> viral-style short video (voiceover + cinematic images + subtitles).

Free-first: every stage logs which provider it used, rotating to the next free
provider on rate limits / failures.

Stage 1a: article extraction (requests + BeautifulSoup, trafilatura fallback)
Stage 1b: viral script generation (Gemini -> Groq -> Cerebras -> OpenRouter -> GLM-4-Flash),
          saved to output/script.json with full_narration verified at 150-250 words
Stage 2 : voiceover via local Speaches+Kokoro TTS (Docker, port 8969); Edge-TTS fallback
Stage 3 : cinematic images via Pollinations.ai (free, no API key)
Stage 4 : SRT (platform-ready) + styled ASS subtitles (burned in)
Stage 5 : final MP4 assembly via ffmpeg (imageio-ffmpeg bundled binary)

Usage:
    python pipeline.py --url "https://medium.com/..."
API keys are read from environment variables (all optional; pipeline rotates):
    GEMINI_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY, ZHIPU_API_KEY
"""

import argparse
import asyncio
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s",
                    handlers=[logging.StreamHandler(sys.stdout),
                              logging.FileHandler(OUTPUT_DIR / "pipeline.log", encoding="utf-8")])
log = logging.getLogger("pipeline")

SPEACHES_URL = "http://localhost:8969/v1"
KOKORO_MODEL = "speaches-ai/Kokoro-82M-v1.0-ONNX"  # fp32: ~2x faster than fp16 on CPU
KOKORO_VOICE = "af_heart"
EDGE_VOICE = "en-US-ChristopherNeural"

SCRIPT_PROMPT = """You are a viral short-form video scriptwriter. Turn the article below into a
60-90 second narrated video script (roughly 150-210 spoken words).

Rules:
- Open with a scroll-stopping hook in the first sentence.
- Punchy, conversational narration. Short sentences. No fluff, no "this article".
- End with a strong takeaway or question that drives comments.
- Exactly 5 scenes.
- "full_narration" must be the complete spoken script (hook + all scene narrations),
  between 150 and 250 words total.

Return ONLY valid JSON (no markdown fences) with this shape:
{
  "title": "short video title",
  "hook": "first line spoken",
  "full_narration": "the entire script read start to finish",
  "scenes": [
    {"narration": "text to speak for this scene (25-45 words)",
     "image_prompt": "cinematic image prompt: subject, setting, lighting, mood, photorealistic"}
  ]
}

ARTICLE:
"""


# ---------------------------------------------------------------- Stage 1a
def fetch_article(url: str) -> str:
    log.info(f"[STAGE 1a] Fetching article: {url}")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                             "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"}
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "iframe"]):
        tag.decompose()
    article = (soup.find("article") or soup.find("main")
               or soup.find(attrs={"role": "main"}) or soup.body)
    text = re.sub(r"\n{3,}", "\n\n", article.get_text("\n", strip=True))
    if len(text) < 400:
        log.warning("[STAGE 1a] Primary extraction thin (%d chars); trying trafilatura", len(text))
        text = _trafilatura_fallback(url) or text

    out = OUTPUT_DIR / "article_raw.txt"
    out.write_text(text, encoding="utf-8")
    log.info(f"[STAGE 1a] provider=requests+BeautifulSoup chars={len(text)} -> {out}")
    return text


def _trafilatura_fallback(url: str) -> str | None:
    try:
        import trafilatura
        return trafilatura.extract(trafilatura.fetch_url(url)) or None
    except Exception as e:
        log.warning(f"[STAGE 1a] trafilatura fallback unavailable: {e}")
        return None


# ---------------------------------------------------------------- Stage 1b
def _call_gemini(key: str, prompt: str) -> str:
    r = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}",
        json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=90)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]


def _call_openai_compatible(base: str, model: str, key: str, prompt: str) -> str:
    r = requests.post(f"{base}/chat/completions",
                      headers={"Authorization": f"Bearer {key}"},
                      json={"model": model, "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.8},
                      timeout=120)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


LLM_PROVIDERS = [
    ("Google Gemini gemini-2.5-flash", "GEMINI_API_KEY",
     lambda k, p: _call_gemini(k, p)),
    ("Groq llama-3.3-70b-versatile", "GROQ_API_KEY",
     lambda k, p: _call_openai_compatible("https://api.groq.com/openai/v1", "llama-3.3-70b-versatile", k, p)),
    ("Cerebras llama-3.3-70b", "CEREBRAS_API_KEY",
     lambda k, p: _call_openai_compatible("https://api.cerebras.ai/v1", "llama-3.3-70b", k, p)),
    ("OpenRouter deepseek/deepseek-r1:free", "OPENROUTER_API_KEY",
     lambda k, p: _call_openai_compatible("https://openrouter.ai/api/v1", "deepseek/deepseek-r1:free", k, p)),
    ("Zhipu GLM-4-Flash", "ZHIPU_API_KEY",
     lambda k, p: _call_openai_compatible("https://open.bigmodel.cn/api/paas/v4", "glm-4-flash", k, p)),
]


def _parse_script(raw: str) -> dict:
    script = json.loads(re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.M).strip())
    assert len(script.get("scenes", [])) >= 3, "too few scenes"
    if not script.get("full_narration"):
        script["full_narration"] = script["hook"] + " " + \
            " ".join(s["narration"] for s in script["scenes"])
    return script


def generate_script(article: str) -> dict:
    log.info("[STAGE 1b] Generating viral script")
    prompt = SCRIPT_PROMPT + article[:12000]
    errors, last_script = [], None
    for name, env, fn in LLM_PROVIDERS:
        key = os.environ.get(env)
        if not key:
            errors.append(f"{name}: no {env} set")
            continue
        for attempt in range(2):  # second pass gets word-count feedback
            try:
                script = _parse_script(fn(key, prompt))
                words = len(script["full_narration"].split())
                if not 150 <= words <= 250:
                    raise ValueError(f"full_narration is {words} words (target 150-250)")
                OUTPUT_DIR.joinpath("script.json").write_text(
                    json.dumps(script, indent=2, ensure_ascii=False), encoding="utf-8")
                log.info(f"[STAGE 1b] provider={name} scenes={len(script['scenes'])} "
                         f"full_narration={words} words (OK, 150-250) -> script.json")
                return script
            except Exception as e:
                msg = str(e)
                if "words (target" in msg:
                    last_script = None
                    log.warning(f"[STAGE 1b] {name} attempt {attempt+1}: {msg}; retrying with feedback")
                    prompt = SCRIPT_PROMPT + (f"IMPORTANT: your previous script was {msg}. "
                                              "Keep it within 150-250 words.\n\n") + article[:12000]
                else:
                    log.warning(f"[STAGE 1b] {name} failed: {msg}")
                    if "429" in msg or "rate" in msg.lower():
                        time.sleep(2)
                    errors.append(f"{name}: {msg}")
                    break
    raise RuntimeError("All LLM providers failed:\n" + "\n".join(errors))


# ---------------------------------------------------------------- Stage 2
def _speaches_healthy() -> bool:
    try:
        return requests.get(f"{SPEACHES_URL}/models", timeout=3).ok
    except Exception:
        return False


def ensure_speaches() -> bool:
    """Return True if the Speaches+Kokoro server is reachable on :8969,
    starting it via local docker or the Vagrant VM (C:/vagrant/aiprj) if needed."""
    if not _speaches_healthy():
        if not shutil.which("docker"):
            log.warning("[STAGE 2] Local Docker not found; trying Vagrant VM")
            return _start_speaches_vagrant()
        log.info("[STAGE 2] Starting Speaches via docker compose (first run pulls image + Kokoro model)")
        try:
            subprocess.run(["docker", "compose", "up", "-d"], check=True,
                           capture_output=True, text=True)
        except Exception as e:
            log.warning(f"[STAGE 2] docker compose up failed: {e}")
            return False
    return _wait_speaches()


def _start_speaches_vagrant() -> bool:
    vagrantfile = Path("C:/vagrant/aiprj/Vagrantfile")
    if not (shutil.which("vagrant") and vagrantfile.exists()):
        log.warning("[STAGE 2] No Vagrant VM at C:/vagrant/aiprj; cannot start Speaches")
        return False
    try:
        subprocess.run(["vagrant", "ssh", "-c",
                        "sudo docker compose -f /vagrant/docker-compose.yml up -d "
                        "|| sudo docker-compose -f /vagrant/docker-compose.yml up -d "
                        "|| sudo docker run -d --name speaches -p 8969:8000 "
                        "-v hf-hub-cache:/home/ubuntu/.cache/huggingface/hub "
                        "--restart unless-stopped ghcr.io/speaches-ai/speaches:latest-cpu"],
                       cwd=vagrantfile.parent, check=True, capture_output=True, text=True,
                       timeout=300)
    except Exception as e:
        log.warning(f"[STAGE 2] Vagrant Speaches start failed: {e}")
        return False
    return _wait_speaches()


def _wait_speaches(timeout_s: int = 600) -> bool:
    """Wait for the server to become healthy, install the Kokoro model if needed,
    and warm it up (first inference loads the model, which can take minutes)."""
    log.info("[STAGE 2] Waiting for Speaches to become healthy...")
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        if _speaches_healthy():
            break
        time.sleep(5)
    else:
        log.warning("[STAGE 2] Speaches server did not become healthy in time")
        return False
    try:
        installed = requests.get(f"{SPEACHES_URL}/audio/models", timeout=10).json()
        if KOKORO_MODEL not in [m["id"] for m in installed.get("models", [])]:
            log.info(f"[STAGE 2] Downloading TTS model {KOKORO_MODEL}")
            requests.post(f"{SPEACHES_URL}/models/{KOKORO_MODEL}", timeout=900).raise_for_status()
        requests.post(f"{SPEACHES_URL}/audio/speech",
                      json={"model": KOKORO_MODEL, "voice": KOKORO_VOICE, "input": "Hi.",
                            "response_format": "mp3"}, timeout=900)
    except Exception as e:
        log.warning(f"[STAGE 2] Speaches model setup/warmup failed: {e}")
        return False
    return True


def _tts_speaches(text: str, out_path: Path):
    r = requests.post(f"{SPEACHES_URL}/audio/speech",
                      json={"model": KOKORO_MODEL, "voice": KOKORO_VOICE, "input": text,
                            "response_format": "mp3"},
                      timeout=600)
    r.raise_for_status()
    out_path.write_bytes(r.content)


async def _tts_edge(text: str, out_path: Path):
    import edge_tts
    communicate = edge_tts.Communicate(text, voice=EDGE_VOICE, rate="+8%")
    with open(out_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])


def _to_wav(src: Path, dst: Path) -> float:
    """Decode any TTS audio to normalized mono WAV; return sample-accurate duration.

    MP3 container durations (e.g. mutagen estimates) are unreliable for the files
    the TTS backends produce, so all timing is derived from decoded WAV frames.
    """
    import imageio_ffmpeg
    import wave
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-i", str(src),
                    "-ar", "24000", "-ac", "1", str(dst)],
                   check=True, capture_output=True)
    with wave.open(str(dst), "rb") as w:
        return w.getnframes() / w.getframerate()


def synthesize_voiceover(script: dict) -> tuple[Path, list[dict], list[float]]:
    """TTS each narration segment (hook+scene1, then scenes 2..5) separately.

    Returns (full voiceover path, per-word timings, per-segment durations).
    Word timings are allocated proportionally by word length within each segment.
    """
    log.info("[STAGE 2] Synthesizing voiceover")
    segments = [script["hook"] + " " + script["scenes"][0]["narration"]] + \
               [s["narration"] for s in script["scenes"][1:]]

    use_speaches = ensure_speaches()
    provider = (f"Speaches+Kokoro({KOKORO_VOICE})" if use_speaches else f"Edge-TTS({EDGE_VOICE})")
    tts_fn = _tts_speaches if use_speaches else (lambda t, p: asyncio.run(_tts_edge(t, p)))

    seg_paths, durations, word_times = [], [], []
    offset = 0.0
    for i, text in enumerate(segments, 1):
        mp3 = OUTPUT_DIR / f"segment_{i}.mp3"
        for attempt in range(3):
            try:
                tts_fn(text, mp3)
                break
            except Exception as e:
                log.warning(f"[STAGE 2] segment {i} attempt {attempt+1} failed: {e}")
                time.sleep(3)
        else:
            if use_speaches:  # local server flaked mid-run: retry this segment on Edge-TTS
                log.warning(f"[STAGE 2] segment {i}: falling back to Edge-TTS")
                asyncio.run(_tts_edge(text, mp3))
            else:
                raise RuntimeError(f"TTS failed for segment {i}")
        wav = OUTPUT_DIR / f"segment_{i}.wav"
        d = _to_wav(mp3, wav)
        seg_paths.append(wav)
        durations.append(d)

        words = text.split()
        weights = [max(len(w), 2) for w in words]
        t = offset
        for w, wt in zip(words, weights):
            wd = d * wt / sum(weights)
            word_times.append({"word": w, "start": t, "end": t + wd})
            t += wd
        offset += d

    full = OUTPUT_DIR / "voiceover.wav"
    concat = OUTPUT_DIR / "audio_concat.txt"
    concat.write_text("".join(f"file '{p.resolve().as_posix()}'\n" for p in seg_paths), encoding="utf-8")
    import imageio_ffmpeg
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-f", "concat", "-safe", "0",
                    "-i", str(concat), "-c:a", "pcm_s16le", str(full)],
                   check=True, capture_output=True)

    OUTPUT_DIR.joinpath("words.json").write_text(json.dumps(word_times, indent=2), encoding="utf-8")
    total = sum(durations)
    log.info(f"[STAGE 2] provider={provider} segments={len(segments)} "
             f"duration={total:.1f}s -> {full}")
    return full, word_times, durations


# ---------------------------------------------------------------- Stage 3
def generate_images(script: dict) -> list[Path]:
    log.info("[STAGE 3] Generating cinematic images")
    paths = []
    style = "cinematic, dramatic lighting, 35mm film, photorealistic, highly detailed"
    for i, scene in enumerate(script["scenes"], 1):
        prompt = urllib.parse.quote(f'{scene["image_prompt"]}, {style}')
        url = f"https://image.pollinations.ai/prompt/{prompt}?width=1280&height=720&nologo=true&seed={abs(hash(scene['image_prompt'])) % 99999}"
        for attempt in range(3):
            try:
                r = requests.get(url, timeout=120)
                r.raise_for_status()
                p = OUTPUT_DIR / f"scene_{i}.jpg"
                p.write_bytes(r.content)
                paths.append(p)
                log.info(f"[STAGE 3] provider=Pollinations.ai scene={i} -> {p.name}")
                break
            except Exception as e:
                log.warning(f"[STAGE 3] scene {i} attempt {attempt+1} failed: {e}")
                time.sleep(3)
        else:
            raise RuntimeError(f"Image generation failed for scene {i}")
    return paths


# ---------------------------------------------------------------- Stage 4
def _fmt_ts(seconds: float, comma=True) -> str:
    ms = int(round(seconds * 1000))
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms = divmod(rem, 1000)
    sep = "," if comma else "."
    return f"{h:02}:{m:02}:{s:02}{sep}{ms:03}"


def build_subtitles(words: list[dict]):
    """Chunk words (~6 per subtitle), emit plain SRT + viral-styled ASS."""
    log.info("[STAGE 4] Building subtitles")
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= 6 or w["word"].rstrip().endswith((".", "!", "?")):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)

    srt_lines = []
    for i, c in enumerate(chunks, 1):
        srt_lines += [str(i), f'{_fmt_ts(c[0]["start"])} --> {_fmt_ts(c[-1]["end"])}',
                      " ".join(w["word"] for w in c).upper(), ""]
    srt_path = OUTPUT_DIR / "subtitles.srt"
    srt_path.write_text("\n".join(srt_lines), encoding="utf-8")

    ass_header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, BorderStyle
Style: Viral,Montserrat,54,&H00FFFFFF,&H00000000,&H90000000,-1,4,2,2,60,60,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ass_lines = [ass_header]
    for c in chunks:
        start, end = _fmt_ts(c[0]["start"], comma=False), _fmt_ts(c[-1]["end"], comma=False)
        text = " ".join(w["word"] for w in c).upper()
        if c[0]["start"] < 2.5:  # pop-in effect on hook lines
            text = r"{\fad(120,0)}" + text
        ass_lines.append(f"Dialogue: 0,{start},{end},Viral,,0,0,0,,{text}\n")
    ass_path = OUTPUT_DIR / "subtitles.ass"
    ass_path.write_text("".join(ass_lines), encoding="utf-8")

    log.info(f"[STAGE 4] provider=local(word timestamps) subtitles={len(chunks)} -> subtitles.srt/.ass")
    return ass_path


# ---------------------------------------------------------------- Stage 5
def assemble_video(script: dict, images: list[Path], durations: list[float],
                   mp3: Path, ass_path: Path) -> Path:
    log.info("[STAGE 5] Assembling final video with ffmpeg")
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    # Encode each scene as its own segment (-loop 1 -t): the still-image concat
    # demuxer silently drops the final duration entry, truncating the video.
    seg_videos = []
    for i, (img, d) in enumerate(zip(images, durations), 1):
        seg = OUTPUT_DIR / f"scene_{i}_v.mp4"
        subprocess.run([ffmpeg, "-y", "-loop", "1", "-i", str(img), "-t", f"{d:.3f}",
                        "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,"
                               "pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
                        "-r", "25", "-c:v", "libx264", "-tune", "stillimage",
                        "-preset", "medium", "-crf", "20", str(seg)],
                       check=True, capture_output=True)
        seg_videos.append(seg)

    concat_file = OUTPUT_DIR / "concat.txt"
    concat_file.write_text("".join(f"file '{p.resolve().as_posix()}'\n"
                                   for p in seg_videos), encoding="utf-8")
    video_only = OUTPUT_DIR / "video_only.mp4"
    subprocess.run([ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file),
                    "-c", "copy", str(video_only)], check=True, capture_output=True)

    out = OUTPUT_DIR / "final_video.mp4"
    ass_escaped = str(ass_path.resolve()).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
    cmd = [ffmpeg, "-y", "-i", str(video_only), "-i", str(mp3),
           "-vf", f"subtitles='{ass_escaped}'",
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
           str(out)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {proc.stderr[-2000:]}")
    log.info(f"[STAGE 5] provider=ffmpeg(libx264) duration={sum(durations):.1f}s -> {out.resolve()}")
    return out


# ---------------------------------------------------------------- main
def main():
    parser = argparse.ArgumentParser(description="Medium article -> viral short video")
    parser.add_argument("--url", required=True, help="Medium article URL")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(exist_ok=True)
    article = fetch_article(args.url)
    script = generate_script(article)
    mp3, words, durations = synthesize_voiceover(script)
    images = generate_images(script)
    ass_path = build_subtitles(words)
    video = assemble_video(script, images, durations, mp3, ass_path)
    print(f"\nDONE -> {video.resolve()}")
    print(f"Upload-ready subtitles -> {(OUTPUT_DIR / 'subtitles.srt').resolve()}")


if __name__ == "__main__":
    main()
