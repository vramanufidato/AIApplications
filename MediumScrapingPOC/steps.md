# Steps to Run the App in Localhost

End-to-end instructions for running the Medium-article-to-video pipeline on
your local machine, from a clean checkout to a finished MP4. Total setup time:
~15 minutes (plus image downloads); runtime per video: ~15–20 minutes.

---

## Step 1 — Get the code

```bash
git clone https://github.com/vramanufidato/AIApplications.git
cd AIApplications/MediumScrapingPOC
```

Or copy the `MediumScrapingPOC` folder locally. Working directory for all
commands below is this folder.

## Step 2 — Install Python dependencies

Requires Python 3.10+ (`python --version` to check).

```bash
pip install -r requirements.txt
```

This installs: `beautifulsoup4`, `lxml`, `requests`, `edge-tts`,
`imageio-ffmpeg`, `mutagen`.

> No system ffmpeg is needed — the pipeline uses the ffmpeg binary bundled
> inside `imageio-ffmpeg`.

## Step 3 — Set one free LLM API key

The script-generation stage (Stage 1b) needs exactly ONE key. Pick any
provider; the pipeline rotates to the others automatically if one fails.

| Provider | Env var | Free tier |
|----------|---------|-----------|
| Google Gemini (recommended) | `GEMINI_API_KEY` | 500 req/day — [aistudio.google.com](https://aistudio.google.com/apikey) |
| Groq | `GROQ_API_KEY` | ~1,000 req/day — [console.groq.com](https://console.groq.com) |
| Cerebras | `CEREBRAS_API_KEY` | 1M tokens/day — [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| OpenRouter | `OPENROUTER_API_KEY` | 200 req/day — [openrouter.ai](https://openrouter.ai) |
| Zhipu | `ZHIPU_API_KEY` | unlimited — [bigmodel.cn](https://open.bigmodel.cn) |

```bash
# Linux / macOS / Git Bash
export GEMINI_API_KEY="your-key-here"

# Windows CMD
set GEMINI_API_KEY=your-key-here

# Windows PowerShell
$env:GEMINI_API_KEY="your-key-here"
```

## Step 4 — Start the local TTS server (localhost:8969)

You have three options. The pipeline auto-detects the server and falls back to
Edge-TTS (free, internet only) if it's absent — so this step is optional but
recommended for fully offline, unlimited voiceover.

### Option A — Native Docker (Linux / Docker Desktop)

```bash
docker compose up -d
curl http://localhost:8969/health     # -> 200 OK once ready
```

### Option B — Docker inside a Vagrant VM (Windows without Docker)

1. Create a Vagrantfile (VirtualBox provider) with a port forward and resources:

   ```ruby
   Vagrant.configure("2") do |config|
     config.vm.box = "kalilinux/rolling"
     config.vm.network "forwarded_port", guest: 8969, host: 8969, host_ip: "127.0.0.1"
     config.vm.provider "virtualbox" do |vb|
       vb.memory = 4096
       vb.cpus = 4        # Kokoro fp32 needs ~4 vCPUs for usable speed
     end
   end
   ```

2. Boot it and install Docker inside:

   ```bash
   vagrant up
   vagrant ssh -c "sudo apt-get update && sudo apt-get install -y docker.io && sudo systemctl enable --now docker"
   ```

3. Copy `docker-compose.yml` into the VM's `/vagrant` shared folder and start
   the server:

   ```bash
   cp docker-compose.yml /path/to/vagrant-project/
   vagrant ssh -c "sudo docker compose -f /vagrant/docker-compose.yml up -d"
   ```

4. Verify from the host: `curl http://localhost:8969/health` → 200.

### Option C — Skip it (Edge-TTS fallback)

Do nothing. The pipeline logs
`provider=Edge-TTS(en-US-ChristopherNeural)` and uses Microsoft's free neural
voice. Internet required.

> **First-run note:** on first contact the pipeline automatically downloads the
> Kokoro model (~350 MB) into the container's persistent volume and sends a
> warmup request — allow a few extra minutes on the very first run only.

## Step 5 — Run the pipeline

```bash
python pipeline.py --url "https://medium.com/@author/some-article-abc123"
```

Watch the console (also mirrored to `output/pipeline.log`). You'll see each
stage with the provider it used:

```
[STAGE 1a] provider=requests+BeautifulSoup chars=9728 -> output\article_raw.txt
[STAGE 1b] provider=Google Gemini gemini-2.5-flash scenes=5 full_narration=214 words (OK, 150-250) -> script.json
[STAGE 2] provider=Speaches+Kokoro(af_heart) segments=5 duration=100.9s -> voiceover.wav
[STAGE 3] provider=Pollinations.ai scene=1..5 -> scene_*.jpg
[STAGE 4] provider=local(word timestamps) subtitles=46 -> subtitles.srt/.ass
[STAGE 5] provider=ffmpeg(libx264) duration=100.9s -> output\final_video.mp4
DONE -> output\final_video.mp4
```

Typical timing: LLM script ~20s · Kokoro TTS ~2–3 min (0.6× real time on 4
vCPUs) · images ~45s per scene · assembly ~40s.

## Step 6 — Collect the output

| File | What it is |
|------|-----------|
| `output/final_video.mp4` | The video — 1280×720, captions burned in, voiceover muxed |
| `output/subtitles.srt` | Upload-ready subtitles for YouTube/TikTok caption fields |
| `output/script.json` | The viral script (title, hook, scenes, image prompts) |
| `output/article_raw.txt` | Extracted article text |
| `output/voiceover.wav`, `segment_*.mp3/.wav` | Narration audio |
| `output/scene_*.jpg` | Generated cinematic images |
| `output/pipeline.log` | Full run log |

## Step 7 — Verify (optional sanity check)

```bash
# container duration must match the video stream's decode end time
ffmpeg -i output/final_video.mp4            # look for "Duration: 00:01:40.xx"
```

Both numbers should match (~1% tolerance). The pipeline's per-scene encoding
guarantees this; see ARCHITECTURE.md if you modify assembly.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `All LLM providers failed` | No/invalid API key — the error lists each provider's reason. Set one key from Step 3. |
| Stage 2 times out or is very slow | Give the VM ≥4 vCPUs; first request after a container restart reloads the model (pipeline warms up + retries once, then falls back to Edge-TTS per segment). |
| Pollinations 500 errors | Transient — pipeline retries 3× per scene automatically; just wait. |
| `docker: command not found` on Windows host | Use Option B (Vagrant) or Option C (Edge-TTS). |
| Port 8969 already in use | Change the host port in the compose/Vagrantfile and `SPEACHES_URL` in `pipeline.py`. |
