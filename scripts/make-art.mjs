// Generates the placeholder chibi couple illustrations and photo placeholders.
// Run:  node scripts/make-art.mjs
// Output: assets/characters/*.svg (600x800, transparent) and assets/photos/*.svg
// Replace any of these files with your own artwork (PNG/WebP/SVG) and update config.js.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHAR_DIR = join(ROOT, 'assets', 'characters');
const PHOTO_DIR = join(ROOT, 'assets', 'photos');
mkdirSync(CHAR_DIR, { recursive: true });
mkdirSync(PHOTO_DIR, { recursive: true });

const INK = '#4a2420';
const GOLD = '#D4A64A';
const SKIN_G = '#E6B08A';
const SKIN_B = '#F2C6A0';
const HAIR = '#2b1a14';

// ---------- primitives ----------
const st = (w = 3, c = INK) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r}" fill="${fill}" ${extra}/>`;
const E = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${r2(cx)}" cy="${r2(cy)}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const r2 = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const qAt = (p0, p1, p2, t) => lerp(lerp(p0, p1, t), lerp(p1, p2, t), t);
const qSplit = (p0, p1, p2, t) => { const a = lerp(p0, p1, t); const b = lerp(p1, p2, t); return [p0, a, lerp(a, b, t)]; };
const qd = (p0, p1, p2) => `M${r2(p0[0])},${r2(p0[1])} Q${r2(p1[0])},${r2(p1[1])} ${r2(p2[0])},${r2(p2[1])}`;

// deterministic pseudo-random
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function heart(cx, cy, s, fill) {
  return `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0,14 C-14,4 -18,-4 -15,-10 C-12,-16 -4,-17 0,-9 C4,-17 12,-16 15,-10 C18,-4 14,4 0,14Z" fill="${fill}" ${st(2 / s)}/>`;
}
function sparkle(cx, cy, s, fill) {
  return `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0,-10 Q1.5,-1.5 10,0 Q1.5,1.5 0,10 Q-1.5,1.5 -10,0 Q-1.5,-1.5 0,-10Z" fill="${fill}"/>`;
}
function flower(cx, cy, r, petal, center) {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    s += C(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9, r * 0.75, petal);
  }
  return s + C(cx, cy, r * 0.6, center);
}

// ---------- arm ----------
// sleeveT: portion of arm covered by sleeve (1 = full sleeve)
function arm(shoulder, elbow, hand, o) {
  const d = qd(shoulder, elbow, hand);
  let s = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>`;
  s += `<path d="${d}" fill="none" stroke="${o.skin}" stroke-width="24" stroke-linecap="round"/>`;
  const t = o.sleeveT ?? 0.82;
  const [a, b, c] = qSplit(shoulder, elbow, hand, t);
  s += `<path d="${qd(a, b, c)}" fill="none" stroke="${INK}" stroke-width="31" stroke-linecap="round"/>`;
  s += `<path d="${qd(a, b, c)}" fill="none" stroke="${o.sleeve}" stroke-width="25" stroke-linecap="round"/>`;
  if (o.cuff) {
    const p = qAt(shoulder, elbow, hand, t);
    s += C(p[0], p[1], 13.5, o.cuff, st(2));
  }
  if (o.bangles) {
    const p = qAt(shoulder, elbow, hand, 0.9);
    s += C(p[0], p[1], 14.5, o.bangles, st(2));
  }
  s += handShape(hand, o);
  return s;
}

function handShape([hx, hy], o) {
  if (o.palm) {
    // raised palm facing viewer (for mehendi / waving)
    let s = '';
    const fingers = [[-9, -16], [-3, -20], [3, -20], [9, -16]];
    for (const [fx, fy] of fingers) s += E(hx + fx, hy + fy, 4.5, 9, o.skin, st(2.5));
    s += E(hx + 15, hy - 3, 4.5, 8, o.skin, st(2.5) + ` transform="rotate(35 ${hx + 15} ${hy - 3})"`);
    s += C(hx, hy, 14, o.skin, st(2.5));
    for (const [fx, fy] of fingers) s += E(hx + fx, hy + fy, 3, 7.5, o.skin); // hide inner outline
    if (o.mehendi) {
      const m = '#9a3b16';
      s += C(hx, hy + 1, 6, 'none', st(2, m)) + C(hx, hy + 1, 2, m);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; s += C(hx + Math.cos(a) * 10, hy + 1 + Math.sin(a) * 10, 1.4, m); }
      for (const [fx, fy] of fingers) s += `<line x1="${hx + fx}" y1="${hy + fy - 5}" x2="${hx + fx}" y2="${hy + fy + 3}" stroke="${m}" stroke-width="2" stroke-dasharray="2 2"/>`;
    }
    return s;
  }
  let s = C(hx, hy, 13, o.skin, st(2.5));
  if (o.mehendi) s += C(hx, hy, 5, 'none', st(1.8, '#9a3b16')) + C(hx, hy, 1.8, '#9a3b16');
  return s;
}

// ---------- faces ----------
function face(x, y, skin, o) {
  let s = '';
  s += C(x - 78, y + 10, 13, skin, st()) + C(x + 78, y + 10, 13, skin, st());
  s += C(x, y, 80, skin, st());
  // eyes
  if (o.eyes === 'happy') {
    for (const ex of [x - 28, x + 28]) s += P(`M${ex - 11},${y + 16} Q${ex},${y + 2} ${ex + 11},${y + 16}`, 'none', st(5));
  } else if (o.eyes === 'wink') {
    s += E(x - 28, y + 12, 9, 11, '#2a1712') + C(x - 25, y + 8, 3.5, '#fff') + C(x - 31, y + 16, 1.6, '#fff');
    s += P(`M${x + 17},${y + 14} Q${x + 28},${y + 6} ${x + 39},${y + 14}`, 'none', st(5));
  } else {
    for (const ex of [x - 28, x + 28]) {
      s += E(ex, y + 12, 9, 11, '#2a1712') + C(ex + 3, y + 8, 3.5, '#fff') + C(ex - 3, y + 16, 1.6, '#fff');
    }
  }
  if (o.lashes && o.eyes !== 'happy') {
    s += P(`M${x - 37},${y + 6} L${x - 43},${y + 1}`, 'none', st(2.5)) + P(`M${x - 36},${y + 2} L${x - 39},${y - 4}`, 'none', st(2.5));
    if (o.eyes !== 'wink') s += P(`M${x + 37},${y + 6} L${x + 43},${y + 1}`, 'none', st(2.5)) + P(`M${x + 36},${y + 2} L${x + 39},${y - 4}`, 'none', st(2.5));
  }
  // brows
  const by = y - (o.lashes ? 4 : 8);
  s += P(`M${x - 40},${by} Q${x - 28},${by - 7} ${x - 16},${by}`, 'none', st(o.lashes ? 3 : 4.5, HAIR));
  s += P(`M${x + 16},${by} Q${x + 28},${by - 7} ${x + 40},${by}`, 'none', st(o.lashes ? 3 : 4.5, HAIR));
  // blush
  s += E(x - 50, y + 34, 13, 8, '#F38D9C', 'opacity=".65"') + E(x + 50, y + 34, 13, 8, '#F38D9C', 'opacity=".65"');
  // haldi smudges
  if (o.haldi) {
    s += P(`M${x - 62},${y + 22} q8,-8 18,-2 q10,4 4,14 q-6,8 -16,4 q-10,-6 -6,-16z`, '#F5B800', 'opacity=".85"');
    s += P(`M${x + 44},${y + 30} q10,-6 18,2 q6,8 -2,14 q-10,4 -16,-4 q-4,-8 0,-12z`, '#F5B800', 'opacity=".85"');
    s += C(x + 10, y - 40, 5, '#F5B800', 'opacity=".8"');
  }
  // nose
  s += P(`M${x - 4},${y + 27} Q${x},${y + 32} ${x + 4},${y + 27}`, 'none', st(2.5));
  // mouth
  const my = y + (o.mustache ? 47 : 42);
  s += P(`M${x - 14},${my} Q${x},${my + 18} ${x + 14},${my} Z`, '#B2353F', st(2.5));
  s += P(`M${x - 7},${my + 9} Q${x},${my + 4} ${x + 7},${my + 9} Q${x},${my + 14} ${x - 7},${my + 9}Z`, '#F07A85');
  if (o.mustache) {
    s += P(`M${x - 22},${y + 42} Q${x - 12},${y + 30} ${x},${y + 37} Q${x + 12},${y + 30} ${x + 22},${y + 42} Q${x + 10},${y + 38} ${x},${y + 41} Q${x - 10},${y + 38} ${x - 22},${y + 42}Z`, HAIR);
  }
  return s;
}

// ---------- groom ----------
function groom(o) {
  const x = o.x, y = 250;
  const skin = SKIN_G;
  const long = o.outfit === 'sherwani' || o.outfit === 'bandhgala' || o.outfit === 'tux';
  const hem = o.outfit === 'sherwani' ? 640 : o.outfit === 'shirt' ? 560 : long ? 600 : 595;
  let s = '';
  // legs + shoes
  for (const side of [-1, 1]) {
    const lx = x + side * 19;
    s += P(`M${lx - 16},${hem - 10} L${lx - 15},690 L${lx + 15},690 L${lx + 16},${hem - 10}Z`, o.pants, st());
    s += P(`M${lx - 22},704 Q${lx - 24},686 ${lx},686 Q${lx + 22},686 ${lx + 24},704Z`, o.shoes, st());
  }
  // torso
  const body = `M${x - 50},344 Q${x - 58},330 ${x - 40},326 L${x + 40},326 Q${x + 58},330 ${x + 50},344 L${x + 66},${hem} Q${x},${hem + 12} ${x - 66},${hem} Z`;
  s += P(body, o.top, st());
  if (o.outfit === 'kurta' || o.outfit === 'kurta-jacket') {
    s += P(`M${x},334 L${x},420`, 'none', st(2.5));
    for (const by of [350, 375, 400]) s += C(x + 6, by, 3.5, o.button || GOLD, st(1.5));
    s += P(`M${x - 64},${hem - 14} Q${x},${hem - 2} ${x + 64},${hem - 14}`, 'none', `stroke="${o.trim || GOLD}" stroke-width="6" opacity=".9"`);
  }
  if (o.outfit === 'kurta-jacket') {
    for (const side of [-1, 1]) {
      s += P(`M${x + side * 46},336 L${x + side * 12},332 L${x + side * 8},560 L${x + side * 58},560 Q${x + side * 62},450 ${x + side * 46},336Z`, o.jacket, st());
      s += P(`M${x + side * 12},332 L${x + side * 8},560`, 'none', `stroke="${GOLD}" stroke-width="4"`);
      s += P(`M${x + side * 50},520 L${x + side * 26},520`, 'none', st(2.5));
    }
    s += C(x - 12, 380, 3.5, GOLD, st(1.5)) + C(x - 12, 410, 3.5, GOLD, st(1.5)) + C(x - 12, 440, 3.5, GOLD, st(1.5));
  }
  if (o.outfit === 'sherwani') {
    // borders and motifs
    s += P(`M${x},330 L${x},${hem + 6}`, 'none', `stroke="${GOLD}" stroke-width="8"`);
    s += P(`M${x - 64},${hem - 12} Q${x},${hem + 2} ${x + 64},${hem - 12}`, 'none', `stroke="${GOLD}" stroke-width="10"`);
    for (const by of [350, 380, 410, 440]) s += C(x, by, 4, '#fff8ee', st(1.5));
    const r = rng(7);
    for (let i = 0; i < 26; i++) {
      const yy = 350 + r() * (hem - 380);
      const half = 46 + (yy - 330) * 0.06;
      const xx = x + (r() > 0.5 ? 1 : -1) * (12 + r() * (half - 18));
      s += flower(xx, yy, 3.5, '#E7C77A', '#B8862F');
    }
    // stole
    s += P(`M${x - 50},338 L${x - 30},328 L${x + 62},560 L${x + 46},572 Z`, o.stole || '#7A1F2B', st());
    s += P(`M${x - 38},332 L${x + 54},566`, 'none', `stroke="${GOLD}" stroke-width="3" stroke-dasharray="6 4"`);
    // pearl mala
    const p0 = [x - 36, 334], p1 = [x - 10, 470], p2 = [x + 36, 334];
    for (let i = 0; i <= 18; i++) { const p = qAt(p0, [x, 500], p2, i / 18); s += C(p[0], p[1], 4.5, i % 3 ? '#fffaf0' : '#C8102E', st(1.2)); }
  }
  if (o.outfit === 'bandhgala') {
    s += P(`M${x - 22},326 L${x + 22},326 L${x + 22},342 L${x - 22},342Z`, o.top, st(2.5));
    s += P(`M${x + 2},342 L${x + 2},${hem + 5}`, 'none', st(2.5));
    for (const by of [360, 395, 430, 465, 500]) s += C(x - 7, by, 4, GOLD, st(1.5));
    s += P(`M${x + 24},380 L${x + 48},380`, 'none', st(2.5));
    s += P(`M${x + 28},380 l5,-12 l5,10 l5,-10 l5,12`, '#E8C3FF', st(1.5));
    s += P(`M${x - 64},${hem - 12} Q${x},${hem + 2} ${x + 64},${hem - 12}`, 'none', `stroke="${GOLD}" stroke-width="4" opacity=".8"`);
    const r = rng(3);
    for (let i = 0; i < 9; i++) s += sparkle(x - 50 + r() * 100, 360 + r() * 220, 0.45, '#C9D4FF');
    // brooch
    s += flower(x - 30, 372, 5, '#E9E4FF', GOLD);
  }
  if (o.outfit === 'shirt') {
    s += P(`M${x - 24},327 L${x},352 L${x + 24},327 L${x + 14},342 L${x},356 L${x - 14},342Z`, o.collar || '#fff', st(2));
    s += P(`M${x},352 L${x},${hem + 4}`, 'none', st(2));
    for (const by of [380, 420, 460, 500]) s += C(x + 6, by, 3, o.collar || '#fff', st(1.2));
    s += P(`M${x + 20},372 L${x + 42},372 L${x + 42},398 L${x + 20},398Z`, 'none', st(2));
    if (o.pattern) for (let i = 0; i < 16; i++) { const r = rng(21 + i); s += C(x - 50 + r() * 100, 370 + r() * 180, 2.4, o.pattern); }
  }
  if (o.outfit === 'tux') {
    s += P(`M${x - 24},330 L${x},430 L${x + 24},330 Z`, '#ffffff', st(2.5));
    s += P(`M${x - 40},328 L${x - 4},440 L${x - 22},440 L${x - 46},360Z`, '#111', st(2));
    s += P(`M${x + 40},328 L${x + 4},440 L${x + 22},440 L${x + 46},360Z`, '#111', st(2));
    s += P(`M${x},340 l-16,-9 l0,18 z M${x},340 l16,-9 l0,18 z`, '#111', st(2)) + C(x, 340, 4, '#111');
    for (const by of [460, 495]) s += C(x, by, 4, '#3a3a3a', st(1.5));
    s += P(`M${x + 26},400 L${x + 46},400 L${x + 44},392 L${x + 40},388 L${x + 34},392 L${x + 30},388Z`, '#F3E2B8', st(1.5));
    s += P(`M${x + 24},402 L${x + 48},402`, 'none', st(2.5));
  }
  // arms
  const armO = { skin, sleeve: o.sleeve || o.top, cuff: o.cuff, sleeveT: 0.84 };
  s += arm([x - 48, 346], o.armL[0], o.armL[1], { ...armO, palm: o.palmL });
  s += arm([x + 48, 346], o.armR[0], o.armR[1], { ...armO, palm: o.palmR });

  // head
  s += face(x, y, skin, { eyes: o.eyes, mustache: true, haldi: o.haldi });
  if (o.safa) {
    s += P(`M${x + 34},${y - 96} Q${x + 96},${y - 150} ${x + 78},${y - 176} Q${x + 70},${y - 130} ${x + 14},${y - 108}Z`, o.safa.tail || o.safa.color, st());
    const shape = `M${x - 88},${y - 6} Q${x - 98},${y - 104} ${x},${y - 114} Q${x + 98},${y - 104} ${x + 88},${y - 6} Q${x},${y - 52} ${x - 88},${y - 6}Z`;
    s += `<clipPath id="safaClip"><path d="${shape}"/></clipPath>`;
    s += P(shape, o.safa.color, st());
    let pleats = '';
    for (let i = 0; i < 6; i++) pleats += P(`M${x - 100},${y - 30 - i * 17} Q${x - 10},${y - 64 - i * 16} ${x + 100},${y - 36 - i * 20}`, 'none', `stroke="${o.safa.pleat}" stroke-width="5" opacity=".9"`);
    if (o.safa.pattern) for (let i = 0; i < 18; i++) { const r = rng(11 + i); pleats += C(x - 80 + r() * 160, y - 104 + r() * 80, 2.4, o.safa.pattern); }
    s += `<g clip-path="url(#safaClip)">${pleats}</g>`;
    s += P(`M${x - 88},${y - 6} Q${x},${y - 52} ${x + 88},${y - 6}`, 'none', `stroke="${GOLD}" stroke-width="8"`);
    s += P(`M${x - 88},${y - 6} Q${x},${y - 52} ${x + 88},${y - 6}`, 'none', st(2));
    // kalgi
    s += P(`M${x - 4},${y - 82} Q${x - 10},${y - 140} ${x + 22},${y - 158} Q${x + 8},${y - 120} ${x + 6},${y - 82}Z`, '#fffaf0', st(2.5));
    s += C(x, y - 74, 13, GOLD, st(2.5)) + C(x, y - 74, 6, '#C8102E') + C(x, y - 56, 4.5, '#fffaf0', st(1.5));
    if (o.sehra) {
      for (const sx of [-84, -72, 72, 84]) {
        for (let i = 0; i < 8; i++) {
          const py = y - 10 + i * 11 + (Math.abs(sx) === 72 ? 5 : 0);
          s += C(x + sx, py, i % 2 ? 3.5 : 4.5, i % 2 ? GOLD : '#fffaf0', st(1.2));
        }
        s += flower(x + sx, y + 82 + (Math.abs(sx) === 72 ? 5 : 0), 4, '#F28C28', '#C8102E');
      }
    }
  } else {
    s += P(`M${x - 80},${y + 2} Q${x - 88},${y - 80} ${x},${y - 86} Q${x + 88},${y - 80} ${x + 80},${y + 2} Q${x + 74},${y - 34} ${x + 40},${y - 42} Q${x + 10},${y - 26} ${x - 20},${y - 46} Q${x - 52},${y - 30} ${x - 70},${y - 32} Q${x - 78},${y - 18} ${x - 80},${y + 2}Z`, HAIR, st());
    s += P(`M${x - 6},${y - 84} Q${x + 18},${y - 108} ${x + 30},${y - 88}`, 'none', st(5, HAIR));
  }
  if (o.extra) s += o.extra;
  return s;
}

// ---------- bride ----------
function bride(o) {
  const x = o.x, y = 250;
  const skin = SKIN_B;
  let s = '';
  // veil (back)
  if (o.veil) s += P(`M${x - 96},${y} L${x - 130},${y + 300} Q${x},${y + 330} ${x + 130},${y + 300} L${x + 96},${y} Q${x},${y - 120} ${x - 96},${y}Z`, o.veil, st() + ' opacity=".92"');
  // hair back
  if (!o.veil) s += C(x, y - 92, 30, HAIR, st());
  s += C(x, y - 2, 92, HAIR, st());
  s += P(`M${x - 90},${y} Q${x - 104},${y + 90} ${x - 70},${y + 124} L${x + 70},${y + 124} Q${x + 104},${y + 90} ${x + 90},${y}Z`, HAIR, st());
  // feet
  s += E(x - 24, 702, 16, 9, o.shoes || '#C8102E', st(2.5)) + E(x + 24, 702, 16, 9, o.shoes || '#C8102E', st(2.5));
  // skirt
  let skirt;
  if (o.outfit === 'gown') {
    skirt = `M${x - 40},400 Q${x - 52},540 ${x - 50},590 Q${x - 104},670 ${x - 116},694 Q${x},716 ${x + 116},694 Q${x + 104},670 ${x + 50},590 Q${x + 52},540 ${x + 40},400 Z`;
  } else {
    skirt = `M${x - 42},400 Q${x - 76},520 ${x - 118},682 Q${x},710 ${x + 118},682 Q${x + 76},520 ${x + 42},400 Z`;
  }
  s += P(skirt, o.skirt, st());
  if (o.outfit !== 'gown') {
    // pleat lines
    for (const k of [-0.6, -0.25, 0.25, 0.6]) s += P(`M${x + k * 40},410 Q${x + k * 70},540 ${x + k * 112},${690 - Math.abs(k) * 8}`, 'none', `stroke="${o.pleat || 'rgba(0,0,0,.12)'}" stroke-width="3"`);
    s += P(`M${x - 114},668 Q${x},696 ${x + 114},668`, 'none', `stroke="${o.border || GOLD}" stroke-width="14"`);
    s += P(`M${x - 116},678 Q${x},706 ${x + 116},678`, 'none', st(2));
    // buttis
    const rows = [[470, 3], [530, 4], [600, 5]];
    for (const [ry, n] of rows) {
      const half = 42 + 76 * Math.pow((ry - 400) / 282, 1.1);
      for (let i = 0; i < n; i++) {
        const bx = x - half + 14 + (i + 0.5) * ((half * 2 - 28) / n);
        s += o.buttiFlower ? flower(bx, ry, 4.5, o.butti, o.buttiCenter || '#fff') : C(bx, ry, 3.5, o.butti || GOLD);
      }
    }
  } else {
    s += P(`M${x - 112},688 Q${x},712 ${x + 112},688`, 'none', `stroke="${o.border || GOLD}" stroke-width="6" opacity=".8"`);
  }
  if (o.sparkles) {
    const r = rng(5);
    for (let i = 0; i < 22; i++) {
      const yy = 420 + r() * 260;
      const half = 40 + 70 * ((yy - 400) / 290);
      s += sparkle(x - half + r() * half * 2, yy, 0.35 + r() * 0.4, o.sparkles);
    }
  }
  // blouse
  s += P(`M${x - 44},352 Q${x - 46},336 ${x - 30},332 L${x + 30},332 Q${x + 46},336 ${x + 44},352 L${x + 42},404 L${x - 42},404 Z`, o.blouse, st());
  if (o.outfit === 'gown') s += P(`M${x - 30},334 Q${x - 15},350 ${x},340 Q${x + 15},350 ${x + 30},334`, 'none', st(2.5));
  s += P(`M${x - 42},402 L${x + 42},402`, 'none', `stroke="${o.belt || GOLD}" stroke-width="8"`);
  // necklace
  if (o.necklace === 'bridal') {
    s += P(`M${x - 28},336 Q${x},362 ${x + 28},336`, 'none', `stroke="${GOLD}" stroke-width="9"`);
    for (let i = 1; i < 8; i++) { const p = qAt([x - 28, 336], [x, 362], [x + 28, 336], i / 8); s += C(p[0], p[1], 3, i % 2 ? '#C8102E' : '#1E8A4C'); }
    const q0 = [x - 34, 338], q1 = [x, 410], q2 = [x + 34, 338];
    s += P(qd(q0, q1, q2), 'none', `stroke="${GOLD}" stroke-width="4"`);
    s += C(x, 374, 8, GOLD, st(2)) + C(x, 374, 4, '#C8102E');
  } else if (o.necklace === 'flower') {
    for (let i = 0; i <= 8; i++) { const p = qAt([x - 30, 336], [x, 372], [x + 30, 336], i / 8); s += flower(p[0], p[1], 4, i % 2 ? '#FFFFFF' : '#F28C28', '#F5B800'); }
  } else {
    s += P(`M${x - 26},336 Q${x},366 ${x + 26},336`, 'none', `stroke="${o.necklace || GOLD}" stroke-width="5"`);
    s += C(x, 352, 5, o.necklace || GOLD, st(1.5));
  }
  // dupatta across shoulder
  if (o.dupatta) {
    s += P(`M${x - 48},344 Q${x - 42},328 ${x - 26},332 L${x + 72},478 Q${x + 66},494 ${x + 50},488Z`, o.dupatta, st() + ' opacity=".9"');
    s += P(`M${x - 34},334 L${x + 62},484`, 'none', `stroke="${o.dupattaBorder || GOLD}" stroke-width="3" stroke-dasharray="5 4"`);
  }
  // arms
  const armO = { skin, sleeve: o.sleeve || o.blouse, sleeveT: o.sleeveT ?? 0.38, bangles: o.bangles || '#C8102E', mehendi: o.mehendi };
  s += arm([x - 40, 350], o.armL[0], o.armL[1], { ...armO, palm: o.palmL });
  s += arm([x + 40, 350], o.armR[0], o.armR[1], { ...armO, palm: o.palmR });
  // head
  s += face(x, y, skin, { eyes: o.eyes, lashes: true, haldi: o.haldi });
  // front hair
  s += P(`M${x - 84},${y + 8} Q${x - 92},${y - 88} ${x},${y - 90} Q${x + 92},${y - 88} ${x + 84},${y + 8} Q${x + 76},${y - 50} ${x + 6},${y - 60} L${x},${y - 52} L${x - 6},${y - 60} Q${x - 76},${y - 50} ${x - 84},${y + 8}Z`, HAIR, st());
  s += P(`M${x - 84},${y + 8} Q${x - 92},${y + 40} ${x - 80},${y + 60}`, 'none', st(4, HAIR));
  s += P(`M${x + 84},${y + 8} Q${x + 92},${y + 40} ${x + 80},${y + 60}`, 'none', st(4, HAIR));
  // gajra / flower crown
  if (!o.veil && !o.casual) {
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.08 + i * 0.105); s += C(x + Math.cos(a) * 32, y - 92 + Math.sin(a) * 32, 5, '#fffaf0', st(1.5)); }
  }
  if (o.flowerCrown) {
    const c0 = [x - 82, y - 20], c1 = [x, y - 130], c2 = [x + 82, y - 20];
    for (let i = 0; i <= 10; i++) { const p = qAt(c0, c1, c2, i / 10); s += flower(p[0], p[1], 6.5, i % 2 ? '#fffaf0' : '#F28C28', '#F5B800'); }
  }
  // veil front
  if (o.veil) {
    s += P(`M${x - 98},${y + 14} Q${x - 108},${y - 110} ${x},${y - 116} Q${x + 108},${y - 110} ${x + 98},${y + 14} Q${x + 92},${y - 84} ${x},${y - 90} Q${x - 92},${y - 84} ${x - 98},${y + 14}Z`, o.veil, st());
    s += P(`M${x - 96},${y + 6} Q${x - 100},${y - 100} ${x},${y - 104} Q${x + 100},${y - 100} ${x + 96},${y + 6}`, 'none', `stroke="${GOLD}" stroke-width="5" stroke-dasharray="1 9" stroke-linecap="round"`);
  }
  // maang tikka & bindi
  if (o.tikka !== false) {
    s += P(`M${x},${y - 56} L${x},${y - 38}`, 'none', `stroke="${GOLD}" stroke-width="3"`);
    s += o.tikka === 'flower' ? flower(x, y - 32, 5, '#fffaf0', '#F28C28') : C(x, y - 32, 7, GOLD, st(2)) + C(x, y - 32, 3, '#C8102E');
  }
  s += C(x, y - 12, 3.5, '#C8102E');
  // earrings
  for (const side of [-1, 1]) {
    const ex = x + side * 80, ey = y + 22;
    if (o.earrings === 'flower') s += flower(ex, ey + 4, 6, '#F28C28', '#fffaf0');
    else s += P(`M${ex - 9},${ey + 8} Q${ex},${ey - 6} ${ex + 9},${ey + 8}Z`, GOLD, st(2)) + C(ex - 6, ey + 12, 2.2, GOLD) + C(ex, ey + 14, 2.2, GOLD) + C(ex + 6, ey + 12, 2.2, GOLD);
  }
  // nath
  if (o.nath) {
    s += C(x + 12, y + 30, 11, 'none', `stroke="${GOLD}" stroke-width="2.8"`) + C(x + 12, y + 41, 2.5, '#C8102E');
    s += P(`M${x + 22},${y + 25} Q${x + 60},${y + 10} ${x + 72},${y - 4}`, 'none', `stroke="${GOLD}" stroke-width="1.6"`);
  }
  if (o.extra) s += o.extra;
  return s;
}

// ---------- props ----------
function varmala(p0, p2, dip) {
  let s = '';
  const p1 = [(p0[0] + p2[0]) / 2, dip];
  for (let i = 0; i <= 22; i++) {
    const p = qAt(p0, p1, p2, i / 22);
    const col = ['#C8102E', '#F28C28', '#fffaf0'][i % 3];
    s += C(p[0], p[1], i % 3 === 2 ? 6 : 9, col, st(1.5));
  }
  s += flower(p1[0], qAt(p0, p1, p2, 0.5)[1] + 14, 9, '#C8102E', '#F5B800');
  return s;
}
function haldiBowl(cx, cy) {
  return P(`M${cx - 26},${cy} Q${cx},${cy + 34} ${cx + 26},${cy}Z`, '#C9962E', st()) +
    E(cx, cy, 26, 8, '#F5B800', st(2.5)) + P(`M${cx - 20},${cy + 10} Q${cx},${cy + 18} ${cx + 20},${cy + 10}`, 'none', `stroke="#F7DA7A" stroke-width="3"`) +
    flower(cx + 10, cy - 4, 4, '#F28C28', '#C8102E');
}
function flute(hx, hy, rot) {
  return `<g transform="rotate(${rot} ${hx} ${hy})">` +
    P(`M${hx},${hy - 4} L${hx},${hy - 34}`, 'none', st(4)) +
    E(hx, hy - 2, 10, 3, '#fff', st(2)) +
    P(`M${hx - 10},${hy - 88} L${hx + 10},${hy - 88} L${hx + 7},${hy - 46} Q${hx},${hy - 32} ${hx - 7},${hy - 46}Z`, 'rgba(255,255,255,.5)', st(2.5)) +
    P(`M${hx - 9},${hy - 72} L${hx + 9},${hy - 72} L${hx + 7},${hy - 46} Q${hx},${hy - 34} ${hx - 7},${hy - 46}Z`, '#F3C969') +
    C(hx - 2, hy - 60, 1.8, '#fff') + C(hx + 3, hy - 52, 1.5, '#fff') + C(hx, hy - 66, 1.2, '#fff') +
    `</g>`;
}
function mic(hx, hy) {
  return `<g transform="rotate(-20 ${hx} ${hy})">` + P(`M${hx - 5},${hy - 30} L${hx + 5},${hy - 30} L${hx + 3},${hy + 14} L${hx - 3},${hy + 14}Z`, '#333', st(2)) +
    C(hx, hy - 38, 12, '#bbb', st(2.5)) + P(`M${hx - 9},${hy - 42} L${hx + 9},${hy - 42} M${hx - 11},${hy - 36} L${hx + 11},${hy - 36}`, 'none', st(1.5)) + `</g>`;
}

// ---------- scenes ----------
const W = 600, H = 800;
function svgDoc(content, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">\n<title>${title}</title>\n${E(300, 712, 220, 16, '#000', 'opacity=".08"')}\n${content}\n</svg>\n`;
}

const GX = 205, BX = 395;
// common arm presets
const G_HOLD_R = [[GX + 74, 420], [GX + 96, 468]];
const B_HOLD_L = [[BX - 64, 420], [BX - 96, 470]];
const G_DOWN_L = [[GX - 70, 420], [GX - 74, 494]];
const G_DOWN_R = [[GX + 70, 420], [GX + 74, 494]];
const B_DOWN_L = [[BX - 62, 420], [BX - 66, 486]];
const B_DOWN_R = [[BX + 62, 420], [BX + 66, 486]];
const G_WAVE_L = [[GX - 100, 330], [GX - 108, 250]];
const B_WAVE_R = [[BX + 96, 330], [BX + 104, 252]];

const wedGroom = { safa: { color: '#C8102E', pleat: '#E8475F', tail: '#E8475F', pattern: GOLD }, outfit: 'sherwani', top: '#F6E9CC', pants: '#F6E9CC', shoes: '#C99A3A', cuff: GOLD, stole: '#7A1F2B' };
const wedBride = { outfit: 'lehenga', skirt: '#C8102E', blouse: '#A50E26', border: GOLD, butti: GOLD, veil: '#E0283F', necklace: 'bridal', nath: true, bangles: '#E8B83F', mehendi: true, shoes: GOLD, pleat: 'rgba(90,0,10,.25)' };

const scenes = {
  hero: {
    title: 'Shivam and Prachi in wedding attire holding hands',
    g: { ...wedGroom, x: GX, sehra: false, armL: G_DOWN_L, armR: G_HOLD_R },
    b: { ...wedBride, x: BX, armL: B_HOLD_L, armR: B_DOWN_R },
    extra: heart(300, 140, 1.6, '#E63E5C') + heart(250, 96, 0.8, '#F6A5B5') + heart(352, 104, 0.9, '#F6A5B5') + sparkle(180, 120, 1, GOLD) + sparkle(430, 140, 0.8, GOLD),
  },
  thankyou: {
    title: 'Shivam and Prachi waving thank you',
    g: { ...wedGroom, x: GX, armL: G_WAVE_L, armR: G_HOLD_R, palmL: true, eyes: 'happy' },
    b: { ...wedBride, x: BX, armL: B_HOLD_L, armR: B_WAVE_R, palmR: true, eyes: 'happy' },
    extra: heart(300, 150, 1.4, '#E63E5C') + heart(110, 200, 0.8, '#F6A5B5') + heart(500, 196, 0.9, '#F6A5B5'),
  },
  haldi: {
    title: 'Shivam and Prachi at the Haldi in yellow outfits',
    g: { x: GX, outfit: 'kurta', top: '#F7C843', pants: '#FFF8EE', shoes: '#C99A3A', trim: '#F28C28', button: '#F28C28', haldi: true, eyes: 'wink', armL: G_WAVE_L, armR: [[GX + 80, 440], [GX + 66, 478]], palmL: true,
      extra: haldiBowl(GX + 66, 470) },
    b: { x: BX, outfit: 'lehenga', skirt: '#FFD23F', blouse: '#F28C28', border: '#F28C28', butti: '#F28C28', buttiFlower: true, buttiCenter: '#C8102E', dupatta: '#FFE98A', dupattaBorder: '#F28C28',
      necklace: 'flower', earrings: 'flower', tikka: 'flower', flowerCrown: true, bangles: '#F28C28', haldi: true, shoes: '#F28C28', pleat: 'rgba(200,120,0,.25)', armL: B_DOWN_L, armR: B_WAVE_R, palmR: true },
    extra: sparkle(120, 150, 1, '#F5B800') + sparkle(480, 120, 1.2, '#F5B800'),
  },
  mehendi: {
    title: 'Shivam and Prachi at the Mehendi showing mehendi hands',
    g: { x: GX, outfit: 'kurta-jacket', top: '#BFE8C4', jacket: '#1F7A4D', pants: '#FFF8EE', shoes: '#8B5A2B', sleeve: '#BFE8C4', trim: '#1F7A4D', armL: [[GX - 86, 430], [GX - 46, 478]], armR: G_DOWN_R },
    b: { x: BX, outfit: 'lehenga', skirt: '#2FA36B', blouse: '#F48FB1', border: '#F48FB1', butti: '#FFD6E4', buttiFlower: true, buttiCenter: '#F5B800', dupatta: '#F9B9CF', dupattaBorder: GOLD,
      necklace: GOLD, bangles: '#1F7A4D', mehendi: true, shoes: '#F48FB1', sleeveT: 0.36, pleat: 'rgba(0,60,30,.25)',
      armL: [[BX - 92, 410], [BX - 84, 336]], armR: [[BX + 92, 410], [BX + 84, 336]], palmL: true, palmR: true, eyes: 'happy' },
    extra: heart(300, 150, 1.1, '#F48FB1') + heart(140, 130, 0.7, '#2FA36B'),
  },
  sangeet: {
    title: 'Shivam and Prachi dancing at the Sangeet',
    g: { x: GX, outfit: 'bandhgala', top: '#2A3D9A', pants: '#1B2560', shoes: '#111', cuff: GOLD, eyes: 'happy',
      armL: [[GX - 104, 320], [GX - 96, 236]], armR: [[GX + 82, 400], [GX + 96, 430]],
      extra: mic(GX - 96, 236) },
    b: { x: BX, outfit: 'lehenga', skirt: '#7B3FB5', blouse: '#5A2A8C', border: '#C9B8FF', butti: '#E8DBFF', sparkles: '#FFFFFF', dupatta: '#C7A6F0', dupattaBorder: '#E8DBFF',
      necklace: '#E8E8F0', bangles: '#C9B8FF', shoes: '#C9B8FF', eyes: 'happy', pleat: 'rgba(30,0,60,.3)',
      armL: [[BX - 82, 400], [BX - 96, 432]], armR: [[BX + 104, 320], [BX + 98, 236]], palmR: true },
    extra: sparkle(110, 140, 1.4, '#FFFFFF') + sparkle(490, 160, 1.1, '#FFFFFF') + sparkle(300, 110, 1.6, '#FFE08A') +
      `<text x="250" y="200" font-size="46" fill="#FFE08A" stroke="${INK}" stroke-width="1.5">♪</text><text x="330" y="170" font-size="38" fill="#C9B8FF" stroke="${INK}" stroke-width="1.5">♫</text>`,
  },
  wedding: {
    title: 'Shivam and Prachi at the wedding pheras with a varmala',
    g: { ...wedGroom, x: GX, sehra: true, armL: [[GX - 64, 440], [GX - 8, 410]], armR: [[GX + 64, 440], [GX + 8, 410]] },
    b: { ...wedBride, x: BX, armL: [[BX - 72, 430], [BX - 46, 456]], armR: [[BX + 72, 430], [BX + 46, 456]],
      extra: varmala([BX - 46, 452], [BX + 46, 452], 640) },
    extra: heart(300, 150, 1.2, '#E63E5C') + sparkle(130, 120, 1.1, GOLD) + sparkle(470, 110, 1.2, GOLD),
  },
  reception: {
    title: 'Shivam and Prachi at the Reception raising a toast',
    g: { x: GX, outfit: 'tux', top: '#1c1c1c', sleeve: '#1c1c1c', pants: '#1c1c1c', shoes: '#0d0d0d', cuff: '#ffffff', armL: G_DOWN_L, armR: [[GX + 62, 440], [GX + 86, 396]],
      extra: flute(GX + 86, 396, 14) },
    b: { x: BX, outfit: 'gown', skirt: '#E9D3A8', blouse: '#E9D3A8', border: '#C9A45C', sparkles: '#FFFFFF', necklace: '#F4F4F4', bangles: '#F4F4F4', shoes: '#C9A45C', sleeveT: 0.15,
      belt: '#C9A45C', armL: [[BX - 62, 440], [BX - 86, 396]], armR: B_DOWN_R, extra: flute(BX - 86, 396, -14) },
    extra: sparkle(300, 250 - 120, 1.4, '#F3C969') + sparkle(270, 200, 0.7, '#F3C969') + sparkle(334, 196, 0.8, '#F3C969') + sparkle(120, 150, 1, '#F3C969') + sparkle(480, 150, 1, '#F3C969'),
  },
};

for (const [name, sc] of Object.entries(scenes)) {
  const doc = svgDoc(groom(sc.g) + bride(sc.b) + (sc.extra || ''), sc.title);
  writeFileSync(join(CHAR_DIR, `${name}.svg`), doc);
}

// ---------- love-story scenes (portrait 600x750, full illustrated backgrounds) ----------
const SW = 600, SH = 750;
const grad = (id, stops, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${C(0, 0, 22, '#fff')}${C(24, -10, 26, '#fff')}${C(50, 0, 22, '#fff')}${E(25, 10, 46, 14, '#fff')}</g>`;
const mug = (hx, hy, col) =>
  P(`M${hx - 13},${hy - 34} L${hx + 13},${hy - 34} L${hx + 11},${hy - 4} Q${hx},${hy + 2} ${hx - 11},${hy - 4}Z`, col, st(2.5)) +
  P(`M${hx + 12},${hy - 28} q12,2 10,12 q-2,8 -11,6`, 'none', st(3)) +
  P(`M${hx - 4},${hy - 42} q-6,-8 0,-14 M${hx + 5},${hy - 42} q-6,-8 0,-14`, 'none', `stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"`) +
  heart(hx, hy - 20, 0.35, '#fff');
const ringBox = (hx, hy) =>
  P(`M${hx - 16},${hy - 14} L${hx + 16},${hy - 14} L${hx + 16},${hy + 4} L${hx - 16},${hy + 4}Z`, '#C8102E', st(2.5)) +
  P(`M${hx - 16},${hy - 14} L${hx - 10},${hy - 34} L${hx + 22},${hy - 34} L${hx + 16},${hy - 14}Z`, '#E8475F', st(2.5)) +
  C(hx, hy - 18, 8, 'none', `stroke="${GOLD}" stroke-width="4"`) + P(`M${hx - 5},${hy - 28} l5,-7 5,7 -5,5z`, '#BDEBFF', st(1.5)) +
  sparkle(hx + 18, hy - 46, 0.9, '#FFE08A') + sparkle(hx - 18, hy - 42, 0.6, '#FFE08A');
const pine = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M-4,0 h8 v18 h-8z', '#7a4a2a')}${P('M0,-70 L28,-20 L14,-22 L34,6 L-34,6 L-14,-22 L-28,-20Z', '#2f8f4e', st(2.5))}</g>`;
const diya = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M0,-34c6,8 8,13 8,17a8,8 0 0 1-16,0c0-4 2-9 8-17z', '#FFC93C', st(2))}${P('M-26,-6h52c-2,12-12,20-26,20s-24-8-26-20z', '#C4552D', st(2.5))}${E(0, -6, 26, 5, '#E07A45', st(2))}</g>`;
const rangoli = (x, y) => {
  let s = E(x, y, 120, 30, '#fff', 'opacity=".5"');
  const rings = [[100, 26, '#E63E5C'], [76, 20, '#F28C28'], [52, 14, '#FFD23F'], [28, 8, '#2FA36B']];
  for (const [rx, ry, c] of rings) s += E(x, y, rx, ry, c, st(2));
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; s += E(x + Math.cos(a) * 88, y + Math.sin(a) * 23, 9, 4, '#fff8ee'); }
  return s + E(x, y, 10, 4, '#7A1F2B');
};
const garlandRow = (y, n = 9) => {
  let s = `<path d="M0,${y} Q${SW / 2},${y + 40} ${SW},${y}" fill="none" stroke="#2f8f4e" stroke-width="5"/>`;
  for (let i = 0; i < n; i++) {
    const x = 30 + i * ((SW - 60) / (n - 1));
    const top = y + 40 * 4 * (x / SW) * (1 - x / SW) * 0.5;
    const len = i % 2 ? 3 : 4;
    for (let k = 0; k < len; k++) s += flower(x, top + 8 + k * 16, 7, k % 2 ? '#FFD23F' : '#F28C28', '#C8102E');
  }
  return s;
};

function storyDoc(title, bg, chars, fg = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" role="img" aria-label="${title}">
<title>${title}</title>
${bg}
<g transform="translate(45 72) scale(.85)">${E(300, 712, 220, 16, '#000', 'opacity=".12"')}${chars}</g>
${fg}
</svg>\n`;
}

const casualBride = { outfit: 'gown', casual: true, tikka: false, nath: false, sleeveT: 0.32, border: 'rgba(255,255,255,.7)', necklace: '#fffaf0', bangles: '#fffaf0', earrings: 'jhumka' };

const story = [
  {
    file: 'photo1', title: 'How we met — Shivam and Prachi share coffee at a café',
    bg: `<defs>${grad('w1', [[0, '#FDE6D6'], [1, '#F9D3C0']])}</defs><rect width="600" height="750" fill="url(#w1)"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 52}" y="0" width="26" height="620" fill="#fff" opacity=".25"/>`).join('')}
      <rect x="350" y="70" width="200" height="230" rx="10" fill="#BFE6FF" ${st(4)}/>${cloud(390, 140, 0.7)}<path d="M450,70 V300 M350,185 H550" ${st(5)}/>
      ${P('M340,60 h60 q-10,120 -30,250 h-30z', '#E8A0A8', st(3))}${P('M560,60 h-60 q10,120 30,250 h30z', '#E8A0A8', st(3))}
      <path d="M110,0 V70" ${st(3)}/>${P('M80,110 L140,110 L126,70 L94,70Z', '#F2B35B', st(3))}${C(110, 116, 7, '#FFF4B0')}
      <rect x="0" y="620" width="600" height="130" fill="#C98B5E"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${i * 90},620 V750" stroke="#A86F47" stroke-width="3"/>`).join('')}
      ${P('M30,560 h60 l-8,60 h-44z', '#D9774B', st(3))}${P('M60,560 q-40,-60 -20,-110 q20,40 20,110 q0,-80 30,-120 q10,60 -30,120', '#3FA66B', st(3))}`,
    g: { x: GX, outfit: 'shirt', top: '#7FB3E6', sleeve: '#7FB3E6', collar: '#fff', pants: '#3B4F7A', shoes: '#6B4A2E', armL: G_DOWN_L, armR: [[GX + 72, 440], [GX + 66, 474]], extra: mug(GX + 66, 470, '#fff8ee') },
    b: { ...casualBride, x: BX, skirt: '#F6A5B5', blouse: '#F6A5B5', sparkles: '#ffffff', shoes: '#fff', armL: [[BX - 72, 440], [BX - 66, 474]], armR: B_DOWN_R, eyes: 'happy', extra: mug(BX - 66, 470, '#FFD23F') },
    extra: heart(300, 300, 1.1, '#E63E5C') + heart(270, 250, 0.6, '#F6A5B5') + heart(330, 240, 0.7, '#F6A5B5'),
  },
  {
    file: 'photo2', title: 'First date — Shivam and Prachi under fairy lights and stars',
    bg: `<defs>${grad('w2', [[0, '#25285E'], [0.7, '#6B3F98'], [1, '#B06AB3']])}</defs><rect width="600" height="750" fill="url(#w2)"/>
      ${Array.from({ length: 18 }, (_, i) => { const r = rng(40 + i); return sparkle(r() * 600, r() * 360, 0.3 + r() * 0.5, '#FFF4C2'); }).join('')}
      ${C(500, 110, 46, '#FFF4C2')}${C(520, 96, 46, '#25285E', 'opacity=".0"')}${C(486, 98, 8, '#F1E3A0')}${C(512, 128, 6, '#F1E3A0')}
      <path d="M0,170 Q150,230 300,175 T600,170" fill="none" stroke="#3a2a4a" stroke-width="3"/>
      ${Array.from({ length: 11 }, (_, i) => { const x = 20 + i * 56; const y = 170 + Math.sin((x / 600) * Math.PI * 2) * -6 + (i % 5 ? 24 : 18) - (Math.abs(x - 150) < 120 || Math.abs(x - 450) < 120 ? -10 : 0); const c = ['#FFE08A', '#F6A5B5', '#BDEBFF'][i % 3]; return C(x, y + 8, 18, c, 'opacity=".25"') + E(x, y + 8, 7, 10, c, st(2)); }).join('')}
      ${P('M0,640 Q150,600 300,630 T600,620 V750 H0Z', '#2E5E4E')}${P('M0,690 Q200,660 400,690 T600,680 V750 H0Z', '#24493d')}`,
    g: { x: GX, outfit: 'shirt', top: '#F2B35B', sleeve: '#F2B35B', collar: '#fff8ee', pattern: '#fff8ee', pants: '#2B3A55', shoes: '#111', eyes: 'happy', armL: G_DOWN_L, armR: G_HOLD_R },
    b: { ...casualBride, x: BX, skirt: '#9ED9C0', blouse: '#9ED9C0', sparkles: '#ffffff', shoes: '#fff', eyes: 'happy', armL: B_HOLD_L, armR: B_DOWN_R },
    extra: heart(300, 330, 1.2, '#E63E5C') + heart(300, 250, 0.7, '#F6A5B5'),
  },
  {
    file: 'photo3', title: 'Adventures together — Shivam and Prachi in the mountains',
    bg: `<defs>${grad('w3', [[0, '#9ED8FF'], [1, '#FFF3DA']])}</defs><rect width="600" height="750" fill="url(#w3)"/>
      ${C(470, 110, 44, '#FFD23F')}${C(470, 110, 60, '#FFD23F', 'opacity=".25"')}${cloud(60, 110, 1)}${cloud(260, 70, 0.7)}
      ${P('M-20,520 L150,230 L320,520Z', '#8C8FD6', st(3))}${P('M150,230 L190,300 L170,290 L150,310 L130,290 L110,300Z', '#fff', st(2))}
      ${P('M220,520 L420,190 L620,520Z', '#6F73C4', st(3))}${P('M420,190 L466,266 L440,256 L420,280 L400,256 L374,266Z', '#fff', st(2))}
      ${P('M0,520 Q150,470 300,510 T600,500 V750 H0Z', '#7CC47F', st(3))}${P('M0,620 Q200,580 400,620 T600,610 V750 H0Z', '#5FAF66')}
      ${pine(50, 560, 1.1)}${pine(560, 570, 1.2)}${pine(520, 520, 0.8)}`,
    g: { x: GX, outfit: 'shirt', top: '#E86A5B', sleeve: '#E86A5B', collar: '#fff', pattern: '#fff', pants: '#C9A66B', shoes: '#6B4A2E', eyes: 'happy', armL: G_WAVE_L, armR: G_HOLD_R, palmL: true },
    b: { ...casualBride, x: BX, skirt: '#7FC8A9', blouse: '#FFD23F', sleeveT: 0.5, sleeve: '#FFD23F', sparkles: '#ffffff', shoes: '#6B4A2E', armL: B_HOLD_L, armR: B_WAVE_R, palmR: true },
    extra: '',
  },
  {
    file: 'photo4', title: 'The proposal — Shivam offers a ring to a delighted Prachi at sunset',
    bg: `<defs>${grad('w4', [[0, '#FF8FA3'], [0.55, '#FFB37A'], [1, '#FFE3A3']])}</defs><rect width="600" height="750" fill="url(#w4)"/>
      ${C(300, 470, 120, '#FFE08A', 'opacity=".9"')}${C(300, 470, 160, '#FFE08A', 'opacity=".25"')}
      <rect x="0" y="470" width="600" height="140" fill="#5BA4CF"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${40 + i * 95},${500 + (i % 2) * 40} q20,-10 40,0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`).join('')}
      <rect x="230" y="480" width="140" height="10" rx="5" fill="#FFE08A" opacity=".6"/>
      ${P('M0,600 Q300,570 600,600 V750 H0Z', '#F3D2A2')}${Array.from({ length: 8 }, (_, i) => heart(40 + i * 75, 80 + (i % 3) * 50, 0.6 + (i % 2) * 0.3, i % 2 ? '#fff' : '#E63E5C')).join('')}`,
    g: { x: GX, outfit: 'shirt', top: '#F6E9CC', sleeve: '#F6E9CC', collar: '#fff', pants: '#3B4F7A', shoes: '#6B4A2E', armL: G_DOWN_L, armR: [[GX + 70, 420], [GX + 100, 440]] },
    b: { ...casualBride, x: BX, skirt: '#E63E5C', blouse: '#E63E5C', sparkles: '#FFE3E8', shoes: '#fff', eyes: 'happy', palmL: true, palmR: true, armL: [[BX - 86, 420], [BX - 64, 316]], armR: [[BX + 86, 420], [BX + 64, 316]] },
    extra: ringBox(GX + 100, 436) + heart(300, 150, 1.4, '#E63E5C'),
  },
  {
    file: 'photo5', title: 'Families meet — Shivam and Prachi greeting the families with namaste',
    bg: `<defs>${grad('w5', [[0, '#FFF3E0'], [1, '#FCE0C6']])}</defs><rect width="600" height="750" fill="url(#w5)"/>
      <rect x="0" y="600" width="600" height="150" fill="#E9B98A"/><path d="M0,600 H600" stroke="#C98B5E" stroke-width="6"/>
      <rect x="40" y="200" width="110" height="140" rx="6" fill="#fff" ${st(4)}/><rect x="52" y="212" width="86" height="96" fill="#F6D6D6"/>${C(80, 250, 14, SKIN_G)}${C(110, 250, 14, SKIN_B)}${P('M66,248 q14,-26 28,0Z M96,248 q14,-26 28,0Z', HAIR)}
      <rect x="450" y="210" width="110" height="140" rx="6" fill="#fff" ${st(4)}/><rect x="462" y="222" width="86" height="96" fill="#D8EEDC"/>${C(490, 262, 14, SKIN_G)}${C(520, 262, 14, SKIN_B)}${P('M476,260 q14,-26 28,0Z M506,260 q14,-26 28,0Z', HAIR)}
      ${garlandRow(20)}${rangoli(300, 700)}${diya(70, 690)}${diya(530, 690)}`,
    g: { x: GX, outfit: 'kurta', top: '#BFD8F2', pants: '#FFF8EE', shoes: '#C99A3A', trim: GOLD, armL: [[GX - 64, 440], [GX - 8, 410]], armR: [[GX + 64, 440], [GX + 8, 410]] },
    b: { x: BX, outfit: 'lehenga', skirt: '#F9B9CF', blouse: '#E87FA0', border: GOLD, butti: '#fff', buttiFlower: true, buttiCenter: '#F28C28', dupatta: '#FFE6EE', dupattaBorder: GOLD,
      necklace: GOLD, bangles: '#E87FA0', shoes: GOLD, pleat: 'rgba(150,40,80,.2)', eyes: 'happy', armL: [[BX - 56, 440], [BX - 7, 410]], armR: [[BX + 56, 440], [BX + 7, 410]] },
    extra: heart(300, 170, 1.1, '#E63E5C'),
  },
  {
    file: 'photo6', title: 'Forever begins — Shivam and Prachi under the mandap',
    bg: `<defs><radialGradient id="w6" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#A8283C"/><stop offset="1" stop-color="#5a1420"/></radialGradient></defs><rect width="600" height="750" fill="url(#w6)"/>
      ${Array.from({ length: 20 }, (_, i) => { const r = rng(80 + i); return sparkle(r() * 600, r() * 600, 0.4 + r() * 0.5, '#F3D58A'); }).join('')}
      <rect x="20" y="120" width="34" height="520" fill="${GOLD}" ${st(3)}/><rect x="546" y="120" width="34" height="520" fill="${GOLD}" ${st(3)}/>
      ${P('M0,140 Q300,30 600,140 L600,110 Q300,0 0,110Z', '#C8102E', st(3))}${P('M0,140 Q300,30 600,140', 'none', `stroke="${GOLD}" stroke-width="8"`)}
      ${garlandRow(130, 9)}<rect x="0" y="640" width="600" height="110" fill="#3d0d16"/>${Array.from({ length: 12 }, (_, i) => flower(25 + i * 50, 660, 9, i % 2 ? '#F28C28' : '#FFD23F', '#C8102E')).join('')}`,
    g: { ...wedGroom, x: GX, sehra: true, armL: [[GX - 64, 440], [GX - 8, 410]], armR: [[GX + 64, 440], [GX + 8, 410]] },
    b: { ...wedBride, x: BX, armL: [[BX - 72, 430], [BX - 46, 456]], armR: [[BX + 72, 430], [BX + 46, 456]], extra: varmala([BX - 46, 452], [BX + 46, 452], 640) },
    extra: '',
    fg: `<g transform="translate(300 712)">${P('M-46,0 h92 l-10,28 h-72z', '#C4552D', st(3))}${P('M0,-58c14,16 22,28 18,42-2,10-9,14-18,14s-16-4-18-14c-2-8 3-14 8-18 0,8 3,10 5,10-3-12 0-20 5-34z', '#FF9E1B', st(2.5))}${P('M0,-30c6,8 8,12 7,18-1,4-4,6-7,6s-6-2-7-6c0-4 2-6 4-8 0,3 1,4 2,4-1-6 0-10 1-14z', '#FFE066')}</g>`,
  },
];

for (const sc of story) {
  writeFileSync(join(PHOTO_DIR, `${sc.file}.svg`), storyDoc(sc.title, sc.bg, groom(sc.g) + bride(sc.b) + (sc.extra || ''), sc.fg || ''));
}

console.log('Art generated in assets/characters and assets/photos');
