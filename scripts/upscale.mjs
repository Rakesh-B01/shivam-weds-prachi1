// Upscales an image with Lanczos-3 + gentle sharpening using headless Edge/Chrome.
// 1) node scripts/serve.mjs   2) node scripts/upscale.mjs <input> <output> [scale=3]
// e.g. node scripts/upscale.mjs assets/illustrations/hero-source.jpg assets/illustrations/hero.jpg 3
// Note: upscaling smooths pixelation but can't invent detail — a larger original always looks best.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [input, output, scale = '3'] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node scripts/upscale.mjs <input> <output> [scale]');
const browser = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].filter(Boolean).find((p) => existsSync(p));
if (!browser) throw new Error('No Chrome/Edge found. Set CHROME_PATH.');

const srcUrl = '/' + relative(ROOT, join(ROOT, input)).replace(/\\/g, '/');
const url = `http://localhost:${process.env.PORT || 5173}/scripts/upscale.html?src=${encodeURIComponent(srcUrl)}&scale=${scale}`;
const html = execFileSync(browser, ['--headless=new', '--disable-gpu', '--virtual-time-budget=60000', '--dump-dom', url], { encoding: 'utf8', maxBuffer: 200e6 });
const m = html.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
if (!m) throw new Error('Upscale failed — is the local server running (node scripts/serve.mjs)?');
writeFileSync(join(ROOT, output), Buffer.from(m[1], 'base64'));
console.log('Wrote', output);
