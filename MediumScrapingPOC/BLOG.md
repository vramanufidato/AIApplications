# From Medium Article to Viral Video, Entirely on Free Tiers — a POC Build Log

*How a single Python file, one Vagrant VM, and a strict "free-first" rule turned
a psychiatry article into a captioned, voice-acted 100-second video.*

## The idea

Content repurposing is the classic automation target: take a long-form Medium
article and produce a short, vertical-feed-ready video — hook, voiceover,
cinematic imagery, punchy captions. The constraint that made this interesting:
**every component must be free**. No paid TTS, no paid image APIs, no paid LLM
beyond free tiers. The result is
[`pipeline.py`](pipeline.py) in this repo, plus the
[architecture doc](ARCHITECTURE.md) with Mermaid diagrams.

## The pipeline

```mermaid
flowchart LR
    A[Medium URL] --> B[Scrape<br/>requests + BS4]
    B --> C[Script<br/>Gemini free tier]
    C --> D[Voiceover<br/>Kokoro local TTS]
    D --> E[Images<br/>Pollinations]
    E --> F[Subtitles<br/>word timings]
    F --> G[Assembly<br/>ffmpeg]
    G --> H[final_video.mp4]
```

Five stages, each logging which free provider it used, each with a fallback. The
test subject: a clinical article on biological interventions for
treatment-resistant mood disorders — 9,728 characters scraped cleanly on the
first try.

## What the free tiers actually looked like

**Script generation** rotated through five free LLM providers (Gemini → Groq →
Cerebras → OpenRouter → Zhipu). Gemini 2.5 Flash produced a 5-scene, 214-word
script in 17 seconds on the first call. The pipeline validates the word count
(150–250) and only retries or rotates on violation — the quality gate matters
more than the rotation.

**Voiceover** was the hard part. The spec called for local
[Speaches](https://github.com/speaches-ai/speaches) + Kokoro-82M — genuinely
free and offline — but that means Docker, and the Windows host had none. Enter a
Kali Vagrant VM with 4 vCPUs, a port forward on 8969, and Docker installed
inside. Three non-obvious findings:

1. Speaches ships without the model — it must be installed at runtime via
   `POST /v1/models/{model_id}`. The pipeline now does this automatically into a
   persistent volume.
2. **fp32 beats fp16 on CPU** — 22s vs 50s for the same 13s clip. Benchmark
   before trusting the "smaller = faster" intuition.
3. The first inference after a restart stalls for minutes while the model
   loads. An unconditional warmup call absorbs this; without it, timeouts masquerade
   as server failures.

**Images** from Pollinations.ai needed no key at all — just patience (~45s per
scene) and retry logic for its occasional 500s.

**Subtitles** were generated from word timings without any alignment model:
Kokoro's API returns no word boundaries, so the pipeline allocates word durations
proportionally within each scene's *measured* audio length. Good enough for
6-word caption chunks, and the price is right.

## Two bugs worth writing down

Both were caught only because the final video was verified frame-by-frame, not
just checked for a zero exit code.

**The 10-second drift.** Captions were perfectly synced at the start and
visibly wrong by mid-video — the narration text on screen didn't match the
audio. Root cause: MP3 files carry duration as a header *estimate*, and the
estimator was wrong by a couple of seconds per segment. Five segments later,
scene boundaries had drifted ~10s. The fix: decode every segment to WAV and
count frames. Sample-accurate, zero dependencies on container metadata.

**The video that ended 21 seconds early.** The assembled video reported a
1:40.9 duration, but its video stream decoded only to 1:19.8 — the last scene's
21 seconds simply didn't exist as frames, so the video froze while the audio
played on. This is a quiet quirk of ffmpeg's concat demuxer with still images
and `duration` entries: the final entry gets dropped. The fix: stop trusting
concat timing entirely — encode each scene as its own `-loop 1 -t <duration>`
segment, then concat those. Length-exact by construction.

A third lesson came for free: **verify with hashes, not eyeballs**. During
debugging, an image-viewer cache kept serving stale frames for newly extracted
files, which looked exactly like "the video isn't changing." Byte-level
comparisons settled what screenshots couldn't.

## Results

For the test article, end to end:

| Metric | Value |
|--------|-------|
| Video length | 1:41 (100.9s), 1280×720 |
| Wall-clock build time | ~18 minutes (TTS and images dominate) |
| Paid API cost | $0.00 |
| Free-tier consumption | 1 Gemini request, 6 local TTS calls, 5 Pollinations images |
| Caption sync | Verified frame-level at 3s / 45s / 65s / 85s / 99s |

## What I'd add next

- **9:16 vertical rendering** (TikTok/Shorts-native) — a crop pass in Stage 5.
- **Whisper-based forced alignment** for exact word timings instead of
  proportional allocation.
- **Background music ducking** under the voiceover with a sidechain filter.
- **YouTube metadata generation** (title/description/tags) from the same script
  call — one more field in the JSON.

The whole thing is ~450 lines of Python, one compose file, and a strong
preference for measuring things instead of trusting them.
