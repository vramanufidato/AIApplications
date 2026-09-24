# Meta AI animation provider (default)

`video.provider = "meta_ai"` builds the Reel from **Meta AI animation clips** instead of
still-image Ken-Burns. The pipeline normalises each clip to 1080×1920 / 30 fps, gives every clip an
equal time slot to hit an exact total length (**30 s by default**), then adds the on-screen Tamil text
and the voiceover.

## Why clips are supplied, not called by API

Meta AI's animation / video ("Animate", "Vibes") features are consumer experiences in the **Meta AI
app** and on Instagram/Messenger. There is **no free public API**, so this agent does not call it
programmatically. You generate the clips in Meta AI, drop them in a folder, and the agent renders the
final Reel.

## Steps

1. Open **Meta AI** (app or meta.ai) and use the animation / text-to-video feature.
2. Generate **3–6 clips** matching the scene list (see the content pack). Keep them **vertical (9:16)**
   where possible; horizontal is fine — the agent crops to 9:16.
3. Export each clip to your device.
4. Put the clips in:

   ```
   data/nisabtham/assets/clips/
     clip1.mp4
     clip2.mp4
     ...
   ```

   (Or list explicit paths in `config.json` → `video.clips`.)

5. Run:

   ```bash
   python run_pipeline.py --config config.json
   ```

## How timing works

- `video.duration` (default **30**) is the target length.
- Each clip gets `duration / n_clips` seconds. Short clips are **looped** and long clips are
  **trimmed**, so the total is exactly the target duration.
- The on-screen caption windows (from `reel.segments`) are scaled proportionally to the final length.

Example: 30 s, 5 clips → each clip runs 6 s.

## Notes

- Clip audio is ignored; the Reel uses the ambient bed + generated voiceover.
- Provider `stills` is the fallback (no Meta AI clips needed).
- Switching providers:

  ```bash
  python run_pipeline.py --config config.json --provider stills
  ```
