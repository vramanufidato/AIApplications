/* Copper Kettle Coffee — back office (bookings ledger) */
(function () {
  "use strict";

  var state = { all: [] };

  function $(s, r) { return (r || document).querySelector(s); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  function fmtStamp(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function computeStats(list) {
    var t = todayISO();
    var upcoming = list.filter(function (b) { return b.date >= t; }).length;
    var today = list.filter(function (b) { return b.date === t; }).length;
    $("#stat-total").textContent = String(list.length);
    $("#stat-upcoming").textContent = String(upcoming);
    $("#stat-today").textContent = String(today);
  }

  function applyFilter(list, q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return list;
    return list.filter(function (b) {
      return [b.id, b.name, b.phone, b.email, b.date, b.notes]
        .join(" ").toLowerCase().indexOf(q) !== -1;
    });
  }

  function render(list) {
    var tbody = $("#bookings-body");
    var filtered = applyFilter(list, $("#filter").value);
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state">' +
        (list.length ? "No bookings match your filter." : "No bookings yet — create one from the main site.") +
        "</div></td></tr>";
    } else {
      tbody.innerHTML = filtered.map(function (b) {
        return "<tr>" +
          '<td class="ref-cell">' + esc(b.id) + "</td>" +
          "<td><strong>" + esc(b.name) + "</strong></td>" +
          "<td>" + esc(b.phone) + (b.email ? '<br><span class="sub">' + esc(b.email) + "</span>" : "") + "</td>" +
          "<td>" + fmtDate(b.date) + '<br><span class="sub">' + esc(b.time) + "</span></td>" +
          "<td>" + esc(b.party) + "</td>" +
          '<td><span class="tag">' + esc(b.seating || "—") + "</span></td>" +
          '<td class="notes">' + esc(b.notes || "—") + "</td>" +
          '<td class="sub">' + fmtStamp(b.createdAt) + "</td>" +
          "</tr>";
      }).join("");
    }
    $("#shown-count").textContent = filtered.length + " shown · " + list.length + " total";
    $("#updated-at").textContent = "Updated " + new Date().toLocaleTimeString();
  }

  function load() {
    var st = $("#table-status");
    if (st) st.textContent = "Loading bookings…";
    fetch("/api/bookings")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        state.all = j.bookings || [];
        if (st) st.textContent = "";
        computeStats(state.all);
        render(state.all);
      })
      .catch(function (err) {
        if (st) st.innerHTML = '<span class="error">Could not load bookings (' + esc(err.message) + "). Start the server with <code>node server.js</code> and reload.</span>";
        $("#bookings-body").innerHTML = '<tr><td colspan="8"><div class="empty-state">No data — server not reachable.</div></td></tr>';
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("#filter").addEventListener("input", function () { render(state.all); });
    $("#refresh").addEventListener("click", load);
    load();
  });
})();
