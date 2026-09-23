// open-demo.mjs — open the offline demo in the default browser.
//
// Run:  npm run demo

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(__dirname, '..', 'demo', 'index.html');

const cmd =
  process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
const args = process.platform === 'win32' ? ['/c', 'start', '', file] : [file];

console.log(`Opening ${file}`);
spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
