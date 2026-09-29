/* ─────────────────────────────────────────────────────────────
   Copper Kettle Coffee — booking interactions
   Served from the local Node server (POST /api/bookings).
   When index.html is opened directly from disk (file://), it falls
   back to keeping bookings in this browser and shows a notice.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var SERVE_MODE = location.protocol !== "file:";
  var API = SERVE_MODE ? "" : null; // "" = same origin; null = browser-only preview
  var FALLBACK_SLOTS = buildSlots(8, 21);
  // day (0=Sun) → [open, close] in decimal hours
  var HOURS = { 1: [7.5, 21], 2: [7.5, 21], 3: [7.5, 21], 4: [7.5, 21], 5: [7.5, 21], 6: [8, 22], 0: [8, 20] };

  function buildSlots(start, end) {
    var out = [];
    for (var h = start; h <= end; h++) out.push((h < 10 ? "0" : "") + h + ":00");
    return out;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayISO() { return fmtISO(new Date()); }
  function addDaysISO(n) { var d = new Date(); d.setDate(d.getDate() + n); return fmtISO(d); }
  function dec2hm(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return pad(h) + ":" + pad(m); }

  /* ── Opening-hours chip ───────────────────────────────────── */
  function setOpenChip() {
    var el = $("#open-chip");
    if (!el) return;
    var now = new Date();
    var day = now.getDay();
    var h = now.getHours() + now.getMinutes() / 60;
    var win = HOURS[day];
    var text;
    if (win && h < win[0]) text = "Opens today at " + dec2hm(win[0]);
    else if (win && h <= win[1]) text = "Open now · until " + dec2hm(win[1]);
    else text = "Opens tomorrow at " + dec2hm(HOURS[(day + 1) % 7][0]);
    el.textContent = text;
  }

  /* ── Time slots ───────────────────────────────────────────── */
  function populateSlots(slots) {
    var sel = $("#bk-time");
    if (!sel) return;
    sel.innerHTML = "";
    var ph = document.createElement("option");
    ph.value = ""; ph.textContent = "Select a time"; ph.disabled = true; ph.selected = true;
    sel.appendChild(ph);
    slots.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
  }
  function loadSlots() {
    if (!API) { populateSlots(FALLBACK_SLOTS); return; }
    fetch(API + "/api/slots")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { populateSlots(j && j.slots && j.slots.length ? j.slots : FALLBACK_SLOTS); })
      .catch(function () { populateSlots(FALLBACK_SLOTS); });
  }

  function setDateBounds() {
    var d = $("#bk-date");
    if (!d) return;
    d.min = todayISO();
    d.max = addDaysISO(7);
  }

  /* ── Validation (mirrors the server rules) ────────────────── */
  function validate(data) {
    var errors = [];
    var name = (data.name || "").trim();
    if (name.length < 2 || name.length > 80) errors.push("name: enter 2–80 characters");
    var phone = (data.phone || "").trim();
    if (!/^[+]?[\d][\d\s-]{7,17}$/.test(phone)) errors.push("phone: enter a valid phone number");
    var email = (data.email || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email: enter a valid email or leave it blank");
    var date = data.date || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("date: pick a date");
    else if (date < todayISO()) errors.push("date: pick today or a later date");
    else if (date > addDaysISO(7)) errors.push("date: we take bookings up to 7 days ahead");
    if (FALLBACK_SLOTS.indexOf(data.time || "") === -1) errors.push("time: pick a time between 08:00 and 21:00");
    var party = Number(data.party);
    if (!party || party < 1 || party > 12) errors.push("party: choose 1–12 guests");
    return errors;
  }

  function clearErrors() {
    var boxes = document.querySelectorAll(".field-error");
    for (var i = 0; i < boxes.length; i++) { boxes[i].hidden = true; boxes[i].textContent = ""; }
    var fields = document.querySelectorAll("#booking-form [aria-invalid]");
    for (var j = 0; j < fields.length; j++) fields[j].removeAttribute("aria-invalid");
    var st = $("#booking-status");
    if (st) { st.textContent = ""; st.classList.remove("error", "success"); }
  }

  function renderErrors(errors) {
    var general = [];
    errors.forEach(function (msg) {
      var idx = msg.indexOf(":");
      var field = idx > 0 ? msg.slice(0, idx).trim() : "";
      var text = idx > 0 ? msg.slice(idx + 1).trim() : msg;
      var box = field ? $("#err-" + field) : null;
      if (box) {
        box.textContent = text; box.hidden = false;
        var input = $("#bk-" + field);
        if (input) input.setAttribute("aria-invalid", "true");
      } else {
        general.push(text);
      }
    });
    var st = $("#booking-status");
    if (st) {
      st.textContent = general.join(" ") || "Please fix the highlighted fields.";
      st.classList.add("error");
    }
  }

  function showSuccess(booking, note) {
    var panel = $("#booking-success");
    if (!panel) return;
    var ref = $("#bs-ref");
    if (ref) ref.textContent = booking.id;
    var detail = $("#bs-detail");
    if (detail) {
      var d = new Date(booking.date + "T" + booking.time + ":00");
      var nice = isNaN(d.getTime()) ? booking.date : d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
      detail.textContent = nice + " · " + booking.time + " · " + booking.party + "\u00A0" + (booking.party > 1 ? "guests" : "guest") + (note ? " — " + note : "");
    }
    panel.hidden = false;
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ── Submit ───────────────────────────────────────────────── */
  function bookingPayload(form) {
    var fd = new FormData(form);
    var data = {};
    ["name", "phone", "email", "date", "time", "party", "seating", "notes"].forEach(function (k) {
      data[k] = (fd.get(k) || "").toString().trim();
    });
    data.party = Number(data.party);
    return data;
  }

  function submitBooking(data) {
    if (API === null) {
      // Browser-only preview: keep a ledger in localStorage.
      var list = [];
      try { list = JSON.parse(localStorage.getItem("ck_bookings") || "[]"); } catch (e) { list = []; }
      var booking = {
        id: "CK-LOCAL-" + Date.now().toString(36).toUpperCase(),
        name: data.name, phone: data.phone, email: data.email, date: data.date, time: data.time,
        party: data.party, seating: data.seating, notes: data.notes,
        status: "confirmed", createdAt: new Date().toISOString(), storage: "browser-preview"
      };
      list.push(booking);
      localStorage.setItem("ck_bookings", JSON.stringify(list));
      return Promise.resolve({ booking: booking, note: "Kept in this browser (preview mode)." });
    }
    return fetch(API + "/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (json) {
        if (res.status === 201 && json && json.ok) return { booking: json.booking, note: "" };
        var e = new Error("validation");
        e.errors = (json && json.errors) || ["Something went wrong — please try again."];
        throw e;
      });
    });
  }

  /* ── Wire up ──────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    if (!SERVE_MODE) {
      var banner = $("#preview-banner");
      if (banner) banner.hidden = false;
    }
    setOpenChip();
    setDateBounds();
    loadSlots();

    var form = $("#booking-form");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearErrors();
      var data = bookingPayload(form);
      var errors = validate(data);
      if (errors.length) { renderErrors(errors); return; }

      var btn = $("#booking-submit");
      var old = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Saving…";

      submitBooking(data).then(function (ok) {
        btn.disabled = false; btn.textContent = old;
        var st = $("#booking-status");
        if (st) { st.classList.remove("error"); st.classList.add("success"); st.textContent = "Booking saved. See you soon!"; }
        form.reset();
        showSuccess(ok.booking, ok.note);
      }).catch(function (err) {
        btn.disabled = false; btn.textContent = old;
        if (err && err.errors) renderErrors(err.errors);
        else {
          var st = $("#booking-status");
          if (st) { st.textContent = "Could not reach the booking service. Is the server running? (node server.js)"; st.classList.add("error"); }
        }
      });
    });

    var again = $("#bs-again");
    if (again) {
      again.addEventListener("click", function () {
        var panel = $("#booking-success");
        if (panel) panel.hidden = true;
        var st = $("#booking-status");
        if (st) st.textContent = "";
        form.reset();
        var name = $("#bk-name");
        if (name) name.focus();
      });
    }

    form.addEventListener("input", function (ev) {
      var t = ev.target;
      var box = t.name ? $("#err-" + t.name) : null;
      if (box && !box.hidden && String(t.value).trim()) {
        box.hidden = true;
        t.removeAttribute("aria-invalid");
      }
    });
  });
})();
