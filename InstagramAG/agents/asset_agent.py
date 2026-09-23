"""AGENT 2a - Asset generation (scene images).

Generates 9:16 scene stills from text prompts using the AutoGLM Seedream
text-to-image endpoint (free, token auto-fetched from the local service).

Retry policy: if the API replies with the "high demand" message, wait
RETRY_BACKOFF_S seconds and try again.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
import urllib.request

API_URL = "https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/generate-image-seedream"
TOKEN_URL = os.environ.get("AUTOGLM_TOKEN_URL", "http://127.0.0.1:18432/get_token")
APPID = os.environ.get("AUTOGLM_APPID", "100003")
SECRET = os.environ.get("AUTOGLM_SECRET", "38d2391985e2369a5fb8227d8e6cd5e5")

RETRY_BACKOFF_S = 240  # 4 minutes, per user policy
MAX_ATTEMPTS = 6


def _token() -> str:
    try:
        with urllib.request.urlopen(TOKEN_URL, timeout=30) as r:
            tok = r.read().decode("utf-8").strip()
        return tok if tok.lower().startswith("bearer") else f"Bearer {tok}"
    except Exception:
        return ""


def _headers() -> dict:
    ts = str(int(time.time()))
    sign = hashlib.md5(f"{APPID}&{ts}&{SECRET}".encode("utf-8")).hexdigest()
    h = {
        "Content-Type": "application/json",
        "X-Auth-Appid": APPID,
        "X-Auth-TimeStamp": ts,
        "X-Auth-Sign": sign,
    }
    tok = _token()
    if tok:
        h["Authorization"] = tok
    return h


def generate_image(prompt: str, ref_url: str | None = None) -> str:
    body = {"query": prompt}
    if ref_url:
        body["image"] = ref_url
    data = json.dumps(body).encode("utf-8")

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            req = urllib.request.Request(API_URL, data=data, headers=_headers(), method="POST")
            with urllib.request.urlopen(req, timeout=300) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            url = payload.get("data", {}).get("image_url")
            if url:
                return url
            raise RuntimeError(f"no image_url in response: {payload}")
        except Exception as exc:  # noqa: BLE001
            msg = str(exc)
            if "high demand" in msg.lower() or "priority access" in msg.lower():
                print(f"  [asset] high demand (attempt {attempt}); sleeping {RETRY_BACKOFF_S}s ...")
                time.sleep(RETRY_BACKOFF_S)
                continue
            if attempt < MAX_ATTEMPTS:
                wait = min(2 ** attempt, 30)
                print(f"  [asset] error: {msg}; retry in {wait}s")
                time.sleep(wait)
                continue
            raise
    raise RuntimeError("asset generation failed after retries")


def download(url: str, dst: str) -> None:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    urllib.request.urlretrieve(url, dst)


def run(cfg: dict, base: str) -> None:
    """Generate cover + scene stills into <base>."""
    cover_prompt = cfg.get("cover_prompt")
    if cover_prompt:
        print("  [asset] cover ...")
        download(generate_image(cover_prompt), os.path.join(base, "cover.jpeg"))

    for scene in cfg.get("scenes", []):
        dst = os.path.join(base, "scenes", f"{scene['name']}.jpeg")
        print(f"  [asset] {scene['name']} ...")
        download(generate_image(scene["prompt"]), dst)
