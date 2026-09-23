"""AGENT 2b - Voiceover.

Generates voiceover lines with edge-tts (free, no API key, commercial friendly).
Supports any voice edge-tts exposes, e.g. Tamil: ta-IN-ValluvarNeural / ta-IN-PallaviNeural.
"""
from __future__ import annotations

import asyncio
import os

from edge_tts import Communicate


async def _gen(text: str, voice: str, rate: str, pitch: str, dst: str) -> None:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    communicate = Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await communicate.save(dst)


def run(cfg: dict, base: str) -> None:
    voice = cfg.get("voice", "en-US-AriaNeural")

    async def _all() -> None:
        for line in cfg.get("voice_lines", []):
            dst = os.path.join(base, "audio", f"{line['name']}.mp3")
            print(f"  [voice] {line['name']} ...")
            await _gen(line["text"], voice, line.get("rate", "+0%"),
                       line.get("pitch", "+0Hz"), dst)

    asyncio.run(_all())
