// Renders assets/og-image.jpg (WhatsApp / social preview) using headless Edge or Chrome.
// 1) Start the local server:  node scripts/serve.mjs
// 2) In another terminal:     node scripts/make-og.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

const url = `http://localhost:${process.env.PORT || 5173}/scripts/og.html`;
const html = execFileSync(browser, ['--headless=new', '--disable-gpu', '--virtual-time-budget=15000', '--dump-dom', url], { encoding: 'utf8', maxBuffer: 50e6 });
const m = html.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
if (!m) throw new Error('Render failed — is the local server running?');
const out = join(ROOT, 'assets', 'og-image.jpg');
writeFileSync(out, Buffer.from(m[1], 'base64'));
console.log('Wrote', out);
