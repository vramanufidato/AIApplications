# Thumbnail / Reel-cover guidelines

How `agents/thumbnail_agent.py` designs covers, and the rules it follows.

## Outputs per video

| File | Size | Use |
|---|---|---|
| `<name>-cover-1080x1920.png` | 1080×1920 (9:16) | Reel cover shown in the feed; uploaded as the Reel cover |
| `<name>-grid-1080x1080.png` | 1080×1080 (1:1) | Profile-grid version with all key text inside the centre crop |

## Layout (z-order)

1. **Base still** — one strong focal image (earphones / a struck frame), cropped to the target ratio.
2. **Darkening + vignette** — `brightness -0.05`, `contrast +6%`, vignette, so text always reads.
3. **Scrim** — semi-transparent black band over the lower third (two stacked bands ≈ a soft gradient).
4. **Brand mark** (top-left) — `POCKET FM` in a dark pill.
5. **Series tag** (top-right) — `AUDIO SERIES` in the accent colour.
6. **Title** — huge Tamil, white, black outline + drop shadow, centred on the focal band.
7. **Accent bar** — thin electric-blue rule under the title.
8. **Kicker** — one short Tamil line.
9. **Badge** — single benefit CTA on a solid accent-coloured box.

## Best practices applied

- **One idea per thumbnail.** The title (≤1 word) + one badge; no paragraph text.
- **Readable at 200 px.** Title fontsize 150–170 on a 1080 canvas; bold Latin for brand text.
- **High contrast.** Dark teal background, white text with outline/shadow, single accent colour.
- **Series recognition.** Identical brand pill, tag, accent colour and title placement on every video
  so the audience recognises the show instantly.
- **Safe area.** Main text sits in the vertical centre band (y ≈ 1120–1500 on 9:16), clear of
  Instagram's top/bottom UI, and inside the centre square for the grid crop.
- **Thumbnail ≠ video frame.** The cover uses the most iconic image, not a random frame
  (`time` selects a deliberate dramatic frame when `base` is omitted).
- **Consistent colour psychology.** Cold blue/teal = mystery/suspense.

## Fonts

- Tamil: `C:/Windows/Fonts/Nirmala.ttc` (rendered through ffmpeg's harfbuzz — correct shaping).
- Latin brand/tag: `C:/Windows/Fonts/arialbd.ttf`.

> Note: Pillow without Raqm cannot shape Tamil, so thumbnails are composed with ffmpeg.

## Customising

Edit the `thumbnails` array in `config.json`:

```json
{ "name": "myshow-reel", "video": "out/reel-9x16.mp4", "time": 12,
  "title": "...", "kicker": "...", "badge": "...", "brand": "POCKET FM", "tag": "AUDIO SERIES" }
```

- `base` = a still image, or `video` + `time` = extract that frame.
- Change colours in `agents/thumbnail_agent.py` (`ACCENT`, `INK`) and positions in `LAYOUT`.
