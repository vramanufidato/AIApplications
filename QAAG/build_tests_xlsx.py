# -*- coding: utf-8 -*-
import sys, os, datetime
XLSX_SKILL_DIR = os.path.join(os.environ.get("OPENCLAW_STATE_DIR", r"C:\Users\venka\.openclaw-autoclaw"), "skills", "xlsx")
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)
from base import *
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter

OUT = r"C:\Users\venka\OneDrive\Documents\GitHub\QAAG\test_cases.xlsx"

# ---------------- Test case data ----------------
tests = [
    dict(id="TC-001", module="Homepage", name="Homepage loads successfully", pri="High", cat="smoke", typ="Positive",
         pre="Chrome installed; network access to https://fidatosmainportfolio.netlify.app/",
         steps="1. Launch headless Chrome at 1920x1080\n2. Navigate to the target URL\n3. Wait for document.readyState = 'complete'\n4. Read page title and hero H1",
         exp="Title contains 'Fidato'; hero H1 'Content Creation, AI Audio Scoring, & Enterprise Systems Architecture.' is visible; no error page"),
    dict(id="TC-002", module="Navigation", name="Primary navigation renders all 8 section links", pri="High", cat="smoke", typ="Positive",
         pre="Homepage loaded",
         steps="1. Locate nav[aria-label='Main Navigation']\n2. Enumerate its anchors\n3. Verify each expected label + href",
         exp="All 8 links present and displayed with correct hrefs: Home, Art & Content, AI Music & Audio, Architecture, Resume, Credentials, Media Assets, Contact"),
    dict(id="TC-003", module="Navigation", name="Every internal section route resolves (no broken links)", pri="High", cat="functional", typ="Positive",
         pre="Homepage loaded",
         steps="1. Parametrize over /art, /music, /architecture, /resume, /credentials, /media, /contact\n2. Navigate to each route\n3. Assert no 404 / 'Page not found' and non-empty <body>",
         exp="All 7 routes render a real page (HTTP 200, no not-found), body text non-empty"),
    dict(id="TC-004", module="Hero", name="Hero CTA 'Explore My Work' navigates to /art", pri="Medium", cat="functional", typ="Positive",
         pre="Homepage loaded",
         steps="1. Scroll hero into view\n2. Click a[href$='/art'] inside div.hero-ctas\n3. Read resulting URL and body",
         exp="URL path becomes /art and the Art page content renders (body non-empty)"),
    dict(id="TC-005", module="Hero", name="Hero CTA 'View Resume' navigates to /resume", pri="Medium", cat="functional", typ="Positive",
         pre="Homepage loaded",
         steps="1. Locate 'View Resume' (a.btn.btn-ghost) in div.hero-ctas\n2. Click it\n3. Read resulting URL",
         exp="URL path becomes /resume and resume content renders"),
    dict(id="TC-006", module="Footer", name="Footer SITE SECTIONS links are valid", pri="Medium", cat="regression", typ="Positive",
         pre="Homepage loaded",
         steps="1. Locate footer.footer div.footer-links\n2. Enumerate anchors\n3. Assert each has an href and resolves to a non-404 page",
         exp="All footer section links carry hrefs and resolve successfully"),
    dict(id="TC-007", module="Contact", name="Contact / Commission Work CTA reaches /contact", pri="Medium", cat="functional", typ="Positive",
         pre="Homepage loaded",
         steps="1. Click navbar 'Commission Work' (a.cta-nav-btn)\n2. Return home, click 'Contact' nav link\n3. Read both resulting URLs",
         exp="Both CTAs resolve to /contact"),
    dict(id="TC-008", module="External Links", name="External outbound links are well-formed", pri="Low", cat="functional", typ="Positive",
         pre="Homepage loaded",
         steps="1. Locate known external anchors (nxtdev portfolios, Suno @fidato_warrior, Medium, Credly badges)\n2. Assert valid https hrefs and target attribute",
         exp="All external anchors present with valid https hrefs (open in new tab where applicable)"),
    dict(id="TC-009", module="Media", name="No broken images on homepage", pri="Medium", cat="regression", typ="Positive",
         pre="Homepage loaded and fully rendered",
         steps="1. Enumerate all <img> elements\n2. Read naturalWidth of each\n3. Assert none are 0",
         exp="Every <img> reports naturalWidth > 0 (no failed image loads)"),
    dict(id="TC-010", module="Routing", name="Unknown route returns a 404 page", pri="Low", cat="regression", typ="Negative",
         pre="Site reachable",
         steps="1. Navigate to a non-existent path e.g. /this-page-does-not-exist\n2. Read HTTP status and page content",
         exp="Site returns 404 status or an explicit not-found page (not a silent blank page)"),
    dict(id="TC-011", module="Responsive", name="Mobile viewport renders hero and nav", pri="Medium", cat="smoke", typ="Positive",
         pre="Chrome available",
         steps="1. Launch Chrome at 390x844 (mobile)\n2. Load homepage\n3. Assert hero h1 and nav container are present/visible",
         exp="Hero and navigation present and visible at mobile width; body non-empty"),
]

headers = ["Test ID", "Module", "Test Case Title", "Priority", "Category", "Type", "Preconditions", "Test Steps", "Expected Result"]
last_col = len(headers) + 1  # starts at B=2 -> K=11

wb = Workbook()
ws = wb.active
ws.title = "Test Cases"
setup_sheet(ws, title="QAAG Test Cases - Fidato Portfolio (fidatosmainportfolio.netlify.app)", last_col=last_col)

for c, h in enumerate(headers, start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, 4, 2, last_col)

pri_color = {"High": ACCENT_NEGATIVE, "Medium": ACCENT_WARNING, "Low": ACCENT_POSITIVE}
for i, t in enumerate(tests):
    r = 5 + i
    vals = [t["id"], t["module"], t["name"], t["pri"], t["cat"], t["typ"], t["pre"], t["steps"], t["exp"]]
    for c, v in enumerate(vals, start=2):
        ws.cell(row=r, column=c, value=v)
    style_data_row(ws, r, 2, last_col, i)
    # center short columns
    for c in (2, 5, 6, 7):
        ws.cell(row=r, column=c).alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    # priority accent color
    ws.cell(row=r, column=5).font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color=pri_color[t["pri"]])

auto_fit_columns(ws, min_width=8, max_width=46, header_row=4, data_start_row=5)
auto_fit_row_heights(ws, header_row=4, data_start_row=5)
ws.freeze_panes = "C5"

# ---------------- Summary sheet ----------------
ws2 = wb.create_sheet("Summary")
setup_sheet(ws2, title="Coverage Summary", last_col=3)
ws2.cell(row=4, column=2, value="Metric")
ws2.cell(row=4, column=3, value="Value")
style_header_row(ws2, 4, 2, 3)

total = len(tests)
pri_counts = {p: sum(1 for t in tests if t["pri"] == p) for p in ["High", "Medium", "Low"]}
cat_counts = {c: sum(1 for t in tests if t["cat"] == c) for c in ["smoke", "functional", "regression"]}

rows = [
    ("Site URL", "https://fidatosmainportfolio.netlify.app/"),
    ("Site Type", "Static personal-brand portfolio (Netlify)"),
    ("Inspected", datetime.datetime.now().strftime("%Y-%m-%d %H:%M")),
    ("Total Test Cases", total),
    ("High Priority", pri_counts["High"]),
    ("Medium Priority", pri_counts["Medium"]),
    ("Low Priority", pri_counts["Low"]),
    ("Smoke Tests", cat_counts["smoke"]),
    ("Functional Tests", cat_counts["functional"]),
    ("Regression Tests", cat_counts["regression"]),
    ("Search / Login / Signup flows", "None (no forms detected in recon)"),
]
for i, (k, v) in enumerate(rows):
    r = 5 + i
    ws2.cell(row=r, column=2, value=k)
    ws2.cell(row=r, column=3, value=v)
    style_data_row(ws2, r, 2, 3, i)
    ws2.cell(row=r, column=3).alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws2.cell(row=r, column=2).font = Font(name=FONT_NAME, size=11, bold=HEADER_BOLD, color=PRIMARY)

auto_fit_columns(ws2, min_width=12, max_width=40, header_row=4, data_start_row=5)
auto_fit_row_heights(ws2, header_row=4, data_start_row=5)

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("SAVED:", OUT)
print("sheets:", wb.sheetnames, "| rows in Test Cases:", ws.max_row)
