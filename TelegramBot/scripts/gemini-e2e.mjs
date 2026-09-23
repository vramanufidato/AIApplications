import { loadEnv } from '../src/env.js';
loadEnv();
import { generateReply } from '../src/reply.js';
for (const persona of ['psychologist', 'astrologer']) {
  const t0 = Date.now();
  try {
    const r = await generateReply({ persona, userText: 'I feel stuck about my career lately.', provider: 'openai', env: process.env });
    console.log(`\n=== ${persona} (${Date.now() - t0}ms) ===\n${r}`);
  } catch (e) {
    console.log(`\n=== ${persona} FAILED: ${e.message} ===`);
  }
}
