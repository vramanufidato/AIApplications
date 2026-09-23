"""AGENT 4 - Review + Scheduling (free methods only).

Scheduling is a human handoff: no credentials are requested or stored.
This agent writes the review/scheduling guide and prints the free flow.
"""
from __future__ import annotations

import os

GUIDE = """# Review & Scheduling (free methods only)

> This agent cannot log into Instagram / Meta Business Suite and will never ask for credentials.
> Scheduling is a manual handoff using free tools below.

## Approve?
Caption + hashtags + assets are in `01-reel-content-pack.md` and the rendered Reel in `out/`.
Reply **approve / edit / discard**.

## Method 1 - Instagram Native Scheduler (recommended)
1. Instagram app -> **+ (Create)** -> Reel
2. Add video (9:16 MP4), cover, caption + hashtags
3. **More options / Advanced settings** -> **Schedule this Reel** ON
4. Pick date + time -> **Schedule**
5. Manage: Profile -> Menu -> **Scheduled content**
Limits: 25 posts/day, up to 75 days ahead.

## Method 2 - Meta Business Suite (desktop)
1. Facebook Page linked to Instagram
2. **Create Reel** / **Planner** -> select IG account
3. Upload video + caption -> **Schedule** -> date/time -> Schedule
Limits: 20 minutes to 29 days ahead.

## Method 3 - Free third-party (Later free tier)
- Auto Publish (original audio, single clip, <=90s on Android) or Notification Publishing (trending audio).

## Best practice
- Upload Reels natively for best reach; add trending audio inside the IG app.
- Tamil night-listening audience peaks ~8-10 PM IST.
"""


def run(cfg: dict, base: str) -> None:
    dst = os.path.join(base, "02-review-and-scheduling.md")
    os.makedirs(base, exist_ok=True)
    with open(dst, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(GUIDE)
    print(f"  [scheduling] wrote {dst}")
    print("  [scheduling] Approve for scheduling? (yes / no / edit)")
