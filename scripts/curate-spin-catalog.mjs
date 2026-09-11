#!/usr/bin/env node
/**
 * Spin catalog curator — the curation receipt writer
 * (spin-ora-svg-lane C1, design §1).
 *
 * Intent list:
 * 1. single writer — THIS script is the only in-repo writer of
 *    registry/files/ui/spin/spin-catalog.ts, the frozen text corpus
 *    the spin component renders from (ora's own mechanism: cli-spinners
 *    frames + per-spinner interval, VERBATIM — never hand-transcribed;
 *    braille glyphs are transcription traps).
 * 2. objective, re-runnable predicate — include every corpus entry
 *    whose frames (a) contain NO emoji-presentation characters — no
 *    codepoint ≥ U+1F000, no U+FE0F (VS16), no BMP char with
 *    Emoji_Presentation=Yes (the standard Unicode 15 ranges embedded
 *    below — a blanket 0x2600-0x27bf range is WRONG: ✶✸✹✺ dingbats and
 *    the ☰ trigrams are text presentation and stay) — (b) count
 *    ≤ 30 frames, (c) are ≤ 10ch wide per frame (codepoints).
 *    bouncingBar is excluded BY NAME — its frames are [ ] bracket art,
 *    the decoration this change kills (Owner ruling #1).
 * 3. deterministic bytes — the JSON's own key order rides through
 *    untouched (names are NOT re-sorted); two runs over the same
 *    corpus write byte-identical files.
 *
 * Usage: node scripts/curate-spin-catalog.mjs [--data <spinners.json>]
 *   --data overrides the corpus path (default: resolve the root
 *   devDependency 'cli-spinners/spinners.json'; while that install is
 *   pending, fall back to /tmp/spin-ref/package/spinners.json — the
 *   npm-pack of cli-spinners@2.9.2 this change was curated against).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(repoRoot, 'registry/files/ui/spin/spin-catalog.ts');
const REL_TARGET = 'registry/files/ui/spin/spin-catalog.ts';
const FALLBACK_DATA = '/tmp/spin-ref/package/spinners.json';
const DEFAULT_INTERVAL = 80; // ora's default, for a corpus entry missing the field

// BMP Emoji_Presentation=Yes ranges (Unicode 15) — the chars that render
// as wide colorful emoji WITHOUT a VS16. NOT a blanket 2600-27bf: the
// dingbats/trigram spinners are text presentation and must survive.
const EMOJI_PRESENTATION_RANGES = /** @type {const} */ ([
  [0x231a, 0x231b],
  [0x23e9, 0x23ec],
  [0x23f0, 0x23f0],
  [0x23f3, 0x23f3],
  [0x25fd, 0x25fe],
  [0x2614, 0x2615],
  [0x2648, 0x2653],
  [0x267f, 0x267f],
  [0x2693, 0x2693],
  [0x26a1, 0x26a1],
  [0x26aa, 0x26ab],
  [0x26bd, 0x26be],
  [0x26c4, 0x26c5],
  [0x26ce, 0x26ce],
  [0x26d4, 0x26d4],
  [0x26ea, 0x26ea],
  [0x26f2, 0x26f3],
  [0x26f5, 0x26f5],
  [0x26fa, 0x26fa],
  [0x26fd, 0x26fd],
  [0x2705, 0x2705],
  [0x270a, 0x270b],
  [0x2728, 0x2728],
  [0x274c, 0x274c],
  [0x274e, 0x274e],
  [0x2753, 0x2755],
  [0x2757, 0x2757],
  [0x2795, 0x2797],
  [0x27b0, 0x27b0],
  [0x27bf, 0x27bf],
  [0x2b1b, 0x2b1c],
  [0x2b50, 0x2b50],
  [0x2b55, 0x2b55],
]);

const NAME_EXCLUSIONS = new Map([
  // name → ruling (the receipt prints it verbatim)
  ['bouncingBar', 'bracket-art frames ([ ]) — the wrapping decoration this change kills (Owner ruling #1)'],
]);

/** The first emoji-presentation offender in a frame, or null. */
function emojiOffender(frame) {
  for (const ch of Array.from(frame)) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x1f000) return { cp, clause: 'codepoint ≥ U+1F000' };
    if (cp === 0xfe0f) return { cp, clause: 'VS16 (U+FE0F)' };
    for (const [lo, hi] of EMOJI_PRESENTATION_RANGES) {
      if (cp >= lo && cp <= hi) return { cp, clause: 'Emoji_Presentation=Yes' };
    }
  }
  return null;
}

/** All exclusion reasons for one corpus entry (empty = kept). */
function exclusionReasons(name, spinner) {
  const reasons = [];
  if (NAME_EXCLUSIONS.has(name)) reasons.push(`name ruling: ${NAME_EXCLUSIONS.get(name)}`);
  const width = Math.max(...spinner.frames.map((f) => Array.from(f).length));
  if (spinner.frames.length > 30) reasons.push(`frames ${spinner.frames.length} > 30`);
  if (width > 10) reasons.push(`width ${width}ch > 10`);
  for (const frame of spinner.frames) {
    const hit = emojiOffender(frame);
    if (hit) {
      reasons.push(`emoji-presentation (${hit.clause}, first offender U+${hit.cp.toString(16).toUpperCase()})`);
      break;
    }
  }
  return reasons;
}

/** Resolve the corpus: --data flag, else the devDependency, else the pack fallback. */
function resolveCorpusPath(argv) {
  const flagAt = argv.indexOf('--data');
  if (flagAt !== -1 && argv[flagAt + 1]) return { path: resolve(argv[flagAt + 1]), via: '--data flag' };
  try {
    const require = createRequire(import.meta.url);
    return { path: require.resolve('cli-spinners/spinners.json'), via: "root devDependency 'cli-spinners'" };
  } catch {
    return { path: FALLBACK_DATA, via: 'fallback (devDependency not installed yet)' };
  }
}

const { path: dataPath, via } = resolveCorpusPath(process.argv.slice(2));
const corpus = JSON.parse(readFileSync(dataPath, 'utf8'));

// Corpus sanity: entries are non-empty frame arrays (the predicate below
// assumes frames exist; an empty entry would make Math.max() -Infinity).
for (const [name, spinner] of Object.entries(corpus)) {
  if (!Array.isArray(spinner.frames) || spinner.frames.length === 0) {
    throw new Error(`corpus entry ${name} has no frames — predicate assumptions broken, investigate`);
  }
}

// Curation pass — JSON key order (input order) rides through, never re-sorted.
const kept = [];
const excluded = [];
for (const [name, spinner] of Object.entries(corpus)) {
  const reasons = exclusionReasons(name, spinner);
  if (reasons.length === 0) kept.push(name);
  else excluded.push([name, reasons]);
}

// Hard sanity pins (design §1: the flawed blanket range wrongly killed these).
for (const mustKeep of ['star', 'hamburger', 'toggle12']) {
  if (!kept.includes(mustKeep)) {
    throw new Error(`${mustKeep} must be KEPT — text-presentation glyphs (✶☰☗) are not emoji; predicate drifted`);
  }
}
if (kept.includes('bouncingBar')) throw new Error('bouncingBar must be EXCLUDED by name — bracket art');

const serializeFrame = (f) => JSON.stringify(f); // byte-exact incl. trailing spaces, backslashes
const body = kept
  .map((name) => {
    const spinner = corpus[name];
    const frames = spinner.frames.map(serializeFrame).join(', ');
    const interval = typeof spinner.interval === 'number' ? spinner.interval : DEFAULT_INTERVAL;
    return `  ${name}: {\n    frames: [${frames}],\n    interval: ${interval},\n  },`;
  })
  .join('\n');

const output = `// GENERATED — do not edit (writer: scripts/curate-spin-catalog.mjs,
// data: cli-spinners@2.9.2 MIT — sindresorhus, ora's spinner corpus).
// spin-ora-svg-lane C1, 2026-09-11.
//
// Intents:
// 1. the frozen text corpus — frames and per-spinner intervals VERBATIM
//    from the corpus (never hand-transcribed; braille glyphs are
//    transcription traps); re-run the curator to reproduce these bytes.
// 2. pure data — zero imports; installs with the registry:ui spin family.
//
// Curation rule: every cli-spinners@2.9.2 entry whose frames carry no
// emoji-presentation characters (no codepoint ≥ U+1F000, no U+FE0F, no
// BMP Emoji_Presentation=Yes — the standard ranges embedded in the
// curator; a blanket 0x2600-0x27bf range is WRONG: ✶✸✹✺ dingbats and the
// ☰ trigrams are text presentation and stay), ≤ 30 frames, ≤ 10ch wide.
// Excluded by name: bouncingBar — its frames are [ ] bracket art, the
// wrapping decoration this change kills (Owner ruling #1).

export interface TextSpinner {
  readonly frames: readonly string[];
  readonly interval: number;
}

export type TextSpinnerName =
${kept.map((n) => `  | '${n}'`).join('\n')}
  ;

export const TEXT_SPINNER_NAMES: readonly TextSpinnerName[] = [
${kept.map((n) => `  '${n}',`).join('\n')}
];

export const SPINNER_CATALOG: Readonly<Record<TextSpinnerName, TextSpinner>> = {
${body}
};
`;

writeFileSync(TARGET, output);

console.log(`source: ${dataPath} (${via})`);
console.log(`kept: ${kept.length} / ${Object.keys(corpus).length} → ${REL_TARGET}`);
console.log(`excluded ${excluded.length}:`);
for (const [name, reasons] of excluded) console.log(`  ${name.padEnd(16)} ${reasons.join(' · ')}`);
