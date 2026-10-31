// Composes an original Punjabi-style bhangra instrumental (royalty-free, made entirely in code):
// dhol (dagga bass + tilli treble) in the swung bhangra "chaal", chimta jingles, a tumbi riff,
// an algoza/flute folk melody and a soft drone. Designed to loop seamlessly as background music.
// Run: node scripts/make-bhangra.mjs  → assets/music/punjabi-bhangra-instrumental.wav
// (then encode to MP3, e.g. ffmpeg -i in.wav -b:a 96k out.mp3)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'music');
mkdirSync(OUT_DIR, { recursive: true });

const SR = 44100;
const BPM = 104;
const BEAT = 60 / BPM;
const BARS = 24;
const TOTAL = BARS * 4 * BEAT; // exact loop length
const N = Math.round(TOTAL * SR);
const L = new Float32Array(N), R = new Float32Array(N);

// deterministic noise so every render is identical
let seed = 12345;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

/** write a mono voice into the stereo mix; pan -1..1. Wraps around so the loop point is seamless. */
function mix(t0, len, fn, gain = 1, pan = 0) {
  const s0 = Math.round(t0 * SR), n = Math.round(len * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR, i);
    const k = (s0 + i) % N;
    L[k] += v * gl; R[k] += v * gr;
  }
}

/* ---------------- instruments ---------------- */
// dhol bass head (dagga): deep boom with a pitch drop + a soft slap
function dagga(t0, vel = 1) {
  let ph = 0;
  mix(t0, 0.5, (t) => {
    const f = 52 + 75 * Math.exp(-t * 22);
    ph += (2 * Math.PI * f) / SR;
    return Math.sin(ph) * Math.exp(-t * 6.5) * vel + noise() * Math.exp(-t * 260) * 0.35 * vel;
  }, 0.95, -0.15);
}
// dhol treble head (tilli): sharp, woody crack
function tilli(t0, vel = 1) {
  let lp = 0, ph = 0;
  mix(t0, 0.16, (t) => {
    const n = noise();
    lp += 0.35 * (n - lp); // smooth a little
    ph += (2 * Math.PI * 540) / SR;
    return ((n - lp) * 0.9 + Math.sin(ph) * 0.55) * Math.exp(-t * 38) * vel;
  }, 0.5, 0.2);
}
// chimta: bright metallic jingle
function chimta(t0, vel = 1) {
  let prev = 0, ph1 = 0, ph2 = 0;
  mix(t0, 0.14, (t) => {
    const n = noise(); const hp = n - prev; prev = n;
    ph1 += (2 * Math.PI * 5200) / SR; ph2 += (2 * Math.PI * 7350) / SR;
    return (hp * 0.6 + (Math.sin(ph1) + Math.sin(ph2)) * 0.25) * Math.exp(-t * 42) * vel;
  }, 0.22, 0.55);
}
// tumbi: one-string plucked lute — Karplus-Strong with a bright, twangy tone
function tumbi(t0, freq, vel = 1, len = 0.32) {
  const p = Math.max(2, Math.round(SR / freq));
  const buf = new Float32Array(p);
  for (let i = 0; i < p; i++) buf[i] = noise();
  let idx = 0;
  mix(t0, len, (t) => {
    const a = buf[idx], b = buf[(idx + 1) % p];
    const y = (0.72 * a + 0.28 * b) * 0.9965;
    buf[idx] = y; idx = (idx + 1) % p;
    const fade = t > len - 0.02 ? (len - t) / 0.02 : 1;
    return y * vel * fade;
  }, 0.42, 0.35);
}
// algoza / flute: breathy sine with vibrato that blooms after the attack
function flute(t0, freq, beats, vel = 1) {
  const len = beats * BEAT;
  let ph = 0, ph2 = 0, lp = 0;
  mix(t0, len + 0.05, (t) => {
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.4 * t) * Math.min(1, t / 0.25);
    ph += (2 * Math.PI * freq * vib) / SR;
    ph2 += (2 * Math.PI * freq * 1.003 * vib) / SR; // second pipe, slightly detuned (algoza)
    const n = noise(); lp += 0.08 * (n - lp);
    const env = Math.min(1, t / 0.04) * (t > len - 0.06 ? Math.max(0, (len + 0.05 - t) / 0.11) : 1);
    return (Math.sin(ph) * 0.6 + Math.sin(ph2) * 0.4 + Math.sin(2 * ph) * 0.12 + lp * 0.25) * env * vel;
  }, 0.33, -0.3);
}

/* ---------------- notes (E major pentatonic-ish, typical of Punjabi folk) ---------------- */
const NOTE = {
  E2: 82.41, B2: 123.47, E3: 164.81,
  B4: 493.88, E5: 659.25, Fs5: 739.99, Gs5: 830.61, A5: 880, B5: 987.77, Cs6: 1108.73, E6: 1318.51,
};

/* ---------------- arrangement ---------------- */
const barT = (bar) => bar * 4 * BEAT;
const swing = (beat) => beat * BEAT; // on-beat
const off = (beat) => beat * BEAT + (2 / 3) * BEAT; // swung off-beat (triplet feel)

// soft drone (tonic + fifth) for the whole loop
mix(0, TOTAL, (t) => {
  const s = Math.sin(2 * Math.PI * NOTE.E2 * t) * 0.5 + Math.sin(2 * Math.PI * NOTE.B2 * t) * 0.3 + Math.sin(2 * Math.PI * NOTE.E3 * t) * 0.2;
  return s * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t));
}, 0.07, 0);

// tumbi riff (two-bar phrase on swung 8ths)
const RIFF = [
  ['B5', 'B5', 'E6', 'B5', 'Cs6', 'B5', 'A5', 'B5'],
  ['Gs5', 'Gs5', 'B5', 'Gs5', 'A5', 'Gs5', 'Fs5', 'E5'],
];
function tumbiBar(bar, phrase, vel = 1) {
  RIFF[phrase].forEach((n, i) => {
    const beat = Math.floor(i / 2);
    tumbi(barT(bar) + (i % 2 ? off(beat) : swing(beat)), NOTE[n], (i % 2 ? 0.75 : 1) * vel);
  });
}

// dhol "chaal" for one bar
function dholBar(bar, fill = false) {
  const t = barT(bar);
  dagga(t + swing(0), 1);      tilli(t + off(0), 0.8);
  tilli(t + swing(1), 0.9);    dagga(t + off(1), 0.75);
  dagga(t + swing(2), 1);      tilli(t + off(2), 0.8);
  tilli(t + swing(3), 0.9);    dagga(t + off(3), 0.75);
  if (fill) { tilli(t + off(3) + BEAT / 6, 0.7); dagga(t + swing(3) + BEAT / 3, 0.6); }
  [0, 1, 2, 3].forEach((b) => chimta(t + off(b), b % 2 ? 1 : 0.6));
}

// flute melody, two 4-bar phrases (durations in beats)
const MELODY = [
  [['B4', 1], ['E5', 1], ['Fs5', 1], ['Gs5', 1], ['A5', 2], ['Gs5', 1], ['Fs5', 1], ['Gs5', 1], ['Fs5', 1], ['E5', 1], ['Fs5', 1], ['E5', 4]],
  [['Gs5', 1], ['B5', 1], ['Cs6', 1], ['B5', 1], ['A5', 1], ['Gs5', 1], ['A5', 2], ['B5', 1], ['A5', 1], ['Gs5', 1], ['Fs5', 1], ['E5', 4]],
];
function flutePhrase(startBar, phrase, vel = 1) {
  let beat = 0;
  for (const [n, d] of MELODY[phrase]) { flute(barT(startBar) + beat * BEAT, NOTE[n], d, vel); beat += d; }
}

// bars 0-1: tumbi alone · 2-7: dhol joins · 8-15: flute melody · 16-23: melody again, fuller
for (let bar = 0; bar < BARS; bar++) {
  const phrase = bar % 2;
  const tumbiVel = bar >= 8 && bar < 16 ? 0.55 : 1;
  tumbiBar(bar, phrase, tumbiVel);
  if (bar >= 2) dholBar(bar, bar % 4 === 3);
}
flutePhrase(8, 0); flutePhrase(12, 1);
flutePhrase(16, 0, 0.9); flutePhrase(20, 1, 0.9);

/* ---------------- master: gentle limiter + normalise ---------------- */
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.2); R[i] = Math.tanh(R[i] * 1.2); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const g = 0.89 / peak;

/* ---------------- write 16-bit stereo WAV ---------------- */
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
const out = join(OUT_DIR, 'punjabi-bhangra-instrumental.wav');
writeFileSync(out, Buffer.concat([hdr, data]));
console.log(`Wrote ${out} (${TOTAL.toFixed(1)}s, ${BPM} BPM, seamless loop)`);
