/**
 * Copper Kettle Coffee — real-browser verification (Chrome DevTools Protocol).
 *
 * 1) Emulates a 390×844 mobile device and screenshots the home page
 *    → docs/home-mobile.png
 * 2) Fills the booking form like a visitor and submits it via the real UI
 *    → docs/booking-success-390.png  +  verifies the confirmation panel
 *
 * Run (server must be up):  node scripts/browser-check.mjs
 */
import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const PORT = 9231;
const BASE = process.env.BASE_URL || "http://localhost:3000";

const browserPaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];
const browser = browserPaths.find((p) => fs.existsSync(p));
if (!browser) { console.error("No Chromium-based browser found — skipping."); process.exit(1); }

fs.mkdirSync(DOCS, { recursive: true });
const ud = path.join(os.tmpdir(), "ck-browser-check-" + Date.now());
const proc = spawn(browser, [
  "--headless=new", "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  "--remote-allow-origins=*", "--user-data-dir=" + ud,
  "--remote-debugging-port=" + PORT, "about:blank"
], { stdio: "ignore" });

let ws = null;
let msgId = 0;
const pending = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function waitForEndpoint() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("DevTools endpoint did not come up");
}

function evalJs(expression) {
  return send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })
    .then((r) => {
      if (r && r.exceptionDetails) {
        console.error("PAGE EXCEPTION:", r.exceptionDetails.text,
          (r.exceptionDetails.exception && r.exceptionDetails.exception.description) || "");
        return undefined;
      }
      return r && r.result ? r.result.value : undefined;
    });
}

async function waitInPage(expr, timeoutMs = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { if (await evalJs(expr)) return true; } catch {}
    await sleep(250);
  }
  return false;
}

async function shoot(file) {
  const r = await send("Page.captureScreenshot", { format: "png" });
  const full = path.join(DOCS, file);
  fs.writeFileSync(full, Buffer.from(r.data, "base64"));
  return full;
}

let pass = false, ref = "";
try {
  const wsUrl = await waitForEndpoint();
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("WebSocket connect failed")); });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result || {});
    }
  };

  await send("Page.enable");
  await send("Runtime.enable");
  // true 390 px CSS viewport (mobile emulation — bypasses Windows min-window limits)
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  });

  await send("Page.navigate", { url: BASE + "/" });
  await waitInPage("document.readyState === 'complete'");
  await waitInPage("document.querySelector('#bk-time') && document.querySelector('#bk-time').options.length > 2");
  await sleep(900);
  console.log("MOBILE SCREENSHOT:", await shoot("home-mobile.png"));

  // — real form interaction: fill + submit like a visitor —
  await evalJs("document.querySelector('#book').scrollIntoView()");
  await sleep(500);
  const filled = await evalJs(`
    (function () {
      var d = new Date(); d.setDate(d.getDate() + 2);
      var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      document.querySelector('#bk-name').value = 'Browser Check Guest';
      document.querySelector('#bk-phone').value = '+91 98111 22334';
      document.querySelector('#bk-email').value = 'check@example.com';
      document.querySelector('#bk-date').value = iso;
      document.querySelector('#bk-time').value = '12:00';
      document.querySelector('#bk-party').value = '2';
      document.querySelector('#bk-notes').value = 'Created via automated browser check';
      return { name: document.querySelector('#bk-name').value, date: iso, time: document.querySelector('#bk-time').value, party: document.querySelector('#bk-party').value };
    })()
  `);
  console.log("FORM FILLED:", JSON.stringify(filled));

  await evalJs("document.querySelector('#booking-submit').click()");
  const shown = await waitInPage("document.querySelector('#booking-success') && !document.querySelector('#booking-success').hidden", 15000);
  ref = await evalJs("document.querySelector('#bs-ref') ? document.querySelector('#bs-ref').textContent : ''");
  console.log("SUCCESS PANEL SHOWN:", shown, "| REF:", ref);
  await sleep(600);
  console.log("SUCCESS SCREENSHOT:", await shoot("booking-success-390.png"));

  pass = Boolean(shown && ref);
} catch (e) {
  console.error("BROWSER-CHECK ERROR:", e.message);
} finally {
  try { ws && ws.close(); } catch {}
  try { execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: "ignore" }); } catch {}
  await sleep(300);
  console.log(pass ? "BROWSER-CHECK PASS" : "BROWSER-CHECK FAIL");
  process.exit(pass ? 0 : 1);
}
