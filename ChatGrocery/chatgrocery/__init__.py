"""ChatGrocery — quick-commerce price monitoring agent (POC).

Fetches a point-in-time price snapshot for a set of grocery SKUs across
Blinkit / Zepto / Swiggy Instamart for one delivery pincode, finds the
cheapest platform per SKU, flags any cross-platform gap above a threshold,
writes a Markdown report, and posts a one-line summary to a Pumble
incoming webhook.
"""

__version__ = "0.1.0"
