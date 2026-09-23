// smoke.mjs — offline verification for the persona brain.
//
// Imports the reply logic directly (no Telegram, no network) and asserts that
// both personas produce non-empty replies and that the crisis guard fires.
//
// Run:  node test/smoke.mjs     (exit code 0 = pass)

import assert from 'node:assert/strict';
import { generateReply } from '../src/reply.js';
import { PERSONAS, getSystemPrompt, normalizePersona } from '../src/personas.js';
import { crisisDetected } from '../src/safety.js';

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`  ok  ${name}`);
}

// 1) Both personas answer offline in mock mode.
for (const persona of PERSONAS) {
  const reply = await generateReply({
    persona,
    userText: 'I feel stuck about my career lately.',
    provider: 'mock',
    env: {},
  });
  assert.equal(typeof reply, 'string', `${persona}: reply is a string`);
  assert.ok(reply.trim().length > 20, `${persona}: reply is non-empty`);
  ok(`${persona} returns a non-empty mock reply`);
}

// 2) Persona switching actually changes the voice.
const psy = await generateReply({ persona: 'psychologist', userText: 'hello there', provider: 'mock', env: {} });
const astro = await generateReply({ persona: 'astrologer', userText: 'hello there', provider: 'mock', env: {} });
assert.notEqual(psy, astro, 'personas produce different replies');
ok('psychologist and astrologer differ');

// 3) System prompts load for both personas and include the shared base.
for (const persona of PERSONAS) {
  const sp = getSystemPrompt(persona);
  assert.ok(sp.includes('AutoClaw'), `${persona}: system prompt has shared base`);
  ok(`${persona} system prompt loads`);
}

// 4) Unknown persona normalises to a valid one.
assert.equal(normalizePersona('wizard'), 'psychologist');
ok('unknown persona normalises to psychologist');

// 5) Crisis guard.
assert.equal(crisisDetected('I want to die'), true);
ok('crisis detector flags self-harm language');
const crisisReply = await generateReply({ persona: 'psychologist', userText: 'I want to die', provider: 'mock', env: {} });
assert.ok(/emergency|crisis|helpline/i.test(crisisReply), 'crisis reply points to real help');
ok('crisis reply surfaces real help');

// 6) Crisis guard wins even in "openai" provider mode (no network call happens).
const crisisOpenai = await generateReply({
  persona: 'astrologer',
  userText: 'i think i want to end my life',
  provider: 'openai',
  env: {},
});
assert.ok(/emergency|crisis|helpline/i.test(crisisOpenai));
ok('crisis guard short-circuits before any LLM call');

console.log(`\nAll ${passed} checks passed.`);
