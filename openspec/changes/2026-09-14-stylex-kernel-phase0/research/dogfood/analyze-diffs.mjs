#!/usr/bin/env node
// analyze-diffs.mjs — root-cause bucketing of the P0.6 dogfood diff
// (research/dogfood-diff.json, produced by compare-compiled.mjs).
//
// Every diff must land in a DESIGNED bucket (design.md citation) or
// the run fails as UNEXPLAINED. The comparator's raw diff carries the
// normalized signatures; buckets are decided by reversible DECL-text
// transformations against the unmatched pool of the other side:
//
//   T  typed-token indirection  a `var(--jx-X)` ≡ b `var(--X)` for X a
//      tokens.stylex member (design §2/§4.1: atoms author against the
//      typed layer; the tokens :root block maps --jx-X → var(--X), so
//      the runtime chain is identical — P0.3b live-probe). Seam names
//      (--jx-fill, --jx-tick-step, the density channels…) are NOT
//      members and never strip.
//   F  seam fallback            a `var(--jx-S,var(--jx-D))` ≡ b
//      `var(--jx-S)` (design §4.2: the sanctioned dynamic idiom — the
//      spike's defineVars :root defaults re-expressed as atom
//      fallbacks; an unset seam resolves to the same default).
//   P  spike-only machinery     b-side rules with no dogfood
//      counterpart BY LAW: the icon factory's @property --x-* blocks
//      + var(--x-width/height) atoms (§4.2: factories forbidden), the
//      press-button defineVars/createTheme :root + override-class
//      blocks (§4.2: build-time theme classes are outside the idiom).
//   U  unexplained              anything else — must be ZERO
//
// Usage: node research/dogfood/analyze-diffs.mjs [diff.json]
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? new URL('../dogfood-diff.json', import.meta.url).pathname;
const { diffs } = JSON.parse(readFileSync(file, 'utf8'));

// the typed token layer's members (registry/files/lib/tokens.stylex.ts,
// P0.3 — 60 names). ONLY these strip --jx-X → --X.
const TOKEN_MEMBERS = [
  'brand-hue', 'background', 'foreground', 'card', 'card-foreground', 'popover',
  'popover-foreground', 'primary', 'primary-foreground', 'secondary',
  'secondary-foreground', 'muted', 'muted-foreground', 'accent',
  'accent-foreground', 'destructive', 'destructive-foreground', 'border',
  'input', 'ring', 'terminal', 'terminal-foreground', 'terminal-hover',
  'terminal-muted', 'success', 'success-foreground', 'warning',
  'warning-foreground', 'info', 'info-foreground', 'error',
  'error-foreground', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'font-sans', 'font-mono', 'font-nav', 'radius', 'shadow-color',
  'shadow-2xs', 'shadow-xs', 'shadow-sm', 'shadow', 'shadow-md',
  'shadow-xs-press', 'shadow-sm-press', 'shadow-md-press', 'shadow-engrave',
  'shadow-well', 'shadow-well-hover', 'shadow-paper', 'scrim',
  'surface-shadow', 'scrollbar-track', 'scrollbar-thumb',
  'scrollbar-thumb-hover', 'scrollbar-thumb-active',
];
const MEMBER_VAR = new RegExp(`var\\(--jx-(${TOKEN_MEMBERS.join('|')})\\b`, 'gi');
// typed strip, fallback-carrying forms included:
// var(--jx-primary) → var(--primary); var(--jx-surface-shadow,X) → var(--surface-shadow,X)
const tStrip = (s) => s.replace(MEMBER_VAR, 'var(--$1');
// fallback-strip for the corpus seams (spike defineVars defaults):
// var(--jx-S,var(--jx-D)) and var(--jx-S,<literal>) → var(--jx-S)
const SEAM = '--jx-(?:fill|fill-ink|tonal|outline|press-shadow|press-shadow-hover|press-shadow-active|press-move)';
const fStrip = (s) =>
  s
    .replace(new RegExp(`var\\((${SEAM}),var\\(--jx-[a-z0-9-]+\\)\\)`, 'gi'), 'var($1)')
    .replace(new RegExp(`var\\((${SEAM}),1px 1px\\)`, 'gi'), 'var($1)');

const declsOf = (sig) => sig.split('\u0003').slice(-1)[0] ?? sig;

const aOnly = diffs.filter((d) => d.b === '(no structural match)');
const bOnly = diffs.filter((d) => d.a === '(no structural match)');
const bPool = bOnly.map((d) => ({ d, decls: declsOf(d.b), used: false }));
const buckets = { T: [], F: [], P: [], U: [] };

for (const d of aOnly) {
  const decls = declsOf(d.a);
  // the icon seam re-authoring (§4.2 factory → CSS-var seam) has NO decl
  // counterpart on the spike side BY DESIGN: the factory compiled to
  // @property --x-* + var(--x-width/height) rules (bucketed P below)
  if (decls.includes('--jx-icon-size')) {
    buckets.P.push({ a: decls, b: '(the spike rides the factory: var(--x-width/height) + @property --x-*)' });
    continue;
  }
  const cand = [tStrip(decls), tStrip(fStrip(decls)), fStrip(decls)];
  const hitIdx = bPool.findIndex((p) => !p.used && cand.includes(p.decls));
  if (hitIdx !== -1) {
    const hit = bPool[hitIdx];
    hit.used = true;
    const bucket = hit.decls === cand[0] ? 'T' : 'F'; // pure-T when typed strip alone matched
    buckets[bucket].push({ a: decls, b: hit.decls });
    continue;
  }
  buckets.U.push({ a: decls, b: '(no match after T/F transforms)' });
}

// remaining b-side-only: designed machinery (P) or unexplained (U)
for (const p of bPool) {
  if (p.used) continue;
  if (
    p.d.b.includes('@property --x-') ||
    p.d.b.includes('syntax: "*"') ||
    /--jx-(fill|fill-ink|tonal|outline|press-shadow|press-shadow-hover|press-shadow-active|press-move):/.test(p.d.b) ||
    p.d.b.includes('var(--x-width)') ||
    p.d.b.includes('var(--x-height)')
  ) {
    buckets.P.push({ a: '(spike-only, by law)', b: p.d.b });
  } else {
    buckets.U.push({ a: '(no match after T/F transforms)', b: p.d.b });
  }
}

const summary = {
  file,
  totalDiffs: diffs.length,
  aOnly: aOnly.length,
  bOnly: bOnly.length,
  T: buckets.T.length,
  F: buckets.F.length,
  P: buckets.P.length,
  U: buckets.U.length,
};
console.log(JSON.stringify(summary, null, 2));
if (buckets.U.length > 0) {
  console.error('[analyze-diffs] UNEXPLAINED diffs present:');
  for (const u of buckets.U) console.error(`  a: ${String(u.a).slice(0, 200)}\n  b: ${String(u.b).slice(0, 200)}\n`);
  process.exit(1);
}
console.log('[analyze-diffs] every diff bucketed — zero unexplained');
