/**
 * Copper Kettle Coffee — seed 3 sample bookings into a RUNNING server.
 * Run:  node scripts/seed.mjs           (defaults to http://localhost:3000)
 *       BASE_URL=http://localhost:3001 node scripts/seed.mjs
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";

function pad(n) { return (n < 10 ? "0" : "") + n; }
function plusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

const samples = [
  { name: "Asha Rao", phone: "+91 98450 12345", email: "asha@example.com", date: plusDays(1), time: "18:00", party: 2, seating: "Terrace", notes: "Sample booking (setup demo)" },
  { name: "Vikram Mehta", phone: "+91 99860 45217", email: "", date: plusDays(3), time: "09:00", party: 4, seating: "Indoor", notes: "Sample booking (setup demo)" },
  { name: "Priya Sharma", phone: "+91 90080 33412", email: "priya@example.com", date: plusDays(6), time: "11:00", party: 3, seating: "Window bar", notes: "Sample booking (setup demo)" }
];

try {
  const existing = (await (await fetch(BASE + "/api/bookings")).json()).bookings || [];
  let created = 0, skipped = 0;

  for (const s of samples) {
    if (existing.some((b) => b.name === s.name && String(b.notes || "").includes("Sample booking"))) {
      skipped++;
      console.log(`SKIP     ${s.name} (already seeded)`);
      continue;
    }
    const r = await fetch(BASE + "/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s)
    });
    const j = await r.json();
    if (r.status === 201) {
      created++;
      console.log(`CREATED  ${j.booking.id}  ${j.booking.name}  ${j.booking.date} ${j.booking.time} ×${j.booking.party}`);
    } else {
      console.log(`ERROR    ${s.name}: ${JSON.stringify(j.errors || j)}`);
    }
  }

  const list = await (await fetch(BASE + "/api/bookings")).json();
  console.log(`\nSeeded ${created} new (${skipped} skipped). Ledger now holds ${list.count} bookings.`);
} catch (e) {
  console.error(`Could not reach ${BASE} — is the server running?  (node server.js)\n${e.message}`);
  process.exit(1);
}
