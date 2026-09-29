/**
 * Copper Kettle Coffee — HTTP check of every page & endpoint.
 * Run:  node scripts/check-pages.mjs [baseUrl]
 */
const BASE = process.argv[2] || "http://localhost:3000";

const targets = [
  ["Home page", "/", 200, "text/html", "Book a table"],
  ["Back office", "/admin", 200, "text/html", "bookings-body"],
  ["Stylesheet", "/styles.css", 200, "text/css", ".h-display"],
  ["Front-end script", "/app.js", 200, "javascript", "submitBooking"],
  ["Admin script", "/admin.js", 200, "javascript", "computeStats"],
  ["Favicon", "/favicon.svg", 200, "image/svg+xml", "<svg"],
  ["Slots API", "/api/slots", 200, "application/json", '"08:00"'],
  ["Health API", "/api/health", 200, "application/json", "copper-kettle-bookings"],
  ["Bookings API", "/api/bookings", 200, "application/json", '"bookings"'],
  ["CSV export", "/api/bookings.csv", 200, "text/csv", "id,name,phone"],
  ["Unknown route → 404", "/nope", 404, "", ""]
];

let pass = 0, fail = 0;
for (const [label, p, code, type, contains] of targets) {
  try {
    const r = await fetch(BASE + p);
    const body = await r.text();
    const typeOk = !type || (r.headers.get("content-type") || "").includes(type);
    const bodyOk = !contains || body.includes(contains);
    const ok = r.status === code && typeOk && bodyOk;
    ok ? pass++ : fail++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${label.padEnd(20)} ${p.padEnd(18)} → ${r.status} ${(r.headers.get("content-type") || "").split(";")[0]} ${body.length}b`
    );
    if (!ok) {
      console.log(`      expected ${code} ${type}${contains ? ` containing "${contains}"` : ""}`);
    }
  } catch (e) {
    fail++;
    console.log(`FAIL  ${label.padEnd(20)} ${p.padEnd(18)} → ${e.message}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
