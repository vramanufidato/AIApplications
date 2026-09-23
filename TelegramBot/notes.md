# Other things an AutoClaw Telegram bot can do

The pattern is always the same: **Telegram is the front door; AutoClaw is the
brain.** The BotFather token gets messages in, personas/instructions shape the
voice, and tools/memory do the work. Below are concrete use cases — each one line
on how it maps to AutoClaw capabilities.

1. **Personal psychologist / reflective listener** — a safe-space DM that reflects
   feelings and asks gentle questions. *Maps to: persona instructions + a
   safety-guard recall. (This POC.)*
2. **Astrologer / daily reflection** — a short "theme of the day" framed as
   reflection, not prediction. *Maps to: persona instructions only.*
3. **Journaling & mood coach** — you DM a thought; the bot tags mood and stores
   the entry. *Maps to: memory + scheduled prompts.*
4. **Habit & streak tracker** — "did you meditate?" nudges, with a weekly recap.
   *Maps to: cron reminders + a small data store.*
5. **Study / flashcard tutor** — quiz on your own notes, spaced repetition.
   *Maps to: file/web-fetch tools + memory.*
6. **Mobile code reviewer** — paste a diff, get review comments on your phone.
   *Maps to: code tools + a review persona.*
7. **Calendar & inbox triage** — "what's my day?", "summarize unread mail".
   *Maps to: calendar/email connectors.*
8. **Language-practice partner** — chat in your target language with corrections.
   *Maps to: persona instructions + memory of your level.*
9. **Meal & grocery planner** — plan meals from what's in your fridge, output a
   shopping list. *Maps to: tools + a structured output persona.*
10. **On-call runbook helper** — "service X is down"; get the first diagnostic
    steps and a summary of the alert. *Maps to: exec/runbook tools + persona.*
11. **Home-automation notifier** — the bot pings you when a sensor or job fires,
    and accepts "turn off the lights" style replies. *Maps to: webhooks + tools.*
12. **Daily news / digest briefer** — a morning summary of sources you choose.
    *Maps to: search/browser tools + a scheduled job.*

## Turning one into a product

- **Pick a persona file** from `personas/` as the starting voice.
- **Add the one capability it needs** (a tool, a connector, or memory).
- **Add one scheduled job** if it should reach out on its own (e.g. a daily nudge).
- **Keep a safety guard** in front of anything health- or crisis-adjacent.

Path A in the README (OpenClaw's native Telegram channel) is the fastest way to
ship any of these for real; this repo's Path B is the learning/demo route.
