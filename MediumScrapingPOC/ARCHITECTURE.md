# Architecture

## System overview

```mermaid
flowchart TB
    subgraph HOST["Windows Host"]
        CLI[pipeline.py CLI<br/>--url &lt;medium article&gt;]

        subgraph S1["Stage 1 — Ingest & Script"]
            FETCH[requests + BeautifulSoup<br/>trafilatura fallback]
            LLM{LLM rotation<br/>on 429 / failure}
            GEM[Gemini 2.5 Flash]
            GRQ[Groq llama-3.3-70b]
            CER[Cerebras llama-3.3-70b]
            OR[OpenRouter deepseek-r1:free]
            GLM[Zhipu GLM-4-Flash]
        end

        subgraph S3_5["Stages 3–5 — Media & Assembly"]
            POLL[Pollinations.ai<br/>5 cinematic images]
            SUB[Subtitle builder<br/>SRT + styled ASS]
            FFM[imageio-ffmpeg<br/>per-scene encode + concat + burn-in]
        end

        OUT[output/final_video.mp4<br/>output/subtitles.srt]
    end

    subgraph VM["Vagrant VM (Kali, VirtualBox) — optional"]
        DOCKER[Docker Engine]
        SPEA[Speaches container<br/>port 8000 → host 8969]
        KOK[Kokoro-82M fp32 ONNX<br/>voice: af_heart]
    end

    CLI --> FETCH --> LLM
    LLM -->|1st| GEM
    LLM -->|2nd| GRQ
    LLM -->|3rd| CER
    LLM -->|4th| OR
    LLM -->|5th| GLM
    LLM -->|script.json| TTS

    subgraph S2["Stage 2 — Voiceover"]
        TTS{Speaches healthy<br/>on :8969?}
        EDGE[Edge-TTS<br/>fallback]
    end

    TTS -->|yes| SPEA
    TTS -->|no / failure| EDGE
    DOCKER --- SPEA --- KOK
    SPEA ---|"127.0.0.1:8969<br/>port forward"| TTS

    TTS -->|segment_*.wav<br/>sample-accurate durations| SUB
    POLL -->|scene_*.jpg| FFM
    SUB -->|subtitles.ass| FFM
    TTS -->|voiceover.wav| FFM
    FFM --> OUT
```

## Data flow per run

```mermaid
sequenceDiagram
    participant U as User
    participant P as pipeline.py
    participant M as Medium
    participant L as Gemini (free tier)
    participant S as Speaches/Kokoro (local)
    participant I as Pollinations
    participant F as ffmpeg

    U->>P: python pipeline.py --url "..."
    P->>M: GET article HTML
    M-->>P: article body text (9.7k chars)
    P->>L: script prompt (article + viral rules)
    L-->>P: script.json (5 scenes, 150-250 words validated)
    loop 5 scenes (hook + scenes 2-5)
        P->>S: POST /v1/audio/speech (per-scene text)
        S-->>P: segment MP3 → decoded to WAV for exact duration
    end
    P->>I: GET /prompt/<cinematic prompt> per scene
    I-->>P: scene images 1280x720
    P->>F: per-scene stills (-loop 1 -t <scene duration>)
    P->>F: concat segments + subtitles.ass + voiceover.wav
    F-->>P: final_video.mp4 (captions burned in)
    P-->>U: final_video.mp4 + subtitles.srt
```

## Component decisions

### TTS: Speaches + Kokoro in Docker (via Vagrant on Windows)

The host runs no Docker, so the TTS server lives in a Kali Vagrant VM
(VirtualBox, 4 vCPU / 4 GB) with a `127.0.0.1:8969 → guest 8969` port forward.
The pipeline's `ensure_speaches()` resolution order:

1. Server already healthy on `:8969` → use it.
2. Local `docker compose up -d` (native Docker hosts).
3. `vagrant ssh` into `C:/vagrant/aiprj` and start the container there.
4. Any failure at request time → per-segment fallback to Edge-TTS.

On first contact the pipeline installs the model
(`POST /v1/models/speaches-ai/Kokoro-82M-v1.0-ONNX`) into the persistent
`hf-hub-cache` volume and issues a warmup request, because the first inference
after a container restart can stall for minutes while the model reloads.

**fp32 over fp16:** benchmarked on 4 vCPUs, the fp32 ONNX build synthesized a
13s clip in ~22s vs ~50s for fp16 — half_float conversion overhead outweighs the
smaller weights on this CPU. fp32 is therefore the default
(`KOKORO_MODEL` in `pipeline.py`).

### Timing: everything from decoded WAV frames

Two verified failure modes shaped the design:

- MP3 header duration estimates (mutagen) drift several seconds over five
  Kokoro segments → captions and scene cuts desync by mid-video. All durations
  now come from decoding each segment to 24 kHz mono WAV and counting frames.
- ffmpeg's still-image concat demuxer silently drops the final `duration`
  entry, truncating a 101s video at 80s (audio continued to 101s). Assembly now
  encodes each scene as its own segment (`-loop 1 -t <duration>`) and concats
  those, which is length-exact.

### Word-level caption timing without a paid aligner

Kokoro's OpenAI-compatible API returns no word boundaries. Word timings are
allocated proportionally to word length within each scene's *measured* duration,
then chunked into ~6-word captions. Scene-level accuracy is exact (it is the
decoded audio length); within a scene, drift is bounded by the scene length and
is imperceptible for caption purposes.

### Script quality gate

`full_narration` must be 150–250 words. On violation the pipeline retries the
same provider once with corrective feedback (the measured word count), then
rotates to the next provider. The word count is logged at generation time.
