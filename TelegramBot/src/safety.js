// safety.js — lightweight guardrails.
//
// This POC is explicitly NOT a substitute for professional mental-health care.
// We keep a small, transparent keyword check so the psychologist persona can
// surface real crisis resources instead of attempting to "handle" a crisis.

const CRISIS_PATTERNS = [
  /\bkill\s+myself\b/i,
  /\bsuicid/i,
  /\bend\s+my\s+life\b/i,
  /\bdont\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bcut(ting)?\s+myself\b/i,
];

/**
 * True when the text contains a signal that warrants crisis guidance.
 * Deliberately simple and readable — a real product would use a vetted model.
 */
export function crisisDetected(text) {
  const t = String(text || '');
  return CRISIS_PATTERNS.some((re) => re.test(t));
}

export const CRISIS_REPLY = [
  "I'm really glad you told me, and I want you to be safe. I'm a small demo bot — I can't provide crisis care.",
  '',
  'Please reach out to a real person right now:',
  '• Your local emergency number (e.g. 112 in India/EU, 911 in the US, 999 in the UK).',
  '• A suicide-prevention helpline in your country (in India: AASRA +91-9820466726; or search "crisis line <your country>").',
  '• Someone you trust — a friend, family member, or doctor — and tell them how you feel.',
  '',
  "If you are in immediate danger, call emergency services. You deserve support from a human, not a demo.",
].join('\n');
