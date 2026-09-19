# MediumScrapingPOC — Medium Article → Viral Video Pipeline

Turn any Medium article URL into a ready-to-upload, viral-style short video with
voiceover, cinematic AI images, and burned-in captions — using **only free
services and open-source tools**.

```
python pipeline.py --url "https://medium.com/@author/some-article-abc123"
```

**Output:** a 60–100 second 1280×720 MP4 (`output/final_video.mp4`), an
upload-ready `subtitles.srt`, and all intermediate artifacts.

## What it does

| Stage | Purpose | Provider (free-first, with fallback) |
|-------|---------|--------------------------------------|
| 1a | Article extraction | `requests` + `BeautifulSoup` → `trafilatura` fallback |
| 1b | Viral script generation | Gemini → Groq → Cerebras → OpenRouter → Zhipu GLM-4-Flash (rotates on failure/429) |
| 2 | Voiceover (TTS) | Local **Speaches + Kokoro-82M** (Docker, in a Vagrant VM if needed) → Edge-TTS fallback |
| 3 | Cinematic images | Pollinations.ai (no API key) |
| 4 | Subtitles | Word-timestamped SRT + styled ASS (burned in) |
| 5 | Video assembly | ffmpeg (per-scene segments, concat, caption burn-in) |

Every stage logs exactly which provider it used to `output/pipeline.log`.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full component diagram and data
flow (Mermaid), and [BLOG.md](BLOG.md) for the write-up of how this POC was
built — including the two nasty timing bugs found during verification.

## Prerequisites

- **Python 3.10+**
- **An LLM API key** (any ONE of): `GEMINI_API_KEY`, `GROQ_API_KEY`,
  `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `ZHIPU_API_KEY`
  (Gemini's free tier — 500 req/day — is the recommended starting point)
- **For local TTS:** Docker, either natively or inside the included Vagrant VM
  (Kali Linux, VirtualBox provider). Without Docker the pipeline automatically
  falls back to Edge-TTS (free Microsoft neural voices, needs only internet).

## Setup

```bash
# 1. Install Python dependencies
pip install beautifulsoup4 lxml edge-tts imageio-ffmpeg mutagen requests

# 2. (Optional, for local Kokoro TTS) start the TTS server
#    Native Docker:
docker compose up -d          # serves http://localhost:8969
#    Or via the bundled Vagrant VM (see Vagrant setup below)

# 3. Set one LLM key
export GEMINI_API_KEY="your-key-here"      # Windows: set GEMINI_API_KEY=...
```

> **ffmpeg note:** the pipeline uses the ffmpeg binary bundled with
> `imageio-ffmpeg`, so no system ffmpeg install is required.

### Vagrant TTS setup (Windows hosts without Docker)

The included `docker-compose.yml` deploys
[Speaches](https://github.com/speaches-ai/speaches) (an OpenAI-compatible TTS
server) with the Kokoro-82M model. On a Docker-less Windows host, run it inside
a Vagrant VM:

```ruby
# Vagrantfile (Kali Linux) — the two settings that matter
config.vm.network "forwarded_port", guest: 8969, host: 8969, host_ip: "127.0.0.1"
config.vm.provider "virtualbox" do |vb|
  vb.memory = 4096
  vb.cpus = 4        # Kokoro fp32 needs ~4 vCPUs for usable speed
end
```

```bash
cd /c/vagrant/aiprj && vagrant up
vagrant ssh -c "sudo apt-get install -y docker.io && sudo systemctl enable --now docker"
# copy docker-compose.yml to the VM's /vagrant share, then:
vagrant ssh -c "sudo docker compose -f /vagrant/docker-compose.yml up -d"
```

The pipeline auto-discovers the server at `localhost:8969`, installs the Kokoro
model on first run, and warms it up. See [ARCHITECTURE.md](ARCHITECTURE.md) for
why the **fp32** ONNX model (`speaches-ai/Kokoro-82M-v1.0-ONNX`) is used instead
of fp16.

## Run

```bash
python pipeline.py --url "https://medium.com/@author/article-slug"
```

Pipeline progress streams to the console and `output/pipeline.log`. Total wall
time for a ~100s video: roughly 10–20 minutes, dominated by Kokoro synthesis
(~0.6× real time on 4 vCPUs) and Pollinations image generation (~45s per scene).

### Output files

```
output/
├── final_video.mp4    # the deliverable (captions burned in)
├── subtitles.srt      # upload-ready subtitles for platform caption fields
├── subtitles.ass      # styled subtitles used for burn-in
├── script.json        # LLM script: title, hook, full_narration, scenes
├── article_raw.txt    # extracted article text
├── voiceover.wav      # concatenated narration audio
├── segment_*.mp3/.wav # per-scene audio (one TTS call per scene)
├── scene_*.jpg        # generated cinematic images
├── words.json         # per-word start/end times
└── pipeline.log       # full run log incl. provider per stage
```

## Full walk-through of one run

1. **Fetch** — the article HTML is pulled with a browser User-Agent; scripts,
   nav, footer etc. are stripped and the `<article>`/`<main>` body text saved
   (~9.7k chars for the test article).
2. **Script** — Gemini 2.5 Flash turns the article into a 5-scene viral script.
   The pipeline validates `full_narration` is **150–250 words** and retries once
   with corrective feedback before rotating providers.
3. **Voiceover** — each scene is synthesized separately so scene boundaries in
   the video align exactly with audio segment boundaries. Timings are derived
   from decoded WAV frames (sample-accurate), not MP3 header estimates.
4. **Images** — one Pollinations image per scene from the LLM's cinematic prompt
   (1280×720, deterministic seed, 3 retries).
5. **Subtitles** — word timings are chunked into ~6-word captions; a plain SRT
   and a Montserrat-styled ASS (with a fade-in pop on the hook) are emitted.
6. **Assembly** — each scene image is encoded as its own still-image segment
   with the scene's exact audio duration, segments are concatenated, captions
   burned in, and the voiceover muxed (H.264 + AAC, `+faststart`).

## Troubleshooting

- **"All LLM providers failed"** — no API key set, or the key is invalid/out of
  quota. The error lists each provider's failure reason.
- **Kokoro is slow / times out** — give the VM ≥4 vCPUs; the first request after
  a container restart reloads the model (the pipeline warms it up and retries
  once; a failing segment falls back to Edge-TTS automatically).
- **Pollinations 500s** — transient; the pipeline retries 3× per scene with
  backoff.
- **Video/audio length mismatch** — fixed by the per-scene encoding in Stage 5;
  if you modify assembly, verify with
  `ffmpeg -i final_video.mp4 -map 0:v -f null -` (decode end time must match
  `Duration:`).

## Free-tier budget

| Service | Free allowance | Usage per video |
|---------|---------------|-----------------|
| Gemini 2.5 Flash | 500 req/day | 1–2 requests |
| Speaches/Kokoro | unlimited (local) | 6 requests (5 scenes + warmup) |
| Pollinations.ai | unlimited | 5 images |
| Edge-TTS | unlimited | fallback only |
