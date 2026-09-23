// check.mjs — run `node --check` over every .js/.mjs file in the project.
//
// Run:  node scripts/check.mjs     (exit code 0 = all files parse)

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(m?js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`  ok  ${path.relative(ROOT, file)}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${path.relative(ROOT, file)}`);
    console.error(String(err.stderr || err.message));
  }
}

if (failed) {
  console.error(`\n${failed} file(s) failed syntax check.`);
  process.exit(1);
}
console.log(`\nAll ${files.length} JS files parse cleanly.`);
