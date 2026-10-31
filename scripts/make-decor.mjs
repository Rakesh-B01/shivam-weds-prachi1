// Draws the rose + traditional Indian ornaments used for borders and separators.
// Run: node scripts/make-decor.mjs   → assets/decor/*.svg
//   rose-divider.svg      separator under section titles (rose, buds, leaves, gold vines, paisleys)
//   border-band.svg       repeating temple/rose band for section edges (tile, repeat-x)
//   rose-corner-*.svg     corner clusters for cards (tl, tr, bl, br)
//   footer-garland.svg    repeating blush-rose garland for the maroon footer (tile, repeat-x)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'decor');
mkdirSync(OUT, { recursive: true });
const f = (n) => Number(n).toFixed(2).replace(/\.?0+$/, '');
const GOLD = '#C99A3A', GOLD_LIGHT = '#E9C766', MAROON = '#7A1F2B';

const PALETTES = {
  red: { id: 'R', light: '#F0566E', mid: '#C21A38', dark: '#7A0E20', line: '#5A0A18', hi: '#FFB3C0' },
  blush: { id: 'B', light: '#FFE1E7', mid: '#F6A5B5', dark: '#D9768B', line: '#B5506A', hi: '#FFFFFF' },
};
const defs = (...pals) => `<defs>${pals.map((p) => `
  <radialGradient id="rose${p.id}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${p.light}"/><stop offset=".55" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></radialGradient>`).join('')}
  <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5DA56A"/><stop offset="1" stop-color="#2C6B3A"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B8862F"/><stop offset=".5" stop-color="#F1D27A"/><stop offset="1" stop-color="#A9781F"/></linearGradient>
</defs>`;

/* a layered rose seen from above: five outer petals, a cupped centre and a spiral of inner petals */
function rose(cx, cy, r, p = PALETTES.red) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    s += `<circle cx="${f(cx + Math.cos(a) * r * 0.42)}" cy="${f(cy + Math.sin(a) * r * 0.42)}" r="${f(r * 0.6)}" fill="url(#rose${p.id})" stroke="${p.line}" stroke-opacity=".35" stroke-width="${f(r * 0.05)}"/>`;
  }
  s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.62)}" fill="${p.mid}"/>`;
  s += `<path d="M${f(cx - r * 0.42)},${f(cy + r * 0.08)} a${f(r * 0.42)},${f(r * 0.42)} 0 1 1 ${f(r * 0.62)},${f(r * 0.3)} a${f(r * 0.26)},${f(r * 0.26)} 0 1 1 ${f(-r * 0.2)},${f(-r * 0.42)} a${f(r * 0.12)},${f(r * 0.12)} 0 1 1 ${f(-r * 0.04)},${f(r * 0.2)}" fill="none" stroke="${p.line}" stroke-width="${f(r * 0.09)}" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="M${f(cx - r * 0.7)},${f(cy - r * 0.15)} Q${f(cx - r * 0.35)},${f(cy - r * 0.85)} ${f(cx + r * 0.3)},${f(cy - r * 0.72)}" fill="none" stroke="${p.hi}" stroke-width="${f(r * 0.08)}" stroke-linecap="round" opacity=".75"/>`;
  return s;
}
function leaf(x, y, angle, len) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"><path d="M0,0 Q${f(len * 0.5)},${f(-len * 0.36)} ${f(len)},0 Q${f(len * 0.5)},${f(len * 0.36)} 0,0Z" fill="url(#leaf)"/><path d="M${f(len * 0.08)},0 L${f(len * 0.85)},0" stroke="#A9D7A6" stroke-width="${f(len * 0.04)}" opacity=".8"/></g>`;
}
function bud(x, y, angle, s, p = PALETTES.red) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"><path d="M0,${f(-s)} C${f(s * 0.7)},${f(-s * 0.5)} ${f(s * 0.6)},${f(s * 0.5)} 0,${f(s * 0.6)} C${f(-s * 0.6)},${f(s * 0.5)} ${f(-s * 0.7)},${f(-s * 0.5)} 0,${f(-s)}Z" fill="url(#rose${p.id})"/><path d="M${f(-s * 0.55)},${f(s * 0.25)} Q0,${f(s * 1.3)} ${f(s * 0.55)},${f(s * 0.25)} Q0,${f(s * 0.75)} ${f(-s * 0.55)},${f(s * 0.25)}Z" fill="url(#leaf)"/></g>`;
}
/* paisley / buta — the classic Indian teardrop with a curled tip */
function buta(x, y, s, angle = 0, color = 'url(#gold)') {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${f(s)})"><path d="M0,10 C-9,10 -10,-1 -4,-6 C1,-10 8,-9 9,-3 C10,2 5,4 3,1 C1,-2 4,-4 6,-3" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/><path d="M0,10 C-6,9 -7,1 -3,-3" fill="none" stroke="${color}" stroke-width=".8"/><circle cx="-1" cy="3" r="1.6" fill="${MAROON}"/></g>`;
}
const dot = (x, y, r = 1.4, c = GOLD) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`;
const svg = (w, h, body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${extra}>${body}</svg>\n`;

/* ---------- 1. Rose divider (240 x 40) ---------- */
{
  const half = `
    <path d="M104,20 C88,8 70,30 54,20 C42,12 30,24 20,20" fill="none" stroke="url(#gold)" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M70,23 c-4,-8 4,-12 7,-6" fill="none" stroke="url(#gold)" stroke-width="1.2"/>
    <path d="M40,17 c3,7 -5,10 -7,4" fill="none" stroke="url(#gold)" stroke-width="1.2"/>
    ${buta(10, 20, 0.85, -90)}
    ${dot(62, 22)}${dot(47, 16)}${dot(30, 22, 1.1)}
    ${leaf(108, 22, 165, 15)}${leaf(106, 16, 205, 12)}
    ${bud(92, 13, -40, 4.6)}
    ${leaf(80, 18, 150, 9)}`;
  const body = `${defs(PALETTES.red)}
    <g>${half}</g><g transform="translate(240 0) scale(-1 1)">${half}</g>
    ${rose(120, 20, 12)}
    ${dot(120, 4, 1.6, MAROON)}${dot(120, 36, 1.6, MAROON)}`;
  writeFileSync(join(OUT, 'rose-divider.svg'), svg(240, 40, body, 'aria-hidden="true"'));
}

/* ---------- 2. Traditional border band tile (96 x 30, repeat-x) ---------- */
{
  const body = `${defs(PALETTES.red)}
    <rect width="96" height="30" fill="none"/>
    <path d="M0,2.5 H96 M0,6 H96" stroke="${GOLD}" stroke-width="1.4"/>
    <path d="M0,27.5 H96" stroke="${GOLD}" stroke-width="1.2" stroke-dasharray="1 3" stroke-linecap="round"/>
    <!-- temple arches (kangura) -->
    <path d="M0,6 Q12,22 24,6 Q36,22 48,6 Q60,22 72,6 Q84,22 96,6" fill="none" stroke="${MAROON}" stroke-width="1" opacity=".55"/>
    ${dot(12, 15, 1.3, GOLD)}${dot(36, 15, 1.3, GOLD)}${dot(60, 15, 1.3, GOLD)}${dot(84, 15, 1.3, GOLD)}
    <!-- rose with leaves, then a gold buta -->
    ${leaf(24, 19, 200, 9)}${leaf(24, 19, -20, 9)}
    ${rose(24, 17, 6.2)}
    ${buta(72, 16, 0.75, 0)}
    ${dot(48, 19, 1.8, '#C21A38')}${dot(0, 19, 1.8, '#C21A38')}${dot(96, 19, 1.8, '#C21A38')}`;
  writeFileSync(join(OUT, 'border-band.svg'), svg(96, 30, body, 'aria-hidden="true"'));
}

/* ---------- 3. Rose corner clusters (110 x 110), four orientations ---------- */
{
  const cluster = `
    <path d="M4,108 V4 H108" fill="none" stroke="url(#gold)" stroke-width="1.6"/>
    <path d="M10,108 V10 H108" fill="none" stroke="url(#gold)" stroke-width=".8" opacity=".8"/>
    <path d="M30,30 C52,34 70,22 98,24" fill="none" stroke="url(#gold)" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M30,30 C34,52 22,70 24,98" fill="none" stroke="url(#gold)" stroke-width="1.3" stroke-linecap="round"/>
    ${buta(98, 24, 0.7, 0)}${buta(24, 98, 0.7, 90)}
    ${dot(76, 22)}${dot(22, 76)}${dot(88, 30, 1.1)}${dot(30, 88, 1.1)}
    ${leaf(36, 40, 40, 20)}${leaf(42, 30, 5, 16)}${leaf(30, 44, 85, 16)}
    ${leaf(54, 22, -10, 12)}${leaf(20, 56, 100, 12)}
    ${rose(56, 16, 7.5)}${rose(16, 56, 7.5)}
    ${bud(70, 30, 70, 4.2)}${bud(30, 70, 20, 4.2)}
    ${rose(28, 28, 13)}`;
  const variants = { tl: '', tr: 'translate(110 0) scale(-1 1)', bl: 'translate(0 110) scale(1 -1)', br: 'translate(110 110) scale(-1 -1)' };
  for (const [name, t] of Object.entries(variants)) {
    writeFileSync(join(OUT, `rose-corner-${name}.svg`), svg(110, 110, `${defs(PALETTES.red)}<g transform="${t}">${cluster}</g>`, 'aria-hidden="true"'));
  }
}

/* ---------- 4. Footer garland tile (84 x 34, repeat-x) — blush roses on a gold rope ---------- */
{
  const body = `${defs(PALETTES.blush)}
    <path d="M0,4 H84" stroke="${GOLD_LIGHT}" stroke-width="2"/>
    <path d="M0,8 Q21,26 42,8 Q63,26 84,8" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
    ${leaf(21, 18, 200, 10)}${leaf(21, 18, -20, 10)}
    ${rose(21, 17, 7, PALETTES.blush)}
    ${dot(42, 9, 2.4, '#FFF8EE')}${dot(0, 9, 2.4, '#FFF8EE')}${dot(84, 9, 2.4, '#FFF8EE')}
    ${bud(63, 19, 0, 4, PALETTES.blush)}${leaf(63, 22, 140, 7)}${leaf(63, 22, 40, 7)}
    ${dot(33, 13, 1.3, GOLD_LIGHT)}${dot(51, 13, 1.3, GOLD_LIGHT)}${dot(9, 13, 1.3, GOLD_LIGHT)}${dot(75, 13, 1.3, GOLD_LIGHT)}`;
  writeFileSync(join(OUT, 'footer-garland.svg'), svg(84, 34, body, 'aria-hidden="true"'));
}

console.log('Decor written to assets/decor');
