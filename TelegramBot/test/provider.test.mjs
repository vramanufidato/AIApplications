// provider.test.mjs - verify the OpenAI-compatible provider wiring with a fake
// fetch. No network, no token. Run: node test/provider.test.mjs
import assert from 'node:assert/strict';
import { generateReply } from '../src/reply.js';

let captured = null;
const fakeFetch = async (url, opts) => {
  captured = { url, opts, body: JSON.parse(opts.body) };
  return {
    ok: true,
    async json() {
      return { choices: [{ message: { content: '  fake reply  ' } }] };
    },
  };
};

const out = await generateReply({
  persona: 'astrologer',
  history: [
    { role: 'user', content: 'earlier' },
    { role: 'assistant', content: 'ok' },
  ],
  userText: 'what should I focus on?',
  provider: 'openai',
  env: { LLM_BASE_URL: 'http://127.0.0.1:9999/v1/', LLM_MODEL: 'test-model', LLM_API_KEY: 'secret' },
  fetchImpl: fakeFetch,
});

assert.equal(out, 'fake reply', 'response is trimmed');
assert.equal(captured.url, 'http://127.0.0.1:9999/v1/chat/completions', 'URL built from base');
assert.equal(captured.opts.method, 'POST', 'POST method');
assert.equal(captured.opts.headers.Authorization, 'Bearer secret', 'auth header set');
assert.equal(captured.body.model, 'test-model', 'model forwarded');
assert.equal(captured.body.messages[0].role, 'system', 'system prompt first');
assert.ok(captured.body.messages[0].content.length > 10, 'system prompt non-empty');
assert.equal(captured.body.messages.at(-1).content, 'what should I focus on?', 'user message last');

console.log('provider.test: all assertions passed (offline).');
