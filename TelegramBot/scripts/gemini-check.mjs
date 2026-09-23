import { loadEnv } from '../src/env.js';
loadEnv();
const key = process.env.LLM_API_KEY;
const base = (process.env.LLM_BASE_URL || '').replace(/\/+$/, '');
if (!key) { console.error('no LLM_API_KEY'); process.exit(1); }
console.log('base:', base);
console.log('model:', process.env.LLM_MODEL);

try {
  const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` } });
  const j = await r.json().catch(() => ({}));
  console.log('GET /models ->', r.status);
  const ids = (j.data || []).map((m) => m.id);
  console.log('models:', ids.length ? ids.join(', ') : JSON.stringify(j).slice(0, 400));
} catch (e) { console.error('models error:', e.message); }

try {
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      messages: [{ role: 'user', content: 'Reply with exactly: hello from gemini' }],
      max_tokens: 30,
    }),
  });
  const txt = await r.text();
  console.log('POST /chat/completions ->', r.status);
  console.log('body:', txt.slice(0, 600));
} catch (e) { console.error('chat error:', e.message); }
