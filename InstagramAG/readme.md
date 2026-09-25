# InstagramAG — Free-Tools Instagram Content Agent

A multi-agent pipeline that generates **captions, hashtags, scene assets, Tamil voiceover and a
final 9:16 Reel** for Instagram — using free tools only. It follows the 4-agent spec:

```
AGENT 1  Content Generation  -> hooks, caption, hashtags, scene prompts   (content_agent)
AGENT 2  Video source        -> Meta AI animation clips (default)         (clip_agent)
         Asset Generation    -> 9:16 cover / stills (AutoGLM Seedream)      (asset_agent)
         Voiceover           -> Tamil/other TTS via edge-tts (free)        (voice_agent)
         Assembly            -> ffmpeg: clips|Ken-Burns + text + audio      (assembly_agent)
AGENT 3  Validation          -> caption/hashtag/format checks report      (validation_agent)
AGENT 4  Review + Scheduling -> free Instagram / Meta Business Suite flow (scheduling_agent)

**Default output: a 30-second 9:16 Reel built from Meta AI animation clips.**
```

> Scheduling is a **human handoff**: no account credentials are requested or stored. The pipeline
> prepares the asset pack + validates it; you upload/schedule inside Instagram or Meta Business Suite.

## Install

```bash
pip install -r requirements.txt      # edge-tts
# ffmpeg must be on PATH (with drawtext/harfbuzz for Tamil shaping)
```

## Configure

Copy `config.example.json` to `config.json` and edit the topic, caption, hashtags, scene prompts
and voice lines for your series.

```json
{
  "language": "ta-IN",
  "voice": "ta-IN-ValluvarNeural",
  "output_dir": "data/nisabtham",
  ...
}
```

## Run

```bash
python run_pipeline.py --config config.json
```

Outputs land in `data/<slug>/`:

```
data/<slug>/
  out/reel-9x16.mp4          # the final Reel
  thumbnails/*.png           # 9:16 cover + 1:1 grid per video
  assets/scenes/*.jpeg       # generated stills
  assets/audio/vo_*.mp3      # voiceover lines
  cover-9x16.jpeg
  01-reel-content-pack.md    # hooks / caption / hashtags / script
  02-review-and-scheduling.md
  validation_report.json
```

## Agents

| Module | Responsibility |
|---|---|
| `agents/content_agent.py` | Writes the content pack (hooks, caption, hashtags, script). |
| `agents/clip_agent.py` | Locates + validates the Meta AI animation clips for the Reel. |
| `agents/thumbnail_agent.py` | Renders 9:16 cover + 1:1 grid thumbnails (thumbnail best practices). |
| `agents/asset_agent.py` | Text-to-image scene stills via the AutoGLM Seedream endpoint. |
| `agents/voice_agent.py` | Voiceover via `edge-tts` (free, no API key). |
| `agents/assembly_agent.py` | Builds the Reel with ffmpeg (zoompan + drawtext + audio mix). |
| `agents/validation_agent.py` | `validation_report.json` (caption ≤2200, hashtags ≤30, MP4 9:16 ≤90s). |
| `agents/scheduling_agent.py` | Prints the free Instagram native / Meta Business Suite steps. |

## Reel structure

Every Reel is assembled on one timeline:

```
[ intro card ]  [ main body: Meta AI clips OR stills ]  [ outro card ]
   cover image        video.duration (30s default)          FOLLOW / Subscribe
```

- **Intro card** uses the cover image (`reel.intro.image`), so the key image appears *inside* the
  reel, with the series title + a subtitle.
- **Outro card** is the **Follow / Subscribe end page** (`reel.outro`): big `FOLLOW`, a
  `Subscribe · Like · Save` line, and a brand CTA banner. Swap the image to any still.
- Caption windows and the voiceover are shifted automatically by the intro length (the
  `body@Ns` value printed during assembly).
- Total length = intro + body + outro (e.g. 2.5s + 30s + 5s = 37.5s).

Configure in `config.json` -> `reel.intro` / `reel.outro`:

```json
"intro": { "image": "cover.jpeg", "frames": 75, "text": "நிசப்தம்",
           "text_font": "tamil", "sub": "Pocket FM · மர்ம ஆடியோ தொடர்", "sub_font": "tamil" },
"outro": { "image": "scenes/s5_wave.jpeg", "frames": 150, "text": "FOLLOW",
           "text_font": "latin", "sub": "Subscribe · Like · Save",
           "cta": "POCKET FM · நிசப்தம்", "cta_font": "tamil" }
```

Fonts: `tamil` = Nirmala (also fine for Latin), `latin` = Arial Black (titles), `latinsub` = Arial
Bold. Use a Tamil-capable font for any Tamil string.

## Video providers

`video.provider` selects the video source:

| Provider | What it does |
|---|---|
| `meta_ai` **(default)** | Normalises Meta AI animation clips to 1080×1920/30fps, gives each clip an equal slot to hit `video.duration` (**30 s default**), then adds captions + voiceover. |
| `stills` | Ken-Burns zoompan over generated scene stills (the earlier approach). |

Meta AI has no free public API, so you generate the clips in the Meta AI app and drop them in
`data/<slug>/assets/clips/`. Full steps: [`docs/meta-ai-animation.md`](docs/meta-ai-animation.md).

Switch provider:

```bash
python run_pipeline.py --config config.json --provider stills
```

## Retry policy

Any generation call that returns `We're experiencing high demand right now…` is retried after a
**4-minute** backoff (see `RETRY_BACKOFF_S = 240` in `agents/asset_agent.py`).

## Notes

- Tamil on-screen text needs a shaping-capable font. `C:/Windows/Fonts/Nirmala.ttc` ships with
  Windows and works with ffmpeg's harfbuzz-backed `drawtext`.
- Media outputs are git-ignored by default (see `.gitignore`); commit code + docs, keep media out of git.
