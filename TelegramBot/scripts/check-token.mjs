import { loadEnv } from '../src/env.js';
loadEnv();
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.error('No token in .env'); process.exit(1); }
const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
const data = await res.json().catch(() => ({}));
if (!data.ok) { console.error('getMe failed:', data.description || res.status); process.exit(1); }
const b = data.result;
console.log(`Token OK. Bot: @${b.username}  (id ${b.id}, name "${b.first_name}")`);
