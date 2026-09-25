"""ChatFin — chat-based financial research agent (POC).

A small, dependency-light agent that:
  1. pulls NSE daily closes for a watchlist,
  2. computes a 30-day SMA and a 14-day RSI,
  3. derives a Bullish / Bearish / Neutral signal,
  4. writes a Markdown report, and
  5. posts a one-line summary to a chat webhook (Pumble).

The indicator and signal logic are pure functions so they can be unit-tested
without a network connection.
"""

__version__ = "0.1.0"
